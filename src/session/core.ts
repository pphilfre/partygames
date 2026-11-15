import {
  calculate,
  newRound,
  rank,
  roundStreak,
  streakBonus,
  type Game,
  type Question,
} from "../engine";
import {
  championship,
  breakdown,
  hash,
  poolFor,
  type Night,
  type NightRound,
  type Result,
} from "./model";
const uid = () => crypto.randomUUID();
export function timer(n: Night, phase = "writing") {
  return n.vibe === "comfortable"
    ? 86400
    : phase === "voting"
      ? 20
      : n.itinerary[n.segment].game === "bluff"
        ? 35
        : n.itinerary[n.segment].game === "who"
          ? 30
          : 25;
}
function practiceQuestion(game: Game): Question {
  return {
    id: `practice-${game}`,
    game,
    text:
      game === "ballpark"
        ? "How many sides does a triangle have?"
        : game === "bluff"
          ? "Which animal is often called a human’s best friend?"
          : "What is your ideal movie-night snack?",
    answer: game === "ballpark" ? "3" : game === "bluff" ? "A dog" : "",
    pack: "Practice",
    category: "Practice",
    enabled: true,
    tolerance: 3,
    unit: game === "ballpark" ? "sides" : undefined,
    guidance: "Share only what feels comfortable.",
    skip: true,
  };
}
export function makeRound(
  n: Night,
  seed: number,
  practice: boolean,
  replay = false,
  oldQuestion?: Question,
  library: Question[] = [],
  rules = { base: 300, speed: 200 },
): NightRound {
  const segment = n.itinerary[n.segment];
  const available = poolFor(library, segment);
  const unused = available.filter((q) => !n.used.includes(q.id));
  const q =
    oldQuestion ||
    (practice
      ? practiceQuestion(segment.game)
      : unused[0] ||
        (n.allowRepeats
          ? available[(n.roundNumber - 1) % available.length]
          : undefined));
  if (!q)
    throw Error(
      "No unused prompts remain. Choose another pack in setup, or explicitly allow repeated prompts.",
    );
  const r = newRound(segment.game, n.roundNumber, n.players, [q], timer(n), {
    base: rules.base,
    speed: n.vibe === "competitive" ? rules.speed : 0,
  });
  const ids = [...r.participants].sort(
    (a, b) =>
      (n.roleCounts[a] || 0) - (n.roleCounts[b] || 0) ||
      hash(seed, a) - hash(seed, b),
  );
  return {
    ...r,
    id: uid(),
    question: { ...q },
    author: ids[0],
    bluffers: ids.slice(0, 3),
    practice,
    replay,
    revealElapsed: 0,
    revealReady: false,
    fallbacks: [],
    seed,
    phase: "countdown",
    remaining: 3,
  };
}
export function awarded(n: Night, r: NightRound): Night {
  if (r.awarded) return { ...n, round: r };
  const frozen = {
    ...r,
    points: calculate(r, n.players),
    bonuses: Object.fromEntries(
      n.players
        .filter((p) => r.participants.includes(p.id))
        .map((p) => [p.id, streakBonus(r, p)]),
    ),
    streaks: Object.fromEntries(
      n.players
        .filter((p) => r.participants.includes(p.id))
        .map((p) => [p.id, roundStreak(r, p)]),
    ),
  };
  // Curated system fallbacks never earn a human deception reward.
  frozen.fallbacks.forEach((id) => {
    frozen.points[id] = 0;
  });
  if (r.practice || r.replay)
    return { ...n, round: { ...frozen, awarded: true } };
  if (n.ledger.some((l) => l.id === r.id))
    return { ...n, round: { ...frozen, awarded: true } };
  const before = n.players;
  const positions = rank(before);
  const players = before.map((p) => {
    if (!r.participants.includes(p.id)) return p;
    const next = {
      ...p,
      previousScore: p.score,
      previous: positions.find((x) => x.id === p.id)!.rank,
      streak: frozen.streaks[p.id],
      games: {
        ...p.games,
        [r.game]: p.games[r.game] + (frozen.points[p.id] || 0),
      },
      played: { ...p.played, [r.game]: p.played[r.game] + 1 },
    };
    return { ...next, score: championship(next) };
  });
  const values = Object.values(frozen.points),
    best = Math.max(...values);
  const result: Result = {
    id: r.id,
    sessionId: n.id,
    segmentId: n.itinerary[n.segment].id,
    round: r.number,
    game: r.game,
    rulesVersion: "baseline-1",
    attempt: { ...frozen, awarded: true },
    players: before.map((p) => ({
      ...p,
      games: { ...p.games },
      played: { ...p.played },
    })),
    breakdown: Object.fromEntries(
      before.map((p) => [
        p.id,
        breakdown(
          frozen,
          p,
          players.find((x) => x.id === p.id)!,
        ),
      ]),
    ),
    winners:
      best > 0
        ? Object.keys(frozen.points).filter((id) => frozen.points[id] === best)
        : [],
    voided: false,
  };
  const roleCounts = { ...n.roleCounts };
  (r.game === "bluff"
    ? r.bluffers
    : r.game === "who"
      ? [r.author]
      : []
  ).forEach((id) => {
    roleCounts[id] = (roleCounts[id] || 0) + 1;
  });
  return {
    ...n,
    players,
    round: { ...frozen, awarded: true },
    ledger: [...n.ledger, result],
    roleCounts,
  };
}
