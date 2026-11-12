import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FlaskConical,
  Plus,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, Standings } from "../components/Gameplay";
import { Button } from "../components/ui";
import { games } from "../engine";
import { useParty } from "../store";

import {
  PartyHero,
  PartyJourney,
  SessionStrip,
  Mascot,
} from "../components/Experience";
import { GameCards, PageTitle } from "../components/Host";
export function Dashboard() {
  const s = useParty();
  return (
    <>
      <PageTitle
        eyebrow="LET’S MAKE A NIGHT OF IT"
        title="Hey, party starter"
        description="You bring the people. We’ll bring the friendly competition."
      >
        <Button variant="secondary" asChild>
          <Link to="/demo">
            <FlaskConical size={16} />
            Try demo
          </Link>
        </Button>
        <Button asChild>
          <Link to="/lobby">
            <Plus size={16} />
            Host a party
          </Link>
        </Button>
      </PageTitle>
      <PartyHero />
      <SessionStrip />
      <PartyJourney />
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>
              Pick your kind of chaos<span>✱</span>
            </h2>
            <p>Easy to learn. Hard to stop playing.</p>
          </div>
          <Link to="/dashboard/games">
            Explore all games
            <ArrowRight size={15} />
          </Link>
        </div>
        <GameCards />
      </section>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>The party’s all here</h3>
              <p>
                {s.players.filter((p) => p.connected).length} people ready to
                make questionable decisions.
              </p>
            </div>
            <Link to="/lobby">
              Manage
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="party-avatar-row">
            {s.players.slice(0, 10).map((p) => (
              <div key={p.id}>
                <Avatar p={p} />
                <small>{p.name}</small>
              </div>
            ))}
            {s.players.length > 10 && (
              <Link to="/lobby" className="more-players">
                +{s.players.length - 10}
              </Link>
            )}
          </div>
          <div className="room-line">
            <span>
              <span className="live-dot" /> Room open · <b>FRDY</b>
            </span>
            <Link to="/lobby">
              Go to lobby
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <section className="panel mini-champ">
          <div className="section-heading">
            <h3>
              <Trophy size={17} /> The ones to beat
            </h3>
            <Link to="/leaderboard">
              Full standings
              <ArrowUpRight size={14} />
            </Link>
          </div>
          {s.history.length ? (
            <Standings compact />
          ) : (
            <div className="no-champion">
              <span>🏆</span>
              <div>
                <b>The crown is waiting.</b>
                <p>
                  Play your first round to get the
                  <br />
                  championship started.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
      {s.history.length > 0 && (
        <section className="panel section">
          <h3>Recent rounds</h3>
          {s.history
            .slice(-5)
            .reverse()
            .map((h, i) => (
              <div className="history-row" key={i}>
                <span>
                  {games[h.game].name} · Round {h.round}
                </span>
                <b>{h.winner} leads the championship</b>
                <Check size={16} />
              </div>
            ))}
        </section>
      )}
      <footer className="page-footer">
        <span>Made for nights worth remembering.</span>
        <span>NO DOWNLOADS. JUST GOOD TIMES. ✱</span>
      </footer>
    </>
  );
}

export function GameLibrary() {
  return (
    <>
      <PageTitle
        title="Find your party trick"
        description="Three ways to bring the room together. Zero awkward icebreakers."
      />
      <GameCards />
      <section className="panel section">
        <h2>One party. One championship.</h2>
        <p>
          Switch games whenever you like. Each game contributes up to 1,000
          championship points based on average round performance. Bluff Battle
          uses a 500-point baseline, Guess Who 500, and Ballpark 1,000. Points
          accumulate within each game; championship averages keep game length
          and random roles from dominating.
        </p>
        <Button asChild>
          <Link to="/demo">
            Open the playground <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
    </>
  );
}

export function Home() {
  const s = useParty();
  return (
    <div className="home-page">
      <nav className="home-nav">
        <Link className="brand" to="/">
          afterparty<span>✱</span>
        </Link>
        <div>
          <Link to="/dashboard/games">The games</Link>
          <Link to="/dashboard/questions">Question packs</Link>
          <Button variant="dark" asChild>
            <Link to="/dashboard">
              Host a party
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
      </nav>
      <section className="home-hero">
        <div>
          <span className="eyebrow">YOUR FRIENDS. YOUR GAME SHOW.</span>
          <h1>
            Big laughs.
            <br />
            More{" "}
            <span>
              “one more
              <br />
              round.”
            </span>
          </h1>
          <p>
            Turn your living room into a game show.
            <br />
            Wild guesses, convincing lies, and your favourite people.
          </p>
          <div className="button-row">
            <Button asChild>
              <Link
                to="/demo"
                onClick={() => {
                  s.init(14);
                  s.start("bluff");
                }}
              >
                Launch Demo
                <ArrowUpRight size={18} />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/dashboard">
                Enter the host room
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <small>Try the local demo with 14 simulated players.</small>
        </div>
        <div className="home-art">
          <Mascot />
          <span className="home-sticker">
            YOUR PLACE.
            <br />
            OUR GAMES.
            <br />
            GOOD TIMES. ✱
          </span>
        </div>
      </section>
      <div className="home-marquee">
        GOOD PEOPLE. GREAT GAMES. ✱ QUESTIONABLE GUESSES. UNFORGETTABLE NIGHTS.
        ✱
      </div>
      <section className="home-games">
        <div className="section-heading">
          <h2>Pick your kind of chaos.</h2>
          <span>THREE GAMES. ZERO BORING MOMENTS.</span>
        </div>
        <GameCards />
      </section>
      <footer className="page-footer">
        <Link to="/dashboard">
          Open the host dashboard
          <ArrowRight size={16} />
        </Link>
        <span>LOCAL. SELF-CONTAINED. READY TO PARTY.</span>
      </footer>
    </div>
  );
}
