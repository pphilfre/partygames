// Original procedural sound effects; no downloaded audio or network dependency.
let context: AudioContext | null = null;
let ready = false;
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    void context.resume();
    ready = true;
  } catch {}
}
export function playSound(
  kind:
    | "tick"
    | "submit"
    | "correct"
    | "incorrect"
    | "move"
    | "winner"
    | "transition",
) {
  if (!ready || !context) return;
  const ctx = context;
  const notes = {
    tick: [440],
    submit: [523, 659],
    correct: [523, 659, 784],
    incorrect: [220, 196],
    move: [440, 587, 740],
    winner: [523, 659, 784, 1046],
    transition: [392, 523],
  }[kind];
  notes.forEach((note, i) => {
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    const time = ctx.currentTime + i * 0.09;
    osc.frequency.value = note;
    gain.gain.setValueAtTime(0.035, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.start(time);
    osc.stop(time + 0.2);
  });
}
