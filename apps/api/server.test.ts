import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { openDatabase, type Database } from "./db";
import { buildServer } from "./server";
import { weekBounds } from "../../packages/shared/domain";
let db: Database;
let app: ReturnType<typeof buildServer>;
let ownerCookie = "",
  supporterCookie = "";
let walletId = "";
const headers = (cookie: string) => ({
  cookie,
  origin: "http://127.0.0.1:5173",
});
const wallet = {
  title: "College",
  role: "owner",
  owner: "Asha",
  supporter: "Meera",
  relationship: "Mentor",
  weeklyAmount: 100000,
};
const payload = (merchant = "An expense") => ({
  type: "add-expense",
  expense: {
    id: randomUUID(),
    merchant,
    amount: 10000,
    category: "meals",
    date: weekBounds(),
    note: "",
    fastFood: true,
    shareReceipt: false,
  },
});
const state = async (cookie = ownerCookie) =>
  (
    await app.inject({
      method: "GET",
      url: "/api/state",
      headers: headers(cookie),
    })
  ).json();
async function action(value: object, cookie = ownerCookie, version?: number) {
  const s = await state(cookie);
  return app.inject({
    method: "POST",
    url: "/api/actions",
    headers: headers(cookie),
    payload: {
      action: value,
      version: version ?? s.state.version,
      walletId: s.walletId,
    },
  });
}
beforeAll(async () => {
  db = await openDatabase("memory://");
  app = buildServer(db);
  await app.ready();
}, 30000);
afterAll(async () => {
  await app.close();
  await db.close();
});
describe("wallet API", () => {
  it("isolates demo wallets and prevents foreign origins", async () => {
    const a = await app.inject({
      method: "POST",
      url: "/api/session",
      payload: {},
    });
    const b = await app.inject({
      method: "POST",
      url: "/api/session",
      payload: {},
    });
    expect(a.json().walletId).not.toBe(b.json().walletId);
    expect(a.cookies[0].httpOnly).toBe(true);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/session",
          headers: { origin: "https://untrusted.example" },
          payload: {},
        })
      ).statusCode,
    ).toBe(403);
  });
  it("creates an empty authenticated wallet and disallows perspective switching", async () => {
    const r = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        username: "asha",
        name: "Asha",
        password: "a long test password",
        wallet,
      },
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().state.expenses).toEqual([]);
    expect(r.json().demo).toBe(false);
    ownerCookie = `pact_session=${r.cookies[0].value}`;
    walletId = r.json().walletId;
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/demo/role",
          headers: headers(ownerCookie),
          payload: { role: "supporter" },
        })
      ).statusCode,
    ).toBe(403);
  });
  it("joins an invite exactly once with a separately authenticated supporter", async () => {
    const invite = (
      await app.inject({
        method: "POST",
        url: "/api/invites",
        headers: headers(ownerCookie),
        payload: {},
      })
    ).json();
    const registered = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        username: "meera",
        name: "Meera",
        password: "another long password",
        wallet: { ...wallet, role: "supporter" },
      },
    });
    supporterCookie = `pact_session=${registered.cookies[0].value}`;
    const joined = await app.inject({
      method: "POST",
      url: "/api/invites/join",
      headers: headers(supporterCookie),
      payload: { token: invite.token },
    });
    expect(joined.statusCode).toBe(200);
    expect(joined.json().walletId).toBe(walletId);
    expect(joined.json().connected).toBe(true);
    expect(joined.json().role).toBe("supporter");
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/invites/join",
          headers: headers(supporterCookie),
          payload: { token: invite.token },
        })
      ).statusCode,
    ).toBe(404);
  });
  it("enforces role permissions for spending and contributions", async () => {
    expect((await action(payload(), supporterCookie)).statusCode).toBe(403);
    expect(
      (
        await action({
          type: "top-up",
          id: randomUUID(),
          amount: 100000,
          note: "Weekly support",
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await action(
          {
            type: "top-up",
            id: randomUUID(),
            amount: 100000,
            note: "Weekly support",
          },
          supporterCookie,
        )
      ).statusCode,
    ).toBe(200);
  });
  it("requires both people to accept food preferences", async () => {
    const s = await state();
    const id = randomUUID();
    expect(
      (
        await action({
          type: "propose",
          id,
          budgets: s.state.budgets,
          baseVersion: s.state.pactVersion,
          note: "Two fast-food meals per week",
          fastFoodLimit: 2,
        })
      ).statusCode,
    ).toBe(200);
    expect((await action({ type: "accept-pact", id })).statusCode).toBe(400);
    expect(
      (await action({ type: "accept-pact", id }, supporterCookie)).statusCode,
    ).toBe(200);
  });
  it("flags a third fast-food meal, saves anyway, and supports context and acknowledgement", async () => {
    for (let n = 0; n < 2; n++)
      expect((await action(payload())).statusCode).toBe(200);
    const third = payload("Burger after class");
    const r = await action(third);
    expect(r.statusCode).toBe(200);
    expect(r.json().state.expenses[0].flags.join()).toContain("2 fast-food");
    expect(
      (
        await action(
          {
            type: "acknowledge",
            id: third.expense.id,
            reply: "Thanks for explaining",
          },
          supporterCookie,
        )
      ).json().state.expenses[0].acknowledged,
    ).toBe(true);
    expect(
      (
        await action({
          type: "add-context",
          id: third.expense.id,
          note: "The mess was closed",
        })
      ).json().state.expenses[0].acknowledged,
    ).toBe(false);
  });
  it("deduplicates retries and rejects stale concurrent writes", async () => {
    const expense = payload("Bus");
    const s = await state();
    const a = await action(expense, ownerCookie, s.state.version);
    const b = await action(expense, ownerCookie, s.state.version);
    expect(a.statusCode).toBe(200);
    expect(b.statusCode).toBe(200);
    expect(
      b
        .json()
        .state.expenses.filter(
          (e: { id: string }) => e.id === expense.expense.id,
        ),
    ).toHaveLength(1);
    expect(
      (await action(payload(), ownerCookie, s.state.version)).statusCode,
    ).toBe(409);
    const current = await state();
    const results = await Promise.all([
      action(payload("A"), ownerCookie, current.state.version),
      action(payload("B"), ownerCookie, current.state.version),
    ]);
    expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
  });
  it("stores private uploads, strips metadata, and enforces sharing at the API", async () => {
    const bytes = await sharp({
      create: { width: 40, height: 40, channels: 3, background: "#aa8844" },
    })
      .png()
      .toBuffer();
    const boundary = "pact-test-upload";
    const multipart = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`,
      ),
      bytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const upload = await app.inject({
      method: "POST",
      url: "/api/receipts",
      headers: {
        ...headers(ownerCookie),
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: multipart,
    });
    expect(upload.statusCode).toBe(200);
    const id = upload.json().receiptId;
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/api/receipts/${id}`,
          headers: headers(ownerCookie),
        })
      ).headers["content-type"],
    ).toBe("image/jpeg");
    const expense = payload();
    Object.assign(expense.expense, {
      receiptId: id,
      evidence: "photo",
      shareReceipt: false,
    });
    expect((await action(expense)).statusCode).toBe(200);
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/api/receipts/${id}`,
          headers: headers(supporterCookie),
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (await state(supporterCookie)).state.expenses[0].receiptId,
    ).toBeUndefined();
    const outsider = await app.inject({
      method: "POST",
      url: "/api/session",
      payload: {},
    });
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/api/receipts/${id}`,
          headers: headers(`pact_session=${outsider.cookies[0].value}`),
        })
      ).statusCode,
    ).toBe(404);
    const sharedUpload = await app.inject({
      method: "POST",
      url: "/api/receipts",
      headers: {
        ...headers(ownerCookie),
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: multipart,
    });
    const shared = payload();
    Object.assign(shared.expense, {
      receiptId: sharedUpload.json().receiptId,
      evidence: "photo",
      shareReceipt: true,
    });
    await action(shared);
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/api/receipts/${sharedUpload.json().receiptId}`,
          headers: headers(supporterCookie),
        })
      ).statusCode,
    ).toBe(200);
  });
  it("aggregates recorded monthly spending and archives old weeks without losing data", async () => {
    const before = await state();
    const report = (
      await app.inject({
        method: "GET",
        url: `/api/monthly?month=${before.state.weekStart.slice(0, 7)}`,
        headers: headers(ownerCookie),
      })
    ).json();
    expect(report.expenses).toBe(before.state.expenses.length);
    expect(report.spent).toBe(
      before.state.expenses.reduce(
        (n: number, e: { amount: number }) => n + e.amount,
        0,
      ),
    );
    const previous = { ...before.state, weekStart: "2026-01-05" };
    previous.expenses = previous.expenses.map((e: object) => ({
      ...e,
      date: "2026-01-05",
    }));
    await db.query("UPDATE wallets SET state=$1 WHERE id=$2", [
      JSON.stringify(previous),
      walletId,
    ]);
    const rolled = await state();
    expect(rolled.state.weekStart).toBe(weekBounds());
    expect(rolled.state.expenses).toEqual([]);
    expect(
      (
        await app.inject({
          method: "GET",
          url: "/api/monthly?month=2026-01",
          headers: headers(ownerCookie),
        })
      ).json().expenses,
    ).toBe(before.state.expenses.length);
  });
  it("logs out, logs back in, and retains wallet membership", async () => {
    await app.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: headers(ownerCookie),
      payload: {},
    });
    expect(
      (
        await app.inject({
          method: "GET",
          url: "/api/state",
          headers: headers(ownerCookie),
        })
      ).statusCode,
    ).toBe(401);
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "asha", password: "a long test password" },
    });
    expect(login.statusCode).toBe(200);
    expect(login.json().walletId).toBe(walletId);
  });
});
