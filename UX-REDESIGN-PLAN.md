# Afterparty: make the demo feel like a great game night

Detailed product, gameplay, UX, and visual design proposal · 15 November 2026

## Experience correction · 15 November 2026

The user reviewed the implementation and found the game order incomplete, the screens unlike Kahoot, and the experience empty. Their follow-up explicitly keeps the existing rules and prioritises pacing, reveals, and screens. Accounts, customisation systems, and game packs are outside this correction.

The earlier implementation satisfied many technical milestones but understated the room gathering and the public performance. The intended sequence is now explicit and playable:

**Setup → waiting lobby → host starts → how to play / optional practice → countdown → private answer → lock in → staged public reveal → personal result → leaderboard → next round / next game → finale.**

| Reference experience | Gap in our implementation | Implemented correction |
| --- | --- | --- |
| Blooket: a shared Game ID, joining methods, visible participants, and an explicit host Start | A fully populated cast appeared immediately; there was no joining beat | A six-digit local demo code; simulated arrivals; code/name entry and rejoining; a waiting phone; lock/unlock; minimum-player feedback; host Start above the stage |
| Kahoot: a distinct shared-screen lobby and private controller | The lobby resembled character settings; mobile stacked all roles | A violet public room and separate personal waiting state; fullscreen; dedicated mobile lobby/phone controls |
| Kahoot: large prompts, timed answering, consistent answer locations and clear result beats | Small timers and neutral surfaces made the phases blend together | Prominent timers/time bar, numbered round progress, four consistent answer colours plus letters, distinct countdown and result screens |
| Blooket: the shared game communicates activity and changes in position | Waiting was mostly an icon and a sentence | Ballpark shows who has locked in; Bluff shows anonymous answer cards; Guess Who presents the whole cast equally; standings celebrate the actual round leaders |
| Blooket's Gold Quest includes a second decision and uncertain outcomes after answering | Our rules have different sources of fun: estimates, deception, and recognising friends | Retain those rules at the user's request. Improve their payoff through locked-choice suspense, anonymous vote totals, author/truth reveals, and an explicit next-round rhythm |

References reviewed: [Blooket hosting and lobby](https://help.blooket.com/hc/en-us/articles/15984215236503-How-to-Host-a-Blooket-Game), [Blooket joining](https://help.blooket.com/hc/en-us/articles/15985153979415-How-to-Join-a-Blooket-Game), [Gold Quest's answer / chest / outcome loop](https://help.blooket.com/hc/en-us/articles/42100784373655-Game-Overview-Gold-Quest), and [Kahoot's shared-screen hosting sequence](https://kahoot.com/files/2021/06/StarterGuide_0621.pdf). These are documented product patterns and official screenshots, not a claim to have played a current live session.

The code is a functioning local walkthrough, not a cross-device service; the screen says so. Real QR/link joining remains deferred. A fresh lobby starts with the reviewer present, then adds demo guests. The host can fill the cast immediately, turn off automatic arrivals, lock the room, or start with at least four joined players. Unjoined players are excluded when play starts. Rematches keep the cast together.

The shared five-second reveal now has three readable beats: all choices locked; anonymous distribution / votes; the truth or author. Private results release with the public answer. Bluff writers and the secret author remain undisclosed before the result. No scoring or game rules changed.

Verification is recorded in QA.md. Improved UI and passing automation do not establish that a real party finds the games fun; the human play sessions in section 17 remain necessary.

**Status:** local-demo implementation delivered following the user's explicit instruction to implement this plan. See IMPLEMENTATION.md for shipped scope and remaining human validation, DESIGN.md for the implemented system, and QA.md for observed checks. The original proposal is retained below as design rationale.

**Confirmed brief:** friends and family at a party; one hosted night mixing Bluff Battle, Guess Who, and Ballpark; the clarity, character, and satisfying feedback associated with Duolingo and Blooket. Keep the product a local demo until the UI and UX feel ready. Production infrastructure is deliberately deferred.

**Core recommendation:** replace the dashboard-led experience with a playable game-night flow. Give the host a calm, contextual controller, the player a focused personal action, and the shared display a well-paced show. Keep a discreet demo controller around that experience so one person can review every role without managing fourteen simulated identities.

## Contents

1. [Scope and evidence](#1-scope-and-evidence)
2. [What needs to change](#2-what-needs-to-change)
3. [The experience we are designing](#3-the-experience-we-are-designing)
4. [Make playing feel rewarding](#4-make-playing-feel-rewarding)
5. [Demo operation](#5-demo-operation)
6. [Navigation and information architecture](#6-navigation-and-information-architecture)
7. [Screen plans and placement](#7-screen-plans-and-placement)
8. [Round phases and host control](#8-round-phases-and-host-control)
9. [Game-specific redesign](#9-game-specific-redesign)
10. [Scoring, fairness, and progression](#10-scoring-fairness-and-progression)
11. [Visual direction and design tokens](#11-visual-direction-and-design-tokens)
12. [Responsive layout and accessibility](#12-responsive-layout-and-accessibility)
13. [Content and interface language](#13-content-and-interface-language)
14. [Failure, interruption, and recovery](#14-failure-interruption-and-recovery)
15. [Implementation map](#15-implementation-map)
16. [Delivery sequence and acceptance gates](#16-delivery-sequence-and-acceptance-gates)
17. [How we will judge whether it is fun](#17-how-we-will-judge-whether-it-is-fun)
18. [Decisions, risks, and later work](#18-decisions-risks-and-later-work)
19. [Research and local verification](#19-research-and-local-verification)

## 1. Scope and evidence

### What this plan delivers

- A complete proposed game-night journey, from opening the demo to a mixed-game finale and rematch.
- Explicit jobs, layouts, controls, and feedback for the host, player, shared display, and person reviewing the demo.
- Play rules and pacing proposals that address waiting, suspense, role clarity, and understandable rewards.
- A provisional visual system, wireframes, realistic example content, and interaction specifications.
- An implementation sequence with observable acceptance criteria, grounded in the current code.
- A clear boundary between demo UX work and any eventual production work.

### What stays out of the immediate build

Real room services, QR joining, remote phone sessions, authentication, accounts, payment, public question marketplaces, cloud saves, push notifications, and infrastructure migration. None is necessary to evaluate whether this demo is enjoyable. Do not turn the redesign into a backend project.

The shared display and phone in the demo represent future roles. They can run as embedded views over the same local session. A room code must not imply that separate devices can join today.

### What is confirmed and what is assumed

| Item | Status | Design consequence |
| --- | --- | --- |
| Friends and family are the first audience | Confirmed by user | Conversational game-night language; no classroom dashboard |
| A host leads a night mixing all three games | Confirmed by user | A session itinerary and cross-game transitions matter more than a game catalogue |
| Keep it a demo while refining UI/UX | Confirmed by user | Build local scenario controls and role previews before any production systems |
| Duolingo / Blooket are experience references | Confirmed by user | Clear next actions, personal identity, satisfying feedback, visible progress |
| Existing product name is Afterparty | Repository fact; retained provisionally | No renaming project required |
| One reviewer often uses a desktop browser | Working assumption | Default to a well-sized shared stage with a playable phone preview |
| Some reviewers use only a phone | Working assumption | Role tabs must make the whole demo usable on one narrow screen |
| Mixed ages and varying confidence | Working assumption | Comfortable default prompts, private skips, clear instructions, no humiliation |
| Typical party has 6–10 people; stress range 4–24 | Proposal; existing games advertise 4–24 | Default to eight demo participants; test the full existing range |
| Host may also want to play | Open product decision | Demonstrate a spoiler-safe host mode and expose its tradeoffs |

`PRODUCT.md` records durable facts and the user's scope decisions. This document supplies proposed solutions. The existing `DESIGN-PLAN.md` remains historical context; this plan governs the next proposed UX work where the two differ.

## 2. What needs to change

### Current product truth

The repo already implements three distinct games, deterministic simulation, phase transitions, question editing, score calculation, local saves, streak bonuses, and TV/phone views. Keep those strengths. The task is to make the surrounding experience feel like a coherent game rather than a set of tools.

Current routes and source were reviewed alongside fresh desktop captures of `/dashboard` and `/demo`. Existing screenshot files span older visual versions; they are supporting history, not unquestioned evidence of the current UI. Findings below are code and layout observations, not claims from user research.

| Current observation | Why it disrupts play | Proposed response | Evidence |
| --- | --- | --- | --- |
| Host home has a large promotional hero, journey, challenge, library, roster, and rankings | Starting competes with browsing and motivational content | Put the current session and one next action first; move inspiration to game selection | `src/pages/Dashboard.tsx`, `Experience.tsx` |
| Host, TV, player, and demo destinations share a broad sidebar | The visitor must understand the implementation's surfaces before playing | Choose a role through an obvious demo toolbar; use a dedicated live session shell | `src/App.tsx` |
| Real host progression is exposed through the demo playground | A host has to learn simulation and overrides to operate the game | Extract a contextual host controller; put simulation behind simple and advanced demo controls | `src/pages/Demo.tsx`, `Host.tsx` |
| The same action is labelled “Advance phase” across different situations | The host cannot predict what the button will do | “Start round”, “Start voting”, “Reveal answer”, “Show standings”, “Next round” | `RoundControls` |
| New state starts with fourteen fake connected players | People can mistake sample state for a party they created | Choose a demo cast explicitly and label simulated participants | `src/store.ts`, `makePlayers()` |
| FRDY looks like an operational room code | It suggests remote joining which does not exist | In this demo show “Local demo”; any join walkthrough says “Preview only” | `Lobby.tsx`, `Dashboard.tsx` |
| Most players do not write during Bluff Battle or Guess Who | “Waiting for an answer” gives little agency or expectation | Role-specific copy, shorter writing, participation in the reveal, controlled optional reactions | `Gameplay.tsx`, `engine.ts` |
| Guess Who has one private author | Public readiness can inadvertently identify the author | Generic public writing status; private role-specific phone messages |
| Ballpark reveals one estimate every 1.1 seconds | Twenty-four estimates alone take about 26 seconds, before other beats | Bound the full sequence; group outliers and spotlight the final contenders | `live/BallparkReveal.tsx` |
| Phone feedback leads with positive raw points while its header uses normalized championship points | The displayed total can fall after a celebratory round | Label each score explicitly; separate round gains from championship change | `PhoneResult`, `store.next()` |
| Removing a player clears the active round | Roster management can unexpectedly erase the current activity | Defer removal to the next round or offer an explicit unscored restart | `store.removePlayer()` |
| Restarting an awarded round preserves old points and permits a fresh scored attempt | “Restart” can create a second award for the same apparent round | Distinguish replay for practice from void-and-replace; preserve a score ledger | `store.restart()`, README |
| Fonts are declared as Inter while the bundled file is Plus Jakarta Sans | Naming masks the actual visual system | Use the correct family name when implementing tokens | `src/styles.css` |

### Priority order

1. Understand what to do and make it work in one browser.
2. Make the core game loop enjoyable, including waiting and reveal pacing.
3. Make results understandable and fair enough to trust.
4. Give the experience a distinctive, consistent visual identity.
5. Add optional progression only after the first four hold up in play.

More animation cannot repair an unclear role or a confusing score.

## 3. The experience we are designing

### Product promise

**Your friends are the entertainment. Afterparty gives the night its rhythm.**

The app's job is to prompt a funny decision, collect private input, build anticipation, reveal what happened, and make the room want the next prompt. It should repeatedly return attention to the people in the room.

### Three surfaces, three different jobs

| Surface | The question it answers | Most important content | Primary action |
| --- | --- | --- | --- |
| Player phone | “What do I do right now?” | Private role, prompt, input or choices, confirmation | Answer, choose, or watch |
| Shared display | “What is happening in the room?” | Public prompt, anonymous activity, reveal, standings | Usually none; it is a presentation |
| Host controller | “What does the room need next?” | Phase, completion, actionable blockers, pacing | Exactly one contextual progression action |
| Demo toolbar | “How can I inspect the experience?” | View selection, demo player, simulation state | Change view or run a scenario |

The demo toolbar sits outside the simulated product. A reviewer may need it; a fictional player should never have to interact with it.

### A recommended mixed night

Proposed default: **nine scored rounds, three per game**, plus a brief unscored practice prompt when a new game starts. Aim for roughly 12–18 minutes at a comfortable pace; measure actual duration rather than displaying this as a guaranteed claim.

1. **Ballpark opens the night.** Everyone can act immediately; there is no writing role to explain. Guessing creates an easy first success.
2. **Bluff Battle raises the social stakes.** Players understand the input/reveal rhythm before role asymmetry is introduced.
3. **Guess Who closes with the people.** By now the group has a rhythm and the personal reveal is the emotional payoff.
4. **Finale connects the night.** Show the overall result, each game's winner, and a few truthful memorable moments.

The host can reorder or repeat games in setup. A Quick tour scenario runs one scored round of each game for review; it is separate from the default night. A single-game option remains available, but it should not displace the mixed-night recommendation.

Nine rounds do not guarantee every person an author turn. Do not claim they do. Keep a role queue across games and rematches; offer an extended Guess Who segment when a host wants everyone to be the author. Show the actual additional rounds required for the current cast.

### First-time journey

```text
Open demo
  -> Start a demo night
  -> Pick cast + vibe + length (defaults already selected)
  -> Lobby: choose your character, see the itinerary
  -> A very short learn-by-doing practice
  -> Ballpark: answer -> lock -> reveal -> personal result
  -> Brief standings -> next round
  -> Game transition: what changes, what stays familiar
  -> Bluff Battle -> Guess Who
  -> Finale -> play another round / replay with new prompts / finish
```

Returning to a saved demo starts with **Resume demo** and **Start fresh**. It must not silently drop a reviewer into an unexplained mid-round state.

### Five feelings to design deliberately

- **Belonging:** my name and character visibly join the cast.
- **Competence:** I know my role, complete a small action, and see confirmation.
- **Anticipation:** everyone has committed; the answer is about to land.
- **Recognition:** the result explains my contribution, even if I did not win.
- **Momentum:** I can see the next round and the host can start it confidently.

Treat “dopamine” as shorthand for rewarding play. This plan makes no claim that a particular animation or reward produces a measurable neurological effect.

## 4. Make playing feel rewarding

### The smallest useful loop

**Understand -> decide -> commit -> anticipate -> discover -> understand the result -> go again.**

Each beat needs its own visible state. The moment of submission should feel satisfying without pretending the player has already succeeded. Correctness belongs to the reveal.

| Beat | Player experience | Shared screen | Host experience | Proposed duration |
| --- | --- | --- | --- | --- |
| Prompt arrives | One clear task; input is immediately usable | Large prompt and concise instruction | Completion target and timer visible | 0.2–0.4s transition |
| Player chooses | Selection depresses/highlights; confirmation names the choice | No private information | Progress changes after a valid commit | Immediate |
| Submission accepted | “Answer locked” plus submitted value | Anonymous completion increment | Clear accepted count | Acknowledge within 150ms locally |
| All required input is in | “Look at the big screen” | “Everyone's in” | Reveal action becomes ready | 0.5–1.5s breathing space |
| Reveal | Readable personal outcome, timed to the public result | One staged reveal with a focal event | Hold or shorten presentation | Usually 4–9s |
| Reward | Explain raw points and any bonus | Show the meaningful winners/moves | One next action | 1–2s, overlapping result hold |
| Between rounds | My position and next game, if relevant | Short standings or round recap | Next round; pause always available | Host-paced |

These are prototype tuning targets. They are not fixed delays every visitor must endure.

### Reward hierarchy

**Every action:** clear tactile press and reliable confirmation.

**Every round:** show what happened to me, what earned points, and one public result worth talking about.

**Meaningful milestones:** a streak, a bluff that fooled several people, a closest estimate, or a new lead gets a richer moment.

**End of a game:** one stamp added to tonight's itinerary.

**End of the night:** a shared finale and a record of real highlights.

Use one dominant celebration at a time. Do not play a chime, large count-up, confetti, mascot dance, badge unlock, and leaderboard transition simultaneously.

### Keep people engaged without adding chores

- Waiting copy says why the person is waiting and what happens next.
- After submitting, show the locked answer and invite attention to the shared screen.
- Optional reactions are limited to a small set, rate-limited, and cosmetic. They appear during the aftermath of a reveal, never over reading, typing, or private role assignment.
- Let the host hold a funny moment. An automatic countdown must not cut off the room's reaction.
- Include participation and clever deception in truthful highlights, not only accuracy.
- Do not publicly spotlight the lowest scorer or the most extreme wrong estimate by name as a joke.
- A missed round gives direction: “No answer this round. You're in for the next one.”
- Keep losing players eligible; no elimination in the default night.

### Progression that fits occasional parties

Use tonight's three-game itinerary as the immediate progression system. Completing a game segment earns its stamp once. A stamp represents completion, not winning.

A later demo experiment can show a clearly labelled, device-local character collection. Earn a known accessory after a visible milestone, such as completing the three-game tour. Let the person choose the reward. It must not require an account, pretend to sync, affect score, or interrupt a live round.

Avoid daily streak pressure, lives, energy timers, randomized paid rewards, recurring notifications, and rewards for repeatedly clicking through a simulated game. Party nights are occasional social events. Make returning welcoming, not obligatory.

## 5. Demo operation

### Make the local demo the first-class product for now

The default experience should be playable by one reviewer as one participant, with the rest of the cast simulated. It should also be possible to inspect the host and all player roles. Do not force a reviewer to open several tabs or repeatedly manufacture answers.

Proposed toolbar, outside the game frame:

```text
Local demo    View: [ Together ] [ Host ] [ Player ] [ TV ]
Playing as: Alex v       Other players: [ Auto-play on ]    [ Demo tools ]
```

“Together” is the default desktop view. It combines a correctly scaled shared stage and an interactive phone. The host action bar sits directly below the stage. On small screens it becomes a role tab interface rather than shrinking all three surfaces into unreadable miniatures.

### Two levels of demo control

**Everyday review:** change view, choose the participant being previewed, turn other-player auto-play on/off, pause, restart the scenario.

**Advanced tools drawer:** deterministic seed, cast size, response overrides, select a private author, disconnect a participant, force a tie, missing submission, extreme estimate, long text, reset local data, and jump to a state.

Keep advanced tools fully available. Hide their complexity, not their existence. “Demo tools” must be visible and labelled so a reviewer can find it.

### Auto-play contract

- Simulated participants use the existing validation and scoring functions.
- Preserve real answers and votes. Never overwrite a reviewer's submission.
- Schedule a small, deterministic spread of responses; avoid instant simultaneous completion that feels inert.
- Auto-play handles only participants marked as simulated and not currently controlled by the reviewer.
- Freeze pending simulation while paused. Clear scheduled events when leaving a round or changing scenarios.
- State jumps cancel pending work before initializing the target state.
- A participant selector changes which perspective is shown. It must not erase inputs or change the room's phase.
- Show “Demo player” on simulated roster entries; never invent live human activity.
- Auto-play produces plausible variety rather than making every simulated person correct.
- Replaying the same seed reproduces scoring, roles, and answer timing for comparison.
- Distinguish “Preview another player” from “Take control of this player”. Only the latter transfers manual input; otherwise auto-play eligibility can change accidentally.

### Demo privacy versus real privacy

All secrets exist locally today. For UX review, components should still receive the information appropriate to their role. This makes spoilers intentional and supports a future adapter. It is not a security boundary; a reviewer can inspect local state.

The default host projection shows readiness and blockers without revealing the answer or author. A separate **Show spoilers** switch warns that the host can no longer fairly play that question. Scenario tools can inspect everything, but remain outside the simulated host surface.

### Scenario shelf

| Scenario | Purpose | Starting state |
| --- | --- | --- |
| First night | Assess onboarding and the normal loop | Fresh cast of eight, no score |
| Quick tour | Review all three games quickly | One round per game |
| Write a bluff | Experience the private role | Reviewer is one of three bluffers |
| Be the secret author | Review Guess Who writing and skip | Reviewer is author; spoilers off |
| Big party | Assess roster and reveal density | Twenty-four participants |
| Close finish | Assess suspense and ties | Known seeded scores near the final round |
| Waiting on one player | Assess host recovery | One required input is missing |
| Player returns | Assess refresh / simulated reconnect | Accepted submission already exists |
| Comfortable mode | Assess calm motion and untimed interaction | Reduced motion, no speed bonus, host-paced |

Scenario labels say that the setup is synthetic. Results after real interaction must still be calculated, not hard-coded solely to make the reviewer win.

## 6. Navigation and information architecture

### Proposed destinations

Keep existing URLs working during migration. The hierarchy below is a proposed logical model; do not rename every route in the first implementation.

```text
Start
  Resume demo / Start a demo night
  Explore games

Prepare night
  Itinerary and vibe
  Cast
  Packs

Session
  Lobby
  Learn / Play / Reveal / Standings
  Game transition
  Finale

Prepare content
  Question library
  Question editor and previews

Preferences
  Sound / motion / haptics / comfortable mode

Demo toolbar
  Together / Host / Player / TV
  Demo tools and scenarios
```

### Navigation by context

- **Start and preparation:** compact labelled navigation. On desktop, one slim rail may contain Night, Games, Questions, Settings. On mobile, use the same vocabulary in a menu; there is no need for five permanent destinations.
- **Live session:** remove the broad app sidebar and marketing header. Retain a compact session bar, exit/pause access, and contextual controls.
- **Player:** no host tabs, library links, account icons, or irrelevant bottom navigation during a round. Preferences and leaving are under a labelled menu.
- **TV:** no host controls, simulator inputs, or admin chrome in the presentation itself.
- **Demo toolbar:** remains separate from role navigation. A screenshot/export of a product surface can omit it.
- **Exit while live:** opens a local pause sheet with Resume, Back to setup, and End night. Merely inspecting Questions must not silently advance or reset a game.

Use “Settings” for actual preferences; the current “You” tab does not lead to a real personal profile. Use “Standings” consistently while playing and “Tonight's results” at the finale. Internal engine terminology such as phase, override, and tolerance stays in advanced tools or specialist editing.

## 7. Screen plans and placement

Wireframes are structural and provisional. Example names, scores, and situations below are synthetic demonstration content. They do not claim user activity or product results.

### 7.1 Start: get into an experience immediately

**Question:** “Can I try this now, and what will happen?”

```text
+----------------------------------------------------------+
| afterparty                         Games      Settings    |
|                                                          |
| Make tonight a game night.                                |
| Three games. You play; the demo fills the room.            |
|                                                          |
| [ Start a demo night ]     Explore the games              |
| Local demo. No other devices needed.                      |
|                                                          |
| [Small live vignette: a guess commits, a reveal lands]     |
|                                                          |
| Ballpark              Bluff Battle          Guess Who    |
| Everyone guesses      Write a believable lie Know your cast|
+----------------------------------------------------------+
```

Lead with the playable product, not a dashboard's statistics. A saved session replaces the primary button with **Resume demo** and shows the actual game and round; **Start fresh** is secondary and explains what resets. The vignette is optional and short, with a static reduced-motion version. Do not make an autoplay video a prerequisite to starting.

**Placement:** the primary action is visible in the initial viewport at 390px and desktop. The local-demo explanation sits directly beneath it because that is where expectations are formed. Game discovery comes after starting, not beside a competing “host” route with an unclear difference.

### 7.2 Prepare a night: defaults first, configuration second

**Question:** “What are we playing, and is it suitable for this group?”

Desktop: settings occupy the left two thirds; a sticky itinerary summary occupies the right third. Mobile: choices stack, then a compact sticky summary/action area.

Fields in decision order:

1. **Night length:** Quick tour / Game night / Custom. Game night selected by default.
2. **Vibe:** Easygoing selected; optional competitive variant changes timer/speed settings visibly, not secretly.
3. **Itinerary:** Ballpark, Bluff Battle, Guess Who; show rounds and one-line task. Reorder with buttons as well as drag.
4. **Cast:** eight sample participants; edit names and characters, range 4–24.
5. **Packs:** recommended compatible pack per game. Filter by game, tone, and available question count.

The summary says “9 rounds across 3 games” and a provisional duration range. Advanced controls for exact timers and scoring are collapsed. Primary action: **Open lobby**. Changing packs must not start a round.

If a pack cannot supply enough distinct prompts, show the shortage before starting. Offer fewer rounds or another pack. Repeating content requires an explicit choice; no silent cycling of questions.

### 7.3 Lobby: create belonging and make readiness legible

```text
+----------------------------------------------------------+
| Friday night                              Local demo     |
|                                                          |
| Your cast is here.                                        |
| [Alex] [Priya] [Sam] [Jamie] [Taylor] [Jordan] [Casey] ...  |
|  You    Demo   Demo   Demo    Demo     Demo    Demo        |
|                                                          |
| Tonight:  Ballpark --- Bluff Battle --- Guess Who          |
|            First                                         |
|                                                          |
| 8 participants   Auto-play is on                          |
| [ Edit cast ]                          [ Start night ]    |
+----------------------------------------------------------+
```

Replace a giant decorative room code with cast identity and the actual itinerary. In host view, the participant count and start button stay visible while the roster scrolls. The compact list uses avatar, name, and status; editing expands one row or opens a sheet. Remove per-game score abbreviations and destructive icons from every tile.

The reviewer chooses their character on the phone preview. A small entrance animation acknowledges the choice on the stage once. No mandatory account or avatar shop. **I'm ready** is useful in a future group flow; in the single-reviewer demo it means ready for the practice prompt and does not wait on seven fictional approvals.

**Ready rules:** at least four active participants; a valid itinerary; enabled compatible prompts; no blocking draft configuration. A disabled Start button has an adjacent explanation such as “Add 1 more participant to play.”

### 7.4 Learn the game: teach by doing

Each new game gets one short task explanation and an unscored practice prompt. Practice can be skipped by the host; the reviewer can replay it from Help. Do not repeat full instructions every round.

Example Ballpark instruction: **“Give a number. The closer you are, the more you score.”** Beneath it, show three sample estimates and a correct answer, with an explicit “Practice” label.

The phone uses the same input component as the real game. A private role card teaches “You write” or “You guess” where relevant. Do not make players read every possible role before their own first action.

Host sees **Start practice**, then **Start scored rounds**. Completing practice never increments scores, streaks, history, game stamps, or competitive statistics.

### 7.5 Together view: the demo's main working surface

```text
+-------------------------------------------------------------------+
| Local demo   Together | Host | Player | TV      Alex v   Demo tools |
+-------------------------------------------------------------------+
| Session 1 of 3: Ballpark             Round 2 of 3        Pause      |
| +-----------------------------------------+ +-------------------+ |
| |                                         | | Alex       620    | |
| | How many keys are on a                  | | Give your estimate| |
| | standard piano?                 18s     | |                   | |
| |                                         | | [ 88          ]   | |
| |      anonymous submission arrivals      | | keys              | |
| |                                         | | [Lock estimate]   | |
| |                         6 of 8 answers   | |                   | |
| +-----------------------------------------+ +-------------------+ |
| Host: 2 answers left      [+10 seconds] [Pause] [Reveal when ready] |
+-------------------------------------------------------------------+
```

The shared stage dominates, but the phone remains wide enough to use. At 1440px, target a 320–360px phone column and the remaining width for the stage, with 24px between. Do not retain a 228px app sidebar and another 240px simulator rail that crush the stage. At narrow desktop widths switch composition before the phone becomes cramped.

The host bar is outside the shared display. It can control the current round without competing with the question. Its primary action names the next state; only the relevant secondary action appears beside it. All advanced controls remain in the drawer.

### 7.6 Player: a controller for one task

```text
+--------------------------------+
| [avatar] Alex      Ballpark 2/3  |
|                          Menu  |
| Give your estimate        18s  |
| How many keys are on a         |
| standard piano?                |
|                                |
| [            88             ]  |
| keys                           |
|                                |
| [       Lock estimate        ] |
| You can update it until time's up.|
+--------------------------------+
```

**Top:** name/avatar for identity; compact game and round context; menu. A running total is optional and subordinate. Never place score above the task at a scale that makes winning more prominent than participating.

**Upper-middle:** role/task sentence, prompt, time. Prompt remains visible while composing. Timer is adjacent, not an isolated number whose meaning the player has to infer.

**Middle:** answer input or choices. No separate decorative card around every line of information.

**Lower reachable area:** the action, with safe-area padding. It sits after the input in document order. When the keyboard opens, avoid a fixed footer covering the field or submit action.

**After submitting:** show the accepted value, “Saved” or “Locked” according to the actual rules, and the next expectation. For Ballpark an accepted value remains editable; the action becomes **Update estimate**. A client-side press is not success until the store accepts the action.

For four answer choices, the whole choice is clickable, labelled A–D and text. Proposed default is select, then **Lock choice**; this reduces accidental one-tap commitments. Keyboard activation and a visible selected state are required. The extra tap is a hypothesis to test, especially for fast voting. If tested against direct-submit, both variants must give reliable confirmation and no ambiguous half-submission.

### 7.7 Host: operate the room confidently

```text
+-----------------------------------------------------------+
| Friday night      Bluff Battle, round 2 of 3      Paused?   |
|-----------------------------------------------------------|
| Shared-screen preview                  | Room             |
|                                        | 2 of 3 bluffs in  |
| Public prompt only                     | 1 needs an answer |
|                                        | No spoilers       |
|                                        |                   |
|-----------------------------------------------------------|
| Waiting for 1 bluff     [+10 seconds] [Pause] [Start voting]|
|                                    More round actions ... |
+-----------------------------------------------------------+
```

**Top:** session/game/round and current phase in plain language. Pause is always available. Keep room tools where the host expects them rather than moving controls around each phase.

**Centre:** the public stage preview. Do not show the correct answer by default.

**Right:** compact completion and actionable issues. For Guess Who, use generic status by default so a playing host does not discover the author. A non-playing host can explicitly enable moderation/spoilers to inspect content.

**Bottom:** one primary contextual action, one relevant assistive control, and Pause. A local state change can happen in one click; finishing the night or discarding submissions needs an explicit consequence.

On host mobile, the status and primary action take priority over a scaled TV preview. The preview collapses to a thumbnail; completion details and controls remain readable. Host does not have to scroll to reach **Reveal**.

A small helper sentence explains a blocker: “One bluffer hasn't answered. Add time, replace their bluff, or skip this prompt.” It must never say “simulate submissions first” inside the fictional host product.

### 7.8 Shared display: give the room a focal point

```text
+-----------------------------------------------------------+
| afterparty       Ballpark 2 of 3                 [18s]     |
|                                                           |
|           How many keys are on a standard piano?           |
|                                                           |
|                  [ phase-specific stage ]                 |
|                                                           |
|                   6 of 8 answers received                  |
+-----------------------------------------------------------+
```

Use a stable quiet header, one large central prompt, and a stage that changes with the phase. Public progress lives near the stage's bottom edge; it must never cover answer text. There is no footer slogan, breadcrumb, sidebar, or host toolbar in the TV frame.

During input, reserve room for the upcoming reveal rather than filling the screen with decorations. During reveal, the result becomes the centre of attention. Show a private author's identity only at the reveal cue, never through arrival chips, readiness labels, or timing indicators.

Text sizes scale with the display. Test actual viewing distance; a desktop preview alone cannot prove living-room readability. Support a full-screen stage; controls appear only on explicit interaction and live outside the presentation layer.

### 7.9 Personal result: make the outcome understandable

```text
+--------------------------------+
| Alex                  Round 2  |
|                                |
| You were 2 keys away.          |
|             +840               |
|          round points          |
|                                |
| Accuracy                 840   |
| Closest bonus              0   |
| Streak bonus               0   |
|                                |
| Ballpark total         1,460   |
| Championship change      +25   |
|                                |
| Next: one more Ballpark round  |
| Look at the big screen.        |
+--------------------------------+
```

The example above is illustrative; implementation must calculate all numbers from the score ledger. Do not copy sample totals into fixtures without a valid calculation.

Start with the player's action and consequence. Examples: “Your bluff fooled 3 players”, “You found the author”, “You were 2 keys away”. Then show round points, a concise breakdown, and the correct totals. A zero result remains legible and respectful; it does not trigger a red failure screen.

Championship change can be negative with the current formula. If so, display the signed change and a short explanation under a disclosure. Never animate it as an additional reward or obscure it behind a large positive raw score. The default header should show a clearly labelled game total to reduce this confusion.

### 7.10 Standings: enough competition, then back to play

The TV shows the top five or a small viewport-aware set, the biggest positive movement where one exists, and a clear next-round indicator. Full rankings live in the host and player disclosure. A player's own row remains easy to find even outside the top five.

Rank and score are separate columns. Ties share rank; alphabetical order may stabilize layout but never decides a winner. Animate from previous to new positions once, then hold a stable readable table. Do not leave rows bouncing or numbers repeatedly recounting after unrelated updates.

Avoid a mandatory full-table ceremony after every round. Default: brief standings at the end of a game segment, with an optional short round recap after individual rounds. Keep per-round standings available to the host for competitive mode. This cadence should be tested against showing them every round.

### 7.11 Game transition: renew attention without re-onboarding

Show the completed stamp, the next game, and what changes:

**“Next: Bluff Battle. Three people write a lie. Everyone else finds the truth.”**

The player's next role arrives privately. The host sees **Show practice** or **Start Bluff Battle**. Reuse the same screen positions and input/confirmation language, so learning a new game does not mean learning a new app.

No library browsing, configuration sidebar, or new-page detour is necessary between scheduled games.

### 7.12 Finale: end with a memory and an easy next choice

Reveal the podium once, with tied winners treated equally. Then show three short, evidence-backed moments, for example:

- Closest estimate: Sam, 1 key away.
- Most convincing bluff: Priya, 4 players fooled on one prompt.
- Biggest final-round climb: Jamie, up 3 places.

Only show a highlight if the recorded event supports it. If there are no qualifying events, show fewer highlights. Do not invent superlatives merely to fill three slots.

The host chooses **Play another round**, **Replay the night with new prompts**, or **Finish**. Players see their personal summary and a cosmetic “I'd play again” signal; it does not restart the night without host action.

Offer a local save/export of the results after the ceremony, secondary to playing again. Any “Share” action generates a preview/export; it never sends a message or publishes automatically. A longer progression screen belongs after this choice, not in the middle of the reveal.

### 7.13 Questions and preferences: calm supporting tools

Question browsing uses compact pack summaries with game, tone, question count, and suitability. Search and filters sit above the list they affect. Keep “Use this pack” separate from “Play now”.

The editor uses a two-column form/preview arrangement on desktop, stacked on mobile. Preview has Player and TV tabs. Ballpark requires units and a plain-language scoring range helper; the advanced numeric tolerance remains visible to editors who need it. Guess Who includes guidance and an accessible Skip policy. Bluff questions include a canonical answer and enough curation to avoid obvious truth/lie formatting differences.

Import previews additions, replacements, invalid questions, and duplicate IDs before changing the library. Current import replaces the library; retain that capability with an explicit **Replace library** action and count summary. Editing a live question affects future rounds only, preserving the current snapshot.

Separate player preferences (sound, motion, haptics) from night rules (timers, rounds, speed bonus) and destructive demo resets. Put Reset in a clearly labelled section at the end, with precise consequences. Do not call a settings page a personal profile.

## 8. Round phases and host control

### Proposed state model

Use an explicit session state above the existing round engine:

```text
setup -> lobby -> game_intro -> practice? -> playing
                                             |
          round: countdown -> writing -> voting? -> reveal -> recap
                                             |
                  more rounds -> next round --+
                  next game   -> game_transition -> game_intro
                  no games    -> finale -> finished / rematch
```

Practice is explicitly unscored. Pause overlays an active input phase and records remaining time; it is not a new scored attempt. Display animations are subordinate to these states.

### Host action contract

| State | Host primary action | Automatic behavior | Important guard |
| --- | --- | --- | --- |
| Setup | Open lobby | None | Validate itinerary, cast, and usable questions |
| Lobby | Start night | None | Minimum 4 active participants |
| Intro/practice | Start practice / Start scored rounds | Practice feedback only | No scoring side effects |
| Countdown | None; Pause remains available | Start input after 3 seconds | Once per attempt |
| Ballpark input | Reveal estimates | Save accepted estimates; close at deadline | Warn if no entries; missing people receive no score |
| Bluff writing | Start voting | Indicate when 3 required bluffs exist | No voting with invalid/missing options |
| Guess Who writing | Start guessing | Indicate when author answer exists | Author remains private |
| Voting | Reveal answer / Reveal author | Close votes at deadline | Vote eligibility and one accepted vote |
| Reveal playing | Show result now | Run bounded presentation | Skip changes presentation only |
| Reveal finished | Show standings / Next round | Points have committed exactly once | No separate manual “award” operation |
| Segment complete | Start next game | Stamp for completed segment | Keep scores, cast, and queued roles |
| Finale | Play another round | No restart countdown | Host controls continuation |

Recommended default: automatic acceptance/closure, host-controlled reveal start, host-controlled next round. An optional **Keep it moving** demo mode may advance when everyone is done after a short hold. Turn it off by default until pacing is validated. Never start the next round just because a celebratory animation completed on one screen.

### Timer rules

- Show time remaining consistently on player, TV, and host. The host alone sees extra controls.
- Proposed starting values: Ballpark 25 seconds; Bluff writing 35 seconds and voting 20; Guess Who writing 30 and voting 20. Tune with real typing/reading, especially long answers.
- The host can add 10 seconds during an open input phase. Record the new deadline/remaining time once, not independently in each view.
- At zero, inputs close and an explicit state says so. Do not silently throw “advance the round” errors after a button still looks enabled.
- Pause stops input and auto-play scheduling. The UI says “Paused by host”; draft text is preserved.
- Use one demo clock driver. Embedded views must not each tick the store and accelerate time.
- Reloading or changing role preview must not restart the timer. On returning to an old local save, pause and offer Resume rather than burning the remaining time invisibly.
- Comfortable mode removes countdown pressure, speed bonuses, and urgent ticking; host advances when ready.

### Atomic scoring and reveal synchronization

Freeze accepted submissions when input closes. Compute a score breakdown and commit it once per scored attempt before publishing the public result. The reveal may show intermediate visual beats, but it cannot independently award points. A replay, resize, refresh, or reduced-motion toggle must not award again.

The host's **Show result now** fast-forwards visual beats. It does not recalculate winners or change the order of accepted inputs. All three role surfaces use the same reveal cue/timeline anchor. Phone correctness and points appear at the corresponding public cue, so the phone cannot spoil the TV's reveal.

Reduced motion can skip spatial movement while retaining the shared reveal cue. If the whole demo opts for an instant reveal, all views advance together.

## 9. Game-specific redesign

### 9.1 Ballpark: the welcoming opener

**Core pleasure:** everyone commits to a guess, sees how wildly the room differs, and discovers how close they came.

**Keep:** finite numeric inputs, units, editable estimates until closing, explicit tolerance, closest ties, and a number-line reveal.

**Player flow:** prompt -> enter number -> Lock estimate -> accepted value and Update estimate -> look at the screen -> result with absolute distance and score breakdown.

Use a large numeric field with the unit adjacent. Numeric keyboard is a convenience, not the only way to enter minus signs or decimals. Support typed/pasted negative and decimal values; reject NaN/Infinity and empty input. Display local formatting but normalize numeric input consistently. Do not add a “confidence wager” until basic play is proven; it adds another rule and can distort fairness.

**Bounded reveal proposal:**

1. Show the anonymous distribution, with clustered outliers, for about 1 second.
2. Reveal the correct answer with its unit as the first clear anchor.
3. Focus the nearest three or tied nearest estimates, about 0.8–1 second per focus.
4. Show the closest player(s), their distance, and the bonus.
5. Hold the final number line with every estimate available, then offer the next action.

Target 6–9 seconds for 4–24 players. Avoid twenty-four compulsory individual pans. Everyone gets their own detailed phone result. Publicly showing all names can be a host choice after the result; default outlier grouping prevents ridicule and clutter.

For equal estimates, group markers rather than overlapping names. All tied closest players receive the existing bonus. At zero span, widen the axis around the common value. Negative values and extreme outliers keep the axis truthful; if a secondary transformed/zoomed view is used, label it explicitly. Never alter the apparent numerical distances merely for a nicer animation.

**Example fixture:** “How many keys are on a standard piano?” Answer 88 keys; answer 86 with tolerance 30 gives 840 accuracy points, before any closest/streak bonus. Any published explanatory fact should be checked when refreshing the content library; this plan reuses the existing starter prompt.

**Acceptance:** a reviewer submits and updates a guess, sees the accepted value, and can explain both distance and points. The full 24-person reveal remains bounded.

### 9.2 Bluff Battle: make deception social, keep the rules legible

**Core pleasure:** write something believable, watch others commit to it, then reveal who fooled whom.

**Version 1 keeps three rotating bluffers.** An all-player writing mode is a separate experiment, not a cosmetic change; it needs different choice selection and scoring. Preserve authors being unable to vote and correct attribution of fooled votes.

**Bluffer phone:** “You're writing a bluff. Make up a believable answer.” Show the prompt and a concise example from a different question. Do not show the correct answer. Proposed input limit is 100 characters for new demo prompts, with a readable counter near the limit. Long existing custom answers must be previewed and warned about rather than silently truncated.

**Guesser phone while writing:** “Three players are writing bluffs. Next, find the real answer.” Show a public-safe progress indicator. Do not reveal the bluffers' names before voting. Shorter writing phases and auto-play reduce this wait in the demo.

**Voting:** four equally styled choices, including the truth. The TV and every player view use the same stable order for that round. Shuffle deterministically with a round seed instead of sorting alphabetically. Use opaque option IDs in projections so a player component need not receive an ID literally named `truth`.

Normalize whitespace and casing for duplicate checks. If a bluff matches the canonical truth or another bluff, ask the writer to revise privately before voting. Provide a neutral curated fallback only through an explicit host/demo recovery action. Authorship and any fallback status must remain auditable for scoring; a system-authored fallback earns no bluff-author points.

**Reveal:**

1. Lock all choices visibly.
2. Show vote counts without attaching identities to wrong voters by default.
3. Reveal the truth clearly.
4. Reveal bluff authors and how many they fooled.
5. Give phones the relevant truth/bluff result and points.

Keep one suspense moment; do not turn every option into a slow separate ceremony. A strong bluff deserves recognition even if its author is not leading overall.

**Failure rule:** if a required bluffer is missing, offer Add time, Supply fallback, or Skip prompt. Do not dead-end the round or automatically manufacture a human answer. If fewer valid choices remain, a host must explicitly accept a clearly labelled reduced-choice practice round or replace the prompt; never score a rule change invisibly.

**Acceptance:** a bluffer understands why they cannot vote, a guesser knows what they are looking for, and a result explains exactly which bluff earned which points.

### 9.3 Guess Who: build toward a personal reveal

**Core pleasure:** a surprising answer makes everyone reconsider who in the cast wrote it.

**Keep:** one private author, the author cannot guess, voters cannot guess themselves, an optional private skip, configurable existing scoring, and roster-based selection.

**Author phone:** “Your turn. Answer without giving yourself away.” Prompt, concise guidance, input, and **Send answer**. Secondary **Choose another prompt** is always clear when allowed. Skipping does not identify or penalize the person and does not count as a missed scored round.

**Other phones while writing:** “Someone is answering. You'll guess who.” Do not say which participant is still typing. Public display: “A secret answer is on its way.” No avatar chip, named readiness row, or author-only public notification.

**Guessing:** show the answer as a large quotation with the original question above it at smaller scale. Use a two-column roster grid on a phone, avatar and name on each choice, with selected/confirmed states. At 24 people, the roster scrolls; the quotation can collapse to a two-line sticky summary after the person deliberately scrolls, with an expand control. Search may be offered for large rosters but never replaces visible names at eight people.

Only eligible round participants appear as candidates; the viewer's own identity is excluded. Late arrivals are not silently added to a candidate list after the answer was written. Do not use the mutable entire current roster as the source of truth.

**Reveal:** show aggregate guesses, build one short beat, reveal the author's character/name beside the answer, then show who identified them only if the group is comfortable with that presentation. Author gets “You fooled 5 of 7 guessers” and the scoring result, never an unexplained “correct” badge.

**Content default:** start with comfortable prompts such as “What unexpected skill do you have?” Avoid treating all existing personal/embarrassing prompts as automatically suitable for every family. Curate tone tags honestly; do not rely on the current blanket “Light” metadata.

**Host playing:** content preview and moderation reveal the author. Default spoiler-safe mode gives generic completion only. If moderation is needed, the host explicitly switches to non-playing moderation for that question, or uses a private skip without reading the answer. Be honest that private local projections are a UX convention, not secure multiplayer.

**Acceptance:** observers cannot identify the author from public readiness; author can skip safely; voters find a name in a 24-person roster; the reveal and personal score agree.

## 10. Scoring, fairness, and progression

### Preserve working rules before changing the economy

The first redesign milestone keeps existing scoring and exposes it accurately. The current rules include 500 for a correct Bluff guess, 250 per voter fooled, configurable Guess Who points and speed bands, Ballpark accuracy plus closest bonus, and escalating streak bonuses. The championship sums capped normalized per-game averages.

Do not alter several scoring systems while also changing every screen. Establish the current-rule UX baseline first, then compare an explicitly versioned scoring experiment.

### Score vocabulary

| Label | Meaning | Where shown |
| --- | --- | --- |
| Round points | Raw points earned in this round, including listed bonuses | Personal result and result detail |
| Game total | Raw accumulated points in the current game | Player header/result |
| Championship score | Existing normalized overall result | Overall standings and finale |
| Championship change | Signed change in normalized score after this round | Result disclosure, when championship is shown |
| Tonight's stamps | Completed scheduled game segments | Itinerary and finale |
| Character reward | Cosmetic milestone experiment, if enabled | Between games or after finale |

No generic `pts` number should switch between these meanings depending on the screen.

### Fairness audit before calling the mode competitive

- Freeze eligible participants at round start. Counting current connections in an author's denominator can change rewards midway through a round.
- Missing, skipped, and ineligible turns must be distinct. Current scoring constructs points for all players; audit whether newly added/nonparticipant people can incorrectly accumulate `played` rounds or streak changes.
- Author/bluffer turns preserve existing correct streaks but do not invent an accuracy bonus. Show a streak bonus only when it was actually awarded.
- Role schedules should use least-recent/least-used participants with deterministic tie breaking. Carry the schedule into rematches.
- Explain that nine short rounds do not equalize all author opportunities for a large group.
- Correct streaks can snowball. Preserve them initially, then test cosmetic-only streaks as a separate competitive-balance option.
- Speed rewards favor fast readers and input methods. Easygoing/comfortable mode sets the speed bonus to zero. Changing that setting applies at the next round and is visible before input begins.
- Ties share winners and bonuses; no hidden random tiebreak.
- Practice, skipped, voided, and replay-only rounds never award championship or progression credit.
- Replays and duplicate reveal calls cannot change the ledger twice.

### A possible later scoring experiment

If normalized averages remain confusing in testing, compare a “game medals” championship: rank people within each finished game and award a clearly published fixed medal-point schedule, with tied ranks receiving the same points. This would make championship totals cumulative and segment-based. It also introduces new tradeoffs for missed games and unequal roles, so it is a design experiment, not an automatic implementation instruction.

Do not replace current scoring until we can explain the alternative in one short sentence, test representative 4/8/24-person sessions, and compare fairness across author and guessing roles.

### Record the events needed for truthful rewards

Use an append-only local result ledger or immutable result records. Each scored round needs a session ID, game-segment ID, round ID, attempt ID, rule version, eligible participants, accepted input snapshot, point breakdowns, role assignments, before/after scores, reveal cue, and award status. Keep a void/replacement relationship if a result is corrected.

Highlights derive from this data. “Most convincing bluff” needs counted votes per authored option; “closest” needs numeric distance and tie handling; “biggest climb” needs actual prior ranks. A positive-sounding placeholder is not an achievement.

## 11. Visual direction and design tokens

### Design exploration, then a provisional recommendation

The current purple/lime mascot treatment shows the desired energy, but applying it to a long dashboard has not resolved the interaction. Keep the permission to be playful while choosing a coherent world around a game-night ritual.

Seven grounded sources were considered: tabletop game pieces; house-party invitation graphics; collected party-photo stickers; friendly quiz-show title cards; local multiplayer character-select screens; hand-kept scorecards; and community game-night posters. These offer different combinations of identity, legibility, and celebration. Literal arcade cabinets and dense “control room” costumes would make host operation harder.

**Provisional direction: a party-photo sticker cast.** Distinctive characters begin as your identity badge, commit your answer privately, appear together at the reveal, and become a collected memory of the night. The memorable visual element is the living cast of character stickers, not a decorative hero mascot that follows people through every task.

This world lends the palette, bold friendly type, character treatment, and one signature reveal move. It does not dictate navigation or replace ordinary buttons with novelty controls.

**First viewport:** a playable stage and a clear start action, with a small cast demonstrating the reveal. **Visitor path:** start, choose identity, practice, play. **Signature move:** at the reveal cue, character stickers attach to the relevant truth/author/closest-result area, making the group's choices tangible. **Reach:** identity in the lobby, anonymous activity during input, authorship at reveal, memories at the finale. **Risk:** too many stickers can obscure information; only a bounded active group animates, while names and counts remain ordinary readable UI.

The strongest familiar alternative is a tabletop-piece world with tactile controls and colored game tokens. It is easy to understand but more likely to resemble other party-game apps. Retain it as an alternative for review, not a second simultaneous style.

Unrelated visual challengers were considered for discipline: airport wayfinding contributes a demand for unmistakeable next actions, event catalogues demand efficient cast density, typographic specimen sheets demand legible numeric hierarchy. Their literal visual costumes are declined because they reduce audience identification and/or game clarity. Borrow the clarity standards, not airport arrows, catalogue tables, or print ornaments.

This is a written proposal. Before implementing the visual system, review three structural wireframes within this one world: stage-led Together view, host-led live view, and player-led mobile view. They are role compositions, not three unrelated brands. A future approved `DESIGN.md` should record the actual chosen system; do not claim this plan is that approval.

### Compact core palette

| Token | Proposed hex | Role and reason |
| --- | --- | --- |
| Paper | `#FFFFFF` | Clean reading/input surfaces, keeps content crisp |
| Cloud blue | `#EFF4FF` | Quiet preparation/player ground with a cooler playful character |
| Midnight blue | `#18254B` | Readable text, outlines, high-contrast silhouettes |
| Party violet | `#6142D8` | Primary host/player actions and selected states |
| Marigold | `#FFD45A` | Earned highlights, anticipation, game completion |
| Pool blue | `#39C9DD` | Cast accents and Ballpark identity, with dark text |

Semantic extensions: success foreground `#14613E` on `#E8F8EE`; error foreground `#A52A3A` on `#FFF0F2`; muted text `#53617B`; focus ring `#1464D2`. These are functional tokens, not additional dominant page colors. Verify actual text/background pairings before implementation; a proposed hex table is not a contrast audit.

Do not put white body text on marigold or pool blue. Use midnight text. Give answer choices letter labels and symbols in addition to color. Game identity uses a symbol, name, and accent rail; semantic error/success colors never change by game.

### Typography

Use **Plus Jakarta Sans**, correctly named, as the main local family. It is already bundled and suitable for rounded, confident game UI. Use 400/600 for reading/forms, 700 for controls, and 800 for prompts and results. A second font is unnecessary for this iteration. Use tabular numerals on timers and score columns where the font supports them.

Proposed modular scale: 14, 16, 20, 25, 31, 39, 49, 61, 76. Body text defaults to 16px/1.5; fine supporting text is 14px/1.4. Player prompts typically 25–31px; desktop display prompts 49–61px; TV fullscreen prompts can grow to 76px where content fits. Long prompts wrap rather than shrink into illegibility. Keep prose below about 65–75 characters per line.

Sentence case throughout. No tracked uppercase eyebrow over every heading. Numbers indicate real round order or ranking, not decorative catalogue numbers on unrelated game cards.

### Layout grammar

- An 8px spacing rhythm with 4px adjustments: 4/8/12/16/24/32/48/64.
- Inputs and controls use modest 12px corners; answer panels 16px; character stickers may be fully rounded. Radius communicates object type rather than applying the same pill treatment everywhere.
- A 3px vertical “pressed” edge is reserved for primary action and answer controls. Ordinary information panels stay flat.
- Outlines communicate selection, grouping, and keyboard focus. No border purely to fill empty space.
- Content and forms are left-aligned. Shared prompts and reveal focal points are centred. Numeric columns align right. Never justify interface copy.
- One focal area per phase: prompt during input, truth/author/number during reveal, winner/rank during results.
- No gradient washes, endless floating confetti, glass layers, or repeated hover lifts on every card.

### Character and illustration plan

Begin with a small original cast of eight characters, each with a distinct silhouette, expression, and accent. Use existing assets as placeholders where appropriate; final art is a later visual implementation task. Names remain readable without recognizing the character. Allow duplicate characters with distinguishable names/markers; character scarcity must not block joining the demo.

Expressions: ready, thinking, committed, delighted, surprised, calm. A wrong answer gets surprise or encouragement, never a shaming face. One optional shared mascot can guide practice; it recedes during real input.

### Motion and sound vocabulary

| Event | Motion | Sound / haptic |
| --- | --- | --- |
| Press | 1–3px depression, 80–120ms | Optional tiny haptic; no tap sound by default |
| Valid selection | Clear border/check, 120–180ms | None |
| Accepted submission | Check resolves; button becomes confirmation, 180–250ms | One soft cue if enabled |
| Role assignment | Private card changes, 200–300ms | Optional private cue; no public identity leak |
| Reveal | One controlled 400–700ms focal transition within the reveal timeline | One reveal cue |
| Score update | 500–800ms count-up after cue, then stable | One reward cue; no sound per digit |
| New leader / milestone | Short character reaction, 700–1000ms | Distinct modest cue |
| Finale | One 1–2s celebration, then calm | Optional finale cue |

Sound remains off until the reviewer opts in; unlock audio only on interaction. If TV and phone are embedded, one audio owner prevents duplicated sounds. Haptics are progressive enhancement and never essential feedback. Respect both system and in-app reduced-motion preferences; no screen should depend on an entrance animation to become visible.

### Self-critique against the brief

The obvious first proposal would be a big mascot hero, five mobile tabs, a winding progression path, a streak flame, and a currency bar. That resembles the reference products without solving this game's social roles. This proposal replaces that with a session itinerary, a role-specific task, and character-based public reveals. It keeps tactile feedback and earned milestones because they serve actions already in the game.

The signature character move must earn its screen space. If it distracts from reading or hides the answer, reduce it to the identity/reveal layer. The host interface remains precise and quiet. The visual recommendation can change during review without invalidating the gameplay and layout reasoning in this plan.

## 12. Responsive layout and accessibility

### Layout targets

| Width / setting | Composition | Non-negotiable |
| --- | --- | --- |
| 320–479px | One role at a time; role switcher outside play surface | No horizontal overflow; input/action readable with keyboard |
| 480–767px | Single column; optional stage thumbnail | No shrunken embedded phone |
| 768–1099px | Main active role with preview tab or collapsible secondary view | Reachable host action without long scroll |
| 1100–1439px | Together stage + phone if each remains usable | Phone at least ~320px; otherwise switch composition |
| 1440px+ | Stage dominant, phone 320–360px, bounded content width | One browser viewport holds primary task/control |
| 1280x720 / 1920x1080 TV | Dedicated stage, safe margins, larger type | No admin chrome; room-distance legibility |
| 200% zoom / large text | Reflow and scroll content vertically | No clipped prompts or hidden controls |

Use actual container width to choose embedded composition. A window's width alone does not tell us how much space a phone has inside a panel. Use `100dvh` carefully for live views and reserve real safe-area padding. Do not force a full-height layout that clips on a short landscape phone.

### Accessibility acceptance

- Aim for [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) and verify the complete flows during implementation. This is a target, not a compliance claim for this plan.
- All primary targets at least 44x44 CSS pixels; aim for 48–56px tall game actions.
- Visible keyboard focus, semantic buttons, proper labels, and radio-group behavior where choices behave as a single selection.
- Never rely on color, motion, sound, or haptics alone.
- Correct reading/focus order follows identity -> task -> prompt -> input -> action -> feedback.
- After phase change, announce the new task once. Do not move keyboard focus away from a still-valid input on unrelated updates.
- Avoid announcing timer seconds continuously. Announce meaningful warning thresholds only, with an accessible way to hear remaining time on request.
- Accepted submissions and results have stable polite live-region summaries. Errors needing immediate action can be assertive, but not every timer tick or avatar arrival.
- Dialogs/sheets trap and restore focus appropriately; Escape closes non-destructive overlays.
- Comfortable mode supports untimed host advancement and disables speed-based rewards.
- No flashing, aggressive final-second scaling, or endless motion. Reduced motion shows clear state changes and synchronized result timing.
- Long names, repeated characters, 500-character legacy answers, and screen-reader output remain understandable.
- Question facts, quoted answers, names, and content guidance are text, not only artwork.

## 13. Content and interface language

### One action, one name

| Situation | Proposed copy | Reason |
| --- | --- | --- |
| Start | Start a demo night | Explicitly says what this product currently does |
| Resume | Resume demo | Distinguishes saved state from a new session |
| Input: number | Lock estimate / Update estimate | Matches the accepted editable-until-close behavior |
| Input: bluff | Send bluff | Names the role's task |
| Input: author | Send answer | Does not imply a correct factual answer |
| Voting | Lock choice / Lock guess | Distinguishes selection from commitment |
| Accepted | Answer locked / Estimate saved | Reflects actual editability |
| Waiting after commit | You're in. Look at the big screen. | Gives the next action |
| Waiting on writer | A secret answer is on its way. | Explains the pause without exposing identity |
| Host writing complete | Start voting / Start guessing | Predicts the next state |
| Host result | Reveal answer / Reveal author / Reveal estimates | Uses the specific game's vocabulary |
| Score already committed | Show standings | Avoids making points a manual host responsibility |
| Missed input | Time's up. You're back in next round. | Direct and recoverable |
| Ballpark invalid | Enter a number, such as 88. | Gives a fix |
| Demo only | Local demo. Other players are simulated. | Sets an honest expectation |

Do not use “Advance phase”, “Apply override”, “secret payload”, or internal IDs in normal play. Those terms can appear in the advanced demo drawer where they are useful.

### Content curation

- Build an initial reviewed playlist rather than sending every enabled starter question into the default night.
- Each pack has game, tone, recommended reading level, prompt count, source notes where factual, and explicit sensitive-content guidance.
- The default family-friendly pack avoids forced disclosure, sexual prompts, humiliation, or assumptions about relationships. Target age remains an open decision; do not claim a particular child-safety rating.
- Guess Who answers are private until reveal; the author can change prompts without explanation.
- Bluff and Ballpark questions should produce discussable reveals. Prefer surprising, clear facts over obscure numerical trivia requiring specialist knowledge.
- Factual answers with changing values need an “as of” date or should be excluded from a stable starter set.
- Never silently relabel imported sensitive content as “Light”. Let the host preview tone before using it.

## 14. Failure, interruption, and recovery

These are part of the fun: a confident recovery keeps the room relaxed.

| Situation | Player behavior | Host/demo behavior | Score consequence |
| --- | --- | --- | --- |
| Refresh during input | Restore role, draft where available, accepted answer, and phase | Pause old local save until explicit resume | No duplicate award |
| Refresh during reveal | Show the correct current/final reveal beat | Replay visuals available | Committed award stays single |
| Timer ends during submit | Clearly accept or reject using one authoritative local ordering | No ambiguous partial state | Only accepted input scores |
| Two surfaces submit for same player | Stable accepted value; duplicate explains “Already locked” | Advanced tools can inspect | No double vote |
| A required writer is missing | Explain next phase; preserve others' input | Add time, explicit fallback, or skip | Fallback author earns no bluff points |
| Optional guesser is missing | Close at deadline and allow next round | No blocking error | No answer points; apply documented streak policy |
| Player removed mid-round | Current round snapshot stays consistent | Defer removal or void/restart with warning | Preserve history; do not silently clear round |
| Simulated disconnect | Show local demo connection state and recover | Scenario control can reconnect | No real-network claims |
| Fewer than four active participants | Wait at next start | Explain exactly how many are needed | Do not score a secretly altered mode |
| No enabled compatible questions | Clear empty state | Choose pack / Add question | No half-started round |
| Not enough unused prompts | Explain remaining count | Shorten segment or explicitly allow repeats | No hidden repeated content |
| Duplicate bluff / truth match | Private revision request | Curated fallback or replace prompt | No indistinguishable options |
| Inappropriate private answer | Safe skip where possible | Explicit moderation/spoiler mode if needed | Void/skipped round stays unscored |
| Draft edited in library during play | Current prompt unchanged | “Applies to future rounds” | Frozen round result preserved |
| Restart after points awarded | Clear replay mode | Replay unscored, or void-and-replace via ledger | No accidental accumulation |
| Reset demo | Preview what clears | Require specific reset action | Scores/cast/history effects stated |
| Storage unavailable or corrupt | Keep in-memory demo usable where possible | Explain save failure; offer export/reset | Never silently claim persistence |
| Reduced motion toggled mid-reveal | Final state readable at shared cue | No new score event | No replayed rewards |
| Audio blocked/unsupported | Visual feedback complete | Clear opt-in state | None |

Do not call a simulated disconnect an actual network test. Real reconnection and multi-device race handling belong to later production work.

## 15. Implementation map

### Keep the current stack

No framework migration is needed. The engine/store separation is a useful foundation. Add a session layer and better projections around it. Keep the existing question editor and pure scoring functions until a specific rule change is chosen.

| Existing file | Proposed responsibility / change |
| --- | --- |
| `src/App.tsx` | Separate preparation shell, live session shell, and demo wrapper; retain current route compatibility |
| `src/pages/Dashboard.tsx` | Replace dashboard-first entry with start/resume and preparation flow; library remains secondary |
| `src/pages/Demo.tsx` | Become a thin demo workspace; move advanced overrides/scenarios into a drawer |
| `src/pages/Lobby.tsx` | Compact cast, identity, itinerary, readiness, and meaningful start conditions |
| `src/components/Host.tsx` | Contextual host controller with one primary progression action and explicit blockers |
| `src/components/Gameplay.tsx` | Split player phase views, shared display scenes, results, and standings into focused components |
| `src/components/Experience.tsx` | Replace generic journey/challenge repetition with real session itinerary and segment stamps |
| `src/components/live/BallparkReveal.tsx` | Bounded reveal, ties/clusters, shared cue; view does not own score writes |
| `src/components/live/SubmissionArrivals.tsx` | Public-safe activity; never reveal secret author through identity or timing decoration |
| `src/components/live/Timer.tsx` | Shared display contract, accessible thresholds, pause state, comfortable mode |
| `src/engine.ts` | Preserve baseline rules; add explicit eligibility/result breakdown helpers; rule changes versioned |
| `src/store.ts` | Session itinerary, attempt identity, score commit/void, snapshot participant rules, save migration |
| `src/simulation.ts` | Seeded scheduler inputs, manual-player exclusions, cancellation, scenario fixtures |
| `src/pages/Questions.tsx` | Pack selection/editor separation, form previews, import summary, future-round edits |
| `src/pages/Settings.tsx` | Separate personal preferences from session rules and destructive demo tools |
| `src/styles.css`, `src/experience.css` | Consolidate tokens/components; retire conflicting legacy overrides as migrated surfaces replace them |
| `src/sound.ts`, `src/feedback.tsx` | Single audio owner and event-based feedback, respecting preferences |

Suggested new boundaries: `session/`, `demo/`, `components/player/`, `components/host/`, `components/display/`, `components/results/`. Names are implementation proposals, not a requirement to move every file before behavior changes.

### State and component contracts

- `Session`: itinerary, current segment, session status, cast, rules snapshot, scenario metadata.
- `RoundAttempt`: stable identity, participants/roles, accepted inputs, clock/pause, public phase, immutable result reference.
- `PlayerProjection`: own role/input, public prompt/options when allowed, accepted state, released personal result. No other person's private input before release.
- `PublicProjection`: prompt, phase, public completion, released choices and reveal beats, released standings.
- `HostProjection`: public projection plus readiness/blockers and allowed controls; spoilers added only by an explicit mode.
- `DemoState`: current views, previewed player, manually controlled participants, auto-play, scenario/seed, advanced drawer. Keep this out of competitive scoring.
- `ResultBreakdown`: base points, accuracy, deception reward, speed, closest, streak, total, game total, championship before/after.

Local selectors/projections help prevent accidental UI spoilers. They do not make a local store secure. Avoid pretending a frontend boundary provides real authorization.

### Persistence and migration

The current key is `afterparty-v1`. Introduce a versioned migration rather than discarding existing custom questions and settings. Imported historical rounds may lack the detailed ledger; mark that detail unavailable rather than fabricating it. Preserve the old championship state for baseline review or offer a clear Start fresh choice.

Store accepted inputs and session state; debounce draft persistence. View-only toggles should not rewrite the full session every frame. Keep any long animation progress derived from the reveal anchor rather than persisting dozens of visual steps.

### Performance budget for this demo

Targets to validate: local action feedback within 150ms; no input lag while the timer or standings update; a smooth reveal on a representative midrange phone; no animation cost proportional to an unbounded list of players; no continuous background work after leaving a session. Animate transforms/opacity where practical, and cap decorative particles. These are future acceptance targets, not measured performance claims.

## 16. Delivery sequence and acceptance gates

Implement vertical slices. Each milestone should leave a runnable demo worth reviewing. Do not spend the first several iterations rebuilding every card while the core flow remains fragmented.

### Milestone 0: establish the baseline and review the plan

**Scope:** installation, current-rule audit, this document, agreed demo scope, and a shortlist of first screens.

**Deliverables:** working local repo; baseline test/build results; annotated current friction; reviewable proposed direction.

**Exit:** we agree the first build is one complete demo loop, not a production launch. This task completes the installation and planning portion; no UI approval is inferred from saving the plan.

### Milestone 1: a clean Ballpark vertical slice

**Build:** start/resume -> minimal setup -> lobby -> one practice -> one scored round -> bounded reveal -> personal result -> next round. Together view, focused player, contextual host controls. Keep existing score formula.

**Dependencies:** role view boundaries, one clock owner, exact-once score commit, auto-play exclusions.

**Acceptance:**

- Fresh browser reaches an actionable practice or round without manually creating fake submissions.
- Reviewer enters and updates their own number; others auto-play through normal validation.
- Stage, phone, and host agree on timer, phase, accepted answer, and result.
- Revealing/replaying/refreshing awards points once.
- Primary controls fit at 390x844 and 1440x900; 320px reflows cleanly.
- 4/8/24-person reveal length remains within the proposed budget.
- No functional remote join claim is shown.

**Review question:** can someone who has never seen the project complete one round and explain their result without coaching?

### Milestone 2: make host operation feel finished

**Build:** private/public status, contextual actions, pause/add time, missing-input recovery, spoiler-safe mode, proper action naming, advanced demo tools drawer.

**Acceptance:**

- Host identifies the phase and next action at a glance.
- No ordinary action requires the advanced drawer.
- No player input gets overwritten by auto-play or role switching.
- Pause and resume preserve draft, accepted input, clock, and scheduled simulation.
- Replay after scoring is explicitly unscored or void-and-replace.
- Mobile host can reveal/advance without scrolling past a TV preview.

### Milestone 3: Bluff Battle and Guess Who

**Build:** role-specific phone tasks, writing wait states, stable option order, duplicate handling, private skip, safe author status, game-specific reveals, and role queues.

**Acceptance:**

- Reviewer can play both writer/author and guesser roles through scenario presets.
- Private roles are not exposed by public arrivals or host defaults.
- Four valid Bluff choices remain distinguishable and consistently ordered.
- Guess Who candidate lists follow the round snapshot and exclude self.
- Missing required authors cannot dead-end the demo.
- All results have correctly attributed points and appropriate role language.

### Milestone 4: one complete mixed night

**Build:** itinerary, three segments, transitions, game completion stamps, accurate championship changes, meaningful finale, rematch with new prompts.

**Acceptance:**

- A nine-round demo completes without opening the game library between segments.
- Cast, role queue, score history, and preferences persist through transitions.
- Stamps come from completed segments, not visits or clicks.
- Finale highlights are computed from actual events and ties are honest.
- Rematch clearly states which scores reset and which preferences/cast persist.
- Resume restores a coherent paused local night, not an unexplained frozen view.

### Milestone 5: visual identity and feel

**Build:** approved character language, palette/type tokens, selection/press/reveal motion, audio ownership, responsive fit, comfortable mode. Apply it to already-working flows.

**Acceptance:**

- Character identity is memorable while task content stays dominant.
- Consistent component states: rest, hover, focus, selected, pressed, disabled, pending, accepted, error.
- Exactly one dominant reveal/celebration at a time.
- Actual phone and host operation remain fast; visual upgrades do not create mandatory delays.
- Reduced motion, sound off, keyboard use, and enlarged text preserve the full flow.

### Milestone 6: test with people and refine

**Build only what testing justifies:** shorten waits, adjust reveal beats, fix unclear actions, rebalance layout, improve pack tone. Optional collection/reaction experiments come after core problems are resolved.

**Acceptance:** first-time reviewers can start and finish; hosts can recover from a missing input; players understand scoring; the group wants to continue for reasons they can describe. Keep iterating the demo until the owner feels its UI and UX are ready.

### Explicitly later: production decision

Only after a separate decision to leave demo mode: choose room infrastructure, authorization, server-side validation/scoring, private projections, authoritative deadlines, reconnect policy, retention/privacy model, deployment, and operations. The README mentions Convex as a possibility; this plan does not select it or require it.

## 17. How we will judge whether it is fun

### Formative review sessions

Start with a small set of first-time participants and at least two different people trying host controls. Observe small family/friend groups where possible; a local demo review cannot establish actual network or physical-room behavior. Separate facilitator notes from product analytics.

Give tasks without explaining the interface:

1. Start a night and choose who you are.
2. Submit and update a Ballpark guess.
3. Play a bluffer and then a guesser.
4. Be a secret author and skip a prompt you dislike.
5. As host, pause, add time, and recover a missing answer.
6. Find out why you earned that score.
7. Finish the mixed night and start a rematch.

Watch where attention goes, where hands stop, whether people read aloud for each other, and whether someone has to explain a role. After each game ask for their own description of what they were trying to do. Do not lead with “Was that fun?”

### Proposed usability targets

These are hypotheses and review gates, not baseline statistics:

| Signal | Initial target | Interpretation |
| --- | --- | --- |
| Start to first action in Quick tour | Under 45 seconds with defaults | Entry friction is low |
| Explain current task after role assignment | Most first-time reviewers get it without coaching | Role copy and hierarchy work |
| Host locates next action | Within about 2 seconds | Controller is predictable |
| Round score explanation | Reviewer distinguishes round gain from championship total | Rewards are trusted |
| Ballpark reveal at 24 participants | About 6–9 seconds plus optional hold | Suspense does not become waiting |
| Missing-input recovery | Host recovers without resetting the whole night | Room stays relaxed |
| Desire for another round | Observe voluntary continuation and ask why | Loop is rewarding beyond novelty |
| Public embarrassment | No unresolved reports of shaming from default reveals/prompts | Social comfort is protected |

If participants want to continue because they enjoyed a specific bluff or reveal, preserve that moment. If they continue only to see an unlock screen, the social game may still be weak.

### Local review instrumentation

An optional local-only event log can record session start, phase entry/exit, role/task exposure, accepted/rejected input, host action, reveal start/skip/end, score commit, and rematch. Use IDs and elapsed times; avoid storing raw personal answer text in analytics. Store no external telemetry by default for this demo. A debug export is explicit and reviewable.

### Verification approach during implementation

Use meaningful engine/store tests for rule invariants: eligible participants, role rotation, duplicate choice handling, score idempotency, replay/void behavior, ties, negative/zero numeric answers, pause/resume, practice exclusion, and save migration.

Use browser flow tests for the vertical slices and scenarios: a full mixed night, manual input preserved under auto-play, secret-author display, 24-person layouts, long content, keyboard submit, mobile keyboard fit, reduced motion, and result synchronization. Test actual focus/reading behavior manually as well as with automation.

Capture representative states at 320, 390, 768, 1024, and 1440 widths; 1280x720 and 1920x1080 presentation sizes; 200% zoom; and short landscape. Review a real iPhone/Android browser later for keyboard, sound, viewport, and haptic behavior. A browser stub cannot verify physical haptics.

## 18. Decisions, risks, and later work

### Decisions this proposal makes

- Prioritize a polished local demo and the ability to review every role in one browser.
- Build one full game loop before broad visual restyling.
- Default to a mixed night, with Ballpark first, and contextual host progression.
- Preserve current scoring for the first UX baseline while labelling it correctly.
- Keep simulation outside the fictional player/host surfaces and clearly label the demo cast.
- Use real participation/results as the basis for progress and highlights.
- Treat character identity and the reveal as the expressive focal point, with a quiet host controller.

These are recommendations for the next implementation pass, not claims that the user has already approved every detail.

### Decisions still worth reviewing before their dependent milestone

| Decision | Recommendation | Needed before |
| --- | --- | --- |
| Default night length | Nine scored rounds; Quick tour is three | Session orchestration |
| Typical cast | Eight in default demo; 4–24 supported | Entry/lobby composition |
| Host plays too? | Demonstrate spoiler-safe mode, with explicit moderation tradeoff | Guess Who host polish |
| Input commitment | Select then lock for voting; editable Ballpark | Player interaction implementation |
| Standings cadence | Segment standings; short optional round recap | Mixed-night pacing |
| Visual world | Party-photo character stickers, disciplined UI around them | New visual system implementation |
| Streak role | Keep existing bonuses first; test cosmetic-only later | Scoring experiment |
| Target ages/content boundaries | Comfortable defaults, final range unconfirmed | Final starter pack curation |
| Long-term collection | Optional local demo experiment after loop works | Any progression expansion |

None needs to block installation or this plan. Ask about a decision when the next implementation slice depends on it, using concrete screens or behavior for review.

### Main risks and responses

- **A pretty simulator still feels like admin software.** Test start-to-first-round and the host controller before beautifying supporting pages.
- **Automation hides an unplayable human flow.** Turn off auto-play and inspect every manual role; clearly distinguish demo speed from human typing time.
- **Asymmetric writing makes many people wait.** Shorten and explain it first; test an all-player variant only as a separate game mode.
- **Reward noise exhausts the room.** One focal moment; quiet input and stable results; optional sound.
- **Normalized score remains emotionally confusing.** Accurate labels first, then a controlled alternative scoring experiment if needed.
- **The phone spoils the TV.** A shared reveal cue releases private results at the right moment.
- **A playing host sees secrets.** Spoiler-safe defaults and explicit moderation mode; no false promise of secure local privacy.
- **Role coverage feels unfair in short nights.** Persist the queue and explain extended author rotations rather than promising equal turns.
- **Supporting edits break the existing demo.** Migrate by vertical slice, retain routes and custom question data, run relevant regressions.

## 19. Research and local verification

### Reference patterns checked

The references inform specific patterns. They do not prove that importing those patterns will improve this product's retention or make a party more enjoyable.

- Blooket documents a distinct host-led shared-screen flow, account-free participation in live games, several joining methods, and player identity selection in the lobby. The useful inference for this demo is role clarity and identity before play. Real joining is deferred here. [Blooket hosting guide](https://help.blooket.com/hc/en-us/articles/17350648357527-How-do-I-host-a-Blooket-game).
- Blooket documents earned XP/tokens after playing and character collection. The useful inference is to make completed play visible; a currency system is not necessary for this demo. [Blooket rewards](https://help.blooket.com/hc/en-us/articles/16620459001495-How-to-Earn-Tokens-XP-in-Blooket).
- Duolingo describes designing milestone feedback to make accomplishment understandable and celebratory. The useful inference is a clearly earned, carefully timed milestone; a party app has no need to copy a daily streak. [Duolingo milestone design](https://blog.duolingo.com/streak-milestone-design-animation/).

### Repository review

Reviewed `main` at commit `aacf053` (Merge latest gameplay refinements with Afterparty redesign). Key evidence: README, prior DESIGN-PLAN, QA notes, route shell, dashboard, lobby, demo controls, player/TV components, live reveal, engine, store, simulation architecture, settings, question editor, and test coverage.

Fresh desktop captures confirmed the long promotional dashboard and the simulator-heavy demo layout. Historical screenshot variants were compared with current code rather than treated as the final visual authority. The review is not a full manual audit of every existing interaction or proof of all documented features.

### Installation and checks completed for this planning task

- Connected the empty local workspace to `https://github.com/pphilfre/partygames` and checked out tracking branch `main`.
- Installed locked dependencies with `npm ci --no-audit --no-fund`: 231 packages installed.
- Local environment: Node 24.10.0 and npm 11.6.1.
- `npm test`: 15 tests passed.
- `npm run build`: TypeScript and Vite build passed.
- Local Chrome smoke check loaded `/dashboard`, `/demo`, and `/play` with no reported page errors. This was a narrow route-load check, not the full gameplay/browser regression suites.
- No application UI, engine rules, production services, or dependency manifests were changed for this plan.

### First implementation to take from this plan

Build **start -> lobby -> one Ballpark practice -> one scored round -> synchronized reveal -> understandable personal result -> next round**, in Together, Host, Player, and TV views over the existing local store. Review that slice until it is intuitive and enjoyable. Then extend the proven structure to the other games and the full night.
