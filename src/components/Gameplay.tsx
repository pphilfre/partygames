import {
  ArrowUp,
  Maximize,
  Send,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  games,
  rank,
  roundStreak,
  streakBonus,
  type Game,
  type Player,
} from "../engine";
import { useParty } from "../store";
import { GameArt } from "./Art";
import { Button } from "./ui";
import { Timer } from "./live/Timer";
import { BallparkReveal } from "./live/BallparkReveal";
import { SubmissionArrivals } from "./live/SubmissionArrivals";
function ScoreCount({ value, from }: { value: number; from?: number }) {
  const [display, setDisplay] = useState(from ?? value);
  const reduce = useReducedMotion(),
    configured = useParty((s) => s.settings.reduced);
  const previous = useRef(from ?? value);
  useEffect(() => {
    if (reduce || configured) {
      setDisplay(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.65,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reduce, configured]);
  return <>{display.toLocaleString()}</>;
}
function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <motion.i
          key={i}
          initial={{ y: -30, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: 650,
            x: (i % 2 ? 1 : -1) * (30 + i * 4),
            opacity: 0,
            rotate: i * 55,
          }}
          transition={{ duration: 2.5, delay: i * 0.035 }}
          style={{
            left: `${i * 4.3}%`,
            background: ["#ed775a", "#b3c984", "#d1b8e9", "#efc857"][i % 4],
          }}
        />
      ))}
    </div>
  );
}
export function Avatar({ p, small = false }: { p: Player; small?: boolean }) {
  return (
    <span
      className={`avatar ${small ? "small" : ""}`}
      style={{ background: p.color }}
    >
      {p.avatar}
    </span>
  );
}
export function Standings({
  podium = false,
  compact = false,
  game,
  live = false,
  maxRows = 6,
}: {
  podium?: boolean;
  compact?: boolean;
  game?: Game;
  live?: boolean;
  maxRows?: number;
}) {
  const { players, round } = useParty();
  const list = rank(players, game);
  const [settled, setSettled] = useState(!live);
  useEffect(() => {
    if (!live) return;
    setSettled(false);
    const id = setTimeout(() => setSettled(true), 650);
    return () => clearTimeout(id);
  }, [round?.number, round?.game, live]);
  const visible = compact
    ? list.slice(0, 5)
    : live
      ? list.slice(0, maxRows)
      : list;
  const ordered =
    live && !settled
      ? [...visible].sort((a, b) => a.previous - b.previous)
      : visible;
  return (
    <div
      className={`rankings ${compact ? "compact" : ""} ${live ? "live-rankings" : ""}`}
    >
      {podium && (
        <div className="podium">
          {[1, 0, 2].map(
            (i) =>
              list[i] && (
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className={`podium-person place-${i + 1}`}
                  key={list[i].id}
                >
                  <span className="medal">
                    {i === 0 ? "👑" : i === 1 ? "🥈" : "🥉"}
                  </span>
                  <Avatar p={list[i]} />
                  <strong>{list[i].name}</strong>
                  <span>
                    <ScoreCount
                      value={list[i].score}
                      from={list[i].previousScore}
                    />{" "}
                    pts
                  </span>
                  <div className="podium-block">{i + 1}</div>
                </motion.div>
              ),
          )}
        </div>
      )}
      {!compact && !live && (
        <div className="rank-note">
          <span>CHAMPIONSHIP STANDINGS</span>
        </div>
      )}
      {ordered.map((p) => (
        <motion.div
          layout="position"
          transition={{
            layout: { type: "spring", stiffness: 95, damping: 18 },
          }}
          key={p.id}
          className={`rank-row ${p.rank === 1 ? "leader" : ""}`}
        >
          <motion.div
            className="rank-row-inner"
            animate={{
              scale:
                live && settled && p.previous !== p.rank ? [1, 1.045, 1] : 1,
            }}
            transition={{ duration: 0.85, delay: 0.15 }}
          >
            <span className="rank-number">
              {p.rank === 1 ? (
                <Trophy size={17} />
              ) : (
                String(p.rank).padStart(2, "0")
              )}
            </span>
            <Avatar p={p} small />
            <strong>{p.name}</strong>
            {(p.streak || 0) >= 2 && (
              <span className="streak-badge">🔥 {p.streak}</span>
            )}
            {!compact && (
              <span className="movement">
                {p.previous > p.rank ? (
                  <>
                    <ArrowUp size={13} />
                    {p.previous - p.rank}
                  </>
                ) : p.previous < p.rank ? (
                  `↓ ${p.rank - p.previous}`
                ) : (
                  "—"
                )}
              </span>
            )}
            <span className="round-points">
              {round?.awarded && round.points[p.id]
                ? `+${round.points[p.id]}`
                : ""}
            </span>
            <b>
              <ScoreCount
                value={game ? p.games[game] : p.score}
                from={!game ? p.previousScore : undefined}
              />
              <small> pts</small>
            </b>
          </motion.div>
        </motion.div>
      ))}
      {!list.length && <p>No players yet.</p>}
    </div>
  );
}
export function TV({ embedded = false }: { embedded?: boolean }) {
  const s = useParty(),
    r = s.round;
  const [replay, setReplay] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(700);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) =>
      setHeight(entries[0].contentRect.height),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  if (!r)
    return (
      <section
        ref={ref}
        className={`tv empty-tv minimal-live ${embedded ? "embedded" : ""}`}
      >
        <h1>Ready to play?</h1>
        <Button onClick={() => s.start("bluff")}>Start Bluff Battle</Button>
      </section>
    );
  const revealed = r.phase === "reveal",
    results = r.phase === "standings" || r.phase === "complete";
  const votes = Object.values(r.votes);
  const rows = Math.max(
    3,
    Math.min(
      8,
      Math.floor((height - (r.phase === "complete" ? 285 : 100)) / 66),
    ),
  );
  return (
    <section
      ref={ref}
      className={`tv minimal-live game-${r.game} ${embedded ? "embedded" : ""}`}
      key={replay}
    >
      <header className="live-tv-header">
        <span>
          {games[r.game].name}{" "}
          <small>
            {r.number} / {s.settings.rounds}
          </small>
        </span>
        <div className="tv-actions">
          <button
            aria-label="Replay entrance animation"
            onClick={() => setReplay((v) => v + 1)}
          >
            ↻
          </button>
          <button
            aria-label="Toggle sound"
            onClick={() => s.configure({ sound: !s.settings.sound })}
          >
            {s.settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            aria-label="Enter fullscreen"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <Maximize size={16} />
          </button>
        </div>
      </header>
      <AnimatePresence mode="wait">
        <motion.div
          className="tv-content"
          key={`${r.number}-${r.phase}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {r.phase === "instructions" ? (
            <>
              <GameArt game={r.game} />
              <h1>{games[r.game].name}</h1>
              <p className="initial-rules">
                {r.game === "bluff"
                  ? "Write a bluff. Find the truth."
                  : r.game === "who"
                    ? "Read the answer. Guess who wrote it."
                    : "Enter an estimate. Closest wins."}
              </p>
              <Button variant="dark" onClick={s.next}>
                Start <SkipForward size={16} />
              </Button>
            </>
          ) : r.phase === "countdown" ? (
            <motion.div
              key={r.remaining}
              className="countdown"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {r.remaining}
            </motion.div>
          ) : results ? (
            <>
              <h1 className="leaderboard-heading">
                {r.phase === "complete" ? "Final standings" : "Leaderboard"}
              </h1>
              {r.phase === "complete" && <Celebration />}
              <Standings live maxRows={rows} podium={r.phase === "complete"} />
            </>
          ) : (
            <>
              <div className="live-question-row">
                <h1 className="question-title">{r.question.text}</h1>
                {!revealed && (
                  <Timer
                    seconds={r.remaining}
                    duration={r.duration}
                    paused={r.paused}
                  />
                )}
              </div>
              {r.game === "who" ? (
                <>
                  {r.phase === "writing" ? (
                    <div className="private-question-wait">
                      Waiting for an answer
                    </div>
                  ) : (
                    <blockquote className="anonymous-answer">
                      “{r.answers[r.author]?.value}”
                    </blockquote>
                  )}
                  {revealed && (
                    <motion.div
                      className="identity-reveal"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Avatar p={s.players.find((p) => p.id === r.author)!} />
                      <h2>{s.players.find((p) => p.id === r.author)?.name}</h2>
                      <span>
                        {votes.filter((v) => v.value === r.author).length}{" "}
                        correct guesses
                      </span>
                    </motion.div>
                  )}
                </>
              ) : r.game === "bluff" ? (
                r.phase === "writing" ? (
                  <span className="submission-count">
                    {Object.keys(r.answers).length} / 3 answers
                  </span>
                ) : (
                  <div className="tv-options">
                    {r.options.map((o, i) => {
                      const count = votes.filter(
                        (v) => v.value === o.id,
                      ).length;
                      return (
                        <motion.div
                          key={o.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.09 }}
                          className={`tv-option ${revealed && o.id === "truth" ? "correct" : ""}`}
                        >
                          <span className="option-letter">{"ABCD"[i]}</span>
                          <b>{o.text}</b>
                          {revealed && (
                            <>
                              <span>{count} votes</span>
                              <small>
                                {o.id === "truth"
                                  ? "✓ Correct answer"
                                  : s.players.find((p) => p.id === o.author)
                                      ?.name}
                              </small>
                              <motion.div
                                className="vote-fill"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                style={{
                                  width: `${(count / Math.max(votes.length, 1)) * 100}%`,
                                  transformOrigin: "left",
                                }}
                              />
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )
              ) : revealed ? (
                <BallparkReveal />
              ) : (
                <SubmissionArrivals />
              )}
              {!revealed && r.phase === "voting" && (
                <span className="submission-count">
                  {votes.length} /{" "}
                  {s.players.filter((p) => p.connected).length -
                    (r.game === "who" ? 1 : 3)}{" "}
                  votes
                </span>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
export function Mobile({ framed = false }: { framed?: boolean }) {
  const s = useParty(),
    r = s.round,
    p = s.players.find((p) => p.id === s.active) || s.players[0];
  const [value, setValue] = useState("");
  useEffect(
    () => setValue(""),
    [r?.number, r?.phase, s.active, r?.game, r?.question.id],
  );
  if (!p) return <p>Create a party first.</p>;
  const author =
    r &&
    (r.game === "bluff"
      ? r.bluffers.includes(p.id)
      : r.game === "who"
        ? r.author === p.id
        : false);
  const writing = r?.phase === "writing",
    voting = r?.phase === "voting";
  const own = r?.answers[p.id],
    vote = r?.votes[p.id];
  const eligible =
    r && (writing ? r.game === "ballpark" || author : voting && !author);
  const locked = (writing && own && r?.game !== "ballpark") || (voting && vote);
  const result = r && ["reveal", "standings", "complete"].includes(r.phase);
  return (
    <section
      className={`mobile-ui minimal-mobile ${framed ? "phone-frame" : ""}`}
    >
      <header className="player-topbar">
        <strong>{p.name}</strong>
        {!p.connected && (
          <WifiOff
            className="connection-failure"
            size={20}
            aria-label="Disconnected"
          />
        )}
        <motion.span
          key={p.score}
          initial={{ y: 8, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <ScoreCount value={p.score} from={p.previousScore} />{" "}
          <small>pts</small>
        </motion.span>
      </header>
      <div className="mobile-body">
        {!p.connected ? (
          <p role="status">Reconnecting…</p>
        ) : !r ? (
          <h2>Waiting for the host</h2>
        ) : result ? (
          <PhoneResult key={`${r.game}-${r.number}`} player={p} />
        ) : (
          <>
            <div className="phone-question-row">
              <h2>{r.question.text}</h2>
              {["writing", "voting"].includes(r.phase) && (
                <Timer
                  seconds={r.remaining}
                  duration={r.duration}
                  paused={r.paused}
                />
              )}
            </div>
            {!eligible ? (
              <p className="phone-wait">
                {r.phase === "writing"
                  ? "Waiting for an answer"
                  : author && voting
                    ? "Voting in progress"
                    : "Watch the screen"}
              </p>
            ) : locked ? (
              <div className="phone-locked" role="status">
                <span>
                  {writing
                    ? own?.value
                    : r.game === "bluff"
                      ? r.options.find((o) => o.id === vote?.value)?.text
                      : s.players.find((p) => p.id === vote?.value)?.name}
                </span>
                <small>Submitted</small>
              </div>
            ) : writing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  s.send(value);
                }}
              >
                <label className="sr-only" htmlFor="player-answer">
                  {r.game === "ballpark"
                    ? `Estimate in ${r.question.unit}`
                    : "Your answer"}
                </label>
                {r.game === "ballpark" ? (
                  <>
                    <input
                      id="player-answer"
                      name="estimate"
                      autoComplete="off"
                      className="number-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Your estimate…"
                    />
                    <span className="input-unit">{r.question.unit}</span>
                  </>
                ) : (
                  <textarea
                    id="player-answer"
                    name="answer"
                    autoComplete="off"
                    maxLength={500}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Your answer…"
                  />
                )}
                <Button
                  disabled={!value.trim() || r.remaining === 0}
                  type="submit"
                >
                  {own ? "Update estimate" : "Submit"}
                  <Send size={16} />
                </Button>
                {own && (
                  <small className="saved-estimate">Saved: {own.value}</small>
                )}
                {r.game === "who" && r.question.skip !== false && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={s.skipQuestion}
                  >
                    Skip question
                  </Button>
                )}
              </form>
            ) : r.game === "bluff" ? (
              <div className="mobile-answers">
                {r.options.map((o, i) => (
                  <button
                    key={o.id}
                    disabled={r.remaining === 0}
                    onClick={() => s.send(o.id)}
                  >
                    <span>{"ABCD"[i]}</span>
                    {o.text}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <blockquote>“{r.answers[r.author]?.value}”</blockquote>
                <div className="mobile-roster">
                  {s.players
                    .filter((x) => x.id !== p.id)
                    .map((x) => (
                      <button
                        key={x.id}
                        disabled={r.remaining === 0}
                        onClick={() => s.send(x.id)}
                      >
                        <Avatar p={x} small />
                        <span>{x.name}</span>
                      </button>
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
function PhoneResult({ player }: { player: Player }) {
  const r = useParty((s) => s.round)!;
  const points = r.points[player.id] || 0;
  const streak = r.streaks?.[player.id] ?? roundStreak(r, player);
  const bonus = r.bonuses?.[player.id] ?? streakBonus(r, player);
  return (
    <motion.div
      className={`phone-result ${points ? "scored" : "missed"}`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <span className="result-eyebrow">
        {r.phase === "complete"
          ? "Final round"
          : points
            ? "Nice one!"
            : "Next round"}
      </span>
      <motion.strong
        className="earned-score"
        initial={{ scale: 0.6 }}
        animate={{ scale: [0.6, 1.12, 1] }}
        transition={{ duration: 0.65 }}
      >
        +<ScoreCount value={points} from={0} />
      </motion.strong>
      <span>points</span>
      {streak >= 2 && (
        <motion.div
          className="phone-streak"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          🔥 {streak} in a row {bonus > 0 && <b>+{bonus} bonus</b>}
        </motion.div>
      )}
      <div className="phone-total">
        <small>Championship</small>
        <strong>
          <ScoreCount value={player.score} from={player.previousScore} />
        </strong>
      </div>
      {points > 0 && <Celebration />}
    </motion.div>
  );
}
