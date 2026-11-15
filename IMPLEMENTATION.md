# Delivery against the game-night plan

## Live Convex update · 15 November 2026

Real multiplayer supersedes the local-only boundary in the earlier entries. `convex/schema.ts` and `convex/rooms.ts` implement expiring rooms, capability-checked host/player/display access, serialized submissions, server timers and projections. Shared pure scoring and transitions live in `src/session/core.ts` and `src/session/liveEngine.ts`; `/join` and `/room` provide the phone/host/TV flows. Setup defaults to live play with an explicit Demo mode toggle. Demo persistence is isolated from live snapshots. The development backend is deployed; README.md explains Wi-Fi QR joining and frontend hosting for different networks. QA.md records the live LAN browser verification and the remaining physical-device checks.

## Reveal and identity update · 15 November 2026

- Replaced the eight sticker identities with 14 distinct human-face presets. The lobby editor persists skin, six hairstyles, hair colour, four eye styles, facial hair and glasses through the existing avatar field.
- New setups default to 14 participants. Existing cast sizes and names remain saved.
- Bluff Battle reveals animate four coloured vote bars, exact vote counts, the correct answer and bluff authors.
- Guess Who now accepts everyone's answer. The host selects the guessing phase; the game selects one submitted answer, favouring less-used authors. Only that quote is public, each guesser locks one author, and the selected author sits out voting. Scoring remains unchanged.
- Scores count from previous totals, then rows move to the new ranks. Signed score changes remain visible. A third-to-first podium adds spotlights, a winner fanfare and bounded confetti; ties keep their competition ranks.
- Ballpark spotlights guesses from furthest to closest, saving the nearest three for last (about 16.5 seconds for 14). The host can skip to all guesses. Personal results wait until playback finishes; completed playback survives refresh.
- Removed repeated reveal/waiting/reaction/scoring prose, redundant intro steps and finale descriptions. Mobile player headers now span the full card width.
- The lobby renders a local QR code for the player-preview URL and room code. This remains a local demo: remote phones do not share the room.
- Original procedural lobby, play and suspense music loops through one audio transport. Sound is opt-in; pause, mute, tab hiding and route exit stop it. No Kahoot or Blooket recordings are bundled.
- Reduced-motion and comfortable play bypass score movement, the per-player Ballpark sequence and podium choreography while retaining readable results.


Implemented 15 November 2026 following the user's instruction to implement UX-REDESIGN-PLAN.md. This remains a browser-local demo.

## Subsequent experience correction

Following the user's review, retained the game rules and rebuilt the gathering and presentation flow:

- A shared lobby with a six-digit demo code, code-copy/manual fallback, fullscreen, simulated arrivals, visible room lock, minimum-player feedback, and host Start above the stage.
- A separate waiting phone and validated local code/name rejoin flow, with dedicated mobile lobby/phone controls. Arrival state persists, old saved lobbies remain compatible, and play freezes the joined cast. Rematches retain everyone.
- An explicit game-night sequence and running order; three concrete instruction steps and an illustrative example for each game.
- Distinct violet countdowns, prominent timers, remaining-time bars, round progress, matched coloured/lettered answer choices, Ballpark readiness, anonymous Bluff writing, and spoiler-safe Guess Who waiting.
- A staged five-second reveal: locked choices, anonymous vote/distribution beat, then truth/author and synchronized personal results. Round standings spotlight actual joint or sole round winners and name the next game at segment boundaries.
- Added waiting-room regression cases and scripts/show-qa.cjs for the new joining and screen states. Existing rules, score calculation, replay, practice, and award-once behaviour remain in place.

UX-REDESIGN-PLAN.md records the reference comparison and revised experience sequence. This correction does not claim real multiplayer or proven fun with human groups.

## Delivered

- Start/resume; full setup; nine-round mixed night, quick tour, single-game/custom/reordered/repeated segments; compatible packs, unused-prompt counts, cast limits, explicit repeats.
- Editable cast, eight original sticker characters, private roles, learn-by-doing unscored practice, three game segments, completion stamps, computed finale highlights, and fresh-prompt rematches.
- Stage-led Together view, host/player/TV views, mobile role tabs, fullscreen, and existing-route compatibility.
- Contextual host actions, input completion, pause/resume, extra time, closed-input states, missing-writer recovery, deferred roster removal, and consequence confirmations.
- Spoiler-safe projections, anonymous secret-author readiness, explicit moderation, snapshot-based candidate lists, and opaque player choice keys.
- Preview versus manual-control separation; deterministic, spread-out simulation; preserved input; pause/cancellation by attempt; nine synthetic scenarios; advanced tools and JSON export.
- Editable finite numeric estimates; equal-estimate grouping; truthful number line; tied closest rewards; bounded reveal; synchronized phone results.
- Three rotating bluff writers; stable choice order; duplicate normalization; unscored system fallbacks; role-specific tasks, waiting, and results.
- Private author answers/skips; select-then-lock guessing; large-cast search; aggregate author reveal.
- Immutable results with inputs, role/rule snapshots, components, before/after scores, stable IDs, and void records. Awards commit atomically once; replay and replacement semantics are explicit.
- Separate round/game/championship vocabulary; signed changes; participant-snapshot scoring; baseline streak/role exemptions; honest ties.
- Versioned local persistence and legacy migration preserving custom questions, preferences, and old scores; saved drafts/input; explicit refresh resume; storage-error guidance.
- One audio owner; opt-in sound; progressive haptics; reduced motion; comfortable untimed play; cosmetic character choice/reactions.
- Question-import confirmation and future-round guidance; six comfortable prompts with matching simulated content; personal preferences separated from session rules.
- Unit/browser regression suites, five-width layouts, automated accessibility scans, actual rendered captures, and independent finish review.

## Scope and evidence

Milestones 1–5 are implemented for the local demo. Baseline scoring remains in place; the optional alternate medal economy was not adopted. A fixed five-second shared cue keeps reveals bounded for all cast sizes; the host can fast-forward and controls next-round progression.

Character rewards are local choices, not invented account-backed unlocks. The app makes no measured-fun, retention, child-rating, accessibility-certification, physical-device-performance, or real-reconnection claim. No production service, daily streak, energy mechanic, or multiplayer adapter was added.

The supplied plan already chose the visual world and tokens. Implementation used that direction directly; no separate concept lottery, comp-selection exercise, or quality-bar card was created. The original art was generated for this implementation, with the exact prompt retained beside the asset.

Milestone 6 requires real people. Run the plan's novice-player/host sessions, record task comprehension and reveal/waiting reactions, and validate assistive technology, phone keyboards/haptics, and room-distance readability. Automated checks cannot substitute for that evidence.

`QA.md` records verified scope. `screenshots/night-*.png` contains the implementation captures; `screenshots/night-a11y-report.json` contains unresolved findings from the latest automated scans (an empty array means none in those tested states).
