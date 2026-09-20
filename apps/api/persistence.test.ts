import { it, expect } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { openDatabase } from "./db";
import { buildServer } from "./server";
it("retains the session and saved expense after the API and disk database reopen", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pact-persistence-"));
  let db = await openDatabase(directory);
  let app = buildServer(db);
  try {
    const started = await app.inject({
      method: "POST",
      url: "/api/session",
      payload: {},
    });
    const session = started.json();
    const cookie = `pact_session=${started.cookies[0].value}`;
    const id = randomUUID();
    const saved = await app.inject({
      method: "POST",
      url: "/api/actions",
      headers: { cookie },
      payload: {
        walletId: session.walletId,
        version: session.state.version,
        action: {
          type: "add-expense",
          expense: {
            id,
            merchant: "Auto home",
            amount: 6000,
            category: "commute",
            date: session.state.weekStart,
            note: "After class",
          },
        },
      },
    });
    expect(saved.statusCode).toBe(200);
    await app.close();
    await db.close();
    db = await openDatabase(directory);
    app = buildServer(db);
    const restored = await app.inject({
      method: "GET",
      url: "/api/state",
      headers: { cookie },
    });
    expect(restored.statusCode).toBe(200);
    expect(restored.json().walletId).toBe(session.walletId);
    expect(
      restored.json().state.expenses.find((e: { id: string }) => e.id === id)
        ?.amount,
    ).toBe(6000);
  } finally {
    await app.close();
    await db.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);
