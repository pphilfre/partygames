import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Layers,
  LayoutDashboard,
  Library,
  Monitor,
  Settings,
  Smartphone,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Mobile, TV } from "./components/Gameplay";
import { playSound, unlockAudio } from "./sound";
import { useParty } from "./store";

import { MobileNav } from "./components/Experience";
import { ExperienceFeedback } from "./feedback";
import { Dashboard, GameLibrary, Home } from "./pages/Dashboard";
import { Demo } from "./pages/Demo";
import { Leaderboard } from "./pages/Leaderboard";
import { Lobby } from "./pages/Lobby";
import { Questions } from "./pages/Questions";
import { SettingsPage } from "./pages/Settings";
const nav = [
  ["/dashboard", "Home", LayoutDashboard],
  ["/dashboard/games", "Game library", Library],
  ["/dashboard/questions", "Question packs", Layers],
  ["/leaderboard", "Championship", Trophy],
  ["/dashboard/settings", "Settings", Settings],
] as const;
function Sidebar() {
  const s = useParty();
  return (
    <aside className="sidebar">
      <Link to="/" className="brand">
        afterparty<span>✱</span>
      </Link>
      <div className="party-switch">
        <span className="party-icon">✱</span>
        <div>
          <strong>{s.settings.party}</strong>
          <small>Your party space</small>
        </div>
        <ChevronDown size={15} />
      </div>
      <span className="nav-caption">YOUR NEXT GREAT NIGHT</span>
      <nav>
        {nav.map(([to, label, Icon]) => (
          <NavLink
            to={to}
            end
            key={to}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={18} />
            {label}
            {label === "Game library" && <span className="nav-count">3</span>}
          </NavLink>
        ))}
      </nav>
      <span className="nav-caption second-caption">LET’S PARTY</span>
      <nav>
        <NavLink to="/lobby">
          <Users size={18} />
          Party lobby
          <span className="online-count">
            {s.players.filter((p) => p.connected).length}
          </span>
        </NavLink>
        <NavLink to="/display">
          <Monitor size={18} />
          TV display
          <ArrowUpRight size={15} />
        </NavLink>
        <NavLink to="/play">
          <Smartphone size={18} />
          Player view
        </NavLink>
        <NavLink to="/demo">
          <FlaskConical size={18} />
          Demo playground<span className="tiny-tag">TRY IT</span>
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="local-note">
          <span className="live-dot" />
          <span>
            All local. All yours.<small>Your party saves on this device.</small>
          </span>
        </div>
        <div className="host-profile">
          <span className="host-avatar">J</span>
          <div>
            <strong>Jamie’s house</strong>
            <small>The host with the most</small>
          </div>
          <Link to="/dashboard/settings" aria-label="Host settings">
            <Settings size={17} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
function Header() {
  const { pathname } = useLocation();
  const s = useParty();
  const page =
    nav.find((n) => n[0] === pathname)?.[1] ||
    { "/demo": "Demo playground", "/lobby": "Party lobby" }[pathname] ||
    "Overview";
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">Your party</span>
        <ChevronRight size={14} />
        <span>{page}</span>
      </div>
      <div className="top-actions">
        <span className="local-badge">
          <span className="live-dot" /> LOCAL PROTOTYPE
        </span>
        <button
          className="icon-button"
          aria-label="Toggle sound effects"
          aria-pressed={s.settings.sound}
          onClick={() => s.configure({ sound: !s.settings.sound })}
        >
          {s.settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <Link className="top-tv" to="/display">
          <Monitor size={16} /> Open TV display <ArrowUpRight size={14} />
        </Link>
      </div>
    </header>
  );
}
function AudioAndClock() {
  const { tick, round, settings } = useParty();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") tick();
    }, 1000);
    return () => clearInterval(id);
  }, [tick]);
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  useEffect(() => {
    if (settings.sound)
      playSound(
        round?.phase === "complete"
          ? "winner"
          : round?.phase === "standings"
            ? "move"
            : round?.phase === "reveal"
              ? "correct"
              : "transition",
      );
  }, [round?.phase, settings.sound]);
  useEffect(() => {
    if (settings.sound && round && round.remaining > 0 && round.remaining <= 5)
      playSound("tick");
  }, [round?.remaining, settings.sound]);
  return null;
}
export default function App() {
  const { pathname } = useLocation(),
    s = useParty();
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === "afterparty-v1") useParty.persist.rehydrate();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(s.settings.reduced);
  }, [s.settings.reduced]);
  const standalone = ["/", "/display", "/play"].includes(pathname);
  return (
    <MotionConfig reducedMotion={s.settings.reduced ? "always" : "user"}>
      <AudioAndClock />
      <ExperienceFeedback />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!standalone && <Sidebar />}
      <div className={!standalone ? "app-shell" : ""}>
        {!standalone && <Header />}
        <main
          id="main"
          key={pathname}
          className={!standalone ? "main-content screen-enter" : "screen-enter"}
        >
          {pathname === "/" ? (
            <Home />
          ) : pathname === "/dashboard" ? (
            <Dashboard />
          ) : pathname === "/dashboard/games" ? (
            <GameLibrary />
          ) : pathname === "/dashboard/questions" ? (
            <Questions />
          ) : pathname === "/dashboard/settings" ? (
            <SettingsPage />
          ) : pathname === "/lobby" ? (
            <Lobby />
          ) : pathname === "/leaderboard" ? (
            <Leaderboard />
          ) : pathname === "/demo" ? (
            <Demo />
          ) : pathname === "/display" ? (
            <TV />
          ) : pathname === "/play" ? (
            <div className="play-page">
              <Mobile />
            </div>
          ) : (
            <>
              <h1>That party isn’t here.</h1>
              <Link to="/">Head home</Link>
            </>
          )}
        </main>
      </div>
      {!standalone && <MobileNav />}
      {s.error && (
        <div className="toast" role="status">
          {s.error}
          <button aria-label="Dismiss message" onClick={s.clearError}>
            <X size={16} />
          </button>
        </div>
      )}
    </MotionConfig>
  );
}
