import { useEffect } from "react";
import { useParty } from "./store";
import { playSound, unlockAudio } from "./sound";

// Progressive enhancement: visual feedback remains available without vibration/audio.
export function pulse(kind: "tap" | "submit" | "success" | "error") {
  if (useParty.getState().settings.haptics === false || !navigator.vibrate)
    return;
  try {
    navigator.vibrate(
      { tap: 8, submit: 18, success: [20, 50, 35], error: [30, 40, 30] }[kind],
    );
  } catch {
    /* Browser capability is optional. */
  }
}
export function ExperienceFeedback() {
  useEffect(() => {
    const tap = (e: MouseEvent) => {
      const target = (e.target as Element).closest(
        "button,a,input[type=checkbox]",
      );
      if (!target || target.matches(":disabled,[aria-disabled=true]")) return;
      unlockAudio();
      pulse("tap");
    };
    document.addEventListener("click", tap, true);
    const unsubscribe = useParty.subscribe((state, prev) => {
      if (state.error && state.error !== prev.error) {
        pulse("error");
        if (state.settings.sound) playSound("incorrect");
      }
      if (
        state.round?.phase !== prev.round?.phase &&
        ["reveal", "complete"].includes(state.round?.phase || "")
      )
        pulse("success");
      const id = state.active;
      if (
        state.round &&
        prev.round &&
        state.round.game === prev.round.game &&
        state.round.number === prev.round.number &&
        state.round.phase === prev.round.phase &&
        ((state.round.answers[id] &&
          state.round.answers[id] !== prev.round.answers[id]) ||
          (state.round.votes[id] &&
            state.round.votes[id] !== prev.round.votes[id]))
      ) {
        pulse("submit");
        if (state.settings.sound) playSound("submit");
      }
    });
    return () => {
      document.removeEventListener("click", tap, true);
      unsubscribe();
    };
  }, []);
  return null;
}
