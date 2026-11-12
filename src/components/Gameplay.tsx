import {
  ArrowUp,
  Check,
  Clock,
  Eye,
  LockKeyhole,
  Maximize,
  Send,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { games, rank, type Game, type Player } from "../engine";

import { useParty } from "../store";
import { GameArt } from "./Art";
import { Button } from "./ui";
function ScoreCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const reduce = useReducedMotion(),
    configured = useParty((s) => s.settings.reduced);
  const previous = useRef(value);
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
}: {
  podium?: boolean;
  compact?: boolean;
  game?: Game;
}) {
  const { players, round } = useParty();
  const list = rank(players, game);
  const climber = [...list].sort(
    (a, b) => b.previous - b.rank - (a.previous - a.rank),
  )[0];
  return (
    <div className={compact ? "rankings compact" : "rankings"}>
      {podium && (
        <div className="podium">
          {[1, 0, 2].map(
            (i) =>
              list[i] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
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
                  <span>{list[i].score.toLocaleString()} pts</span>
                  <div className="podium-block">{i + 1}</div>
                </motion.div>
              ),
          )}
        </div>
      )}
      {!compact && (
        <div className="rank-note">
          <span>CHAMPIONSHIP STANDINGS</span>
          <span>↗ Biggest climber: {climber?.name}</span>
        </div>
      )}
      {(compact ? list.slice(0, 5) : list).map((p) => (
        <motion.div
          layout
          key={p.id}
          className={`rank-row ${p.rank === 1 ? "leader" : ""}`}
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
            <ScoreCount value={game ? p.games[game] : p.score} />
            <small> pts</small>
          </b>
        </motion.div>
      ))}
      {!list.length && <p>No players yet. Create a party in Demo.</p>}
    </div>
  );
}
export function TV({ embedded = false }: { embedded?: boolean }) {
  const s = useParty(),
    r = s.round;
  const [replay, setReplay] = useState(0);
  if (!r)
    return (
      <section className={`tv empty-tv ${embedded ? "embedded" : ""}`}>
        <span className="eyebrow">AFTERPARTY PRESENTS</span>
        <h1>
          Good people.
          <br />
          Great games.
        </h1>
        <PartyLobby />
        <p>Your next great night starts here.</p>
        <Button onClick={() => s.start("bluff")}>Start Bluff Battle</Button>
      </section>
    );
  const g = games[r.game],
    revealed = ["reveal", "standings", "complete"].includes(r.phase);
  const votes = Object.values(r.votes);
  const result = r.phase === "standings" || r.phase === "complete";
  return (
    <section
      className={`tv game-${r.game} ${embedded ? "embedded" : ""}`}
      key={replay}
    >
      <div className="tv-top">
        <span className="tv-brand">
          afterparty<span>✱</span>
        </span>
        <span>
          {g.name} <i /> ROUND {r.number} / {s.settings.rounds}
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
            {s.settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            aria-label="Enter fullscreen"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          className="tv-content"
          key={`${r.number}-${r.phase}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {r.phase === "instructions" ? (
            <>
              <span className="eyebrow">LET’S PLAY</span>
              <GameArt game={r.game} />
              <h1>{g.name}</h1>
              <p>{g.description}</p>
              <div className="rules">
                {r.game === "bluff"
                  ? "3 bluffers write a lie. Everyone else finds the truth. Correct: +500. Each person fooled: +250."
                  : r.game === "who"
                    ? "One person shares a secret. Guess who wrote it. Correct guesses earn base points plus a speed bonus. The author earns up to 500 for staying mysterious."
                    : "Enter your best estimate. Earn up to 900 for accuracy and 100 for the closest guess. You can edit until the timer ends."}
              </div>
              <Button variant="dark" onClick={s.next}>
                Let’s do this <SkipForward size={16} />
              </Button>
            </>
          ) : r.phase === "countdown" ? (
            <>
              <span className="eyebrow">GET YOUR GAME FACE ON</span>
              <motion.div
                key={r.remaining}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="countdown"
              >
                {r.remaining}
              </motion.div>
              <h2>Here we go.</h2>
            </>
          ) : result ? (
            <>
              <span className="eyebrow">
                {r.phase === "complete"
                  ? "THAT’S A WRAP"
                  : "A LITTLE FRIENDLY COMPETITION"}
              </span>
              {r.phase === "complete" && <Celebration />}
              <h1>
                {r.phase === "complete"
                  ? "A night for the books."
                  : "The plot thickens."}
              </h1>
              <Standings podium={r.phase === "complete"} />
            </>
          ) : (
            <>
              <div className="tv-question-meta">
                <span className="eyebrow">
                  {r.game === "who"
                    ? r.phase === "writing"
                      ? "A SECRET IS BEING SHARED"
                      : "WHO SAID THAT?"
                    : revealed
                      ? "THE MOMENT OF TRUTH"
                      : r.game === "bluff" && r.phase === "writing"
                        ? "BLUFFERS, MAKE IT BELIEVABLE"
                        : "TRUST YOUR GUT"}
                </span>
                <span className="timer">
                  <Clock size={17} />
                  {r.remaining}s {r.paused ? "· Paused" : ""}
                </span>
              </div>
              <h1 className="question-title">
                {r.game === "who"
                  ? r.phase === "writing"
                    ? "Someone has a story to tell…"
                    : `“${r.answers[r.author]?.value || "Waiting for an answer…"}”`
                  : r.question.text}
              </h1>
              {r.game === "who" && r.phase === "writing" ? (
                <>
                  <div className="secret-orb">
                    <LockKeyhole size={48} />
                  </div>
                  <p>Check your phone. One of you has a private question.</p>
                </>
              ) : r.game === "bluff" && r.phase === "writing" ? (
                <>
                  <div className="bluffer-list">
                    {r.bluffers.map((id) => {
                      const p = s.players.find((p) => p.id === id)!;
                      return (
                        <div key={id}>
                          <Avatar p={p} />
                          <b>{p.name}</b>
                          <span>
                            {r.answers[id] ? (
                              <Check size={18} />
                            ) : (
                              <span className="typing">•••</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p>The truth is about to get some competition.</p>
                </>
              ) : r.game === "bluff" ? (
                <div className="tv-options">
                  {r.options.map((o, i) => {
                    const count = votes.filter((v) => v.value === o.id).length;
                    return (
                      <motion.div
                        key={o.id}
                        className={`tv-option ${revealed && o.id === "truth" ? "correct" : ""}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="option-letter">{"ABCD"[i]}</span>
                        <b>{o.text}</b>
                        {revealed && (
                          <>
                            <span>
                              {count} vote{count !== 1 ? "s" : ""}
                            </span>
                            <small>
                              {o.id === "truth"
                                ? "✓ THE TRUTH"
                                : `Bluff by ${s.players.find((p) => p.id === o.author)?.name}`}
                            </small>
                            <div
                              className="vote-fill"
                              style={{
                                width: `${(count / Math.max(votes.length, 1)) * 100}%`,
                              }}
                            />
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : r.game === "who" ? (
                revealed ? (
                  <>
                    <div className="identity-reveal">
                      <Avatar p={s.players.find((p) => p.id === r.author)!} />
                      <h2>
                        It was {s.players.find((p) => p.id === r.author)?.name}!
                      </h2>
                      <span>
                        {votes.filter((v) => v.value === r.author).length} of{" "}
                        {votes.length} saw through it.
                      </span>
                    </div>
                    <div className="identity-votes">
                      {s.players.map((p) => {
                        const count = votes.filter(
                          (v) => v.value === p.id,
                        ).length;
                        return count > 0 ? (
                          <div key={p.id}>
                            <Avatar p={p} small />
                            <b>{p.name}</b>
                            <span>{count} guesses</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    {Object.entries(r.votes)
                      .filter(([, v]) => v.value === r.author)
                      .sort((a, b) => a[1].seconds - b[1].seconds)
                      .slice(0, 1)
                      .map(([id, v]) => (
                        <p key={id}>
                          ⚡ Fastest correct:{" "}
                          {s.players.find((p) => p.id === id)?.name} in{" "}
                          {v.seconds}s · +{r.points[id]} points
                        </p>
                      ))}
                  </>
                ) : (
                  <div className="suspect-cloud">
                    {s.players.map((p) => (
                      <div key={p.id}>
                        <Avatar p={p} />
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : revealed ? (
                <BallparkChart />
              ) : (
                <>
                  <div className="estimate-tease">
                    <span>?</span>
                    <small>{r.question.unit}</small>
                  </div>
                  <p>How close can you get?</p>
                  <div className="submitted-dots">
                    {s.players.map((p) => (
                      <span
                        key={p.id}
                        className={r.answers[p.id] ? "done" : ""}
                      >
                        {r.answers[p.id] ? p.avatar : "·"}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {revealed && r.game !== "who" && (
                <p className="explanation">{r.question.explanation}</p>
              )}
              {revealed && (
                <div className="points-strip">
                  {Object.entries(r.points)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([id, pts]) => (
                      <span key={id}>
                        {s.players.find((p) => p.id === id)?.avatar}{" "}
                        {s.players.find((p) => p.id === id)?.name} <b>+{pts}</b>
                      </span>
                    ))}
                </div>
              )}
              <div className="tv-bottom">
                <span className="live-dot" />
                {r.phase === "writing" || r.game === "ballpark"
                  ? Object.keys(r.answers).length
                  : votes.length}{" "}
                {r.phase === "writing" || r.game === "ballpark"
                  ? "answers"
                  : "votes"}{" "}
                submitted{" "}
                <span>
                  ROOM <b>FRDY</b>
                </span>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="tv-footer">
        <span>GOOD PEOPLE. GREAT GAMES.</span>
        <span>afterparty.local / play · FRDY</span>
      </div>
    </section>
  );
}
function PartyLobby() {
  const players = useParty((s) => s.players);
  return (
    <div className="lobby-cloud">
      {players.map((p) => (
        <Avatar p={p} key={p.id} />
      ))}
    </div>
  );
}
function BallparkChart() {
  const r = useParty((s) => s.round)!,
    players = useParty((s) => s.players);
  const ans = Number(r.question.answer),
    vals = Object.values(r.answers).map((v) => Number(v.value));
  const min = Math.min(ans, ...vals),
    max = Math.max(ans, ...vals),
    span = max - min || 1;
  const pos = (v: number) => 8 + ((v - min) / span) * 84;
  const closest = Object.entries(r.answers).sort(
    (a, b) =>
      Math.abs(Number(a[1].value) - ans) - Math.abs(Number(b[1].value) - ans),
  )[0];
  return (
    <div className="ballpark-result">
      <div className="correct-number">
        <span>THE ANSWER</span>
        <strong>
          {ans.toLocaleString()} <small>{r.question.unit}</small>
        </strong>
      </div>
      <div className="number-chart">
        <div className="number-axis" />
        <div className="answer-line" style={{ left: `${pos(ans)}%` }}>
          <span>✓ {ans.toLocaleString()}</span>
        </div>
        {Object.entries(r.answers)
          .sort((a, b) => Number(a[1].value) - Number(b[1].value))
          .map(([id, v], i) => {
            const p = players.find((p) => p.id === id);
            return (
              p && (
                <motion.div
                  title={`${p.name}: ${Number(v.value).toLocaleString()}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`estimate-marker lane-${i % 4} ${id === closest?.[0] ? "closest" : ""}`}
                  style={{ left: `${pos(Number(v.value))}%` }}
                  key={id}
                >
                  <span className="marker-dot" />
                  <span className="marker-label">
                    {p.avatar} {p.name}
                    <b>{Number(v.value).toLocaleString()}</b>
                  </span>
                </motion.div>
              )
            );
          })}
        <span className="axis-min">{min.toLocaleString()}</span>
        <span className="axis-max">{max.toLocaleString()}</span>
      </div>
      <div className="estimate-grid">
        {Object.entries(r.answers).map(([id, v]) => {
          const p = players.find((p) => p.id === id);
          return (
            p && (
              <div key={id}>
                <span>
                  {p.avatar} {p.name}
                </span>
                <b>{Number(v.value).toLocaleString()}</b>
                <small>+{r.points[id]} pts</small>
              </div>
            )
          );
        })}
      </div>
      <p>
        🎯 Closest estimate:{" "}
        <b>
          {players.find((p) => p.id === closest?.[0])?.name || "No submissions"}
        </b>{" "}
        · +100 bonus
      </p>
    </div>
  );
}
export function Mobile({ framed = false }: { framed?: boolean }) {
  const s = useParty(),
    r = s.round,
    p = s.players.find((p) => p.id === s.active) || s.players[0];
  const [value, setValue] = useState("");
  useEffect(() => setValue(""), [r?.number, r?.phase, s.active, r?.game]);
  if (!p) return <p>Create a party first.</p>;
  const author =
      r &&
      (r.game === "bluff"
        ? r.bluffers.includes(p.id)
        : r.game === "who"
          ? r.author === p.id
          : false),
    writing = r?.phase === "writing",
    voting = r?.phase === "voting",
    own = r?.answers[p.id],
    vote = r?.votes[p.id];
  const eligible =
    r && (writing ? r.game === "ballpark" || author : voting && !author);
  const locked = (writing && own && r?.game !== "ballpark") || (voting && vote);
  return (
    <section className={`mobile-ui ${framed ? "phone-frame" : ""}`}>
      <div className="phone-status">
        <span>9:41</span>
        <span>● ▰</span>
      </div>
      <div className="mobile-header">
        <span className="brand">
          afterparty<span>✱</span>
        </span>
        <span className="room-badge">FRDY</span>
      </div>
      <div className="mobile-player">
        <Avatar p={p} small />
        <b>{p.name}</b>
        <span>{p.score.toLocaleString()} pts</span>
      </div>
      <div className="mobile-body">
        {!p.connected ? (
          <>
            <h2>You’re disconnected.</h2>
            <p>The host can reconnect you in the lobby.</p>
          </>
        ) : !r ? (
          <>
            <span className="eyebrow">YOU’RE IN</span>
            <h1>
              Party people,
              <br />
              assemble.
            </h1>
            <span className="mobile-mascot">{p.avatar}</span>
            <p>Get comfortable. Your host will start a game soon.</p>
          </>
        ) : (
          <>
            <div className="mobile-round">
              <span>{games[r.game].name}</span>
              <span>
                <Clock size={14} /> {r.remaining}s
              </span>
            </div>
            {r.phase === "reveal" ||
            r.phase === "standings" ||
            r.phase === "complete" ? (
              <div className="mobile-confirm">
                <Trophy size={44} />
                <h2>
                  {r.phase === "complete" ? "What a night." : "Round complete!"}
                </h2>
                <strong className="mobile-points">
                  +{r.points[p.id] || 0}
                </strong>
                <p>Watch the big screen for the reveal.</p>
                <small>Championship: {p.score.toLocaleString()} points</small>
              </div>
            ) : !eligible ? (
              <div className="mobile-confirm">
                <Eye size={42} />
                <h2>
                  {r.phase === "writing"
                    ? "A little mystery."
                    : "Eyes on the big screen."}
                </h2>
                <p>
                  {r.game === "who" && writing
                    ? "Someone is sharing a secret. You’ll guess who soon."
                    : author && voting
                      ? "Your answer is out there. Let’s see who takes the bait."
                      : "Your next move is coming up."}
                </p>
              </div>
            ) : locked ? (
              <div className="mobile-confirm">
                <div className="confirmation-icon">
                  <Check size={36} />
                </div>
                <h2>{voting ? "Vote locked in." : "Looking good."}</h2>
                <p>
                  {writing
                    ? own?.value
                    : "Your guess is in. Let the suspense begin."}
                </p>
                <span className="eyebrow">NOW WE WAIT…</span>
              </div>
            ) : (
              <>
                <span className="eyebrow">
                  {author && r.game === "bluff"
                    ? "YOU’RE A BLUFFER"
                    : author && r.game === "who"
                      ? "JUST BETWEEN US"
                      : "YOUR MOMENT"}
                </span>
                <h2>
                  {r.game === "who" && voting
                    ? "Who wrote that?"
                    : r.question.text}
                </h2>
                {writing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      s.send(value);
                    }}
                  >
                    <label htmlFor="player-answer">
                      {r.game === "ballpark"
                        ? `Your estimate (${r.question.unit})`
                        : "Your answer"}
                    </label>
                    {r.game === "ballpark" ? (
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
                        placeholder="e.g. 100…"
                      />
                    ) : (
                      <textarea
                        id="player-answer"
                        name="answer"
                        maxLength={500}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={
                          r.game === "bluff"
                            ? "Make it believable…"
                            : "Tell us a little something…"
                        }
                      />
                    )}
                    <Button
                      disabled={!value.trim() || r.remaining === 0}
                      type="submit"
                    >
                      {own ? "Update estimate" : "Lock it in"}{" "}
                      <Send size={16} />
                    </Button>
                    {own && (
                      <p className="success-text">
                        ✓ Saved: {own.value}. You can still edit.
                      </p>
                    )}
                    {r.game === "who" && r.question.skip !== false && (
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={s.skipQuestion}
                      >
                        Skip this question
                      </Button>
                    )}
                    <p className="input-note">
                      {r.game === "ballpark"
                        ? "Edit until the timer ends. Closest guess earns +100."
                        : r.game === "who"
                          ? "Share only what you’re comfortable with."
                          : "Your answer stays anonymous until the reveal."}
                    </p>
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
                    <p className="input-note">
                      Correct: +{r.rules.base} · Speed bonus: up to{" "}
                      {r.rules.speed}
                    </p>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className="mobile-footer">
        <span className="live-dot" />{" "}
        {p.connected ? "Connected. Ready for a good time." : "Offline"}
      </div>
    </section>
  );
}
