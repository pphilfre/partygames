import { Download, FlaskConical, RefreshCw } from "lucide-react";
import { useState } from "react";
import { completion, type Night } from "../session/model";
import { useNight } from "../session/store";
import { Action, Confirm, Notice, Sheet } from "../components/night/common";

const scenarios = [
  "First night",
  "Quick tour",
  "Write a bluff",
  "Be the secret author",
  "Big party",
  "Close finish",
  "Waiting on one player",
  "Player returns",
  "Comfortable mode",
];
export function DemoTools({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const s = useNight(),
    n = s.night,
    r = n?.round;
  const [scenario, setScenario] = useState(""),
    [reset, setReset] = useState(false),
    [voiding, setVoiding] = useState(false),
    [target, setTarget] = useState("p0"),
    [value, setValue] = useState("");
  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title="Demo tools"
        description="Synthetic scenarios and deliberate overrides. These controls are outside the game."
        wide
      >
        <div className="n-tools-grid">
          <section>
            <h3>Try a different moment.</h3>
            <div className="n-scenario-grid">
              {scenarios.map((name) => (
                <button key={name} onClick={() => setScenario(name)}>
                  <FlaskConical size={17} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
            <p className="n-field-help">
              Each scenario replaces the current night with a labelled synthetic
              setup. Results use the real scoring functions.
            </p>
            <label>
              Deterministic seed
              <input
                type="number"
                min={0}
                max={1000000}
                value={s.demo.seed}
                onChange={(e) =>
                  s.setDemo({
                    seed: Math.max(
                      0,
                      Math.min(1000000, Number(e.target.value) || 0),
                    ),
                  })
                }
              />
            </label>
            <p className="n-field-help">
              The seed applies to the next attempt or scenario. It determines
              role tie-breaking, option order, response timing, and demo
              answers.
            </p>
            <label className="n-toggle">
              <span>
                Auto-play other players
                <small>
                  The manually controlled player is always excluded.
                </small>
              </span>
              <input
                type="checkbox"
                checked={s.demo.auto}
                onChange={(e) => s.setDemo({ auto: e.target.checked })}
              />
            </label>
            <Action secondary disabled={!r || n?.paused} onClick={s.fill}>
              Fill other players’ responses
            </Action>
            {r?.phase === "writing" && r.game === "ballpark" && (
              <details className="n-details">
                <summary>Numeric edge cases</summary>
                <div className="n-inline-actions">
                  <Action
                    secondary
                    disabled={n?.paused}
                    onClick={() => {
                      r.participants
                        .slice(0, 2)
                        .forEach((id) => s.override(id, r.question.answer));
                    }}
                  >
                    Make two tied closest guesses
                  </Action>
                  <Action
                    secondary
                    disabled={n?.paused}
                    onClick={() => s.override(target, "1000000000")}
                  >
                    Give selected player an extreme estimate
                  </Action>
                </div>
                <p>
                  These deliberately replace the selected accepted inputs.
                  Normal auto-play never overwrites your answer.
                </p>
              </details>
            )}
            {r?.phase === "writing" && r.game !== "ballpark" && (
              <Action
                secondary
                disabled={n?.paused}
                onClick={() =>
                  s.override(
                    r.game === "who" ? r.author : r.bluffers[0],
                    "A surprisingly long answer to check how this looks on a small screen. "
                      .repeat(7)
                      .slice(0, 500),
                  )
                }
              >
                Try a 500-character legacy answer
              </Action>
            )}
          </section>
          <section>
            <h3>Inspect & recover.</h3>
            {n && (
              <>
                <label>
                  Participant
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  >
                    {n.players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="n-inline-actions">
                  <Action
                    secondary
                    onClick={() => s.setDemo({ preview: target })}
                  >
                    Preview player
                  </Action>
                  <Action secondary onClick={() => s.disconnect(target)}>
                    {s.demo.disconnected.includes(target)
                      ? "Reconnect demo player"
                      : "Simulate disconnect"}
                  </Action>
                </div>
                {r && ["writing", "voting"].includes(r.phase) && (
                  <>
                    <label>
                      Override response
                      {r.phase === "voting" && r.game === "bluff" ? (
                        <select
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        >
                          <option value="">Choose an option</option>
                          {r.options.map((o, i) => (
                            <option key={o.id} value={o.id}>
                              {String.fromCharCode(65 + i)}: {o.text}
                            </option>
                          ))}
                        </select>
                      ) : r.phase === "voting" ? (
                        <select
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        >
                          <option value="">Choose a participant</option>
                          {n.players
                            .filter((p) => r.participants.includes(p.id))
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder={
                            r.game === "ballpark"
                              ? "Try 88, -273.15 or 1000000"
                              : "Try a believable answer"
                          }
                        />
                      )}
                    </label>
                    <Action
                      secondary
                      disabled={!value.trim() || n.paused}
                      onClick={() => s.override(target, value)}
                    >
                      Apply response override
                    </Action>
                    {r.game === "who" && r.phase === "writing" && (
                      <Action
                        secondary
                        onClick={() => {
                          if (r.answers[r.author]) return;
                          useNight.setState({
                            night: { ...n, round: { ...r, author: target } },
                          });
                        }}
                        disabled={!!r.answers[r.author]}
                      >
                        Make selected player the author
                      </Action>
                    )}
                    <p className="n-field-help">
                      Overrides validate through the same engine. Accepted round
                      results cannot be edited here.
                    </p>
                  </>
                )}
                {r?.awarded && !r.practice && !r.replay && (
                  <div className="n-tool-replay">
                    <Action
                      secondary
                      onClick={() => {
                        s.replay();
                        onOpenChange(false);
                      }}
                    >
                      <RefreshCw size={16} />
                      Replay round, unscored
                    </Action>
                    <Action secondary onClick={() => setVoiding(true)}>
                      Void result & replace attempt
                    </Action>
                  </div>
                )}
                <details className="n-details">
                  <summary>Attempt and score ledger</summary>
                  <p>
                    {n.ledger.filter((l) => !l.voided).length} scored attempts.{" "}
                    {n.ledger.filter((l) => l.voided).length} voided. Rule
                    version: baseline-1.
                  </p>
                  <p>
                    Scenario: {s.demo.scenario}. Practice and unscored replays
                    never enter the ledger.
                  </p>
                  {r && (
                    <p>
                      Current attempt: {r.id}.{" "}
                      {r.awarded ? "Result committed." : "Not scored yet."}{" "}
                      {completion(r).received} responses received.
                    </p>
                  )}
                </details>
                <Action secondary onClick={() => setScenario(s.demo.scenario)}>
                  <RefreshCw size={16} />
                  Restart this scenario
                </Action>
                <Action
                  secondary
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob(
                        [
                          JSON.stringify(
                            {
                              version: 2,
                              exportedAt: new Date().toISOString(),
                              night: n,
                            },
                            null,
                            2,
                          ),
                        ],
                        { type: "application/json" },
                      ),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "afterparty-night.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={16} />
                  Export night & results
                </Action>
              </>
            )}
            <div className="n-danger-zone">
              <h3>Reset this demo.</h3>
              <p>
                Clears the cast, session, score ledger, and role history. Custom
                questions and preferences stay saved.
              </p>
              <Action secondary onClick={() => setReset(true)}>
                Reset demo data
              </Action>
            </div>
          </section>
        </div>
      </Sheet>
      <Confirm
        open={!!scenario}
        onOpenChange={(v) => {
          if (!v) setScenario("");
        }}
        title={`Load “${scenario}”?`}
        description="This replaces your current demo night and its scores. Custom questions and preferences stay saved."
        label="Load scenario"
        onConfirm={() => {
          s.scenario(scenario);
          setScenario("");
          onOpenChange(false);
        }}
      />
      <Confirm
        open={reset}
        onOpenChange={setReset}
        title="Reset demo data?"
        description="This clears the current night, cast, results, and demo history. Your question library and personal preferences remain."
        label="Reset demo data"
        onConfirm={() => {
          s.reset();
          onOpenChange(false);
        }}
      />
      <Confirm
        open={voiding}
        onOpenChange={setVoiding}
        title="Void this result and try again?"
        description="The latest round’s points and streak changes will be reversed. The old result stays in the ledger as voided. A replacement attempt can score once."
        label="Void & replace"
        onConfirm={() => {
          s.voidResult();
          onOpenChange(false);
        }}
      />
    </>
  );
}
