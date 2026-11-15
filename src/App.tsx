import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useParty } from "./store";
import { useNight } from "./session/store";
import { pulse } from "./feedback";
import { playSound, unlockAudio, setMusic } from "./sound";
import {
  NightGames,
  NightSetup,
  NightStart,
  PrepNav,
} from "./pages/NightStart";
import { NightSession } from "./pages/NightSession";
import { Questions } from "./pages/Questions";
import { SettingsPage } from "./pages/Settings";
import { JoinLive, LiveRoom } from "./pages/Live";
import { liveActive } from "./session/transport";
import "./live.css";

function NightDriver() {
  const { pathname } = useLocation();
  const night = useNight((s) => s.night),
    sound = useParty((s) => s.settings.sound);
  useEffect(() => {
    const sync = () => {
      const active = [
        "/demo",
        "/lobby",
        "/play",
        "/display",
        "/leaderboard",
        "/room",
      ].includes(pathname);
      setMusic(
        sound &&
          active &&
          night &&
          !night.paused &&
          !document.hidden &&
          !["finished", "finale"].includes(night.status)
          ? night.status === "lobby" ||
            night.status === "intro" ||
            night.status === "transition"
            ? "lobby"
            : night.round?.phase === "reveal"
              ? "reveal"
              : "play"
          : "",
      );
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      setMusic("");
    };
  }, [pathname, sound, night?.status, night?.paused, night?.round?.phase]);
  useEffect(() => {
    if (
      !["/demo", "/lobby", "/play", "/display", "/leaderboard"].includes(
        pathname,
      )
    )
      return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") useNight.getState().tick();
    }, 250);
    return () => {
      clearInterval(id);
      const s = useNight.getState();
      if (!liveActive() && s.night?.status === "playing" && !s.night.paused)
        s.pause();
    };
  }, [pathname]);
  useEffect(() => {
    const tap = (e: MouseEvent) => {
      const target = (e.target as Element).closest(
        "button,a,input[type=checkbox]",
      );
      if (target && !target.matches(":disabled")) {
        unlockAudio();
        pulse("tap");
      }
    };
    document.addEventListener("click", tap, true);
    const off = useNight.subscribe((s, prev) => {
      const r = s.night?.round,
        before = prev.night?.round,
        id = s.demo.controlled,
        settings = useParty.getState().settings;
      if (s.error && s.error !== prev.error) {
        pulse("error");
        if (settings.sound) playSound("incorrect");
      }
      if (
        r &&
        before &&
        r.id === before.id &&
        r.phase === before.phase &&
        ((r.answers[id] && r.answers[id] !== before.answers[id]) ||
          (r.votes[id] && r.votes[id] !== before.votes[id]))
      ) {
        pulse("submit");
        if (settings.sound) playSound("submit");
      }
      if (r?.revealReady && !before?.revealReady) {
        pulse("success");
        if (settings.sound) playSound("correct");
      }
    });
    return () => {
      document.removeEventListener("click", tap, true);
      off();
    };
  }, []);
  return null;
}
export default function App() {
  const { pathname } = useLocation(),
    settings = useParty((s) => s.settings),
    night = useNight((s) => s.night),
    error = useNight((s) => s.error),
    legacyError = useParty((s) => s.error);
  const reduced = settings.reduced || night?.vibe === "comfortable";
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
  }, [reduced]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Afterparty · Your people. Your game night.";
  }, [pathname]);
  const support = ["/dashboard/questions", "/dashboard/settings"].includes(
    pathname,
  );
  const body =
    pathname === "/join" ||
    (pathname === "/play" &&
      new URLSearchParams(window.location.search).has("room")) ? (
      <JoinLive />
    ) : pathname === "/room" ? (
      <LiveRoom key={window.location.search} />
    ) : pathname === "/" || pathname === "/dashboard" ? (
      <NightStart />
    ) : pathname === "/setup" ? (
      <NightSetup />
    ) : pathname === "/dashboard/games" ? (
      <NightGames />
    ) : pathname === "/dashboard/questions" ? (
      <Questions />
    ) : pathname === "/dashboard/settings" ? (
      <SettingsPage />
    ) : pathname === "/play" ? (
      <NightSession standalone="player" />
    ) : pathname === "/display" ? (
      <NightSession standalone="tv" />
    ) : pathname === "/leaderboard" ? (
      <NightSession standalone="standings" />
    ) : ["/demo", "/lobby"].includes(pathname) ? (
      <NightSession />
    ) : (
      <div className="night-ui n-not-found">
        <h1>That party isn’t here.</h1>
        <Link className="n-button" to="/">
          Back to the start
        </Link>
      </div>
    );
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <NightDriver />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {support && (
        <div className="night-ui n-support-nav">
          <PrepNav />
          {night && (
            <Link className="n-return-link" to="/demo">
              Return to your saved night
            </Link>
          )}
        </div>
      )}
      <main id="main" className={support ? "night-ui n-support-content" : ""}>
        {body}
      </main>
      {(error || legacyError) && (
        <div className="night-ui n-error-toast" role="alert">
          <span>{error || legacyError}</span>
          <button
            className="n-icon-button"
            aria-label="Dismiss message"
            onClick={() => {
              useNight.getState().clearError();
              useParty.getState().clearError();
            }}
          >
            <X size={19} />
          </button>
        </div>
      )}
    </MotionConfig>
  );
}
