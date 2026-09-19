# Pocket Pact

Shared budgets. Everyday independence.

Ananya is away at college. Her dad, Kunal, sends ₹1,000 for the week. Together they make a plan for meals, commuting, study essentials and a little spending of her own. Pocket Pact makes expenses easy to record and exceptions easy to explain.

## Architecture

- `apps/web`: React + Vite browser application.
- `apps/api`: independent Node.js API; provider secrets stay here.
- `packages/shared`: validated data contracts and budget rules.

The interactive UI is implemented first. Existing Gemini and Sarvam credentials will be connected after UI review. Expense capture, budget flags, context, acknowledgement, top-ups and mutually accepted pact changes currently use local browser demo state. This is a demo household, not a bank account or money-transfer service.

## Development

Node 22.12+ and npm. Install with `npm install`, then run `npm run dev` and open http://127.0.0.1:5173. `npm run build`, `npm run typecheck` and `npm run lint` validate the frontend.

To try the main flow: Add expense → Coffee with friends example → review the ₹60 category overage → Save ₹90 → switch to Kunal in the top-right selector → Family → acknowledge the expense. Our pact also supports a proposed budget change that the other person must accept.

Receipt/photo previews and voice-entry controls are present; provider-backed extraction/transcription are not connected in this UI milestone. Use “Enter details myself” or the labeled examples. Demo data remains in this browser’s localStorage.

## Provenance

This project adapts lessons and selected utilities from the author's earlier Awaaz/Razorpay prototype. The product, UI, and architecture are being changed for Pocket Pact. The original project's history remains in its own repository; this repository does not claim that prior work was created during a later hackathon.
