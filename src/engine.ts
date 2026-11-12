export type Game = "bluff" | "who" | "ballpark";
export type Phase =
  | "instructions"
  | "countdown"
  | "writing"
  | "voting"
  | "reveal"
  | "standings"
  | "complete";
export type Question = {
  id: string;
  game: Game;
  text: string;
  answer: string;
  category: string;
  pack: string;
  enabled: boolean;
  unit?: string;
  tolerance?: number;
  difficulty?: string;
  explanation?: string;
  source?: string;
  sensitivity?: string;
  guidance?: string;
  skip?: boolean;
};
export type Player = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  connected: boolean;
  score: number;
  previous: number;
  previousScore?: number;
  streak?: number;
  games: Record<Game, number>;
  played: Record<Game, number>;
};
export type Submission = { value: string; seconds: number };
export type Round = {
  game: Game;
  number: number;
  phase: Phase;
  question: Question;
  bluffers: string[];
  author: string;
  answers: Record<string, Submission>;
  votes: Record<string, Submission>;
  options: { id: string; text: string; author?: string }[];
  points: Record<string, number>;
  awarded: boolean;
  remaining: number;
  duration: number;
  paused: boolean;
  participants: string[];
  rules: { base: number; speed: number };
  streaks?: Record<string, number>;
  bonuses?: Record<string, number>;
};
export const games: Record<
  Game,
  {
    name: string;
    tag: string;
    description: string;
    color: string;
    symbol: string;
  }
> = {
  bluff: {
    name: "Bluff Battle",
    tag: "Lie a little. Win a lot.",
    description:
      "Make up a convincing lie. Spot the truth. Trust absolutely no one.",
    color: "#dcd3f5",
    symbol: "✦",
  },
  who: {
    name: "Guess Who",
    tag: "You think you know them.",
    description: "One anonymous answer. A room full of suspects. Who said it?",
    color: "#dcebbd",
    symbol: "?",
  },
  ballpark: {
    name: "Ballpark",
    tag: "Close enough counts.",
    description: "Big questions. Wild guesses. Get closest to take the points.",
    color: "#f9ceab",
    symbol: "◎",
  },
};
const names = [
  "Alex",
  "Jamie",
  "Priya",
  "Sam",
  "Taylor",
  "Jordan",
  "Morgan",
  "Casey",
  "Riley",
  "Charlie",
  "Avery",
  "Drew",
  "Quinn",
  "Blake",
];
const emojis = [
  "🐸",
  "🐯",
  "🌸",
  "👽",
  "🍒",
  "🐻",
  "⚡",
  "🦊",
  "🪩",
  "🐼",
  "🍄",
  "🦋",
  "🌻",
  "🐙",
];
export function makePlayers(n = 14): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    name: names[i] || `Guest ${i + 1}`,
    avatar: emojis[i % 14],
    color: ["#e5edc9", "#f4dacd", "#e7ddf5", "#d5e8ed", "#f6e7b9"][i % 5],
    connected: true,
    score: 0,
    previous: i + 1,
    games: { bluff: 0, who: 0, ballpark: 0 },
    played: { bluff: 0, who: 0, ballpark: 0 },
  }));
}
export const defaults: Question[] = [
  ...[
    [
      "What is the national animal of Scotland?",
      "A unicorn",
      "Unexpected",
      "A unicorn has represented Scotland in heraldry since the 12th century.",
    ],
    [
      "What did the first webcam keep an eye on?",
      "A coffee pot",
      "Technology",
      "The Trojan Room coffee pot at the University of Cambridge.",
    ],
    [
      "What unusual thing do sea otters do while sleeping?",
      "Hold hands",
      "Nature",
      "They may hold hands to avoid drifting apart.",
    ],
    [
      "What is a group of flamingos called?",
      "A flamboyance",
      "Nature",
      "A wonderfully fitting collective noun.",
    ],
    [
      "Which animal has cube-shaped poop?",
      "A wombat",
      "Nature",
      "Wombats produce distinctive cube-shaped droppings.",
    ],
    [
      "What was bubble wrap originally marketed as?",
      "Textured wallpaper",
      "Unexpected",
      "Invented in 1957 as a wall covering.",
    ],
  ].map((q, i) => ({
    id: `b${i}`,
    game: "bluff" as Game,
    text: q[0],
    answer: q[1],
    category: q[2],
    pack: "Beautifully Bizarre",
    enabled: true,
    explanation: q[3],
    difficulty: "Medium",
  })),
  ...[
    "What is the most ridiculous thing you believed as a kid?",
    "What is something nobody here knows about you?",
    "What would your school report say about you today?",
    "What is your most chaotic friendship memory?",
    "What unexpected skill do you have?",
    "If you could swap lives with anyone here, what would you do first?",
    "What is your most embarrassing party story?",
  ].map((text, i) => ({
    id: `w${i}`,
    game: "who" as Game,
    text,
    answer: "",
    category: [
      "Funny",
      "Personal",
      "School",
      "Friendships",
      "Unexpected facts",
      "Hypotheticals",
      "Custom",
    ][i],
    pack: "The Inner Circle",
    enabled: true,
    sensitivity: "Light",
    skip: true,
    guidance: "Keep it fun. Share only what feels comfortable.",
  })),
  ...[
    [
      "How many keys are on a standard piano?",
      88,
      "keys",
      "Music",
      "Standard full-size piano keyboard.",
    ],
    [
      "How long is the Great Wall of China?",
      21196,
      "km",
      "World",
      "Total surveyed length including branches (2012 survey).",
    ],
    [
      "In what year was the first iPhone released?",
      2007,
      "year",
      "Technology",
      "Apple introduced the iPhone in 2007.",
    ],
    [
      "How many bones are in an adult human body?",
      206,
      "bones",
      "Science",
      "Typical adult skeletal count.",
    ],
    [
      "How many minutes are in a week?",
      10080,
      "minutes",
      "Numbers",
      "7 × 24 × 60.",
    ],
    [
      "How many hearts does an octopus have?",
      3,
      "hearts",
      "Nature",
      "Two branchial hearts and one systemic heart.",
    ],
    [
      "How tall is the Eiffel Tower, including its antenna?",
      330,
      "metres",
      "World",
      "Height following antenna installation in 2022.",
    ],
    [
      "What is the speed of light in a vacuum?",
      299792458,
      "m/s",
      "Science",
      "Exact SI value.",
    ],
    [
      "At what temperature does water freeze in Celsius?",
      0,
      "°C",
      "Science",
      "At standard atmospheric pressure.",
    ],
    [
      "In what year did humans first land on the Moon?",
      1969,
      "year",
      "History",
      "Apollo 11.",
    ],
    [
      "How many countries are members of the United Nations?",
      193,
      "countries",
      "World",
      "UN member states.",
    ],
    [
      "How many squares are on a chessboard?",
      64,
      "squares",
      "Games",
      "8 × 8 board.",
    ],
    [
      "What is absolute zero in Celsius?",
      -273.15,
      "°C",
      "Science",
      "Definition of zero kelvin.",
    ],
    [
      "How many teeth does a typical adult have?",
      32,
      "teeth",
      "Science",
      "Including wisdom teeth.",
    ],
    [
      "How many elements are in the periodic table?",
      118,
      "elements",
      "Science",
      "Recognized by IUPAC.",
    ],
  ].map((q, i) => ({
    id: `n${i}`,
    game: "ballpark" as Game,
    text: String(q[0]),
    answer: String(q[1]),
    unit: String(q[2]),
    category: String(q[3]),
    explanation: String(q[4]),
    pack: "A Little of Everything",
    enabled: true,
    tolerance:
      i === 2 || i === 9 ? 20 : Math.max(Math.abs(Number(q[1])) * 0.5, 1),
    difficulty: "Medium",
    source:
      [
        "Music: standard 88-key keyboard",
        "China National Cultural Heritage Administration (2012)",
        "Apple Newsroom (2007)",
        "OpenStax Anatomy & Physiology",
      ][i] || "Standard reference fact",
  })),
];
export function validateQuestion(q: Question) {
  if (!q.text.trim()) return "Add a question.";
  if (!q.pack.trim()) return "Add a pack name.";
  if (q.game === "bluff" && !q.answer.trim()) return "Add the correct answer.";
  if (
    q.game === "ballpark" &&
    (!q.answer.trim() ||
      !Number.isFinite(Number(q.answer)) ||
      !Number.isFinite(q.tolerance) ||
      Number(q.tolerance) <= 0)
  )
    return "Enter a finite answer and a positive scoring tolerance.";
  return "";
}
export function rank(players: Player[], game?: Game) {
  const sorted = [...players].sort(
    (a, b) =>
      (game ? b.games[game] - a.games[game] : b.score - a.score) ||
      a.name.localeCompare(b.name),
  );
  return sorted.map((p, i) => ({
    ...p,
    rank:
      i &&
      (game ? p.games[game] : p.score) ===
        (game ? sorted[i - 1].games[game] : sorted[i - 1].score)
        ? sorted.findIndex(
            (x) =>
              (game ? x.games[game] : x.score) ===
              (game ? p.games[game] : p.score),
          ) + 1
        : i + 1,
  }));
}
export const speedBonus = (seconds: number) =>
  seconds <= 5 ? 200 : seconds <= 10 ? 150 : seconds <= 20 ? 75 : 0;
export function ballparkScore(
  value: number,
  answer: number,
  tolerance: number,
) {
  return Math.max(
    0,
    Math.round(
      900 * (1 - Math.abs(value - answer) / Math.max(tolerance, 0.000001)),
    ),
  );
}
export function newRound(
  game: Game,
  number: number,
  players: Player[],
  questions: Question[],
  timer: number,
  rules = { base: 300, speed: 200 },
): Round {
  const pool = questions.filter((q) => q.game === game && q.enabled);
  if (!pool.length)
    throw Error("Enable or add a question for this game first.");
  const question = pool[(number - 1) % pool.length];
  const ids = players.filter((p) => p.connected).map((p) => p.id);
  if (ids.length < 4) throw Error("Connect at least 4 players.");
  return {
    game,
    number,
    phase: "instructions",
    question,
    bluffers: Array.from(
      { length: 3 },
      (_, i) => ids[((number - 1) * 3 + i) % ids.length],
    ),
    author: ids[(number - 1) % ids.length],
    answers: {},
    votes: {},
    options: [],
    points: {},
    awarded: false,
    remaining: timer,
    duration: timer,
    paused: false,
    participants: ids,
    rules,
  };
}
export function submit(
  r: Round,
  player: Player,
  value: string,
  seconds: number,
): Round {
  if (!Number.isFinite(seconds) || seconds < 0)
    throw Error("Enter a valid response time.");
  if (!r.participants.includes(player.id))
    throw Error("This player is not in the round.");
  if (!player.connected || !value.trim())
    throw Error("Enter an answer while connected.");
  if (r.remaining <= 0) throw Error("Time is up. Advance the round.");
  if (r.phase === "writing") {
    if (
      (r.game === "bluff" && !r.bluffers.includes(player.id)) ||
      (r.game === "who" && r.author !== player.id)
    )
      throw Error("Wait for the guessing phase.");
    if (r.game === "ballpark" && !Number.isFinite(Number(value)))
      throw Error("Enter a finite number.");
    if (r.game !== "ballpark" && r.answers[player.id])
      throw Error("Your answer is already locked.");
    return {
      ...r,
      answers: {
        ...r.answers,
        [player.id]: { value: value.trim().slice(0, 500), seconds },
      },
    };
  }
  if (r.phase === "voting") {
    if (
      (r.game === "bluff" && r.bluffers.includes(player.id)) ||
      (r.game === "who" && r.author === player.id)
    )
      throw Error("Authors cannot vote.");
    if (r.votes[player.id]) throw Error("Your vote is already locked.");
    if (
      r.game === "who"
        ? !r.participants.includes(value) || value === player.id
        : !r.options.some((o) => o.id === value)
    )
      throw Error("Choose a valid option.");
    return { ...r, votes: { ...r.votes, [player.id]: { value, seconds } } };
  }
  throw Error("Submissions are closed.");
}
export function roundStreak(r: Round, p: Player): number {
  const exempt =
    (r.game === "bluff" && r.bluffers.includes(p.id)) ||
    (r.game === "who" && r.author === p.id);
  if (exempt) return p.streak || 0;
  const correct =
    r.game === "bluff"
      ? r.votes[p.id]?.value === "truth"
      : r.game === "who"
        ? r.votes[p.id]?.value === r.author
        : !!r.answers[p.id] &&
          ballparkScore(
            Number(r.answers[p.id].value),
            Number(r.question.answer),
            r.question.tolerance || 1,
          ) >= 675;
  return correct ? (p.streak || 0) + 1 : 0;
}
export function streakBonus(r: Round, p: Player) {
  const eligible = !(
    (r.game === "bluff" && r.bluffers.includes(p.id)) ||
    (r.game === "who" && r.author === p.id)
  );
  const streak = roundStreak(r, p);
  return eligible && streak >= 2 ? Math.min(300, (streak - 1) * 100) : 0;
}
export function calculate(r: Round, players: Player[]) {
  const pts: Record<string, number> = Object.fromEntries(
    players.map((p) => [p.id, 0]),
  );
  if (r.game === "ballpark") {
    const entries = Object.entries(r.answers);
    const best = Math.min(
      ...entries.map(([, s]) =>
        Math.abs(Number(s.value) - Number(r.question.answer)),
      ),
    );
    entries.forEach(([id, s]) => {
      pts[id] =
        ballparkScore(
          Number(s.value),
          Number(r.question.answer),
          r.question.tolerance || 1,
        ) +
        (Math.abs(Number(s.value) - Number(r.question.answer)) === best
          ? 100
          : 0);
    });
  }
  if (r.game === "who") {
    let missed = 0;
    Object.entries(r.votes).forEach(([id, s]) => {
      if (s.value === r.author)
        pts[id] =
          r.rules.base +
          Math.round((speedBonus(s.seconds) / 200) * r.rules.speed);
      else missed++;
    });
    pts[r.author] = Math.round(
      (500 * missed) /
        Math.max(players.filter((p) => p.connected).length - 1, 1),
    );
  }
  if (r.game === "bluff") {
    Object.entries(r.votes).forEach(([id, s]) => {
      const opt = r.options.find((o) => o.id === s.value);
      if (opt?.id === "truth") pts[id] = 500;
      else if (opt?.author) pts[opt.author] += 250;
    });
  }
  players.forEach((p) => {
    pts[p.id] += streakBonus(r, p);
  });
  return pts;
}
export function advance(r: Round, players: Player[], timer: number): Round {
  if (r.phase === "instructions")
    return { ...r, phase: "countdown", remaining: 3 };
  if (r.phase === "countdown")
    return { ...r, phase: "writing", remaining: timer, duration: timer };
  if (r.phase === "writing") {
    if (r.game === "ballpark")
      return { ...r, phase: "reveal", points: calculate(r, players) };
    if (r.game === "who" && !r.answers[r.author])
      throw Error(
        "The secret author needs to answer. Simulate submissions or select the author.",
      );
    if (r.game === "bluff" && r.bluffers.some((id) => !r.answers[id]))
      throw Error("All 3 bluffers need an answer. Simulate submissions first.");
    const opts =
      r.game === "bluff"
        ? [
            ...r.bluffers.map((id) => ({
              id,
              text: r.answers[id].value,
              author: id,
            })),
            { id: "truth", text: r.question.answer },
          ].sort((a, b) => a.text.localeCompare(b.text))
        : [];
    return {
      ...r,
      phase: "voting",
      options: opts,
      remaining: timer,
      duration: timer,
    };
  }
  if (r.phase === "voting")
    return { ...r, phase: "reveal", points: calculate(r, players) };
  if (r.phase === "reveal") return { ...r, phase: "standings" };
  return r;
}
