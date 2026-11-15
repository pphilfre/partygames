# Afterparty product context

## Live multiplayer update · 15 November 2026

The user now explicitly authorizes Convex multiplayer, real phone joining by QR/code, and connections to the physical host app, while retaining a demo toggle. This supersedes the local-only/deferred-multiplayer constraints below. Live rooms use authoritative Convex mutations, server timers, and server-side projections; demo mode retains the existing browser-local simulation. The physical app is interpreted as this web app running on the host computer with an optional separate TV browser. Native executable packaging was not requested.

<!-- impeccable:product-schema 1 -->

Recorded 15 November 2026. This file separates confirmed product facts from proposed decisions in `UX-REDESIGN-PLAN.md`.

## Platform

web

## Users

The primary audience is friends and family at a party. The user confirmed a hosted game night mixing all three existing games as the intended session. The host and the people playing are equally important audiences for the redesign.

## Product Purpose

Make a group game night fun, intuitive, and easy to run. Players should understand their next action, enjoy the anticipation and reveals, and want another round. Hosts should understand the state of the room and run the night without managing a development tool.

## Operating Context

The existing product separates a shared display, a player phone interface, and host tools. The user explicitly wants to keep it a demo until the UI and UX feel ready. The immediate deliverable must make a locally simulated game night coherent and reviewable; multiplayer and production work must not become prerequisites. A shared screen with personal phones is a future real-world configuration to validate. The current demo must represent those roles within one browser. The confirmed session mixes Bluff Battle, Guess Who, and Ballpark.

## Capabilities and Constraints

- The repository is `https://github.com/pphilfre/partygames`; the product currently calls itself Afterparty.
- Existing stack: React 19, TypeScript, Vite, React Router, Zustand, Motion, Tailwind CSS, and Radix primitives.
- Three implemented game engines: Bluff Battle (write bluffs and identify the truth), Guess Who (identify the author of an anonymous answer), and Ballpark (numerical estimation).
- The current implementation is a browser-local prototype. Local persistence and same-origin storage events do not provide multiplayer across separate devices.
- The store currently contains private answers and roles. Real multiplayer requires authoritative room state and separate public, player, and host projections.
- The original task produced installation and a detailed plan. On 15 November 2026 the user explicitly authorised implementing that plan with thoughtful UI/UX. IMPLEMENTATION.md records the shipped local-demo scope; QA.md records verification and remaining human validation.

## Brand Commitments

Latest review, 15 November 2026: the user explicitly adds Kahoot's hosting and screen sequence to the experience references. They ask for a waiting lobby, visible code and joining, host Start, and a fuller game experience. Their clarification is to **keep the rules and focus on pacing, reveals, and screens**. Accounts, expanded customisation, and game packs are not the requested work. Local-only code entry demonstrates the joining experience without changing the deferred multiplayer scope.

Duolingo and Blooket are the user's explicit experience references. These establish a desire for clear actions, rewarding progress, playful interaction, and enjoyable hosting and play. Copying their artwork, exact styling, daily engagement mechanics, or classroom positioning is not a confirmed requirement.

Afterparty remains the product name. The authorised implementation adopts the plan's party-photo sticker cast, cloud/midnight/violet palette, and local Plus Jakarta Sans. DESIGN.md and its sidecar record the implemented system; real-party and physical-device validation remain open.

## Evidence on Hand

- `README.md`, `DESIGN-PLAN.md`, and `QA.md` describe the prototype and earlier design work.
- `src/engine.ts`, `src/store.ts`, `src/components/Gameplay.tsx`, and `src/pages/` expose the actual rules, state, and flows.
- `screenshots/` includes historical captures from more than one visual revision. Current code takes precedence where these conflict.
- Existing engine and browser QA scripts provide a starting point for regression checks, not evidence of future multi-device support.
- No user testing, measured retention, product analytics, or deployment performance evidence was supplied.

## Product Principles

1. Make the next action obvious for each role and phase.
2. Design for the group enjoying each other, including while waiting.
3. Reward real actions and outcomes with understandable feedback.
4. Give hosts control over pacing without routine technical work.
5. Preserve trust through understandable scoring, private roles, and recovery from interruptions.

## Open Decisions

Target age range; content boundaries; exact future device setup; eventual multiplayer provider and deployment; persistence beyond one night; and changes to scoring and role distribution remain unconfirmed. Production is explicitly deferred. The redesign plan supplies labelled recommendations for review, with demo usability first.

## Latest requested changes · 15 November 2026

The user now explicitly requests a 14-person lobby, configurable human-face avatars, a lobby QR code, much shorter copy, Bluff vote graphs, animated leaderboard movement with sound, original quiz-style background music, a spotlight podium, and a furthest-first Ballpark reveal. Guess Who changes to everyone writing, with one submitted answer selected for the question. This supersedes the earlier statement that expanded customisation and rule changes were outside scope. Real multiplayer remains deferred; QR codes open the local player-preview route.
