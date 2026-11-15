import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, FastForward, Trophy } from "lucide-react";
import { rank } from "../../engine";
import { fmt, type Night } from "../../session/model";
import { useParty } from "../../store";
import { useNight } from "../../session/store";
import { playSound } from "../../sound";
import { liveAction, liveActive } from "../../session/transport";
import { Sticker } from "./common";

export function ScoreCount({
  from,
  to,
  instant = false,
}: {
  from: number;
  to: number;
  instant?: boolean;
}) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (instant) {
      setValue(to);
      return;
    }
    const control = animate(from, to, {
      duration: 1.15,
      delay: 0.35,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => control.stop();
  }, [from, to, instant]);
  return <>{fmt(value)}</>;
}
export function AnimatedStandings({
  night,
  full = false,
}: {
  night: Night;
  full?: boolean;
}) {
  const reduce = useReducedMotion(),
    settings = useParty((s) => s.settings);
  const instant = !!reduce || settings.reduced || night.vibe === "comfortable";
  const [settled, setSettled] = useState(instant);
  const list = rank(night.players);
  useEffect(() => {
    setSettled(instant);
    if (instant) return;
    const timer = setTimeout(() => {
      setSettled(true);
      if (useParty.getState().settings.sound) playSound("move");
    }, 1250);
    return () => clearTimeout(timer);
  }, [night.round?.id, instant]);
  const ordered = settled
    ? list
    : [...list].sort(
        (a, b) =>
          a.previous - b.previous ||
          (b.previousScore ?? 0) - (a.previousScore ?? 0) ||
          night.players.findIndex((p) => p.id === a.id) -
            night.players.findIndex((p) => p.id === b.id),
      );
  return (
    <div className={`n-standings ${full ? "n-standings-full" : ""}`}>
      <div className="n-standings-heading">
        <h2>{full ? "Results" : "Leaderboard"}</h2>
      </div>
      <ol
        className="n-live-ranks"
        style={{
          gridTemplateRows: `repeat(${Math.min(list.length > 14 ? 8 : 7, list.length)}, auto)`,
        }}
      >
        {ordered.map((p) => (
          <motion.li
            layout={!instant}
            transition={{ layout: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
            key={p.id}
            className={p.rank === 1 && settled ? "n-rank-leader" : ""}
          >
            <span className="n-rank-place">
              {settled ? p.rank : p.previous}
            </span>
            <Sticker player={p} size={50} />
            <b>{p.name}</b>
            <span className="n-rank-rise">
              {settled && p.previous > p.rank ? `↑ ${p.previous - p.rank}` : ""}
            </span>
            <div className="n-score-stack">
              <strong>
                <ScoreCount
                  from={p.previousScore ?? p.score}
                  to={p.score}
                  instant={instant}
                />
              </strong>
              {p.previousScore !== undefined && p.score !== p.previousScore && (
                <small>
                  {p.score > p.previousScore ? "+" : ""}
                  {fmt(p.score - p.previousScore)}
                </small>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
export function BluffChart({
  night,
  released,
}: {
  night: Night;
  released: boolean;
}) {
  const r = night.round!;
  const counts = r.options.map(
    (o) => Object.values(r.votes).filter((v) => v.value === o.id).length,
  );
  const max = Math.max(1, ...counts);
  return (
    <div className="n-bluff-chart" aria-label="Votes by answer">
      {r.options.map((o, i) => {
        const truth = released && o.id === "truth";
        const author = night.players.find((p) => p.id === o.author);
        return (
          <div
            key={o.id}
            className={`n-chart-column n-chart-${i} ${truth ? "is-truth" : ""}`}
          >
            <div className="n-chart-plot">
              <motion.div
                className="n-chart-bar"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ height: `${Math.max(4, (counts[i] / max) * 100)}%` }}
              />
              <strong className="n-chart-count">{counts[i]}</strong>
            </div>
            <span className="n-chart-letter">
              {String.fromCharCode(65 + i)}
              {truth && <Check size={24} />}
            </span>
            <b>{o.text}</b>
            {released && (
              <span className="n-chart-author">
                {truth ? "Correct answer" : author?.name || "Bluff"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
export function BallparkShow({ night }: { night: Night }) {
  const r = night.round!,
    answer = Number(r.question.answer);
  const settings = useParty((s) => s.settings),
    reduce = useReducedMotion();
  const estimates = Object.entries(r.answers)
    .map(([id, a]) => ({
      player: night.players.find((p) => p.id === id)!,
      value: Number(a.value),
      distance: Math.abs(Number(a.value) - answer),
    }))
    .filter((e) => e.player)
    .sort(
      (a, b) =>
        b.distance - a.distance || a.player.id.localeCompare(b.player.id),
    );
  const instant = settings.reduced || !!reduce || night.vibe === "comfortable";
  const [step, setStep] = useState(
    instant || r.ballparkPresented ? estimates.length : 0,
  );
  const done = step >= estimates.length;
  useEffect(() => {
    if (!done) return;
    const current = useNight.getState().night;
    if (current?.round?.id === r.id && !current.round.ballparkPresented) {
      if (liveActive()) {
        liveAction("presented");
        return;
      }
      useNight.setState({
        night: {
          ...current,
          round: { ...current.round, ballparkPresented: true },
        },
      });
    }
  }, [done, r.id]);
  const current = estimates[Math.min(step, estimates.length - 1)];
  useEffect(() => {
    if (instant) {
      setStep(estimates.length);
      return;
    }
    if (done || night.paused || document.hidden) return;
    const timer = setTimeout(
      () => {
        setStep((s) => s + 1);
        if (settings.sound)
          playSound(step >= estimates.length - 3 ? "correct" : "tick");
      },
      step >= estimates.length - 3 ? 1650 : 1050,
    );
    return () => clearTimeout(timer);
  }, [step, done, instant, night.paused, estimates.length, settings.sound]);
  const min = Math.min(answer, ...estimates.map((e) => e.value)),
    max = Math.max(answer, ...estimates.map((e) => e.value));
  const pos = (v: number) =>
    5 + (max === min ? 0.5 : (v - min) / (max - min)) * 90;
  const best = Math.min(...estimates.map((e) => e.distance));
  return (
    <div className="n-ballpark-show">
      <div className="n-ballpark-answer">
        <span>Answer</span>
        <strong>
          {fmt(answer)} <small>{r.question.unit}</small>
        </strong>
      </div>
      <div className="n-guess-focus" aria-live="polite">
        {done ? (
          <>
            <div className="n-closest-faces">
              {estimates
                .filter((e) => e.distance === best)
                .map((e) => (
                  <div key={e.player.id}>
                    <Sticker player={e.player} size={104} />
                    <b>{e.player.name}</b>
                  </div>
                ))}
            </div>
            <h3>Closest · +100</h3>
            <p>
              {fmt(best)} {r.question.unit} away
            </p>
          </>
        ) : (
          current && (
            <motion.div
              key={current.player.id}
              initial={{ scale: 0.88, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Sticker player={current.player} size={104} />
              <h3>{current.player.name}</h3>
              <strong>
                {fmt(current.value)} <small>{r.question.unit}</small>
              </strong>
              <p>{fmt(current.distance)} away</p>
            </motion.div>
          )
        )}
      </div>
      <div className="n-ballpark-track">
        <span className="n-track-rail" />
        <span className="n-track-truth" style={{ left: `${pos(answer)}%` }}>
          Answer
        </span>
        {estimates.slice(0, done ? estimates.length : step + 1).map((e, i) => (
          <motion.span
            key={e.player.id}
            className={`n-track-face ${!done && i === step ? "is-current" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ left: `${pos(e.value)}%`, top: `${58 + (i % 3) * 23}px` }}
            title={`${e.player.name}: ${fmt(e.value)}`}
          >
            <Sticker player={e.player} size={36} />
          </motion.span>
        ))}
        <span className="n-track-min">{fmt(min)}</span>
        <span className="n-track-max">{fmt(max)}</span>
      </div>
      {!done && (
        <button
          className="n-text-button"
          onClick={() => setStep(estimates.length)}
        >
          <FastForward size={17} />
          Show all guesses
        </button>
      )}
      {done && (
        <div className="n-all-guesses">
          {[...estimates].reverse().map((e) => (
            <div key={e.player.id}>
              <Sticker player={e.player} size={36} />
              <b>{e.player.name}</b>
              <strong>{fmt(e.value)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export function Podium({ night }: { night: Night }) {
  const reduce = useReducedMotion(),
    settings = useParty((s) => s.settings);
  const instant = !!reduce || settings.reduced || night.vibe === "comfortable";
  const [beat, setBeat] = useState(instant ? 3 : 0);
  const list = rank(night.players),
    top = list.filter((p) => p.rank <= 3),
    places = [...new Set(top.map((p) => p.rank))].sort((a, b) => b - a);
  useEffect(() => {
    if (!night.ledger.some((result) => !result.voided)) return;
    if (instant) {
      setBeat(3);
      return;
    }
    const timers = [350, 1700, 3200].map((ms, i) =>
      setTimeout(() => {
        setBeat(i + 1);
        if (useParty.getState().settings.sound)
          playSound(i >= places.length - 1 ? "winner" : "move");
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [night.id, instant]);
  if (!night.ledger.some((result) => !result.voided))
    return (
      <div className="n-podium-scene n-empty-podium">
        <h1>No scores yet</h1>
        <div className="n-practice-cast">
          {night.players.slice(0, 3).map((p) => (
            <Sticker key={p.id} player={p} size={120} />
          ))}
        </div>
      </div>
    );
  return (
    <div
      className={`n-podium-scene ${beat >= places.length ? "is-complete" : ""}`}
    >
      <div className="n-spotlight n-spotlight-left" />
      <div className="n-spotlight n-spotlight-right" />
      <h1>
        {beat >= places.length
          ? top.filter((p) => p.rank === 1).length > 1
            ? "Joint winners!"
            : `${list[0]?.name} wins!`
          : "The podium"}
      </h1>
      <div className="n-podium">
        {[2, 1, 3]
          .filter((place) => top.some((p) => p.rank === place))
          .map((place) => {
            const visible = beat > places.indexOf(place);
            return (
              <div
                key={place}
                className={`n-podium-place n-place-${place} ${visible ? "is-shown" : ""}`}
              >
                <div className="n-podium-people" aria-hidden={!visible}>
                  {top
                    .filter((p) => p.rank === place)
                    .map((p) => (
                      <div key={p.id}>
                        <Sticker player={p} size={place === 1 ? 140 : 112} />
                        <h2>{visible ? p.name : "?"}</h2>
                        <strong>{visible ? fmt(p.score) : ""}</strong>
                      </div>
                    ))}
                </div>
                <div className="n-podium-plinth">
                  {place === 1 && <Trophy size={38} />}
                  <b>{place}</b>
                </div>
              </div>
            );
          })}
      </div>
      {beat >= places.length && (
        <div className="n-confetti" aria-hidden="true">
          {Array.from({ length: 26 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37) % 100}%`,
                animationDelay: `${(i % 7) * 0.13}s`,
                background: ["#FFD45A", "#39C9DD", "#E2DAFA", "#FFFFFF"][i % 4],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
