import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useParty } from "../../store";
export function BallparkReveal() {
  const r = useParty((s) => s.round)!,
    players = useParty((s) => s.players),
    reduce = useReducedMotion(),
    quiet = useParty((s) => s.settings.reduced);
  const answer = Number(r.question.answer);
  const estimates = Object.entries(r.answers).sort(
    (a, b) =>
      Math.abs(Number(b[1].value) - answer) -
      Math.abs(Number(a[1].value) - answer),
  );
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (reduce || quiet) {
      setStep(estimates.length);
      return;
    }
    setStep(-1);
    let n = -1;
    const id = setInterval(() => {
      n++;
      setStep(n);
      if (n >= estimates.length) clearInterval(id);
    }, 1100);
    return () => clearInterval(id);
  }, [r.number, r.question.id, reduce, quiet, estimates.length]);
  const done = step >= estimates.length;
  const current = estimates[Math.min(step, estimates.length - 1)];
  const remaining = estimates.slice(Math.max(0, step));
  const values = remaining.map(([, v]) => Number(v.value));
  const min = Math.min(answer, ...values),
    max = Math.max(answer, ...values),
    span = max - min || Math.max(Math.abs(answer) * 0.05, 1);
  const pos = (v: number) => 10 + ((v - min) / span) * 80;
  const p = players.find((p) => p.id === current?.[0]);
  return (
    <div className="ballpark-cinematic">
      <div className="estimate-spotlight" aria-live="polite">
        <AnimatePresence mode="wait">
          {step >= 0 && p && (
            <motion.div
              key={current[0]}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
            >
              <span>
                {done
                  ? "Closest estimate"
                  : `${step + 1} / ${estimates.length}`}
              </span>
              <h2>
                {p.avatar} {p.name}
              </h2>
              <strong>
                {Number(current[1].value).toLocaleString()}{" "}
                <small>{r.question.unit}</small>
              </strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="cinematic-line">
        <div className="number-axis" />
        {estimates.map(([id, v], i) => (
          <motion.div
            key={id}
            className={`cinematic-marker ${current?.[0] === id ? "focused" : ""}`}
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{
              left: `${pos(Number(v.value))}%`,
              opacity: i <= step && (i === step || done) ? 1 : 0,
              scale: current?.[0] === id ? 1.3 : 1,
            }}
            transition={{ duration: 0.8, type: "spring", damping: 24 }}
          >
            <span>{players.find((p) => p.id === id)?.avatar}</span>
          </motion.div>
        ))}
        <AnimatePresence>
          {done && (
            <motion.div
              className="cinematic-answer"
              initial={{ opacity: 0, scale: 0.6, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ left: `${pos(answer)}%`, x: "-50%" }}
            >
              <i />
              <span>Correct answer</span>
              <strong>
                {answer.toLocaleString()} <small>{r.question.unit}</small>
              </strong>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span
          className="line-min"
          key={`min${min}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {min.toLocaleString()}
        </motion.span>
        <motion.span
          className="line-max"
          key={`max${max}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {(max === min ? max + span : max).toLocaleString()}
        </motion.span>
      </div>
      {done && (
        <motion.b
          className="closest-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {p?.name} · +100 closest bonus
        </motion.b>
      )}
    </div>
  );
}
