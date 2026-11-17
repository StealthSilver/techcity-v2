# Rehearsal: TechCity project scenes

Hero pictures for `/projects` and `/projects/{ongoing,upcoming,completed}`, built with the stageshow
skill and kit (`src/stageshow/kit`). Each plays once as it comes into view and keeps its payoff on
screen; reduced motion shows the poster (the payoff). Campuses, tracks and dates come from
`lib/projects`; the scores in the completed report and the weekly sessions are illustrative.

| Scene | Gold | Beats → payoff |
|---|---|---|
| all (board) | reorder | Faridabad's progress fills → its card glides from Ongoing to the top of Completed, Ambala moves up, the completed cards step down → counts roll 2 → 1 and 5 → 6 |
| ongoing | payout-flow | Thursday's MERN lab finishes (Live → Done) → Friday's AI/ML goes live and finishes → week rolls 9 → 10 of 18 |
| upcoming | payout-flow | lab set-up and timetable go pending → done → status rolls Preparing → Ready to start |
| completed | chart-scrub, subscriptions | the weekly assessment line draws in while the average rolls 52% → 84% |

Layout: a 600×540 design pinned to the bottom-right of the hero's tinted picture panel (pinned,
bottom bleed, one gutter on three sides); a 358×320 compact design on phones, in the flow.

Captured: every scene filmed with `film.mjs --gate` at 1280 and 390 wide; all end
`rehearsal passed`. Fixed along the way: a window narrower than tall at 600 high (now 540), a week
count whose digit strip overflowed the phone stage (now `Roll`), meter → Delivered and Live dots
that popped (now `States` and steady dots), headings off the card text edge, track badges wrapping
on the phone (hidden there), a count whose width jumped (now rolls from 52%).

Host: `/projects` and `/projects/ongoing` checked at 1440×900, `/projects/completed` at 375 wide;
all four routes return 200; typecheck and lint pass.

Not checked: the scenes playing in a visible browser at full frame rate (the preview pane was
hidden); `/projects/upcoming` by screenshot; touch devices.
