# Pocket Pact design direction

Ananya and her dad, Kunal, agree on a weekly plan. The product supports independence through expense capture, understandable exceptions, and conversation. It never blocks access to money or treats a food photograph as proof of an amount spent.

Primary concept: `.design/dashboard-concept.png` (local design artifact, generated with the built-in image tool). The concept's original father name is superseded by the user's explicit choice of Kunal.

## Tokens and composition

- Warm paper `#f7f8f2`; ink `#24362d`; forest `#244b3b`; lime `#dff1ad`; line `#dde3d7`.
- Editorial Georgia headings and figures; self-hosted Manrope for interface and body.
- Fixed 224px left rail; open main canvas, 40px desktop gutters, 64/36 content split.
- Navigation: Overview, Expenses, Our pact, Family. Demo persona selector stays visible.
- Primary screen: greeting, weekly balance, recent expenses, agreed category limits, context note, receipt/voice capture strip.
- Lucide outline icons, 20–24px; active Overview icon filled. Rounded 12–16px surfaces, modest borders, no decorative gradients.
- Mobile: compact brand/persona header, bottom navigation, one-column content, large touch targets.

## Required supporting states

Add expense uses a focused dialog: input → suggested details → explicit confirmation. Photo, voice and typed entry share the review step. Details remain editable before sharing. Unknown price is left blank. Budget flags are deterministic and remain distinct from AI extraction.

Expenses have filters, detail view, context and acknowledgement. A proposed pact change requires the other person's acceptance. Kunal's view emphasizes remaining funds, category totals and shared exceptions. Demo top-ups are bookkeeping, not real transfers. Empty, loading, failure and success states are part of every workflow.
