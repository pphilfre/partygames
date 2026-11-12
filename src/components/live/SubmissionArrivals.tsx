import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useParty } from "../../store";
export function SubmissionArrivals() {
  const { round, players } = useParty();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const ids = Object.keys(round?.answers || {}).reverse();
  const columns = Math.max(1, Math.min(7, Math.floor(width / 125)));
  const rows = Math.ceil(ids.length / columns);
  return (
    <div className="arrival-stage" ref={ref}>
      {ids.map((id, i) => {
        const p = players.find((p) => p.id === id);
        if (!p) return null;
        const row = Math.floor(i / columns);
        const items = Math.min(columns, ids.length - row * columns);
        const lane = i % columns;
        const zig = lane === 0 ? 0 : Math.ceil(lane / 2) * (lane % 2 ? -1 : 1);
        const shift = items % 2 === 0 ? 62 : 0;
        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: zig * 125 + shift,
              y: (row - (rows - 1) / 2) * 66,
            }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
          >
            <span style={{ background: p.color }}>{p.avatar}</span>
            <b>{p.name}</b>
          </motion.div>
        );
      })}
    </div>
  );
}
