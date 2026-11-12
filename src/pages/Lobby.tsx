import { Check, Play, Plus, Trash2, Users, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Gameplay";
import { Button } from "../components/ui";
import { useParty } from "../store";

import { PageTitle } from "../components/Host";
export function Lobby() {
  const s = useParty();
  return (
    <>
      <PageTitle
        title="The party’s all here"
        description="Room FRDY · Your local party roster. Make yourself at home."
      >
        <Button asChild>
          <Link to="/demo">
            <Play size={16} />
            Choose a game
          </Link>
        </Button>
      </PageTitle>
      <div className="lobby-header">
        <div>
          <span className="eyebrow">YOUR ROOM CODE</span>
          <h2>FRDY</h2>
          <p>
            Open /play on this device to participate.
            <br />
            This prototype simulates your whole party locally.
          </p>
        </div>
        <div className="join-block">
          <Users size={36} />
          <strong>
            {s.players.filter((p) => p.connected).length} / {s.players.length}
          </strong>
          <span>ready for a good time</span>
        </div>
      </div>
      <div className="roster-grid">
        {s.players.map((p) => (
          <div className="roster-card panel" key={p.id}>
            <Avatar p={p} />
            <input
              aria-label={`Rename ${p.name}`}
              value={p.name}
              maxLength={24}
              onChange={(e) => s.updatePlayer(p.id, { name: e.target.value })}
            />
            <span className={p.connected ? "success-text" : "muted"}>
              {p.connected ? "● Connected" : "○ Disconnected"}
            </span>
            <div className="player-scores">
              <span>BB {p.games.bluff}</span>
              <span>GW {p.games.who}</span>
              <span>BP {p.games.ballpark}</span>
            </div>
            <div className="button-row">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  s.setActive(p.id);
                }}
              >
                {s.active === p.id ? <Check size={14} /> : null}
                {s.active === p.id ? "Selected" : "Control"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Toggle ${p.name} connection`}
                onClick={() =>
                  s.updatePlayer(p.id, { connected: !p.connected })
                }
              >
                <Wifi size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${p.name}`}
                onClick={() => {
                  if (confirm(`Remove ${p.name} from the party?`))
                    s.removePlayer(p.id);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="button-row section">
        <Button
          variant="secondary"
          onClick={() => {
            const id = `p${Date.now()}`;
            useParty.setState({
              players: [
                ...s.players,
                {
                  id,
                  name: "New guest",
                  avatar: "🎉",
                  color: "#e5edc9",
                  connected: true,
                  score: 0,
                  previous: s.players.length + 1,
                  games: { bluff: 0, who: 0, ballpark: 0 },
                  played: { bluff: 0, who: 0, ballpark: 0 },
                },
              ],
            });
          }}
        >
          <Plus size={16} />
          Add guest
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("Reset all player scores?")) s.reset();
          }}
        >
          Reset scores
        </Button>
      </div>
    </>
  );
}
