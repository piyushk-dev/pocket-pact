# Pocket Pact

Shared budgets. Everyday independence.

Ananya is away at college. Her dad, Kunal, sends ₹1,000 for the week. Together they make a plan for meals, commuting, study essentials and a little spending of her own. Pocket Pact makes expenses easy to record and exceptions easy to explain.

## Architecture

- `apps/web`: React + Vite browser application.
- `apps/api`: independent Node.js API; provider secrets stay here.
- `packages/shared`: validated data contracts and budget rules.

UI and complete user flows are being built first; existing Gemini and Sarvam credentials will be connected afterward. This is a demo household, not a bank account or money-transfer service.

## Development

Node 22.12+ and npm. Install with `npm install`. `npm run dev:web` starts the frontend. The full development command and integration instructions will be added with the API milestone.

## Provenance

This project adapts lessons and selected utilities from the author's earlier Awaaz/Razorpay prototype. The product, UI, and architecture are being changed for Pocket Pact. The original project's history remains in its own repository; this repository does not claim that prior work was created during a later hackathon.
