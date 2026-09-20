import { openDatabase } from "./db.ts";
import { buildServer } from "./server.ts";
const db = await openDatabase();
const app = buildServer(db);
await app.listen({
  port: Number(process.env.API_PORT || 3001),
  host: process.env.API_HOST || "127.0.0.1",
});
console.log(
  "Pocket Pact API listening on port " + (process.env.API_PORT || 3001),
);
async function close() {
  await app.close();
  await db.close();
  process.exit(0);
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
