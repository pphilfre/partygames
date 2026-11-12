import {
  Check,
  Columns2,
  Flag,
  Monitor,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Smartphone,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, Mobile, Standings, TV } from "../components/Gameplay";
import { Button } from "../components/ui";
import { games, type Game } from "../engine";
import { useParty } from "../store";

import { PageTitle, RoundControls } from "../components/Host";
export function Demo() {
  const s = useParty(),
    r = s.round;
  const [preview, setPreview] = useState("split"),
    [count, setCount] = useState(14),
    [override, setOverride] = useState(""),
    [seconds, setSeconds] = useState(8);
  const active = s.players.find((p) => p.id === s.active);
  return (
    <>
      <PageTitle
        eyebrow="NO GUESTS REQUIRED"
        title="Your party playground"
        description="A whole house party, at your fingertips. Every preview shares one live state."
      >
        <Button
          variant="secondary"
          onClick={() => {
            s.init(count);
          }}
        >
          <Plus size={16} />
          Create {count}-player party
        </Button>
      </PageTitle>
      <div className="demo-layout">
        <aside className="demo-controls panel">
          <span className="eyebrow">THE DIRECTOR’S CHAIR</span>
          <label>
            Party size
            <input
              type="number"
              min="4"
              max="24"
              value={count}
              onChange={(e) =>
                setCount(Math.max(4, Math.min(24, Number(e.target.value))))
              }
            />
          </label>
          <label>
            Choose a game
            <select
              aria-label="Choose game"
              value={r?.game || "bluff"}
              onChange={(e) => {
                s.configure({ pack: "all" });
                s.start(e.target.value as Game);
              }}
            >
              {Object.entries(games).map(([id, g]) => (
                <option key={id} value={id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Question pack
            <select
              value={s.settings.pack || "all"}
              onChange={(e) => s.configure({ pack: e.target.value })}
            >
              <option value="all">All enabled questions</option>
              {[
                ...new Set(
                  s.questions
                    .filter((q) => q.game === (r?.game || "bluff"))
                    .map((q) => q.pack),
                ),
              ].map((pack) => (
                <option key={pack}>{pack}</option>
              ))}
            </select>
          </label>
          <Button
            onClick={() => {
              s.start(r?.game || "bluff");
            }}
          >
            <Play size={15} />
            Start game
          </Button>
          <div className="form-grid">
            <label>
              Rounds
              <input
                type="number"
                min="1"
                max="20"
                value={s.settings.rounds}
                onChange={(e) =>
                  s.configure({
                    rounds: Math.max(1, Math.min(20, Number(e.target.value))),
                  })
                }
              />
            </label>
            <label>
              Timer
              <input
                type="number"
                min="10"
                max="120"
                value={s.settings.timer}
                onChange={(e) =>
                  s.configure({
                    timer: Math.max(10, Math.min(120, Number(e.target.value))),
                  })
                }
              />
            </label>
          </div>
          <div className="divider" />
          <label>
            You’re controlling
            <select
              value={s.active}
              onChange={(e) => s.setActive(e.target.value)}
            >
              {s.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name}
                  {p.connected ? "" : " (offline)"}
                </option>
              ))}
            </select>
          </label>
          {r?.game === "who" && (
            <label>
              Secret author
              <select
                value={r.author}
                disabled={r.phase !== "writing"}
                onChange={(e) => s.setAuthor(e.target.value)}
              >
                {s.players.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Override {active?.name}’s{" "}
            {r?.phase === "voting" ? "vote (option or player ID)" : "answer"}
            <input
              value={override}
              onChange={(e) => setOverride(e.target.value)}
              placeholder="Type an answer…"
            />
          </label>
          {r?.phase === "voting" && (
            <small>
              {r.game === "bluff"
                ? r.options.map((o) => `${o.id}: ${o.text}`).join(" · ")
                : s.players.map((p) => `${p.id}: ${p.name}`).join(" · ")}
            </small>
          )}
          <label>
            Response time (seconds)
            <input
              type="number"
              min="0"
              max={s.settings.timer}
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
            />
          </label>
          <Button
            variant="secondary"
            size="sm"
            disabled={!r || !["writing", "voting"].includes(r.phase)}
            onClick={() => s.editSubmission(s.active, override, seconds)}
          >
            Apply override
            <Check size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              active &&
              s.updatePlayer(active.id, { connected: !active.connected })
            }
          >
            <Wifi size={14} />
            {active?.connected ? "Disconnect" : "Reconnect"} player
          </Button>
          <div className="divider" />
          <Button
            variant="secondary"
            size="sm"
            disabled={
              !r || ["reveal", "standings", "complete"].includes(r.phase)
            }
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                const live = useParty.getState();
                if (!live.round || live.round.phase === "reveal") break;
                live.sim();
                live.next();
              }
            }}
          >
            Skip to reveal
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!r}
            onClick={() => s.restart()}
          >
            <RotateCcw size={14} />
            Restart round
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!r}
            onClick={() => s.restart(true)}
          >
            Restart game
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!r || ["standings", "complete"].includes(r.phase)}
            onClick={s.skipQuestion}
          >
            Skip question
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!r}
            onClick={s.finish}
          >
            <Flag size={14} />
            Complete game & podium
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Reset all championship scores and rounds?"))
                s.reset();
            }}
          >
            Reset championship
          </Button>
          <p className="input-note">
            Deterministic simulation. Scores come from real answers and votes.
            No backend. No browser-tab circus.
          </p>
        </aside>
        <div className="demo-stage">
          <div className="preview-tabs" role="group" aria-label="Preview mode">
            {[
              ["tv", "TV", Monitor],
              ["mobile", "Mobile", Smartphone],
              ["split", "Split", Columns2],
              ["host", "Host", SlidersHorizontal],
            ].map(([id, label, Icon]) => (
              <button
                key={id as string}
                className={preview === id ? "active" : ""}
                onClick={() => setPreview(id as string)}
              >
                {typeof Icon !== "string" && <Icon size={15} />}{" "}
                {label as string}
              </button>
            ))}
            <span>
              <span className="live-dot" /> LIVE PREVIEW
            </span>
          </div>
          <RoundControls />
          {preview === "host" ? (
            <div className="host-preview">
              <h2>You’re running the show.</h2>
              <p>Review and manage every submission below.</p>
              <SubmissionReview />
              <Standings compact />
            </div>
          ) : (
            <div className={`preview-content preview-${preview}`}>
              {preview !== "mobile" && <TV embedded />}
              {preview !== "tv" && <Mobile framed />}
            </div>
          )}
          <div className="demo-hint">
            <span>✦</span>
            <p>
              <b>Take it for a spin.</b> Start a game, advance past the
              instructions, then simulate answers. Play as anyone on the phone.
              Reveal, award points, repeat.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SubmissionReview() {
  const s = useParty(),
    r = s.round;
  if (!r) return <p>Choose a game to review submissions.</p>;
  return (
    <div className="submission-list">
      {s.players.map((p) => {
        const answer = r.answers[p.id],
          vote = r.votes[p.id];
        return (
          <div key={p.id}>
            <Avatar p={p} small />
            <b>{p.name}</b>
            <span>{answer?.value || vote?.value || "Waiting…"}</span>
            {answer && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${p.name}'s submission`}
                disabled={!["writing", "voting"].includes(r.phase)}
                onClick={() => {
                  const answers = { ...r.answers };
                  delete answers[p.id];
                  useParty.setState({ round: { ...r, answers } });
                }}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
