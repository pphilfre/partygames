import {
  CheckCircle2,
  ChevronDown,
  Pause,
  Play,
  Plus,
  SkipForward,
} from "lucide-react";
import { useState } from "react";
import { completion, type Night } from "../../session/model";
import { useNight } from "../../session/store";
import { Action, Confirm, Notice } from "./common";

export function nextLabel(n: Night) {
  const r = n.round;
  if (n.status === "lobby") return "Start night";
  if (n.status === "intro" || n.status === "transition")
    return "Start practice";
  if (!r) return "Continue";
  if (r.phase === "countdown") return "Starting…";
  if (r.phase === "writing")
    return r.game === "ballpark"
      ? "Reveal estimates"
      : r.game === "bluff"
        ? "Start voting"
        : "Start guessing";
  if (r.phase === "voting")
    return r.game === "bluff" ? "Reveal answer" : "Reveal author";
  if (r.phase === "reveal")
    return r.revealReady ? "Show standings" : "Show result now";
  if (r.phase === "standings")
    return r.practice
      ? "Start scored rounds"
      : r.replay
        ? "Return to standings"
        : n.roundNumber < n.itinerary[n.segment].rounds
          ? "Next round"
          : n.segment < n.itinerary.length - 1
            ? "Next game"
            : "Tonight’s finale";
  return "Continue";
}
export function HostBar({
  night,
  expanded = false,
}: {
  night: Night;
  expanded?: boolean;
}) {
  const next = useNight((s) => s.next),
    pause = useNight((s) => s.pause),
    add = useNight((s) => s.addTime),
    skip = useNight((s) => s.skip),
    fallback = useNight((s) => s.fallback);
  const [skipOpen, setSkipOpen] = useState(false),
    [fallbackOpen, setFallbackOpen] = useState(false);
  const r = night.round;
  if (!r) return null;
  const c = completion(r),
    input = ["writing", "voting"].includes(r.phase);
  const missingRequired =
    r.phase === "writing" && r.game !== "ballpark" && c.received < c.required;
  const noEstimates =
    r.phase === "writing" && r.game === "ballpark" && !c.received;
  const label = nextLabel(night);
  const status = night.paused
    ? "Paused"
    : r.phase === "countdown"
      ? "Get ready"
      : r.phase === "reveal"
        ? r.revealReady
          ? "Result ready"
          : "Revealing…"
        : r.phase === "standings"
          ? r.practice
            ? "Practice complete"
            : "Scores saved"
          : `${c.received} of ${c.required} ${r.phase === "voting" ? "choices" : r.game === "bluff" ? "bluffs" : "answers"} in.`;
  return (
    <div
      className={`n-host-controller ${expanded ? "n-host-expanded" : ""}`}
      aria-label="Host controls"
    >
      <div className="n-host-status">
        <span
          className={`n-host-status-icon ${c.received === c.required && input ? "ready" : ""}`}
        >
          {c.received === c.required && input ? (
            <CheckCircle2 size={23} />
          ) : (
            <span className="n-host-dot" />
          )}
        </span>
        <div>
          <b>{status}</b>
        </div>
      </div>
      <div className="n-host-actions">
        {input && night.vibe !== "comfortable" && (
          <Action secondary onClick={add}>
            <Plus size={17} />
            10 seconds
          </Action>
        )}
        <Action secondary onClick={pause}>
          {night.paused ? <Play size={17} /> : <Pause size={17} />}
          <span>{night.paused ? "Resume" : "Pause"}</span>
        </Action>
        <Action
          disabled={
            night.paused ||
            missingRequired ||
            noEstimates ||
            r.phase === "countdown"
          }
          onClick={next}
        >
          {label}
          {r.phase === "reveal" && !r.revealReady ? (
            <SkipForward size={17} />
          ) : (
            <Play size={17} />
          )}
        </Action>
      </div>
      {(expanded || missingRequired) && (
        <details className="n-details n-round-actions">
          <summary>
            More round actions
            <ChevronDown size={17} />
          </summary>
          <div className="n-inline-actions">
            <Action
              secondary
              disabled={r.awarded || night.paused}
              onClick={() => setSkipOpen(true)}
            >
              Choose another prompt
            </Action>
            {missingRequired && (
              <Action
                secondary
                disabled={night.paused}
                onClick={() => setFallbackOpen(true)}
              >
                Supply missing answer
              </Action>
            )}
          </div>
          <p>
            Replacing a prompt discards this round’s answers. A supplied
            fallback earns no author points.
          </p>
        </details>
      )}
      <Confirm
        open={skipOpen}
        onOpenChange={setSkipOpen}
        title="Choose another prompt?"
        description="Accepted answers and votes in this unscored attempt will be discarded. No points or streaks change."
        label="Replace prompt"
        onConfirm={skip}
      />
      <Confirm
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
        title="Supply a fallback answer?"
        description="Missing required writers receive clearly marked demo answers. Those writers earn no author points this round. Existing answers stay accepted."
        label="Supply fallback"
        onConfirm={fallback}
      />
    </div>
  );
}
export function HostRoom({ night }: { night: Night }) {
  const d = useNight((s) => s.demo),
    setDemo = useNight((s) => s.setDemo),
    r = night.round;
  if (!r) return null;
  const c = completion(r);
  return (
    <aside className="n-host-room">
      <h2>The room</h2>
      <p>
        {c.received} / {c.required} responses
      </p>

      <label className="n-toggle">
        <span>
          Show spoilers
          <small>You can no longer fairly play this question.</small>
        </span>
        <input
          type="checkbox"
          checked={d.spoilers}
          onChange={(e) => setDemo({ spoilers: e.target.checked })}
        />
      </label>
      {d.spoilers && (
        <div className="n-spoilers">
          <b>Moderation view · spoilers on</b>
          <p>
            {r.game === "who"
              ? `Author: ${night.players.find((p) => p.id === r.author)?.name}`
              : `Answer: ${r.question.answer}`}
          </p>
          {Object.entries(r.answers).map(([id, a]) => (
            <p key={id}>
              <strong>{night.players.find((p) => p.id === id)?.name}: </strong>
              {a.value}
              {r.fallbacks.includes(id) ? " (fallback)" : ""}
            </p>
          ))}
        </div>
      )}
      <div className="n-room-roster">
        {night.players.map((p) => (
          <div key={p.id}>
            <span>{p.name}</span>
            <small>
              {d.disconnected.includes(p.id)
                ? "Demo disconnected"
                : !p.connected
                  ? "Leaves next round"
                  : p.id === d.controlled
                    ? "You"
                    : "Demo player"}
            </small>
          </div>
        ))}
      </div>
    </aside>
  );
}
