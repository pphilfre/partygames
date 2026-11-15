---
name: Afterparty
description: A local game night led by the people in the room.
colors:
  paper: '#FFFFFF'
  cloud: '#EFF4FF'
  midnight: '#18254B'
  violet: '#6142D8'
  marigold: '#FFD45A'
  pool: '#39C9DD'
  muted: '#53617B'
  line: '#DCE3F1'
  success: '#14613E'
  error: '#A52A3A'
  focus: '#1464D2'
typography:
  display:
    fontFamily: 'Plus Jakarta Sans, sans-serif'
    fontSize: 'clamp(48px, 5.5vw, 76px)'
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Plus Jakarta Sans, sans-serif'
    fontSize: 'clamp(25px, 4cqw, 49px)'
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: '-0.035em'
  player-question:
    fontFamily: 'Plus Jakarta Sans, sans-serif'
    fontSize: '24px'
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: '-0.03em'
  body:
    fontFamily: 'Plus Jakarta Sans, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: 'Plus Jakarta Sans, sans-serif'
    fontSize: '15px'
    fontWeight: 800
    lineHeight: 1.4
rounded:
  control: '12px'
  answer: '16px'
  stage: '24px'
spacing:
  compact: '8px'
  related: '16px'
  group: '24px'
  section: '32px'
  generous: '48px'
components:
  button-primary:
    backgroundColor: '{colors.violet}'
    textColor: '{colors.paper}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    padding: '13px 22px'
    height: '52px'
  button-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.midnight}'
    rounded: '{rounded.control}'
    padding: '13px 22px'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.midnight}'
    rounded: '{rounded.control}'
    padding: '12px 14px'
    height: '48px'
  stage:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.midnight}'
    rounded: '{rounded.stage}'
---

# Afterparty design system

## Live connection extension · 15 November 2026

Live multiplayer now supersedes the earlier local-only product boundary below. Preserve the same visual system for `/join` and `/room`: quiet cloud inputs on phones, violet shared lobby, the existing cast and results. Setup has a labelled Demo mode toggle; live hosts get a phone-reachable QR/link and a read-only TV link. Connection status uses an icon plus text, and errors supply a recovery action. The join heading uses 36px; live game introductions scale from 32 to 64px; compact phone branding/status use 22/13px. Live alerts reuse the established error surface #FFF0F2 and a quiet yellow #FFF4CE for reconnection notices. These are intentional extensions, not a redesign. Local/demo-only descriptions later in this file apply to demo mode.

Implemented 15 November 2026 from UX-REDESIGN-PLAN.md. The user authorised implementation of the supplied direction; no separate concept lottery or comp-selection workshop was run.

## Overview

**Creative North Star: "Party-photo sticker cast"**

Friends are the entertainment. Character stickers carry identity, anticipation, and recognition while the surrounding controls stay quiet. The product is a locally simulated mixed game night, never a remote joining service.

The shared stage gives the room a focal point, the phone gives one person a private task, and the host gets a calm next action. Demo controls remain outside those fictional product surfaces.

**Key Characteristics:**
- Cast-led expression with original matte character stickers.
- Clear role-specific tasks and contextual host actions.
- Quiet cloud grounds with strong midnight questions.
- Truthful scoring and synchronized shared reveals.

## Colors

Violet identifies primary actions and selection. White is the reading/input surface; cloud blue grounds the room; midnight carries readable text. Pool blue identifies Ballpark, lilac identifies Bluff Battle, and marigold identifies Guess Who and earned completion. Muted text is #53617B. Success is #14613E on #E8F8EE; errors are #A52A3A on #FFF0F2. Focus uses #1464D2.

**The Color Communicates State Rule.** Pair color with a name, symbol, check, or explicit state. Use midnight text on pool blue and marigold.

## Typography

Plus Jakarta Sans is correctly named and self-hosted from public/fonts/plus-jakarta-sans.ttf. Reading uses 400, supporting controls 600–700, prompts/results 800. The implementation uses responsive roles rather than one rigid scale: desktop start copy reaches 76px; mobile start copy uses clamp(34px,10.2vw,46px); player questions are 24px; shared questions scale by container width. Supporting labels range from 10–14px according to the embedded role. Scores/timers use tabular numerals; prose stays below 70ch.

**The Question First Rule.** The question is the heading; private operational instructions follow it as readable ink text. Do not introduce decorative labels above questions.

## Layout

Desktop Together uses a flexible stage and 340px phone with 24px between, inside a bounded 1640px workspace. Preparation is left-aligned; public prompts/reveal focal points are centered; score columns align right.

Below 1100px, Together shows one role at a time. At 767px the preparation forms stack, the demo toolbar becomes compact, and host preview height is bounded so its next action stays reachable. At 379px controls/layout tighten further. Long content scrolls vertically; no miniature phone is required. The dedicated 1280×720 TV standings use three eight-person columns for a 24-person cast.

```
Desktop Together                 Mobile
local demo toolbar               compact demo controls
session / itinerary              session / role tabs
[ shared stage ][ player ]       [ active role ]
[ host next action ]             [ contextual host action ]
```

The spacing rhythm uses 4/8/12/16/24/32/48/64px. Primary actions are at least 44px; contextual preview/utility controls may be more compact. Do not infer a universal target size from the primary control token.

## Elevation & Depth

Information surfaces are primarily flat. The stage, controller, and sheets use modest soft depth where they are separate objects. Primary buttons use 0 3px 2px #40259e; active buttons depress by 2px with 0 1px 2px #40259e. Secondary depth is 0 3px 2px #ccd5e8. Sticker drop shadows belong to the cast; they are not repeated on every information group.

## Shapes

Controls use 12px corners, answer/grouping objects 16px, and large stage/player frames 24px. Character contours come from transparent PNG alpha, not geometric clipping. Selection outlines communicate state and keyboard focus.

## Components

Primary buttons use violet/white, 52px minimum height, and 13px 22px padding; compact host variants use 44px minimum height. Secondary buttons are white with ink text and a quiet boundary. Focus is a 3px ring offset by 4px. Disabled controls use pale neutral fills and explicit adjacent reasons when blocked.

Inputs are white, 48px minimum height, 12px corners, 16px text, and violet carets. Numeric answers use a larger field and adjacent unit. Choices are select-then-lock, with letters or character/name identities as well as a visible selected state. Accepted values are shown explicitly and editable estimates use Update estimate.

Navigation separates preparation from live play. Desktop demo role controls and mobile role tabs sit outside the product surfaces. Preview does not transfer manual control. Radix sheets trap/restore focus and support Escape for non-destructive closure.

**The Cast Carries Expression Rule.** Character identity belongs in the lobby, private confirmation, reveal, and finale. Keep host controls and question content disciplined.

The transparent 4×2 sprite sheet is public/art/cast-stickers.png: Frog, Tiger, Flower, Alien, Cherries, Bear, Mushroom, Star. Readable names distinguish people even when characters repeat. public/art/README.md retains the exact built-in ImageGen prompt; the PNG also embeds its provenance.

One shared five-second reveal cue gates stage/phone results, with host fast-forward. Sticker attachment uses a short cubic-bezier(.16,1,.3,1) response. System and in-app reduced motion remove animations without hiding content. Sound is opt-in and owned once by the application. Comfortable mode removes timed pressure and speed points. Scoring is independent of visual playback; settled reveals stop rewriting saved state.

## Do's and Don'ts

### Shared-screen experience extension · 15 November 2026

Keep the existing cast, typeface, cloud ground, and violet identity. The lobby and countdown commit to a stronger violet public stage, while player inputs stay on white. The user explicitly requested familiar Blooket/Kahoot experience patterns and retained the existing game rules.

The lobby stage uses show violet #5131B7, deep violet #402293, and supporting text #E2DAFA. Host Start stays above the stage and remains visible while the cast gathers. A large six-digit code is labelled as a local demo walkthrough. On mobile the lobby and private phone have separate controls. Roster arrivals are actual persisted demo state, not a repeated entrance animation over an already full cast.

Answer A uses #BB334D, B #2258C7, C #F2C344 with midnight text, and D #137451. These exact colours and letters match between shared and private screens; they identify locations, never correctness. Selection uses midnight plus an explicit selected state; truth uses success green and a check after release. These semantic additions live in src/show.css as --n-answer-a through --n-answer-d. Quiet neutral/support colours remain subordinate tonal variants of the existing system.

Type remains Plus Jakarta Sans. Public questions use the existing container-responsive headline. Supporting embedded-demo labels use the existing compact 9–14px range, with 16–28px readable actions/answers; public room codes use 42–64px, increasing to 96px in fullscreen. The countdown uses 120–200px numerals as a temporary game cue. Small badges may use 6–10px corners; controls remain 12px, answers 14–16px, and stages 24px. These are intentional extensions, not new typographic voices.

Within a round, show answer/guess → lock → reveal → leaderboard. The five-second reveal shows locked input, then anonymous votes/distribution, then the answer. A vote histogram must not identify a bluff writer or secret author. Named Ballpark readiness is safe; Guess Who readiness must remain anonymous. Round spotlights use actual round points and preserve ties; championship scores retain their existing labelled calculation.

One arrival response and one countdown pulse carry the motion. System and in-app reduced motion remove both. All progress and results remain readable without animation or sound.

### Do
- Do give each role one clear next action.
- Do keep the public stage and ordinary host spoiler-safe.
- Do distinguish round points, game totals, and championship changes.
- Do preserve drafts, accepted answers, and scores when pausing or previewing.
- Do label synthetic participants and local-only behavior.

### Don't
- Don't imply remote joining or secure multiplayer from the local store.
- Don't award points, streaks, or stamps for practice or replay.
- Don't reveal a secret author through named readiness or arrival decoration.
- Don't use motion, color, audio, or haptics as the only feedback.
- Don't replace human party and physical-device validation with automated claims.

### Reveal and avatar extension · 15 November 2026

The latest user brief replaces the sticker cast with configurable human faces and expands the game-show results. Human faces are authored modular vectors: six skin tones, six hair shapes/colours, four eye styles, four facial-hair choices and four glasses options, with 14 distinct defaults. Avatar-specific complexion/hair colours belong to identity rather than the interface semantic palette.

Keep operational copy short. Locked phones show the player's name, accepted answer and locked state. Results use scores and identities; remove ornamental commentary, repeated privacy notices and reaction explanations. Retain one local-demo boundary in the lobby and the demo toolbar.

Reveal counts use 28px numerals and 17–24px answers; scoreboard names use 17–18px with 21–23px totals. The podium uses a violet #402293 stage, white names, yellow #FFD45A first place, pale silver #DCE3F1 second, bronze #E8AB83 third, and #F7E8FF secondary scores. Existing 10/14px answer/control corner variants continue; podium plinths use 12px. Gold spotlight beams and confetti are bounded to the finale.

Leaderboard totals count for 1.15s and reorder after 1.25s with an 850ms deceleration. Podium places arrive at 350/1700/3200ms, with ties preserved. Ballpark guesses arrive furthest-first at 1050ms each, with 1650ms for each of the nearest three. A skip action and reduced-motion alternative make all results immediate. Personal Ballpark points wait for the shared playback to finish. Original procedural music is opt-in and stops on pause, mute or hidden tabs.

