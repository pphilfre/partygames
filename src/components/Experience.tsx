import {
  Check,
  ChevronRight,
  Flame,
  Gamepad2,
  Home,
  Layers,
  Settings,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { games } from "../engine";
import { useParty } from "../store";
import { Button } from "./ui";

export function Mascot() {
  return (
    <svg className="spark-mascot" viewBox="0 0 260 260" aria-hidden="true">
      <ellipse cx="133" cy="231" rx="77" ry="12" fill="#382270" opacity=".16" />
      <g className="mascot-body">
        <path
          d="M49 119Q33 80 67 59L82 25 111 48Q147 34 174 56L212 42 211 89Q242 122 222 160L226 196 186 202Q151 231 113 210L75 222 66 184Q35 164 49 119"
          fill="#c7f36b"
          stroke="#304e28"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <ellipse cx="107" cy="113" rx="23" ry="29" fill="white" />
        <ellipse cx="168" cy="109" rx="23" ry="29" fill="white" />
        <ellipse cx="115" cy="116" rx="9" ry="14" fill="#29203f" />
        <ellipse cx="175" cy="112" rx="9" ry="14" fill="#29203f" />
        <path
          d="M111 156Q138 187 169 150"
          fill="#29203f"
          stroke="#29203f"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M126 168Q141 155 156 168" fill="#ff838e" />
        <ellipse cx="80" cy="145" rx="13" ry="7" fill="#99d84e" />
        <ellipse cx="194" cy="139" rx="13" ry="7" fill="#99d84e" />
        <path
          d="M49 126L22 107M222 124L245 97"
          stroke="#304e28"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </g>
      <path d="M29 52L33 38 38 51 51 55 38 60 33 73 28 60 15 56Z" fill="#fff" />
      <path
        d="M225 24L229 13 233 24 244 28 233 32 229 43 225 32 214 28Z"
        fill="#ffe484"
      />
    </svg>
  );
}
export function MobileNav() {
  const tabs = [
    ["/dashboard", "Home", Home],
    ["/dashboard/games", "Games", Gamepad2],
    ["/lobby", "Party", Users],
    ["/leaderboard", "Ranks", Trophy],
    ["/dashboard/settings", "You", Settings],
  ] as const;
  return (
    <nav className="mobile-tabs" aria-label="Main navigation">
      {tabs.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} end>
          <Icon size={23} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
export function PartyJourney() {
  const s = useParty();
  const played = new Set(s.history.map((h) => h.game));
  const tasks = [
    {
      label: "Get the gang together",
      detail: `${s.players.filter((p) => p.connected).length} players in your room`,
      done: s.players.filter((p) => p.connected).length >= 4,
      to: "/lobby",
      icon: Users,
    },
    {
      label: "Make your first move",
      detail: "Finish one round of any game",
      done: s.history.length > 0,
      to: "/dashboard/games",
      icon: Zap,
    },
    {
      label: "Try the whole party pack",
      detail: `${played.size} of 3 games played`,
      done: played.size === 3,
      to: "/dashboard/games",
      icon: Trophy,
    },
  ];
  const completed = tasks.filter((t) => t.done).length;
  return (
    <section className="journey-layout">
      <div className="journey-panel">
        <div className="journey-heading">
          <div>
            <span className="eyebrow">SMALL STEPS. BIG ENERGY.</span>
            <h2>Your party journey</h2>
          </div>
          <span className="journey-count">{completed}/3</span>
        </div>
        <div
          className="journey-progress"
          role="progressbar"
          aria-label="Party journey"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={completed}
        >
          <span style={{ width: `${(completed / 3) * 100}%` }} />
        </div>
        <div className="journey-steps">
          {tasks.map((t, i) => (
            <Link
              to={t.to}
              className={`journey-step ${t.done ? "done" : ""}`}
              key={t.label}
            >
              <span className="step-orb">
                {t.done ? <Check size={21} /> : <t.icon size={21} />}
              </span>
              <span>
                <small>STEP {i + 1}</small>
                <strong>{t.label}</strong>
                <p>{t.detail}</p>
              </span>
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
      </div>
      <div className="challenge-panel">
        <span className="challenge-icon">
          <Flame size={30} />
        </span>
        <span className="eyebrow">TONIGHT’S CHALLENGE</span>
        <h2>
          Three games.
          <br />
          One legendary night.
        </h2>
        <p>Complete a round in every game. Find your party’s hidden talents.</p>
        <div className="challenge-stamps">
          {(["bluff", "who", "ballpark"] as const).map((g) => (
            <span
              key={g}
              className={played.has(g) ? "earned" : ""}
              title={games[g].name}
            >
              {played.has(g) ? <Check size={22} /> : games[g].symbol}
            </span>
          ))}
        </div>
        <Link to="/dashboard/games">
          Let’s do this <ChevronRight size={17} />
        </Link>
      </div>
    </section>
  );
}
export function PartyHero() {
  const s = useParty();
  const ongoing = s.round && s.round.phase !== "complete";
  return (
    <section className="party-hero">
      <div className="hero-message">
        <span className="hero-chip">
          <Sparkles size={14} /> A LITTLE COMPETITION. A LOT OF CONNECTION.
        </span>
        <h2>
          Your people.
          <br />
          Your next great night.
        </h2>
        <p>
          Outsmart your friends. Bluff with confidence.
          <br />
          Make “one more round” a thing.
        </p>
        <Button asChild>
          <Link to={ongoing ? "/demo" : "/dashboard/games"}>
            {ongoing ? "Keep the party going" : "Find your first game"}{" "}
            <ChevronRight size={20} />
          </Link>
        </Button>
        <span className="hero-footnote">
          <Users size={14} /> {s.players.filter((p) => p.connected).length}{" "}
          party people ready to play
        </span>
      </div>
      <div className="hero-character">
        <span className="speech-bubble">I like your competitive side.</span>
        <Mascot />
        <span className="hero-star">✦</span>
      </div>
    </section>
  );
}
export function SessionStrip() {
  const s = useParty();
  return (
    <div className="session-strip">
      <span>
        <Zap size={18} />
        <b>{s.history.length}</b> rounds played
      </span>
      <span>
        <Trophy size={18} />
        <b>{new Set(s.history.map((h) => h.game)).size}/3</b> games explored
      </span>
      <Link to="/dashboard/questions">
        <Layers size={18} />
        <b>{s.questions.length}</b> questions <ChevronRight size={15} />
      </Link>
    </div>
  );
}
