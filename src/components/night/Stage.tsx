import { AnimatedStandings, BluffChart, BallparkShow } from "./Showtime";
import { Check, Clock3, LockKeyhole, Trophy } from "lucide-react";
import { games } from "../../engine";
import { fmt, publicProjection, type Night } from "../../session/model";
import { GameIcon, Sticker } from "./common";

export function Standings({
  night,
  full = false,
}: {
  night: Night;
  full?: boolean;
}) {
  return <AnimatedStandings night={night} full={full} />;
}
export function Timer({
  remaining,
  paused,
  comfortable,
}: {
  remaining: number;
  paused: boolean;
  comfortable: boolean;
}) {
  return (
    <span
      className={`n-timer ${!comfortable && remaining <= 5 ? "is-low" : ""}`}
      aria-label={
        paused
          ? "Paused"
          : comfortable
            ? "Untimed"
            : `${remaining} seconds remaining`
      }
    >
      <Clock3 size={18} />
      {paused ? "Paused" : comfortable ? "No rush" : `${remaining}s`}
    </span>
  );
}
export function Stage({ night }: { night: Night }) {
  const p = publicProjection(night);
  if (!p) return null;
  const { round: r } = night;
  const result = p.result;
  const c = p.completion;
  const writing = p.phase === "writing",
    voting = p.phase === "voting",
    reveal = p.phase === "reveal";
  if (p.phase === "standings")
    return (
      <section
        className="n-stage n-stage-standings"
        aria-label="Shared display"
      >
        <StageHeader night={night} />
        <RoundRhythm night={night} />
        {r?.practice || r?.replay ? (
          <div className="n-practice-complete">
            <span className="n-complete-icon">
              <Check size={34} />
            </span>
            <h2>{r.practice ? "Practice complete" : "Replay complete"}</h2>
            <div className="n-practice-cast">
              <Sticker index={0} size={110} />
              <Sticker index={3} size={110} />
              <Sticker index={7} size={110} />
            </div>
          </div>
        ) : (
          <>
            <RoundSpotlight night={night} />
            <Standings night={night} />
          </>
        )}
      </section>
    );
  return (
    <section
      className={`n-stage game-${p.game} n-phase-${p.phase} ${reveal ? "n-stage-reveal" : ""}`}
      aria-label="Shared display"
    >
      <StageHeader night={night} />
      <RoundRhythm night={night} />
      {(writing || voting) && night.vibe !== "comfortable" && (
        <div className="n-round-clock-track" aria-hidden="true">
          <span
            style={{
              width: `${Math.min(100, (p.remaining / Math.max(1, r!.duration)) * 100)}%`,
            }}
          />
        </div>
      )}
      <div className="n-stage-content">
        {p.phase === "countdown" ? (
          <div className="n-countdown">
            <h2>
              {p.practice ? "Practice" : `Round ${r!.number}`}
            </h2>
            <strong key={p.remaining}>{p.remaining || 1}</strong>
          </div>
        ) : (
          <>
            <h2
              className={`n-stage-prompt ${voting && p.game === "who" ? "n-prompt-small" : ""}`}
            >
              {p.prompt}
            </h2>
            {writing && (
              <div className="n-stage-input-scene n-stage-room-activity">
                <div className={`n-input-emblem game-${p.game}`}>
                  <GameIcon game={p.game} size={62} />
                  <span className="n-lock-mark">
                    <LockKeyhole size={23} />
                  </span>
                </div>
                <h3>
                  {p.game === "ballpark"
                    ? "What’s your best guess?"
                    : p.game === "bluff"
                      ? "Write your bluffs"
                      : "Write your answer"}
                </h3>
                <p>
                  {p.game === "ballpark"
                    ? "Give your estimate on your phone."
                    : p.game === "bluff"
                      ? ""
                      : "Everyone answers. One will be picked."}
                </p>
                {p.game !== "ballpark" && (
                  <div className={`n-writing-teaser n-writing-${p.game}`}>
                    {p.game === "bluff" ? (
                      <>
                        <div className="n-bluff-envelope-row">
                          {Array.from({ length: 3 }, (_, i) => (
                            <div
                              key={i}
                              className={i < c.received ? "is-written" : ""}
                            >
                              <GameIcon game="bluff" size={28} />
                              <b>
                                {i < c.received ? "Bluff locked" : "Writing…"}
                              </b>
                              {i < c.received ? (
                                <Check size={17} />
                              ) : (
                                <LockKeyhole size={17} />
                              )}
                            </div>
                          ))}
                          <div className="n-truth-envelope">
                            <GameIcon game="ballpark" size={28} />
                            <b>One true answer</b>
                            <LockKeyhole size={17} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="n-secret-cast">
                          {night.players
                            .filter((player) =>
                              r!.participants.includes(player.id),
                            )
                            .map((player) => (
                              <div key={player.id}>
                                <Sticker player={player} size={76} />
                                <b>?</b>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {p.game === "ballpark" && (
                  <div className="n-public-ready-cast">
                    {night.players
                      .filter((player) => r!.participants.includes(player.id))
                      .map((player) => (
                        <div
                          key={player.id}
                          className={r!.answers[player.id] ? "is-ready" : ""}
                        >
                          <Sticker player={player} size={65} />
                          <span>{player.name}</span>
                          <small>
                            {r!.answers[player.id] ? (
                              <>
                                <Check size={13} />
                                Locked in
                              </>
                            ) : (
                              "Thinking…"
                            )}
                          </small>
                        </div>
                      ))}
                  </div>
                )}
                <div className="n-anonymous-arrivals" aria-hidden="true">
                  {Array.from(
                    { length: Math.min(c.required, p.game === "who" ? 1 : 12) },
                    (_, i) => (
                      <span key={i} className={i < c.received ? "arrived" : ""}>
                        {i < c.received ? <Check size={16} /> : null}
                      </span>
                    ),
                  )}
                  {c.required > 12 && <b>+{c.required - 12}</b>}
                </div>
              </div>
            )}
            {voting && p.game === "bluff" && (
              <div className="n-stage-choices">
                {p.choices.map((choice, i) => (
                  <div key={choice.key} className="n-answer-tile">
                    <span>{String.fromCharCode(65 + i)}</span>
                    <strong>{choice.text}</strong>
                  </div>
                ))}
              </div>
            )}
            {voting && p.game === "who" && (
              <div className="n-public-quote">
                <span className="n-quote-mark" aria-hidden="true">
                  “
                </span>
                <blockquote>{p.quote}</blockquote>
                <p>Who do you think said it?</p>
                <div className="n-quote-cast">
                  {night.players.slice(0, 6).map((player) => (
                    <Sticker key={player.id} player={player} size={64} />
                  ))}
                </div>
              </div>
            )}
            {reveal && !p.released && (
              <div className="n-suspense n-staged-reveal">
                <h3>
                  {p.game === "ballpark"
                    ? "Estimates locked"
                    : "Answers locked"}
                </h3>
                {p.game === "ballpark" && (
                  <AnonymousDistribution
                    values={Object.values(r!.answers).map((a) =>
                      Number(a.value),
                    )}
                  />
                )}
                {p.game === "bluff" && (
                  <BluffChart night={night} released={false} />
                )}
                {p.game === "who" && (
                  <div className="n-reveal-suspects">
                    {night.players
                      .filter((player) => r!.participants.includes(player.id))
                      .map((player) => {
                        const votes = Object.values(r!.votes).filter(
                          (v) => v.value === player.id,
                        ).length;
                        return (
                          <div key={player.id}>
                            <Sticker player={player} size={68} />
                            <b>{player.name}</b>
                            <span>
                              {p.revealElapsed >= 6
                                ? `${votes} ${votes === 1 ? "vote" : "votes"}`
                                : "Suspect"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
                <span className="n-reveal-count">
                  {Math.max(1, Math.ceil((20 - p.revealElapsed) / 4))}
                </span>
                <div className="n-reveal-progress">
                  <span
                    style={{
                      width: `${Math.min(100, (p.revealElapsed / 20) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {reveal && p.released && result && (
              <div className="n-public-result" key={p.id}>
                {p.game === "ballpark" ? (
                  <BallparkShow night={night} />
                ) : p.game === "bluff" ? (
                  <>
                    <BluffChart night={night} released />
                  </>
                ) : (
                  <>
                    <div className="n-author-reveal">
                      <Sticker player={result.author} size={158} />
                      <div>
                        <p>It was…</p>
                        <h3>{result.author?.name}!</h3>
                      </div>
                    </div>
                    <blockquote className="n-reveal-quote">
                      “{p.quote}”
                    </blockquote>
                    <p>
                      {
                        Object.values(r!.votes).filter(
                          (v) => v.value === r!.author,
                        ).length
                      }{" "}
                      of {Object.keys(r!.votes).length} guesses found the
                      author.
                    </p>
                  </>
                )}

                {(p.practice || p.replay) && (
                  <span className="n-practice-tag">
                    {p.practice ? "Practice" : "Replay"} · no scores awarded
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {["writing", "voting"].includes(p.phase) && (
        <footer className="n-stage-status">
          <span>
            {c.received} / {c.required} {voting ? "votes" : "answers"}
          </span>
          <span>
            {p.remaining === 0
              ? "Time’s up"
              : c.received === c.required
                ? "Everyone’s in."
                : ""}
          </span>
        </footer>
      )}
    </section>
  );
}
function AnonymousDistribution({ values }: { values: number[] }) {
  const min = Math.min(...values),
    max = Math.max(...values);
  return (
    <div
      className="n-anonymous-distribution"
      aria-label="Anonymous estimate distribution"
    >
      <span className="n-distribution-line" />
      {values.map((v, i) => (
        <span
          key={i}
          className="n-distribution-dot"
          style={{
            left: `${max === min ? 50 : 6 + ((v - min) / (max - min)) * 88}%`,
          }}
        />
      ))}
      <small>{fmt(min)}</small>
      <small>{fmt(max)}</small>
    </div>
  );
}
function StageHeader({ night }: { night: Night }) {
  const r = night.round!;
  return (
    <header className="n-stage-header">
      <span>
        <GameIcon game={r.game} size={21} />
        <b>{games[r.game].name}</b>
        <small>
          {r.practice
            ? "Practice"
            : r.replay
              ? "Unscored replay"
              : `Round ${r.number} of ${night.itinerary[night.segment].rounds}`}
        </small>
      </span>
      {["writing", "voting"].includes(r.phase) ? (
        <Timer
          remaining={r.remaining}
          paused={night.paused}
          comfortable={night.vibe === "comfortable"}
        />
      ) : (
        <span className="n-stage-wordmark">afterparty</span>
      )}
    </header>
  );
}
function RoundRhythm({ night }: { night: Night }) {
  const r = night.round!;
  const labels =
    r.game === "ballpark"
      ? ["Estimate", "Lock in", "The reveal", "Leaderboard"]
      : [
          r.game === "bluff" ? "Write the bluffs" : "Write answers",
          r.game === "bluff" ? "Find the truth" : "Guess who",
          "The reveal",
          "Leaderboard",
        ];
  const allEstimates =
    r.game === "ballpark" &&
    r.phase === "writing" &&
    r.participants.every((id) => r.answers[id]);
  const current = allEstimates
    ? 1
    : r.phase === "countdown" || r.phase === "writing"
      ? 0
      : r.phase === "voting"
        ? 1
        : r.phase === "reveal"
          ? 2
          : 3;
  return (
    <ol className="n-round-rhythm" aria-label="Round progress">
      {labels.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? "step" : undefined}
          className={i < current ? "is-complete" : ""}
        >
          <span>{i < current ? <Check size={11} /> : i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
function RoundSpotlight({ night }: { night: Night }) {
  const r = night.round!;
  const best = Math.max(0, ...Object.values(r.points));
  const winners = night.players.filter(
    (p) => r.participants.includes(p.id) && r.points[p.id] === best,
  );
  if (!best) return null;
  return (
    <div className="n-round-spotlight">
      <div className="n-round-spotlight-cast">
        {winners.slice(0, 3).map((p) => (
          <Sticker key={p.id} player={p} size={64} />
        ))}
      </div>
      <div>
        <b>
          {winners.length > 3
            ? `${winners.length} players share the round`
            : `${winners.map((p) => p.name).join(" & ")} ${winners.length === 1 ? "takes" : "share"} the round`}
        </b>
        <span>
          +{fmt(best)} round points
          {night.segment < night.itinerary.length - 1 &&
          night.roundNumber === night.itinerary[night.segment].rounds
            ? ` · Up next: ${games[night.itinerary[night.segment + 1].game].name}`
            : ""}
        </span>
      </div>
      <Trophy size={27} />
    </div>
  );
}
