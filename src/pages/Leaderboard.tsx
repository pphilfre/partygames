import { Trophy } from "lucide-react";
import { useState } from "react";
import { Standings } from "../components/Gameplay";
import { Button } from "../components/ui";
import { games, type Game } from "../engine";

import { PageTitle } from "../components/Host";
export function Leaderboard() {
  const [scope, setScope] = useState<Game | undefined>(),
    [podium, setPodium] = useState(false);
  return (
    <>
      <PageTitle
        title="The bragging rights board"
        description="A little rivalry looks good on everyone. May the best party person win."
      >
        <Button variant="secondary" onClick={() => setPodium(!podium)}>
          <Trophy size={16} />
          {podium ? "Full standings" : "Podium ceremony"}
        </Button>
      </PageTitle>
      <div className="filter-tabs">
        <button
          className={!scope ? "active" : ""}
          onClick={() => setScope(undefined)}
        >
          Championship
        </button>
        {Object.entries(games).map(([id, g]) => (
          <button
            className={scope === id ? "active" : ""}
            key={id}
            onClick={() => setScope(id as Game)}
          >
            {g.name}
          </button>
        ))}
      </div>
      <section className="panel leaderboard-panel">
        <Standings podium={podium} game={scope} />
      </section>
      <div className="score-explainer panel">
        <h3>Fair games. Clear scores.</h3>
        <p>
          Championship points = the sum of your average performance in each
          game, capped at 1,000 per game. Baselines: Bluff Battle 500, Guess Who
          500, Ballpark 1,000. Tied scores share a rank. Each round counts once;
          replaying a reveal never awards twice.
        </p>
        <p>
          Guess Who: 300 correct + speed bonus (≤5s: 200, ≤10s: 150, ≤20s: 75).
          Author: up to 500 based on the proportion fooled. Ballpark: 900 ×
          max(0, 1 − absolute error ÷ tolerance), plus 100 for closest (ties
          share the bonus).
        </p>
      </div>
    </>
  );
}
