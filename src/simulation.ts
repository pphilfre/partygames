import { type Player, type Round, submit } from "./engine";
const lies = [
  ["A very angry goose", "A Highland cow", "A golden eagle"],
  ["A biscuit tin", "A sleeping cat", "A laboratory mouse"],
  ["Sing to each other", "Cover their eyes", "Sleep upside down"],
  ["A sparkle", "A fan club", "A pink parade"],
  ["A capybara", "A koala", "A platypus"],
  ["A shower curtain", "A greenhouse roof", "A fashionable raincoat"],
];
const stories = [
  "I thought the moon followed our car everywhere.",
  "I once accidentally sent a message about someone directly to them.",
  "Excellent potential. Distracted by snacks.",
  "We accidentally joined a stranger’s birthday dinner.",
  "I can name every country in under five minutes.",
  "I would finally find out what is in their camera roll.",
  "I waved back at someone who was waving at the person behind me.",
];
export function simulate(round: Round, players: Player[], timer: number) {
  let r = { ...round };
  for (const [i, p] of players.entries()) {
    if (!p.connected) continue;
    try {
      if (r.phase === "writing" && !r.answers[p.id]) {
        let value = "";
        if (r.game === "bluff")
          value =
            lies[(r.number - 1) % lies.length][r.bluffers.indexOf(p.id)] || "";
        if (r.game === "who") value = stories[(r.number - 1) % stories.length];
        if (r.game === "ballpark") {
          const offsets = [
            -0.18, 0.08, -0.32, 0.01, 0.22, -0.05, 0.52, -0.12, 0.03, 0.28,
            -0.6, 0.11, -0.02, 0.8,
          ];
          value = String(
            Math.round(
              (Number(r.question.answer) +
                (r.question.tolerance || 1) *
                  offsets[(i + r.number - 1) % 14]) *
                100,
            ) / 100,
          );
        }
        r = submit(r, p, value, 3 + ((i * 3) % Math.max(timer - 3, 4)));
      } else if (r.phase === "voting" && !r.votes[p.id]) {
        const value =
          r.game === "who"
            ? i % 3 === 0
              ? r.author
              : players[(i + 2) % players.length].id
            : i % 3 === 0
              ? "truth"
              : r.options[(i + r.number) % 4].id;
        r = submit(r, p, value, 2 + ((i * 3) % Math.max(timer - 2, 3)));
      }
    } catch {
      /* Ineligible authors and bluffers wait. */
    }
  }
  return r;
}
