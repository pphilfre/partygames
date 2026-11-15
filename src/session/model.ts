import {
  ballparkScore,
  games,
  rank,
  speedBonus,
  type Game,
  type Player,
  type Question,
  type Round,
} from "../engine";

export type Segment = { id: string; game: Game; rounds: number; pack: string };
export type NightStatus =
  "lobby" | "intro" | "playing" | "transition" | "finale" | "finished";
export type NightRound = Round & {
  liveCompletion?: { received: number; required: number; missing: string[] };
  id: string;
  practice: boolean;
  replay: boolean;
  revealElapsed: number;
  revealReady: boolean;
  ballparkPresented?: boolean;
  fallbacks: string[];
  seed: number;
};
export type Breakdown = {
  accuracy: number;
  closest: number;
  correct: number;
  deception: number;
  speed: number;
  streak: number;
  total: number;
  gameTotal: number;
  before: number;
  after: number;
  distance?: number;
};
export type Result = {
  id: string;
  sessionId: string;
  segmentId: string;
  round: number;
  game: Game;
  rulesVersion: "baseline-1";
  attempt: NightRound;
  players: Player[];
  breakdown: Record<string, Breakdown>;
  winners: string[];
  voided: boolean;
};
export type Night = {
  scoring?: { base: number; speed: number };
  id: string;
  name: string;
  status: NightStatus;
  itinerary: Segment[];
  segment: number;
  roundNumber: number;
  players: Player[];
  round: NightRound | null;
  ledger: Result[];
  used: string[];
  stamps: string[];
  vibe: "easygoing" | "competitive" | "comfortable";
  allowRepeats: boolean;
  roleCounts: Record<string, number>;
  paused: boolean;
  lobby?: { joined: string[]; locked: boolean; elapsed: number };
};
export type DemoView = "together" | "host" | "player" | "tv";
export type DemoState = {
  view: DemoView;
  preview: string;
  controlled: string;
  auto: boolean;
  seed: number;
  scenario: string;
  spoilers: boolean;
  step: number;
  holdout: string;
  disconnected: string[];
};
export const gameOrder: Game[] = ["ballpark", "bluff", "who"];
export const gameCopy: Record<
  Game,
  { task: string; rule: string; waiting: string; symbol: string }
> = {
  ballpark: {
    task: "Estimate the answer",
    rule: "Guess a number. Closer guesses score more. Closest gets +100.",
    waiting: "The room is making its guesses.",
    symbol: "◎",
  },
  bluff: {
    task: "Find the truth",
    rule: "Three players write a believable bluff. Everyone else finds the truth. Guess it for 500 points; fool someone for 250.",
    waiting:
      "Three players are writing believable bluffs. Next, find the real answer.",
    symbol: "✦",
  },
  who: {
    task: "Guess the author",
    rule: "Everyone answers. One answer is picked. Guess who wrote it.",
    waiting: "Everyone is answering.",
    symbol: "?",
  },
};
export const starter = (rounds = 3): Segment[] =>
  gameOrder.map((game, i) => ({
    id: `segment-${i}`,
    game,
    rounds,
    pack: "starter",
  }));
export function poolFor(questions: Question[], segment: Segment): Question[] {
  return questions.filter(
    (q) =>
      q.game === segment.game &&
      q.enabled &&
      (segment.pack === "all" ||
        (segment.pack === "starter"
          ? (q.game !== "who" ||
              ["w4", "w0", "w2"].includes(q.id) ||
              q.id.startsWith("party-w")) &&
            !["n6", "n10"].includes(q.id)
          : q.pack === segment.pack)),
  );
}
export function setupIssues(
  questions: Question[],
  itinerary: Segment[],
  count: number,
  repeats: boolean,
  used: string[] = [],
) {
  const issues: string[] = [];
  if (count < 4)
    issues.push(
      `Add ${4 - count} more participant${count === 3 ? "" : "s"} to play.`,
    );
  if (!itinerary.length) issues.push("Add a game to the night.");
  const allocated = new Set(used);
  itinerary.forEach((s) => {
    const pool = poolFor(questions, s);
    const available = pool.filter((q) => !allocated.has(q.id));
    if (!pool.length)
      issues.push(
        `${games[s.game].name} has no enabled prompts in this pack. Choose another pack or add a question.`,
      );
    else if (!repeats && available.length < s.rounds)
      issues.push(
        `${games[s.game].name} needs ${s.rounds} unused prompts; ${available.length} available. Shorten the game, change packs, or allow repeats.`,
      );
    available.slice(0, s.rounds).forEach((q) => allocated.add(q.id));
  });
  return issues;
}
export function eligible(r: Round) {
  return r.participants.filter((id) =>
    r.phase === "writing"
      ? r.game !== "bluff" || r.bluffers.includes(id)
      : r.phase === "voting" &&
        (r.game === "who" ? r.author !== id : !r.bluffers.includes(id)),
  );
}
export function completion(r: Round) {
  if ((r as NightRound).liveCompletion)
    return (r as NightRound).liveCompletion!;
  const ids = eligible(r);
  const entries = r.phase === "voting" ? r.votes : r.answers;
  return {
    received: ids.filter((id) => entries[id]).length,
    required: ids.length,
    missing: ids.filter((id) => !entries[id]),
  };
}
export function hash(seed: number, key: string) {
  let h = seed >>> 0;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}
export function roomCode(night: Pick<Night, "id">) {
  return String(100000 + (hash(42, night.id) % 900000));
}
export function lobbyPlayers(night: Night) {
  return night.players.filter(
    (p) => p.connected && (!night.lobby || night.lobby.joined.includes(p.id)),
  );
}
export function shuffled<T>(values: T[], seed: number) {
  const list = [...values];
  for (let i = list.length - 1; i > 0; i--) {
    const j = hash(seed, String(i)) % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
export function championship(p: Player) {
  return Math.round(
    gameOrder.reduce(
      (sum, g) =>
        sum +
        (p.played[g]
          ? Math.min(
              1000,
              (p.games[g] / p.played[g] / (g === "ballpark" ? 1000 : 500)) *
                1000,
            )
          : 0),
      0,
    ),
  );
}
export function breakdown(
  r: NightRound,
  before: Player,
  after: Player,
): Breakdown {
  const id = before.id;
  const correct =
    r.game === "bluff" && r.votes[id]?.value === "truth"
      ? 500
      : r.game === "who" && r.votes[id]?.value === r.author
        ? r.rules.base
        : 0;
  const speed =
    r.game === "who" && correct && r.votes[id]
      ? Math.round((speedBonus(r.votes[id].seconds) / 200) * r.rules.speed)
      : 0;
  const distance =
    r.game === "ballpark" && r.answers[id]
      ? Math.abs(Number(r.answers[id].value) - Number(r.question.answer))
      : undefined;
  const accuracy =
    distance !== undefined
      ? ballparkScore(
          Number(r.answers[id].value),
          Number(r.question.answer),
          r.question.tolerance || 1,
        )
      : 0;
  const closest =
    distance !== undefined &&
    distance ===
      Math.min(
        ...Object.values(r.answers).map((a) =>
          Math.abs(Number(a.value) - Number(r.question.answer)),
        ),
      )
      ? 100
      : 0;
  const total = r.points[id] || 0;
  const streak = r.bonuses?.[id] || 0;
  return {
    accuracy,
    closest,
    correct,
    speed,
    streak,
    total,
    distance,
    deception: Math.max(
      0,
      total - accuracy - closest - correct - speed - streak,
    ),
    gameTotal: after.games[r.game],
    before: before.score,
    after: after.score,
  };
}
export function leaders(players: Player[], game?: Game) {
  return rank(players, game).filter((p) => p.rank === 1);
}
export const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(n);

// These are view contracts, not a security boundary: this is a browser-local demo.
export function publicProjection(night: Night) {
  const r = night.round;
  if (!r) return null;
  const released =
    (r.phase === "reveal" && r.revealReady) ||
    ["standings", "complete"].includes(r.phase);
  return {
    id: r.id,
    game: r.game,
    number: r.number,
    phase: r.phase,
    practice: r.practice,
    replay: r.replay,
    prompt: r.question.text,
    unit: r.question.unit,
    remaining: r.remaining,
    duration: r.duration,
    paused: night.paused,
    comfortable: night.vibe === "comfortable",
    completion: {
      received: completion(r).received,
      required: completion(r).required,
    },
    choices: r.options.map((o, i) => ({ key: `choice-${i}`, text: o.text })),
    quote:
      r.game === "who" &&
      ["voting", "reveal", "standings", "complete"].includes(r.phase)
        ? r.answers[r.author]?.value
        : undefined,
    revealElapsed: r.revealElapsed,
    released,
    result: released
      ? {
          answer: r.question.answer,
          explanation: r.question.explanation,
          author: night.players.find((p) => p.id === r.author),
          options: r.options.map((o, i) => ({
            key: `choice-${i}`,
            text: o.text,
            truth: o.id === "truth",
            author: night.players.find((p) => p.id === o.author),
            votes: Object.values(r.votes).filter((v) => v.value === o.id)
              .length,
          })),
          estimates: Object.entries(r.answers)
            .map(([id, a]) => ({
              player: night.players.find((p) => p.id === id)!,
              value: Number(a.value),
            }))
            .filter((a) => !!a.player),
        }
      : undefined,
  };
}
export function playerProjection(night: Night, id: string) {
  const r = night.round,
    pub = publicProjection(night),
    player = night.players.find((p) => p.id === id);
  if (!r || !pub || !player) return null;
  const writer =
    r.game === "ballpark" ||
    (r.game === "who"
      ? r.phase === "writing" || r.author === id
      : r.bluffers.includes(id));
  const accepted = r.phase === "voting" ? r.votes[id] : r.answers[id];
  const result = night.ledger.find((l) => l.id === r.id && !l.voided)
    ?.breakdown[id];
  return {
    ...pub,
    player,
    writer,
    canAct:
      !night.paused &&
      r.remaining > 0 &&
      (r.phase === "writing" ? writer : r.phase === "voting" && !writer),
    accepted:
      accepted && r.phase === "voting" && r.game === "bluff"
        ? {
            ...accepted,
            value: `choice-${r.options.findIndex((o) => o.id === accepted.value)}`,
          }
        : accepted,
    ownAnswer: r.answers[id],
    ownVote: r.votes[id]
      ? r.game === "who"
        ? night.players.find((p) => p.id === r.votes[id].value)?.name
        : r.options.find((o) => o.id === r.votes[id].value)?.text
      : undefined,
    candidates: night.players
      .filter((p) => r.participants.includes(p.id) && p.id !== id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
      })),
    result: pub.released ? result : undefined,
    preview: id,
  };
}
