import { submit, type Player, type Round } from "../engine";
import { hash, type NightRound } from "./model";

const bluffs: Record<string, string[]> = {
  b0: ["A Highland cow", "A golden eagle", "A red squirrel"],
  b1: ["A sleeping cat", "A biscuit tin", "A laboratory mouse"],
  b2: ["Cover their eyes", "Sing to each other", "Sleep upside down"],
  b3: ["A pink parade", "A sparkle", "A fan club"],
  b4: ["A capybara", "A platypus", "A koala"],
  b5: ["A greenhouse roof", "A shower curtain", "A raincoat"],
};
const stories = [
  "I can fold a fitted sheet. Nobody believes me.",
  "I can name every country in under five minutes.",
  "I make an excellent pancake. The first one is always a disaster.",
  "I can juggle three oranges, but only over a sofa.",
  "I know the lyrics to an unreasonable number of adverts.",
  "I can do a surprisingly convincing duck impression.",
  "I always pack emergency snacks.",
  "I thought the moon followed our car everywhere.",
];
const comfortableAnswers: Record<string, string[]> = {
  "party-w0": [
    "Pancakes. Even the first one.",
    "Perfectly crispy roast potatoes.",
    "Mango with absolutely everything.",
    "A heroic amount of pasta.",
    "Soup and a very good bread roll.",
    "Popcorn, if that counts as dinner.",
    "Cheese on toast. No contest.",
    "Freshly baked pizza.",
  ],
  "party-w1": [
    "A tiny cottage in a world with friendly dragons.",
    "A magical library that never closes.",
    "A space station with excellent snacks.",
    "A village where everyone solves mysteries.",
    "A floating island with a tea shop.",
    "Somewhere with talking cats.",
    "A castle with a surprisingly good bakery.",
    "A forest full of gentle giants.",
  ],
  "party-w2": [
    "Someone making me a cup of tea.",
    "A dog choosing to sit beside me.",
    "Finding money in an old coat.",
    "Perfect weather on a day off.",
    "A very silly message from a friend.",
    "Finishing a crossword.",
    "A train arriving exactly on time.",
    "Hearing my favourite song in a shop.",
  ],
  "party-w3": [
    "A dramatic drum solo that goes on slightly too long.",
    "A tiny kazoo fanfare.",
    "An overly confident disco bassline.",
    "A brass band playing slightly out of tune.",
    "A sweeping orchestra, then a slide whistle.",
    "Eight seconds of triumphant cowbell.",
    "A very cheerful piano jingle.",
    "A guitar riff followed by polite applause.",
  ],
  "party-w4": [
    "A book, a park bench, and no plans.",
    "A long walk that ends at a bakery.",
    "Making something badly, but enjoying it.",
    "A film marathon with excellent snacks.",
    "A board game with a few good friends.",
    "Trying a recipe that takes all afternoon.",
    "Exploring somewhere I have never been.",
    "A nap followed by another small nap.",
  ],
  "party-w5": [
    "Loading the dishwasher efficiently.",
    "Getting the best seat on the train.",
    "Guessing the time without a clock.",
    "Mini golf. It becomes a whole thing.",
    "Finding the longest chip in the bag.",
    "Wrapping a present with no wasted paper.",
    "Getting every bag in from the car at once.",
    "Remembering where everyone parked.",
  ],
};
export function simulatedValue(r: NightRound, p: Player) {
  const i = r.participants.indexOf(p.id),
    random = hash(r.seed, `${r.question.id}-${p.id}-${r.phase}`);
  if (r.phase === "writing") {
    if (r.game === "who") {
      const answers = comfortableAnswers[r.question.id] || stories;
      return answers[random % answers.length];
    }
    if (r.game === "bluff")
      return (
        (bluffs[r.question.id] || [
          "A travelling magician",
          "A pocket watch",
          "A garden gnome",
        ])[r.bluffers.indexOf(p.id)] || ""
      );
    const offsets = [
      -0.8, 0.35, -1.1, 0.04, 0.7, -0.2, 1.8, -0.4, 0.12, 0.9, -2.4, 0.5, -0.07,
      3.2,
    ];
    return String(
      Math.round(
        (Number(r.question.answer) +
          (r.question.tolerance || 1) *
            offsets[(i + r.seed + r.number) % offsets.length]) *
          100,
      ) / 100,
    );
  }
  if (r.game === "who") {
    const candidates = r.participants.filter((id) => id !== p.id);
    return random % 3 === 0 ? r.author : candidates[random % candidates.length];
  }
  return random % 3 === 0
    ? "truth"
    : r.options[random % r.options.length]?.id || "";
}
export function simulateOne(
  r: NightRound,
  player: Player,
  value?: string,
): NightRound {
  try {
    const response = value ?? simulatedValue(r, player);
    return {
      ...submit(
        r,
        { ...player, connected: true },
        response,
        Math.max(
          1,
          Math.min(r.duration - 1, 2 + (hash(r.seed, player.id) % 14)),
        ),
      ),
      ...{ fallbacks: r.fallbacks },
    } as NightRound;
  } catch {
    return r;
  }
}
export function normalizeOptions(r: Round, seed: number): Round {
  const options = [...r.options].sort(
    (a, b) => hash(seed, a.text) - hash(seed, b.text),
  );
  return { ...r, options };
}
