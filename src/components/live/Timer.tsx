import { motion } from "motion/react";
export function Timer({
  seconds,
  duration,
  paused = false,
}: {
  seconds: number;
  duration: number;
  paused?: boolean;
}) {
  return (
    <div
      className={`live-timer ${seconds <= 5 ? "urgent" : ""}`}
      role="timer"
      aria-label={`${seconds} seconds${paused ? ", paused" : ""}`}
    >
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle className="timer-track" cx="40" cy="40" r="35" />
        <motion.circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="220"
          animate={{
            strokeDashoffset: 220 * (1 - seconds / Math.max(duration, 1)),
          }}
          transition={{ duration: 0.7 }}
        />
      </svg>
      <motion.strong
        key={seconds}
        initial={{ scale: seconds <= 5 ? 1.35 : 1.1, y: -3 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 15 }}
      >
        {seconds}
      </motion.strong>
      {paused && <small>Paused</small>}
    </div>
  );
}
