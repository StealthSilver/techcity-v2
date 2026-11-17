# Rehearsal: TechCity product scenes

Built with the stageshow skill and kit (`src/stageshow/kit`, MIT). Each scene plays once as it
comes into view and leaves its payoff on screen; reduced motion shows the poster (the payoff).

| Scene | Gold copied | Beats → payoff |
|---|---|---|
| Setu (LMS) | table-edit | double-click Ananya's empty score → type 18 → Enter → status rolls to Graded → "12 of 40 graded" |
| Marg (roadmaps) | reorder (rows) + table-edit timing | tick Binary search → Done → 5 of 10 steps → Two pointers unlocks as Up next |
| Spardha (contests) | reorder (no cursor) | "Problem C accepted +120" toast → score rolls 280 → 400 → You glide from 5th to 2nd |
| Riyaaz (practice) | hero-demo + form-error button | Run → Running → three tests pass → "All 3 tests passed" → streak rolls 6 → 7 |
| Kaksha (cohorts) | payout-flow + reorder rows (no cursor) | chapter plays out → its check fills → lab unlocks: Start lab, "18 from your batch" |

Look: `look.css` maps the site's Inter type and inks onto the kit's tokens; each product keeps its
own accent. Layout: desktop pins the 600×520 design to the panel's bottom-right corner so the window
bleeds off both edges of the dotted panel; below lg, a dotted card holds the 358-wide compact design.

Captured: every scene filmed with `film.mjs --gate` in the playground at 1280 and 390 wide; all end
`rehearsal passed`. Faults fixed along the way: real words cut by the crop (status badges, step
badges), a value swapped instead of changed in place, a dark slab in a light window, a phone sliver,
a loose list, a near-tangent chip, cursors resting on words.

Host: checked in the real page at 1440×900 (Setu and Riyaaz scrolled into focus, payoffs held) and
at 375 wide (Setu card, compact layout, no horizontal overflow). Typecheck and lint pass.

Not checked: the other three scenes inside the desktop panel at every lg width (1024–1266, where
the stage scales below 1:1); touch devices; the stand-alone `/products/*` pages (unchanged).

Assumptions: names, scores and figures in the scenes are illustrative, not real student data.
