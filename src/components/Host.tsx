import { ArrowRight, Pause, Play, SkipForward, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { games, type Game } from "../engine";
import { useParty } from "../store";
import { GameArt } from "./Art";
import { Button } from "./ui";
export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow muted">{eyebrow}</span>}
        <h1>
          {title}
          <span className="coral-period">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}

export function GameCards() {
  const s = useParty();
  return (
    <div className="game-grid">
      {(Object.keys(games) as Game[]).map((id, i) => (
        <article className="game-card" key={id}>
          <div className="game-cover" style={{ background: games[id].color }}>
            <span className="game-type">
              {["DECEPTION", "SOCIAL DEDUCTION", "ESTIMATION"][i]}
            </span>
            <span className="game-number">0{i + 1}</span>
            <GameArt game={id} />
            <span className="cover-sticker">
              {["TRUST NO ONE", "WHO, ME?", "TAKE A GUESS"][i]}
            </span>
          </div>
          <div className="game-card-body">
            <h3>
              {games[id].name}
              <span>{games[id].symbol}</span>
            </h3>
            <p>{games[id].description}</p>
            <div className="game-card-meta">
              <span>
                <Users size={13} />
                4–24 players
              </span>
              <span>◷ 10–15 min</span>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/demo" onClick={() => s.start(id)}>
                Play {games[id].name}
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RoundControls() {
  const s = useParty(),
    r = s.round;
  return (
    <div className="round-controls">
      <div className="control-status">
        <span className="live-dot" />
        <strong>
          {r
            ? `${games[r.game].name} · Round ${r.number}`
            : "Ready when you are"}
        </strong>
        <span>{r?.phase || "No active game"}</span>
      </div>
      <div className="button-row">
        <Button variant="secondary" size="sm" disabled={!r} onClick={s.pause}>
          {r?.paused ? <Play size={14} /> : <Pause size={14} />}{" "}
          {r?.paused ? "Resume" : "Pause"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!r || !["writing", "voting"].includes(r.phase)}
          onClick={s.sim}
        >
          <Users size={14} />
          Simulate {r?.phase === "voting" ? "votes" : "answers"}
        </Button>
        <Button
          size="sm"
          disabled={!r || r.phase === "complete"}
          onClick={s.next}
        >
          <SkipForward size={14} />
          {r?.phase === "reveal"
            ? "Award points"
            : r?.phase === "standings"
              ? "Next round"
              : r?.phase === "voting"
                ? "Reveal answers"
                : "Advance phase"}
        </Button>
      </div>
    </div>
  );
}
