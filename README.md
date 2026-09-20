# Pocket Pact

Shared budgets. Everyday independence.

Ananya is away at college. Her dad, Kunal, sends ₹1,000 for the week. Together they plan for meals, commuting, study and a little spending of her own. Pocket Pact makes expenses easy to record and exceptions easy to explain. The same flow supports children, students and mentees, with a parent, guardian or mentor as their supporter.

## Run locally

Use Node 22.12+ and npm:

```sh
npm install
cp .env.example .env.local # only if you do not already have this file
npm run dev
```

Open http://127.0.0.1:5173. Vite proxies `/api` to the independent API on port 3001. Existing `.env.local` credentials are used only by the API. Manual entry works without provider keys. The database persists in ignored `.data/postgres`; don't run multiple PGlite API processes against that directory.

`npm run dev:web` and `npm run dev:api` run each service separately. `npm run build` produces `dist/web` and `dist/api`; `npm run start:api` starts the built API. `npm test`, `npm run typecheck` and `npm run lint` run checks.

## Working flows

- Explore Ananya and Kunal's isolated example wallet at `/app`; only the demo permits perspective switching.
- Create an account at `/account`, choose **wallet owner** or **supporter**, and set names, relationship and starting weekly plan. Real wallets start empty.
- Create a private, one-use invite link for the other person. They sign in with their own account and accept it. Links expire after 24 hours; creating another replaces the previous link. Account usernames and passwords are used instead of email; password recovery isn't implemented yet.
- Create multiple wallets or join another wallet, then switch between them in Manage wallets. Each wallet has one owner and one supporter; an account can have different roles in different wallets.
- Record contributions sent outside the app. Pocket Pact tracks funds; it does not hold money, connect to a bank, or transfer payments.
- Type an expense, upload a receipt/photo, or dictate it in Hindi/Hinglish/English. Gemini suggests details; Sarvam transcribes recordings up to 25 seconds. Review and correct everything before saving. Photos without a readable price leave the amount blank.
- Save a photo with manual entry even if AI is unavailable. Uploaded images are decoded, resized and re-encoded without original metadata. They remain private unless the owner selects sharing before saving.
- Budget and food-preference exceptions open a shared conversation. The owner can add context; the supporter can acknowledge and reply. Either person can propose a budget redistribution or fast-food preference; the other must accept. Flags are historical and never block recording an expense.
- `/insights` aggregates actual recorded expenses by month and category, weekly totals and conversations. Prior weeks are archived automatically when the next week starts. A fresh week has no recorded contributions or expenses; no money is automatically transferred or carried forward. Category plans persist.
- Shared views refresh every ten seconds and on window focus. Updates use version checks to prevent lost writes; retrying the same expense or contribution ID cannot double-count it.

## Architecture

- `apps/web`: React + Vite. No provider credentials or database access in the browser.
- `apps/api`: Fastify API, cookie sessions, account authentication, wallet membership, image storage, provider adapters and analytics.
- `packages/shared`: Zod contracts and deterministic pact rules, validated again on the server.
- PostgreSQL schema with a persistent PGlite development database. Set `DATABASE_URL` for PostgreSQL when running multiple API instances. API instances otherwise share no application state; session tokens, memberships, wallet versions, receipts and archives live in the database. Rate limits are currently per instance.

Passwords use salted scrypt. Session and invite tokens are random, stored as hashes; sessions expire after seven days. The API checks membership and role on every protected route. Images are stored in the database and served through access checks, never through public upload URLs. JSON logs never include credentials. Gemini receives only the description and optional normalized image when requested; audio is sent to Sarvam only for transcription.

For hosting, serve `dist/web` with SPA fallback and proxy `/api` to the API. Configure `APP_ORIGIN` to the browser's exact HTTPS origin and `NODE_ENV=production` for secure cookies. Configure database backups and shared rate limiting before wider public use. This is an application MVP, not a regulated payment wallet. No deployment or real-money integration is included.

## UI

The white/violet landing page preserves the approved design. Its five-scene phone walkthrough uses explicitly fictional examples, five-second playback, pause/chapter controls, reduced motion and a quicker enlarged transition. Expense dialogs open without a full-screen blur. Indian sample photos are credited in [docs/design.md](docs/design.md) and in the sample expense details.

## Provenance

This project adapts lessons and selected utilities from the author's earlier Awaaz/Razorpay prototype. The original project's history remains in its own repository; this repository does not claim that prior work was created during a later hackathon.
