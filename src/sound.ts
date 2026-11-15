// Original procedural sound effects; no downloaded audio or network dependency.
let context: AudioContext | null = null;
let ready = false;
let musicTimer: ReturnType<typeof setInterval> | undefined;
let musicBus: GainNode | undefined;
let musicMode = "";
let requestedMode = "";
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    void context.resume();
    ready = true;
    if (requestedMode && !musicTimer) setMusic(requestedMode);
  } catch {}
}

// Original score: marimba lead, syncopated bass and light percussion.
// One transport owns the loop; muting/pausing disconnects every scheduled note.
export function setMusic(mode: string) {
  requestedMode = mode;
  if (musicMode === mode && musicTimer) return;
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = undefined;
  musicBus?.disconnect();
  musicBus = undefined;
  musicMode = "";
  if (!mode || !ready || !context) return;
  const ctx = context,
    bus = ctx.createGain();
  bus.gain.value = 0.42;
  bus.connect(ctx.destination);
  musicBus = bus;
  musicMode = mode;
  const bpm = mode === "lobby" ? 110 : mode === "reveal" ? 142 : 122;
  const beat = 60 / bpm / 2;
  let next = ctx.currentTime + 0.05,
    step = 0;
  const lead = [
    76, 0, 79, 83, 81, 0, 79, 74, 76, 79, 0, 86, 83, 81, 79, 0, 74, 0, 78, 81,
    79, 0, 78, 74, 72, 76, 0, 79, 78, 74, 71, 0,
  ];
  const bass = [48, 48, 53, 55];
  const note = (
    midi: number,
    at: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ) => {
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(at);
    osc.stop(at + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  };
  const schedule = () => {
    while (next < ctx.currentTime + 0.3) {
      const k = step % 32,
        melody = lead[k];
      if (melody) {
        note(melody, next, 0.23, 0.07, "sine");
        note(melody + 12, next, 0.1, 0.012, "triangle");
      }
      if (step % 4 === 0 || step % 8 === 5)
        note(bass[Math.floor(step / 8) % 4], next, 0.22, 0.065, "triangle");
      if (step % 4 === 0) {
        const kick = ctx.createOscillator(),
          gain = ctx.createGain();
        kick.frequency.setValueAtTime(120, next);
        kick.frequency.exponentialRampToValueAtTime(42, next + 0.11);
        gain.gain.setValueAtTime(0.11, next);
        gain.gain.exponentialRampToValueAtTime(0.001, next + 0.13);
        kick.connect(gain);
        gain.connect(bus);
        kick.start(next);
        kick.stop(next + 0.15);
        kick.onended = () => {
          kick.disconnect();
          gain.disconnect();
        };
      }
      if (step % 2 === 1) note(103, next, 0.035, 0.012, "square");
      step++;
      next += beat;
    }
  };
  schedule();
  musicTimer = setInterval(schedule, 120);
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
