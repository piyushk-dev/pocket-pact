# Pocket Pact design direction

Ananya and her dad, Kunal, agree on a weekly plan. The product supports independence through expense capture, understandable exceptions, and conversation. It never blocks access to money or treats a food photograph as proof of an amount spent.

## Approved visual reference

The user supplied CashBook landing-page and phone-walkthrough screenshots and requested this direction in place of the earlier green/serif concept. Follow their white backgrounds, violet accents, large sans-serif headings, black pill buttons, light grid backgrounds, soft card shadows, device mockups, dark closing CTA and expandable FAQs. Use Pocket Pact's own brand, content and expense flows. The primary CTA is **Demo**.

Image generation was unavailable at its usage limit during the redesign. Device scenes are implemented directly in React/CSS from the supplied references; no generated bitmap is required.

## Tokens and composition

- Canvas `#ffffff`; ink `#24212f`; violet `#5947ed`; pale violet `#f4f1ff`; line `#eae7f1`.
- Self-hosted Manrope, 400–700. Bold sans-serif headings and readable tabular money figures.
- Landing: sticky horizontal header, split hero, animated phone, story strip, feature grid, laptop expense preview, three steps, dark CTA, FAQ and footer.
- Four illustrative phone states: weekly balance → receipt capture → expense/context review → saved and shared. Automatic playback pauses with user controls. Reduced motion starts with a static screen and supports explicit playback/step selection.
- App: horizontal desktop navigation, prominent violet balance card, white expense and pact surfaces, black primary actions. Mobile has a visible persona selector and bottom navigation.
- Navigation: Overview, Expenses, Our pact, Family. Demo persona selector stays visible.
- Lucide outline icons; rounded 18–27px surfaces; subtle borders and shadows.

## Required supporting states

Add expense uses a focused dialog: input → suggested details → explicit confirmation. Photo, voice and typed entry share the review step. Details remain editable before sharing. Unknown price is left blank. Budget flags are deterministic and remain distinct from planned AI extraction.

Expenses have filters, detail view, context and acknowledgement. A proposed pact change requires the other person's acceptance. Kunal's view emphasizes remaining funds, category totals and shared exceptions. Demo top-ups are bookkeeping, not real transfers. Empty, failure and success states remain available. Backend integrations are deferred until UI review.
