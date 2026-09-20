import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import sharp from "sharp";
import { z } from "zod";
import {
  actionSchema,
  applyAction,
  seedState,
  weekBounds,
  categories,
  type PactState,
  type Role,
} from "../../packages/shared/domain.ts";
import type { WalletProfile } from "../../packages/shared/api.ts";
import type { Database } from "./db.ts";
import { analyzeExpense, transcribeAudio } from "./providers.ts";

const derive = promisify(scrypt);
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const failure = (message: string, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });
const roleSchema = z.enum(["owner", "supporter"]);
const credentials = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_.-]{3,40}$/,
      "Use 3–40 letters, numbers, dots or underscores for your username.",
    ),
  password: z
    .string()
    .min(10, "Use at least 10 characters for your password.")
    .max(200),
});
const walletSchema = z.object({
  title: z.string().trim().min(1).max(70),
  role: roleSchema,
  owner: z.string().trim().min(1).max(60),
  supporter: z.string().trim().min(1).max(60),
  relationship: z.enum(["Parent", "Guardian", "Mentor", "Other"]),
  weeklyAmount: z.number().int().min(100).max(10000000),
});
type Session = {
  token: string;
  user_id: string | null;
  wallet_id: string;
  role: Role;
};
type Wallet = {
  id: string;
  demo: boolean;
  profile: WalletProfile;
  state: PactState;
};
export function buildServer(db: Database) {
  const app = Fastify({ logger: false, bodyLimit: 7 * 1024 * 1024 });
  app.register(cookie);
  app.register(multipart, {
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024,
      fields: 3,
      fieldSize: 2000,
      parts: 4,
    },
  });
  app.register(rateLimit, { max: 180, timeWindow: "1 minute" });
  app.addHook("onRequest", async (req, reply) => {
    reply
      .header("Cache-Control", "no-store")
      .header("X-Content-Type-Options", "nosniff")
      .header("Referrer-Policy", "same-origin");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const allowed = new Set(
        (
          process.env.APP_ORIGIN ||
          "http://127.0.0.1:5173,http://localhost:5173"
        ).split(","),
      );
      if (
        (req.headers.origin && !allowed.has(req.headers.origin)) ||
        req.headers["sec-fetch-site"] === "cross-site"
      )
        throw failure("This request came from a different site.", 403);
    }
  });
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof z.ZodError)
      return reply.code(400).send({
        error: err.issues[0]?.message || "Check the details and try again.",
      });
    const error = err as Error & { statusCode?: number; code?: string };
    if (error.code === "23505")
      return reply
        .code(409)
        .send({ error: "That username or wallet role is already taken." });
    const status = error.statusCode || 500;
    reply.code(status).send({
      error:
        status >= 500
          ? "Something went wrong. Your saved data is safe; please try again."
          : error.message,
    });
  });
  async function session(req: FastifyRequest): Promise<Session> {
    const token = req.cookies.pact_session;
    if (!token) throw failure("Please sign in again.", 401);
    const { rows } = await db.query<Session>(
      "SELECT * FROM sessions WHERE token=$1 AND expires_at > now()",
      [digest(token)],
    );
    if (!rows[0])
      throw failure("Your session expired. Please sign in again.", 401);
    return rows[0];
  }
  async function newSession(
    reply: FastifyReply,
    user: string | null,
    wallet: string,
    role: Role,
    previous?: string,
  ) {
    const token = randomBytes(32).toString("hex");
    if (previous)
      await db.query("DELETE FROM sessions WHERE token=$1", [digest(previous)]);
    await db.query(
      "INSERT INTO sessions VALUES ($1,$2,$3,$4,now()+interval '7 days')",
      [digest(token), user, wallet, role],
    );
    reply.setCookie("pact_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
    });
    return {
      token: digest(token),
      user_id: user,
      wallet_id: wallet,
      role,
    } satisfies Session;
  }
  async function getWallet(s: Session) {
    const { rows } = await db.query<Wallet>(
      "SELECT * FROM wallets WHERE id=$1",
      [s.wallet_id],
    );
    if (!rows[0]) throw failure("Wallet not found.", 404);
    let wallet = rows[0];
    const week = weekBounds();
    if (wallet.state.weekStart < week) {
      // Archive is idempotent. Compare-and-swap prevents a concurrent action being lost.
      for (
        let attempt = 0;
        attempt < 4 && wallet.state.weekStart < week;
        attempt++
      ) {
        const before = wallet.state;
        const next = {
          ...before,
          version: before.version + 1,
          weekStart: week,
          expenses: [],
          contributions: [],
          proposal: null,
        };
        const saved = await db.query<Wallet>(
          `WITH updated AS (
          UPDATE wallets SET state=$1 WHERE id=$2 AND (state->>'version')::int=$3 RETURNING *
        ), archived AS (
          INSERT INTO weeks SELECT id,$4,$5::jsonb FROM updated ON CONFLICT (wallet_id,week) DO UPDATE SET state=EXCLUDED.state
        ) SELECT * FROM updated`,
          [
            JSON.stringify(next),
            wallet.id,
            before.version,
            before.weekStart,
            JSON.stringify(before),
          ],
        );
        wallet =
          saved.rows[0] ||
          (
            await db.query<Wallet>("SELECT * FROM wallets WHERE id=$1", [
              wallet.id,
            ])
          ).rows[0];
      }
    }
    return wallet;
  }
  async function envelope(s: Session) {
    const wallet = await getWallet(s);
    const people = s.user_id
      ? (
          await db.query<{ name: string; username: string }>(
            "SELECT name,username FROM users WHERE id=$1",
            [s.user_id],
          )
        ).rows[0]
      : null;
    const wallets = s.user_id
      ? (
          await db.query<{ id: string; title: string; role: Role }>(
            "SELECT w.id,w.profile->>'title' AS title,m.role FROM members m JOIN wallets w ON w.id=m.wallet_id WHERE m.user_id=$1 ORDER BY w.id",
            [s.user_id],
          )
        ).rows
      : [];
    const connected =
      wallet.demo ||
      (
        await db.query("SELECT role FROM members WHERE wallet_id=$1", [
          wallet.id,
        ])
      ).rows.length === 2;
    const state = structuredClone(wallet.state);
    if (s.role === "supporter")
      state.expenses.forEach((e) => {
        if (!e.shareReceipt) delete e.receiptId;
      });
    return {
      state,
      role: s.role,
      demo: wallet.demo,
      profile: wallet.profile,
      account: people,
      wallets,
      walletId: wallet.id,
      connected,
    };
  }
  async function createWallet(
    userId: string,
    input: z.infer<typeof walletSchema>,
    newUser?: { username: string; name: string; password: string },
  ) {
    const id = randomUUID();
    const state = seedState();
    state.expenses = [];
    state.contributions = [];
    state.fastFoodLimit = null;
    const total = input.weeklyAmount;
    state.budgets = {
      meals: Math.floor(total * 0.45),
      commute: Math.floor(total * 0.2),
      study: Math.floor(total * 0.2),
      personal: total - Math.floor(total * 0.45) - 2 * Math.floor(total * 0.2),
    };
    const profile = {
      title: input.title,
      owner: input.owner,
      supporter: input.supporter,
      relationship: input.relationship,
    };
    const params: unknown[] = [
      id,
      JSON.stringify(profile),
      JSON.stringify(state),
      userId,
      input.role,
    ];
    if (newUser) {
      params.push(newUser.username, newUser.name, newUser.password);
      await db.query(
        `WITH new_user AS (
        INSERT INTO users VALUES ($4,$6,$7,$8) RETURNING id
      ), new_wallet AS (
        INSERT INTO wallets VALUES ($1,false,$2,$3) RETURNING id
      ) INSERT INTO members SELECT new_wallet.id,new_user.id,$5 FROM new_wallet CROSS JOIN new_user`,
        params,
      );
    } else {
      await db.query(
        `WITH new_wallet AS (
        INSERT INTO wallets VALUES ($1,false,$2,$3) RETURNING id
      ) INSERT INTO members SELECT id,$4,$5 FROM new_wallet`,
        params,
      );
    }
    return id;
  }
  app.get("/api/health", async () => ({
    ok: true,
    providers: {
      gemini: !!process.env.GEMINI_API_KEY,
      sarvam: !!process.env.SARVAM_API_KEY,
    },
  }));
  app.post("/api/session", async (req, reply) => {
    if (req.cookies.pact_session) {
      try {
        return await envelope(await session(req));
      } catch (e) {
        if ((e as { statusCode?: number }).statusCode !== 401) throw e;
      }
    }
    const id = randomUUID();
    await db.query("INSERT INTO wallets VALUES ($1,true,$2,$3)", [
      id,
      JSON.stringify({
        title: "Ananya’s week",
        owner: "Ananya",
        supporter: "Kunal",
        relationship: "Parent",
      }),
      JSON.stringify(seedState()),
    ]);
    return envelope(await newSession(reply, null, id, "owner"));
  });
  app.get("/api/state", async (req) => envelope(await session(req)));
  app.post("/api/demo/role", async (req) => {
    const s = await session(req);
    const wallet = await getWallet(s);
    if (!wallet.demo || s.user_id)
      throw failure(
        "Real accounts cannot switch roles. Sign in with the other account.",
        403,
      );
    const { role } = z.object({ role: roleSchema }).parse(req.body);
    await db.query("UPDATE sessions SET role=$1 WHERE token=$2", [
      role,
      s.token,
    ]);
    return envelope({ ...s, role });
  });
  app.post(
    "/api/auth/register",
    { config: { rateLimit: { max: 8, timeWindow: "15 minutes" } } },
    async (req, reply) => {
      const body = credentials
        .extend({
          name: z.string().trim().min(1).max(60),
          wallet: walletSchema,
        })
        .parse(req.body);
      const salt = randomBytes(16).toString("hex");
      const hash = ((await derive(body.password, salt, 64)) as Buffer).toString(
        "hex",
      );
      const id = randomUUID();
      const wallet = await createWallet(id, body.wallet, {
        username: body.username,
        name: body.name,
        password: `${salt}:${hash}`,
      });
      return envelope(
        await newSession(
          reply,
          id,
          wallet,
          body.wallet.role,
          req.cookies.pact_session,
        ),
      );
    },
  );
  app.post(
    "/api/auth/login",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    async (req, reply) => {
      const body = credentials.parse(req.body);
      const user = (
        await db.query<{ id: string; password: string }>(
          "SELECT id,password FROM users WHERE username=$1",
          [body.username],
        )
      ).rows[0];
      const [salt, hash] = (
        user?.password || "missing:" + "0".repeat(128)
      ).split(":");
      const attempt = (await derive(body.password, salt, 64)) as Buffer;
      if (!user || !timingSafeEqual(attempt, Buffer.from(hash, "hex")))
        throw failure("Username or password is incorrect.", 401);
      const member = (
        await db.query<{ wallet_id: string; role: Role }>(
          "SELECT wallet_id,role FROM members WHERE user_id=$1 LIMIT 1",
          [user.id],
        )
      ).rows[0];
      if (!member)
        throw failure(
          "Your account has no wallet. Please contact the app administrator.",
          409,
        );
      return envelope(
        await newSession(
          reply,
          user.id,
          member.wallet_id,
          member.role,
          req.cookies.pact_session,
        ),
      );
    },
  );
  app.post("/api/auth/logout", async (req, reply) => {
    if (req.cookies.pact_session)
      await db.query("DELETE FROM sessions WHERE token=$1", [
        digest(req.cookies.pact_session),
      ]);
    reply.clearCookie("pact_session", { path: "/" });
    return { ok: true };
  });
  app.post("/api/wallets", async (req) => {
    const s = await session(req);
    if (!s.user_id) throw failure("Create an account first.", 403);
    const body = walletSchema.parse(req.body);
    const id = await createWallet(s.user_id, body);
    await db.query("UPDATE sessions SET wallet_id=$1,role=$2 WHERE token=$3", [
      id,
      body.role,
      s.token,
    ]);
    return envelope({ ...s, wallet_id: id, role: body.role });
  });
  app.post("/api/wallets/select", async (req) => {
    const s = await session(req);
    const { id } = z.object({ id: z.string().uuid() }).parse(req.body);
    const member = (
      await db.query<{ role: Role }>(
        "SELECT role FROM members WHERE wallet_id=$1 AND user_id=$2",
        [id, s.user_id],
      )
    ).rows[0];
    if (!member) throw failure("You are not a member of that wallet.", 403);
    await db.query("UPDATE sessions SET wallet_id=$1,role=$2 WHERE token=$3", [
      id,
      member.role,
      s.token,
    ]);
    return envelope({ ...s, wallet_id: id, role: member.role });
  });
  app.post("/api/invites", async (req) => {
    const s = await session(req);
    if (!s.user_id)
      throw failure("Create an account before inviting someone.", 403);
    const role = s.role === "owner" ? "supporter" : "owner";
    if (
      (
        await db.query(
          "SELECT role FROM members WHERE wallet_id=$1 AND role=$2",
          [s.wallet_id, role],
        )
      ).rows.length
    )
      throw failure("Both people have already joined this wallet.", 409);
    const token = randomBytes(32).toString("hex");
    await db.query("DELETE FROM invites WHERE wallet_id=$1", [s.wallet_id]);
    await db.query(
      "INSERT INTO invites VALUES ($1,$2,$3,now()+interval '24 hours')",
      [digest(token), s.wallet_id, role],
    );
    return { token, role };
  });
  app.post("/api/invites/join", async (req) => {
    const s = await session(req);
    if (!s.user_id) throw failure("Sign in or create an account to join.", 403);
    const { token } = z
      .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
      .parse(req.body);
    // A single statement consumes the invite only if membership insertion succeeds.
    const rows = (
      await db.query<{ wallet_id: string; role: Role }>(
        `WITH invitation AS (DELETE FROM invites WHERE token=$1 AND expires_at>now() RETURNING wallet_id,role) INSERT INTO members (wallet_id,user_id,role) SELECT wallet_id,$2,role FROM invitation RETURNING wallet_id,role`,
        [digest(token), s.user_id],
      )
    ).rows;
    if (!rows[0])
      throw failure("This invite expired or has already been used.", 404);
    await db.query("UPDATE sessions SET wallet_id=$1,role=$2 WHERE token=$3", [
      rows[0].wallet_id,
      rows[0].role,
      s.token,
    ]);
    // The joining person supplies their own display name.
    const name = (
      await db.query<{ name: string }>("SELECT name FROM users WHERE id=$1", [
        s.user_id,
      ])
    ).rows[0].name;
    await db.query(
      "UPDATE wallets SET profile=jsonb_set(profile, $1::text[], $2::jsonb) WHERE id=$3",
      [[rows[0].role], JSON.stringify(name), rows[0].wallet_id],
    );
    return envelope({ ...s, ...rows[0] });
  });
  app.post("/api/actions", async (req) => {
    const s = await session(req);
    const body = z
      .object({
        action: actionSchema,
        version: z.number().int(),
        walletId: z.string().uuid(),
      })
      .parse(req.body);
    if (body.walletId !== s.wallet_id)
      throw failure("Your active wallet changed. Refresh and try again.", 409);
    const wallet = await getWallet(s);
    const action = body.action;
    if (
      action.type === "add-expense" &&
      wallet.state.expenses.some((e) => e.id === action.expense.id)
    )
      return envelope(s);
    if (
      action.type === "top-up" &&
      wallet.state.contributions.some((e) => e.id === action.id)
    )
      return envelope(s);
    if (body.version !== wallet.state.version)
      throw failure(
        "Someone updated this wallet. Your view has refreshed; review your change and try again.",
        409,
      );
    if (action.type === "add-expense" && action.expense.receiptId) {
      const id = action.expense.receiptId;
      if (
        !(
          await db.query(
            "SELECT id FROM receipts WHERE id=$1 AND wallet_id=$2",
            [id, wallet.id],
          )
        ).rows.length
      )
        throw failure("Attachment not found in this wallet.", 404);
      if (wallet.state.expenses.some((e) => e.receiptId === id))
        throw failure(
          "This attachment is already linked to another expense.",
          409,
        );
    }
    let next: PactState;
    try {
      next = applyAction(wallet.state, action, s.role);
    } catch (e) {
      if (e instanceof z.ZodError) throw e;
      throw failure((e as Error).message);
    }
    const result = await db.query(
      "UPDATE wallets SET state=$1 WHERE id=$2 AND (state->>'version')::int=$3 RETURNING id",
      [JSON.stringify(next), wallet.id, body.version],
    );
    if (!result.rows.length)
      throw failure(
        "Someone updated this wallet. Please review and try again.",
        409,
      );
    return envelope(s);
  });
  async function ownerSession(req: FastifyRequest) {
    const s = await session(req);
    if (s.role !== "owner")
      throw failure("Only the wallet owner can upload expenses.", 403);
    return s;
  }
  async function readImage(req: FastifyRequest) {
    let description = "";
    let image: Buffer | undefined;
    for await (const part of req.parts()) {
      if (part.type === "file") {
        if (
          part.fieldname !== "image" ||
          !["image/jpeg", "image/png", "image/webp"].includes(part.mimetype)
        )
          throw failure("Choose a JPG, PNG or WebP photo.");
        const input = await part.toBuffer();
        try {
          image = await sharp(input, { limitInputPixels: 25000000 })
            .rotate()
            .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        } catch {
          throw failure("This image could not be read. Choose another photo.");
        }
      } else if (part.fieldname === "description")
        description = z.string().max(1200).parse(part.value);
    }
    return { description, image };
  }
  async function storeReceipt(wallet: string, image: Buffer) {
    const id = randomUUID();
    await db.query(
      "INSERT INTO receipts (id,wallet_id,data) VALUES ($1,$2,$3)",
      [id, wallet, image.toString("base64")],
    );
    return id;
  }
  app.post("/api/receipts", async (req) => {
    const s = await ownerSession(req);
    const { image } = await readImage(req);
    if (!image) throw failure("Choose a photo first.");
    return { receiptId: await storeReceipt(s.wallet_id, image) };
  });
  app.post(
    "/api/analyze",
    { config: { rateLimit: { max: 12, timeWindow: "1 minute" } } },
    async (req) => {
      const s = await ownerSession(req);
      const { description, image } = await readImage(req);
      if (!description.trim() && !image)
        throw failure("Add a description or photo first.");
      let analysis;
      try {
        analysis = await analyzeExpense(description, image);
      } catch (e) {
        throw failure((e as Error).message, 422);
      }
      return {
        ...analysis,
        ...(image ? { receiptId: await storeReceipt(s.wallet_id, image) } : {}),
      };
    },
  );
  app.get("/api/receipts/:id", async (req, reply) => {
    const s = await session(req);
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const wallet = await getWallet(s);
    const archived = (
      await db.query<{ state: PactState }>(
        "SELECT state FROM weeks WHERE wallet_id=$1",
        [wallet.id],
      )
    ).rows;
    if (
      s.role !== "owner" &&
      ![wallet.state, ...archived.map((w) => w.state)].some((w) =>
        w.expenses.some((e) => e.receiptId === id && e.shareReceipt),
      )
    )
      throw failure("This attachment is private.", 403);
    const receipt = (
      await db.query<{ data: string }>(
        "SELECT data FROM receipts WHERE id=$1 AND wallet_id=$2",
        [id, s.wallet_id],
      )
    ).rows[0];
    if (!receipt) throw failure("Attachment not found.", 404);
    return reply.type("image/jpeg").send(Buffer.from(receipt.data, "base64"));
  });
  app.post(
    "/api/speech/transcribe",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req) => {
      await ownerSession(req);
      const file = await req.file();
      if (
        !file ||
        file.fieldname !== "audio" ||
        !/^audio\/(webm|mp4|wav|x-wav|mpeg|ogg)(;.*)?$/.test(file.mimetype)
      )
        throw failure("Choose a supported audio recording.");
      const audio = await file.toBuffer();
      if (!audio.length) throw failure("The recording is empty. Try again.");
      try {
        return await transcribeAudio(audio, file.mimetype);
      } catch (e) {
        throw failure((e as Error).message, 422);
      }
    },
  );
  app.get("/api/monthly", async (req) => {
    const s = await session(req);
    const { month } = z
      .object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) })
      .parse(req.query);
    const wallet = await getWallet(s);
    const states = [
      wallet.state,
      ...(
        await db.query<{ state: PactState }>(
          "SELECT state FROM weeks WHERE wallet_id=$1",
          [wallet.id],
        )
      ).rows.map((w) => w.state),
    ];
    const expenses = states
      .flatMap((w) => w.expenses)
      .filter((e) => e.date.startsWith(month));
    return {
      month,
      spent: expenses.reduce((n, e) => n + e.amount, 0),
      funded: states
        .flatMap((w) => w.contributions)
        .filter((c) => c.at.startsWith(month))
        .reduce((n, c) => n + c.amount, 0),
      expenses: expenses.length,
      flagged: expenses.filter((e) => e.flags.length).length,
      acknowledged: expenses.filter((e) => e.flags.length && e.acknowledged)
        .length,
      fastFood: expenses.filter((e) => e.fastFood).length,
      categories: categories.map((category) => ({
        category,
        amount: expenses
          .filter((e) => e.category === category)
          .reduce((n, e) => n + e.amount, 0),
      })),
      weeks: states
        .map((w) => ({
          week: w.weekStart,
          amount: w.expenses
            .filter((e) => e.date.startsWith(month))
            .reduce((n, e) => n + e.amount, 0),
        }))
        .filter((w) => w.amount > 0)
        .sort((a, b) => a.week.localeCompare(b.week)),
    };
  });
  return app;
}
