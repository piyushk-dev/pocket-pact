# Pocket Pact design direction

Ananya and her dad, Kunal, agree on a weekly plan. The product supports independence through expense capture, understandable exceptions, and conversation. It never blocks access to money or treats a food photograph as proof of an amount spent.

## Approved visual reference

The user supplied CashBook landing-page and phone-walkthrough screenshots and requested this direction in place of the earlier green/serif concept. Follow their white backgrounds, violet accents, large sans-serif headings, black pill buttons, light grid backgrounds, soft card shadows, device mockups, dark closing CTA and expandable FAQs. Use Pocket Pact's own brand, content and expense flows. The primary CTA is **Try the web app**. There is no separate “Watch the flow” button.

Image generation was unavailable at its usage limit during the redesign. Device scenes are implemented directly in React/CSS from the supplied references; no generated bitmap is required.

## Tokens and composition

- Canvas `#ffffff`; ink `#24212f`; violet `#5947ed`; pale violet `#f4f1ff`; line `#eae7f1`.
- Self-hosted Manrope, 400–700. Bold sans-serif headings and readable tabular money figures. Main app body copy is 15–16px; supporting text is generally 14px, with a 12–13px minimum for compact mobile metadata. The short desktop hero must show the phone playback controls in the initial viewport.
- Landing: sticky horizontal header, split hero, animated phone, story strip, feature grid, laptop expense preview, three steps, dark CTA, FAQ and footer.
- Five illustrative phone states: weekly plan → meal photo → food-preference suggestion → shared context and acknowledgement → monthly recap. Each scene holds for nine seconds. Clicking the phone opens an enlarged, manually navigated story with a spatial transition. Pause when offscreen or expanded; reduced motion starts paused and removes the transition. AI food suggestions and monthly figures are clearly labeled previews, separate from the working app state.
- App: horizontal desktop navigation, prominent violet balance card, white expense and pact surfaces, black primary actions. Mobile has a visible persona selector and bottom navigation.
- Navigation: Overview, Expenses, Our pact, Family. Demo persona selector stays visible.
- Lucide outline icons; rounded 18–27px surfaces; subtle borders and shadows.

## Required supporting states

Add expense uses a focused dialog: input → suggested details → explicit confirmation. Photo, voice and typed entry share the review step. Details remain editable before sharing. Unknown price is left blank. Budget flags are deterministic and remain distinct from planned AI extraction.

Expenses have filters, detail view, context and acknowledgement. A proposed pact change requires the other person's acceptance. Kunal's view emphasizes remaining funds, category totals and shared exceptions. Demo top-ups are bookkeeping, not real transfers. Empty, failure and success states remain available. Backend integrations are deferred until UI review.

## Refinement guidance

This iteration uses [Astra Frontend Design](https://github.com/Enixes/astra-frontend-design/blob/main/SKILL.md), particularly its preserve-mode redesign, product UI, motion and quality-gate references. Preserve the accepted white/violet base; prioritize story, reading comfort, alignment and deliberate interactions.

## Image credit

The illustrative meal photo is by [Robin Stickel on Unsplash](https://unsplash.com/photos/tzl1UCXg5Es), used under the [Unsplash License](https://unsplash.com/license). The local asset is `apps/web/public/images/meal-example.webp`. Amounts, people, food preferences and monthly figures in the walkthrough are fictional examples, not facts inferred from the stock photo.
