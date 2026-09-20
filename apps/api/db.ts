import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";

export interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  close(): Promise<void>;
}
export async function openDatabase(
  location = process.env.DATA_DIR || ".data",
): Promise<Database> {
  let db: Database;
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
    db = {
      query: async <T>(sql: string, params?: unknown[]) => ({
        rows: (await pool.query(sql, params)).rows as T[],
      }),
      close: () => pool.end(),
    };
  } else {
    if (location !== "memory://")
      await mkdir(location, { recursive: true, mode: 0o700 });
    const pg = new PGlite(
      location === "memory://" ? undefined : `${location}/postgres`,
    );
    db = {
      query: (sql, params) => pg.query(sql, params),
      close: () => pg.close(),
    };
  }
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, username text UNIQUE NOT NULL, name text NOT NULL, password text NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS wallets (id text PRIMARY KEY, demo boolean NOT NULL, profile jsonb NOT NULL, state jsonb NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS members (wallet_id text REFERENCES wallets(id), user_id text REFERENCES users(id), role text NOT NULL CHECK (role IN ('owner','supporter')), PRIMARY KEY(wallet_id,role), UNIQUE(wallet_id,user_id))`,
    `CREATE TABLE IF NOT EXISTS sessions (token text PRIMARY KEY, user_id text REFERENCES users(id), wallet_id text REFERENCES wallets(id), role text NOT NULL, expires_at timestamptz NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS invites (token text PRIMARY KEY, wallet_id text REFERENCES wallets(id), role text NOT NULL, expires_at timestamptz NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS receipts (id text PRIMARY KEY, wallet_id text REFERENCES wallets(id), data text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS weeks (wallet_id text REFERENCES wallets(id), week text NOT NULL, state jsonb NOT NULL, PRIMARY KEY(wallet_id,week))`,
  ])
    await db.query(sql);
  return db;
}
