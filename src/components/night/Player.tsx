import {
  Check,
  CheckCircle2,
  Eye,
  HelpCircle,
  LockKeyhole,
  Pencil,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { games } from "../../engine";
import {
  fmt,
  gameCopy,
  playerProjection,
  type Night,
} from "../../session/model";
import { useNight } from "../../session/store";
import { useParty } from "../../store";
import { Action, Notice, Sheet, Sticker } from "./common";
import { Timer } from "./Stage";

export function Player({ night }: { night: Night }) {
  const demo = useNight((s) => s.demo),
    drafts = useNight((s) => s.drafts),
    draft = useNight((s) => s.draft),
    send = useNight((s) => s.send);
  const p = playerProjection(night, demo.preview);
  const [selected, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [help, setHelp] = useState(false),
    [editing, setEditing] = useState(false);
  useEffect(() => {
    setSelected("");
    setSearch("");
    setEditing(false);
  }, [p?.id, p?.phase, demo.preview]);
  const controlled = demo.preview === demo.controlled;
  if (!p)
    return (
      <section className="n-player">
        <p>Choose a player to preview.</p>
      </section>
    );
  const key = `${p.id}-${demo.preview}`,
    value = drafts[key] ?? "";
  const connected = !demo.disconnected.includes(p.player.id);
  const pending = p.phase === "writing" || p.phase === "voting";
  const act = controlled && p.canAct && connected;
  const entry = p.phase === "voting" ? p.accepted : p.ownAnswer;
  const canUpdate = p.game === "ballpark" && p.phase === "writing";
  const input =
    p.phase === "writing" && p.writer && (!entry || (canUpdate && editing));
  const choose = p.phase === "voting" && !p.writer && !entry;
  const result = night.round?.points[p.player.id] || 0;
  const accepted = (choice: string) => {
    if (send(choice)) {
      setSelected("");
      setEditing(false);
    }
  };
  return (
    <section
      className={`n-player game-${p.game} n-player-phase-${p.phase}`}
      aria-label={`${p.player.name}’s player controller`}
    >
      <span
        className="n-phase-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {p.paused
          ? "Paused by host."
          : p.phase === "writing"
            ? p.writer
              ? p.game === "ballpark"
                ? "Give your estimate."
                : p.game === "bluff"
                  ? "Write a believable bluff."
                  : "Write your answer."
              : "An answer is being written. Your guess comes next."
            : p.phase === "voting"
              ? p.writer
                ? "Your answer is in. Wait for the room to guess."
                : p.game === "who"
                  ? "Choose who wrote the answer, then lock your guess."
                  : "Choose the real answer, then lock your choice."
              : p.released
                ? "The result is ready."
                : p.phase === "reveal"
                  ? "The reveal is playing."
                  : "Get ready for the next round."}
      </span>
      <header className="n-player-header">
        <Sticker player={p.player} size={54} />
        <div>
          <b>{p.player.name}</b>
          {p.practice && <span>Practice</span>}
        </div>
        <button
          className="n-icon-button"
          aria-label="Game help and preferences"
          onClick={() => setHelp(true)}
        >
          <HelpCircle size={21} />
        </button>
      </header>
      <div className="n-player-context">
        <span>
          {games[p.game].name}{" "}
          {p.practice
            ? "practice"
            : `${p.number}/${night.itinerary[night.segment].rounds}`}
        </span>
        {pending && (
          <Timer
            remaining={p.remaining}
            paused={p.paused}
            comfortable={p.comfortable}
          />
        )}
      </div>
      {!controlled && (
        <Notice>
          <Eye size={16} />
          You’re previewing a demo player. Use “Take control” in the demo
          toolbar to play as them.
        </Notice>
      )}
      {!connected && (
        <Notice error>
          Simulated disconnect. Your accepted answer is safe. Reconnect in Demo
          tools to continue.
        </Notice>
      )}
      {p.paused && <Notice>Paused</Notice>}
      <div className="n-player-body">
        {p.phase === "countdown" ? (
          <div className="n-player-wait">
            <Sticker player={p.player} size={128} />
            <h2>{p.practice ? "Practice" : "Ready"}</h2>
          </div>
        ) : ["reveal", "standings", "complete"].includes(p.phase) ? (
          <>
            {p.phase === "reveal" &&
            (!p.released ||
              (p.game === "ballpark" && !night.round?.ballparkPresented)) ? (
              <div className="n-player-wait">
                <LockKeyhole size={36} />
                <h2>Locked in</h2>

                {p.ownAnswer && (
                  <span className="n-your-entry">
                    Your answer: {p.ownAnswer.value}
                  </span>
                )}
                {p.ownVote && (
                  <span className="n-your-entry">Your choice: {p.ownVote}</span>
                )}
              </div>
            ) : (
              <div className="n-personal-result">
                <div className="n-result-avatar">
                  <Sticker player={p.player} size={106} />
                  <CheckCircle2 size={25} />
                </div>
                <h2>
                  {p.game === "ballpark"
                    ? p.ownAnswer
                      ? `${fmt(Math.abs(Number(p.ownAnswer.value) - Number(night.round!.question.answer)))} ${night.round!.question.unit || ""} away.`
                      : "No estimate this round."
                    : p.writer
                      ? p.game === "bluff"
                        ? `${Object.values(night.round!.votes).filter((v) => v.value === p.player.id).length} people picked your bluff.`
                        : `You fooled ${Object.values(night.round!.votes).filter((v) => v.value !== p.player.id).length} guessers.`
                      : p.ownVote
                        ? result > 0
                          ? "Correct!"
                          : "Incorrect"
                        : "No guess this round."}
                </h2>
                <div className="n-round-points">
                  <strong>+{fmt(result)}</strong>
                  <span>
                    {p.practice || p.replay
                      ? "practice points · not awarded"
                      : "round points"}
                  </span>
                </div>
                {p.result && (
                  <>
                    <dl className="n-breakdown">
                      {(
                        [
                          ["Accuracy", p.result.accuracy],
                          ["Correct guess", p.result.correct],
                          ["Closest bonus", p.result.closest],
                          ["People fooled", p.result.deception],
                          ["Speed bonus", p.result.speed],
                          ["Streak bonus", p.result.streak],
                        ] as [string, number][]
                      )
                        .filter(([, v]) => v > 0)
                        .map(([label, v]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>+{fmt(v)}</dd>
                          </div>
                        ))}
                    </dl>
                    <div className="n-championship-change">
                      <span>
                        Championship score<b>{fmt(p.result.after)}</b>
                      </span>
                      <strong>
                        {p.result.after - p.result.before > 0 ? "+" : ""}
                        {fmt(p.result.after - p.result.before)}
                        <small>this round</small>
                      </strong>
                    </div>
                  </>
                )}
                {(p.practice || p.replay) && (
                  <Notice>
                    {p.practice ? "Practice complete." : "Unscored replay."}{" "}
                    Your scores and streaks haven’t changed.
                  </Notice>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {(!entry || (canUpdate && editing)) && (
              <div className="n-private-task">
                <h2>{p.prompt}</h2>
                <p
                  className="n-role-instruction"
                  hidden={p.phase === "writing" && p.writer}
                >
                  {p.phase === "voting"
                    ? p.writer
                      ? "Your answer is in."
                      : p.game === "who"
                        ? "Who wrote this?"
                        : "Find the real answer."
                    : p.game === "ballpark"
                      ? "Give your estimate."
                      : p.writer
                        ? p.game === "bluff"
                          ? "You’re writing a bluff."
                          : "Write your answer."
                        : "Wait for the bluffs"}
                </p>
              </div>
            )}
            {p.phase === "voting" && p.game === "who" && (
              <blockquote className="n-phone-quote">“{p.quote}”</blockquote>
            )}
            {input && (
              <form
                className="n-answer-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  accepted(value);
                }}
              >
                {p.game === "ballpark" ? (
                  <label>
                    Your estimate
                    <div className="n-number-input">
                      <input
                        autoComplete="off"
                        name="estimate"
                        inputMode="decimal"
                        value={value}
                        disabled={!act}
                        placeholder="Your best guess"
                        onChange={(e) => draft(e.target.value)}
                      />
                      <span>{p.unit}</span>
                    </div>
                  </label>
                ) : (
                  <label>
                    {p.game === "bluff" ? "Your bluff" : "Your answer"}
                    <textarea
                      name="answer"
                      placeholder={
                        p.game === "bluff"
                          ? "A very convincing answer…"
                          : "Something only you would say…"
                      }
                      maxLength={100}
                      value={value}
                      disabled={!act}
                      onChange={(e) => draft(e.target.value)}
                    />
                    <span className="n-character-count">
                      {value.length}/100
                    </span>
                  </label>
                )}
                <Action type="submit" disabled={!act || !value.trim()}>
                  {p.game === "ballpark"
                    ? entry
                      ? "Update estimate"
                      : "Lock estimate"
                    : p.game === "bluff"
                      ? "Send bluff"
                      : "Send answer"}
                  <LockKeyhole size={17} />
                </Action>
              </form>
            )}
            {choose && (
              <div className="n-vote-form">
                {p.game === "who" && p.candidates.length > 12 && (
                  <label className="n-player-search">
                    <Search size={17} />
                    <input
                      aria-label="Find a player"
                      placeholder="Find a player"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                )}
                <div
                  className={
                    p.game === "who" ? "n-candidate-grid" : "n-phone-choices"
                  }
                  role="radiogroup"
                  aria-label={
                    p.game === "who" ? "Choose the author" : "Choose the truth"
                  }
                >
                  {(p.game === "who"
                    ? p.candidates
                        .filter((c) =>
                          c.name.toLowerCase().includes(search.toLowerCase()),
                        )
                        .map((c) => ({ key: c.id, text: c.name, player: c }))
                    : p.choices
                  ).map((c, i) => (
                    <button
                      key={c.key}
                      role="radio"
                      aria-checked={selected === c.key}
                      className={selected === c.key ? "selected" : ""}
                      disabled={!act}
                      onClick={() => setSelected(c.key)}
                      onKeyDown={(e) => {
                        if (
                          [
                            "ArrowDown",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowLeft",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                          const nodes = Array.from(
                            e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
                              "[role=radio]",
                            ),
                          );
                          const next =
                            (i +
                              (e.key === "ArrowDown" || e.key === "ArrowRight"
                                ? 1
                                : -1) +
                              nodes.length) %
                            nodes.length;
                          nodes[next].focus();
                          nodes[next].click();
                        }
                      }}
                    >
                      {"player" in c ? (
                        <Sticker player={c.player as never} size={44} />
                      ) : (
                        <span className="n-answer-letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                      )}
                      <b>{c.text}</b>
                      {selected === c.key && <Check size={17} />}
                    </button>
                  ))}
                </div>
                {p.game === "who" &&
                  search &&
                  !p.candidates.some((c) =>
                    c.name.toLowerCase().includes(search.toLowerCase()),
                  ) && <p>No names match. Try another name.</p>}
                <Action
                  disabled={!act || !selected}
                  onClick={() => accepted(selected)}
                >
                  {p.game === "who" ? "Lock guess" : "Lock choice"}
                  <LockKeyhole size={17} />
                </Action>
              </div>
            )}
            {entry && pending && !(canUpdate && editing) && (
              <div className="n-accepted" role="status">
                <CheckCircle2 size={36} />
                <h3>{canUpdate ? "Estimate saved." : "Answer locked."}</h3>
                <p>{p.phase === "voting" ? p.ownVote : entry.value}</p>
                {canUpdate && (
                  <Action
                    secondary
                    disabled={!act}
                    onClick={() => {
                      draft(entry.value);
                      setEditing(true);
                    }}
                  >
                    <Pencil size={16} />
                    Update estimate
                  </Action>
                )}
              </div>
            )}
            {pending && !input && !choose && !entry && (
              <div className="n-player-wait">
                <GameWaitIcon />
                <h3>
                  {p.phase === "voting"
                    ? "Waiting for guesses"
                    : "Waiting for bluffs"}
                </h3>
              </div>
            )}
            {p.remaining === 0 && pending && <Notice>Time’s up</Notice>}
          </>
        )}
      </div>
      <Sheet
        open={help}
        onOpenChange={setHelp}
        title={`How to play ${games[p.game].name}`}
        description={gameCopy[p.game].rule}
      >
        <PlayerPreferences />
        <p className="n-field-help">
          Local demo. Other players are simulated. No other devices can join.
        </p>
      </Sheet>
    </section>
  );
}
function GameWaitIcon() {
  return (
    <span className="n-wait-icon">
      <Eye size={30} />
    </span>
  );
}
function PlayerPreferences() {
  const settings = useParty((s) => s.settings),
    configure = useParty((s) => s.configure);
  return (
    <div className="n-preference-list">
      {(["sound", "haptics", "reduced"] as const).map((key) => (
        <label className="n-toggle" key={key}>
          <span>
            {key === "sound"
              ? "Music & sound"
              : key === "haptics"
                ? "Haptic feedback"
                : "Reduced motion"}
          </span>
          <input
            type="checkbox"
            checked={settings[key] ?? true}
            onChange={(e) => configure({ [key]: e.target.checked })}
          />
        </label>
      ))}
    </div>
  );
}
