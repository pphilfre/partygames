import { Podium } from "../components/night/Showtime";
import {
  Check,
  ChevronRight,
  FlaskConical,
  LogOut,
  Maximize2,
  Monitor,
  Pause,
  Play,
  Settings2,
  Smartphone,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { games } from "../engine";
import { gameCopy, type Night } from "../session/model";
import { useNight } from "../session/store";
import {
  Action,
  Brand,
  Confirm,
  GameIcon,
  Itinerary,
  Sheet,
  SoundButton,
  Sticker,
} from "../components/night/common";
import { Player as PlayerController } from "../components/night/Player";
import { Stage, Standings } from "../components/night/Stage";
import { HostBar, HostRoom } from "../components/night/Host";
import { DemoTools } from "../demo/Tools";
import { LobbyScene } from "../components/night/Lobby";

export function NightSession({
  standalone,
}: {
  standalone?: "player" | "tv" | "standings";
}) {
  const s = useNight(),
    n = s.night,
    navigate = useNavigate();
  const [tools, setTools] = useState(false),
    [exit, setExit] = useState(false),
    [end, setEnd] = useState(false);
  const [mobileRole, setMobileRole] = useState<"player" | "tv" | "host">(
    "player",
  );
  useEffect(() => {
    if (s.demo.view !== "together") setMobileRole(s.demo.view);
  }, [s.demo.view]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        const st = useNight.getState();
        if (st.night?.status === "playing" && !st.night.paused) st.pause();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  if (!n)
    return (
      <div className="night-ui n-session-empty">
        <Brand />
        <div>
          <Sticker index={0} size={160} />
          <h1>The room’s yours.</h1>
          <p>
            Set up a local demo night. You’ll play one participant while the
            rest of the cast auto-plays.
          </p>
          <Link className="n-button" to="/setup">
            Start a demo night
            <Play size={18} />
          </Link>
          <button className="n-text-button" onClick={() => setTools(true)}>
            Try a scenario
          </button>
        </div>
        <DemoTools open={tools} onOpenChange={setTools} />
      </div>
    );
  const isPlaying = n.status === "playing" && !!n.round;
  const view = standalone === "standings" ? "tv" : standalone || s.demo.view;
  const player = n.players.find((p) => p.id === s.demo.preview) || n.players[0];
  const full = () => {
    const el = document.querySelector(".n-stage");
    if (el?.requestFullscreen)
      void el.requestFullscreen().catch(() => s.setDemo({ view: "tv" }));
  };
  const pauseExit = () => {
    if (!n.paused) s.pause();
    setExit(true);
  };
  return (
    <div className={`night-ui n-session ${standalone ? "n-standalone" : ""}`}>
      {!standalone && (
        <header className="n-demo-toolbar">
          <div>
            <Brand />
            <span className="n-demo-label">
              <FlaskConical size={15} />
              Local demo
            </span>
          </div>
          <div className="n-demo-views" role="group" aria-label="Demo view">
            {(
              [
                { id: "together", label: "Together", icon: Users },
                { id: "host", label: "Host", icon: Settings2 },
                { id: "player", label: "Player", icon: Smartphone },
                { id: "tv", label: "TV", icon: Monitor },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                aria-pressed={s.demo.view === v.id}
                onClick={() => s.setDemo({ view: v.id })}
              >
                <v.icon size={16} />
                {v.label}
              </button>
            ))}
          </div>
          <div className="n-demo-toolbar-end">
            <label className="n-demo-player-label">
              Preview
              <select
                aria-label="Preview a player"
                value={s.demo.preview}
                onChange={(e) => s.setDemo({ preview: e.target.value })}
              >
                {n.players.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                    {p.id === s.demo.controlled ? " (you)" : ""}
                  </option>
                ))}
              </select>
            </label>
            {s.demo.preview !== s.demo.controlled && (
              <button
                className="n-text-button"
                onClick={() => s.setDemo({ controlled: s.demo.preview })}
              >
                Take control
              </button>
            )}
            <button
              className={`n-auto-toggle ${s.demo.auto ? "is-on" : ""}`}
              aria-pressed={s.demo.auto}
              onClick={() => s.setDemo({ auto: !s.demo.auto })}
            >
              <span />
              Auto-play {s.demo.auto ? "on" : "off"}
            </button>
            <button className="n-tools-button" onClick={() => setTools(true)}>
              <FlaskConical size={17} />
              <span>Demo tools</span>
            </button>
          </div>
        </header>
      )}
      {standalone && (
        <div className="n-standalone-nav">
          <Link to="/demo">Back to demo</Link>
          <span>
            Local demo ·{" "}
            {standalone === "tv"
              ? "Shared display"
              : standalone === "player"
                ? "Player preview"
                : "Standings"}
          </span>
        </div>
      )}
      <div className="n-session-top">
        <div>
          <button
            className="n-icon-button"
            aria-label="Pause and leave session"
            onClick={pauseExit}
          >
            <LogOut size={19} />
          </button>
          <span>
            <b>{n.name}</b>
            <small>
              {n.status === "lobby"
                ? "Lobby"
                : n.status === "finale"
                  ? "Results"
                  : `Game ${n.segment + 1} of ${n.itinerary.length}${n.round?.practice ? " · Practice" : n.round ? ` · Round ${n.roundNumber}` : ""}`}
            </small>
          </span>
        </div>
        <Itinerary compact />
        <div>
          <SoundButton />
          {isPlaying && (
            <button
              className="n-icon-button"
              aria-label={n.paused ? "Resume night" : "Pause night"}
              onClick={s.pause}
            >
              {n.paused ? <Play size={19} /> : <Pause size={19} />}
            </button>
          )}
          {isPlaying && view !== "player" && (
            <button
              className="n-icon-button"
              aria-label="Make shared display fullscreen"
              onClick={full}
            >
              <Maximize2 size={18} />
            </button>
          )}
        </div>
      </div>
      {s.needsResume && (
        <div className="n-resume-banner" role="status">
          <div>
            <b>Night paused</b>
          </div>
          <Action onClick={s.resume}>
            <Play size={17} />
            Resume demo
          </Action>
        </div>
      )}
      {n.status === "lobby" ? (
        <LobbyScene
          night={n}
          playerOnly={view === "player"}
          tvOnly={view === "tv"}
        />
      ) : n.status === "intro" || n.status === "transition" ? (
        <IntroScene night={n} />
      ) : n.status === "finale" || n.status === "finished" ? (
        <FinaleScene night={n} />
      ) : standalone === "standings" ? (
        <Standings night={n} full />
      ) : isPlaying ? (
        <>
          {!standalone && (
            <div
              className="n-mobile-role-tabs"
              role="group"
              aria-label="Active role on this screen"
            >
              {(["player", "tv", "host"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={mobileRole === v}
                  onClick={() => {
                    setMobileRole(v);
                    s.setDemo({ view: "together" });
                  }}
                >
                  {v === "player"
                    ? "Your phone"
                    : v === "tv"
                      ? "Shared screen"
                      : "Host controls"}
                </button>
              ))}
            </div>
          )}
          <div className={`n-workspace view-${view} n-mobile-${mobileRole}`}>
            <div className="n-stage-column">
              <Stage night={n} />
              {!standalone && (
                <HostBar
                  night={n}
                  expanded={view === "host" || mobileRole === "host"}
                />
              )}
            </div>
            {view !== "tv" && view !== "host" && (
              <div className="n-phone-column">
                <PlayerController night={n} />
              </div>
            )}
            {view === "host" && <HostRoom night={n} />}
          </div>
        </>
      ) : null}
      <DemoTools open={tools} onOpenChange={setTools} />
      <Sheet
        open={exit}
        onOpenChange={setExit}
        title="Take a breather."
        description="Your night is paused. Accepted answers, drafts, and scores stay saved."
      >
        <div className="n-pause-options">
          <Action
            onClick={() => {
              s.resume();
              setExit(false);
            }}
          >
            <Play size={18} />
            Resume night
          </Action>
          <Action
            secondary
            onClick={() => {
              setExit(false);
              navigate("/setup");
            }}
          >
            Back to setup
          </Action>
          <Action secondary onClick={() => setEnd(true)}>
            End night & show results
          </Action>
          <Link to="/dashboard/questions" onClick={() => setExit(false)}>
            Visit question library
          </Link>
        </div>
      </Sheet>
      <Confirm
        open={end}
        onOpenChange={setEnd}
        title="End this night?"
        description="Only completed, scored rounds count toward the results. The current unfinished attempt will be discarded."
        label="End night"
        onConfirm={() => {
          s.finish();
          setExit(false);
        }}
      />
    </div>
  );
}
function IntroScene({ night: n }: { night: Night }) {
  const begin = useNight((s) => s.begin),
    g = n.itinerary[n.segment].game;
  const completed = n.stamps.length;
  return (
    <section className={`n-game-intro-scene game-${g}`}>
      <div className="n-intro-copy">
        {completed > 0 && (
          <div className="n-segment-complete">
            <Check size={18} />
            {completed} / {n.itinerary.length} complete
          </div>
        )}
        <span className="n-intro-game-icon">
          <GameIcon game={g} size={40} />
        </span>
        <h1>{games[g].name}</h1>

        <p>{gameCopy[g].rule}</p>
        <div className="n-intro-rules">
          <span>
            <Users size={17} />
            {n.players.filter((p) => p.connected).length} participants
          </span>
          <span>
            {n.itinerary[n.segment].rounds} scored{" "}
            {n.itinerary[n.segment].rounds === 1 ? "round" : "rounds"}
          </span>
          <span>
            {g === "who" && n.vibe === "competitive"
              ? "Speed points on"
              : "No speed pressure"}
          </span>
        </div>
        <Action onClick={() => begin(true)}>
          Start practice
          <Play size={18} />
        </Action>
        <button className="n-text-button" onClick={() => begin(false)}>
          Start game
        </button>
      </div>
      <div className="n-intro-characters">
        <div className={`n-intro-demo-board game-${g}`}>
          <div className="n-intro-demo-title">
            <GameIcon game={g} size={25} />
            {games[g].name}
          </div>
          {g === "ballpark" ? (
            <>
              <h3>How many keys on a piano?</h3>
              <div className="n-intro-estimates">
                <span>72</span>
                <strong>88</strong>
                <span>104</span>
              </div>
              <div className="n-intro-demo-track">
                <span />
                <b />
              </div>
              <div className="n-intro-demo-winner">
                <Sticker index={2} size={88} />
                <div>
                  <b>Priya guessed 86.</b>
                  <span>Just 2 away. Closest gets +100.</span>
                </div>
              </div>
            </>
          ) : g === "bluff" ? (
            <>
              <h3>Which fruit has seeds on the outside?</h3>
              <div className="n-intro-example-choices">
                {["Raspberry", "Strawberry", "Fig", "Dragon fruit"].map(
                  (answer, i) => (
                    <div key={answer}>
                      <span>{String.fromCharCode(65 + i)}</span>
                      {answer}
                      {i === 1 && <Check size={17} />}
                    </div>
                  ),
                )}
              </div>
            </>
          ) : (
            <>
              <h3>“I’d bring a suitcase full of snacks.”</h3>
              <div className="n-intro-example-suspects">
                {n.players.slice(0, 4).map((player) => (
                  <div key={player.id}>
                    <Sticker player={player} size={74} />
                    <b>{player.name}</b>
                  </div>
                ))}
              </div>
            </>
          )}
          <small>Example</small>
        </div>
      </div>
    </section>
  );
}
function FinaleScene({ night: n }: { night: Night }) {
  const s = useNight();
  const [all, setAll] = useState(false),
    [rematch, setRematch] = useState(false);
  return (
    <section className="n-finale">
      <Podium night={n} />
      <div className="n-finale-actions">
        <Action onClick={() => setRematch(true)}>
          Play again
          <Play size={18} />
        </Action>
        <Action secondary onClick={() => setAll((v) => !v)}>
          {all ? "Hide results" : "All results"}
        </Action>
        <Link to="/setup" className="n-text-button">
          Change games
        </Link>
        <Link
          to="/"
          className="n-text-button"
          onClick={() =>
            useNight.setState({ night: { ...n, status: "finished" } })
          }
        >
          Finish
        </Link>
      </div>
      {all && <Standings night={n} full />}
      <Confirm
        open={rematch}
        onOpenChange={setRematch}
        title="Play again?"
        description="Same players. Scores reset."
        label="Start rematch"
        onConfirm={s.rematch}
      />
    </section>
  );
}
