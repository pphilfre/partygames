import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock3,
  Gamepad2,
  Heart,
  Play,
  Plus,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { games, type Game } from "../engine";
import {
  gameCopy,
  poolFor,
  setupIssues,
  starter,
  type Night,
  type Segment,
} from "../session/model";
import { useNight } from "../session/store";
import { useParty } from "../store";
import {
  convex,
  errorText,
  lastHost,
  liveConfigured,
  remember,
  roomMutation,
  type Connection,
} from "../session/live";
import {
  Action,
  Brand,
  Confirm,
  GameIcon,
  Notice,
  SoundButton,
  Sticker,
} from "../components/night/common";

export function PrepNav() {
  return (
    <header className="n-prep-nav">
      <Brand />
      <nav aria-label="Main navigation">
        <Link to="/setup">Your night</Link>
        <Link to="/dashboard/games">Games</Link>
        <Link to="/dashboard/questions">Questions</Link>
        <Link to="/dashboard/settings" aria-label="Settings">
          <Settings2 size={20} />
          <span className="n-mobile-hide">Settings</span>
        </Link>
        <SoundButton />
      </nav>
    </header>
  );
}
export function NightStart() {
  const legacyPlayers = useParty((s) => s.players),
    legacyHistory = useParty((s) => s.history);
  const n = useNight((s) => s.night),
    resume = useNight((s) => s.resume),
    navigate = useNavigate();
  const [fresh, setFresh] = useState(false);
  const saved = !!n && !["finished", "finale"].includes(n.status);
  return (
    <div className="night-ui n-start">
      <PrepNav />
      <section className="n-home-hero">
        <div className="n-home-copy">
          <h1>
            Your people.
            <br />
            Three games.
            <br />
            One great night.
          </h1>
          <p>
            Wild guesses. Believable lies. Stories only your friends could tell.
            Play together on your phones, or try it with a demo cast.
          </p>
          <div className="n-start-actions">
            {saved ? (
              <>
                <Action
                  onClick={() => {
                    resume();
                    navigate("/demo");
                  }}
                >
                  <Play size={19} />
                  Resume demo
                </Action>
                <button
                  className="n-text-button"
                  onClick={() => setFresh(true)}
                >
                  Start fresh
                </button>
              </>
            ) : (
              <Link className="n-button" to="/setup">
                <Play size={19} />
                Host a game night
              </Link>
            )}
          </div>
          <p className="n-local-explainer">
            One shared screen. Your phones. All three games.
          </p>
          <Link className="n-text-button" to="/join">
            Join with a room code
          </Link>
          {lastHost() && (
            <Link
              className="n-text-button"
              to={`/room?room=${lastHost()!.code}&role=host`}
            >
              Return to live room
            </Link>
          )}
          {saved && (
            <div className="n-resume-detail">
              Saved: {n.name}
              {n.round
                ? ` · ${games[n.round.game].name}, round ${n.roundNumber}`
                : ` · ${n.status === "lobby" ? "Your cast is waiting" : "Ready to continue"}`}
            </div>
          )}
        </div>
        <div
          className="n-home-preview"
          aria-label="Illustrative Ballpark result"
        >
          <div className="n-vignette-caption">
            <span>
              <GameIcon game="ballpark" size={18} />
              Ballpark
            </span>
            <span>Example round</span>
          </div>
          <h2>
            How many keys are on
            <br />a standard piano?
          </h2>
          <div className="n-vignette-answer">
            <span>The answer</span>
            <strong>
              88<small>keys</small>
            </strong>
          </div>
          <div className="n-vignette-line">
            <span>72</span>
            <div />
            <span>104</span>
          </div>
          <div className="n-hero-winner">
            <Sticker index={2} size={150} />
            <div>
              <b>Priya guessed 86</b>
              <span>Just 2 keys away.</span>
              <span className="n-example-bonus">Closest guess +100</span>
            </div>
          </div>
          <div className="n-vignette-cast">
            <Sticker index={0} size={95} />
            <Sticker index={1} size={88} />
            <Sticker index={3} size={102} />
            <span>
              Your friends are
              <br />
              the entertainment.
            </span>
          </div>
        </div>
      </section>
      <section className="n-home-games">
        <div className="n-section-heading">
          <h2>Three ways to get the room going.</h2>
          <Link to="/dashboard/games" className="n-text-button">
            Explore the games
          </Link>
        </div>
        <div className="n-game-grid">
          {(["ballpark", "bluff", "who"] as Game[]).map((g, i) => (
            <Link
              to={`/setup?game=${g}`}
              className={`n-game-intro game-${g}`}
              key={g}
            >
              <span className="n-game-art">
                <GameIcon game={g} size={36} />
                <Sticker index={[3, 6, 1][i]} size={106} />
              </span>
              <h3>{games[g].name}</h3>
              <p>
                {g === "ballpark"
                  ? "Big questions. Wild estimates. Close enough really does count."
                  : g === "bluff"
                    ? "Invent a convincing answer. Find the truth hiding among the lies."
                    : "One anonymous answer. A whole room of suspects."}
              </p>
              <span className="n-game-link">
                Try {games[g].name}
                <Play size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      {legacyHistory.length > 0 && (
        <details className="n-legacy-records">
          <summary>Previous prototype scores on this browser</summary>
          <p>
            Your previous championship was preserved separately. Detailed
            attempt breakdowns were not recorded in that version.
          </p>
          <div>
            {legacyPlayers.map((p) => (
              <span key={p.id}>
                {p.name}
                <b>{p.score}</b>
              </span>
            ))}
          </div>
        </details>
      )}
      <footer className="n-footer">
        <Brand />
        <span>Made for the people in the room.</span>
        <Link to="/dashboard/questions">
          Make it personal with your own questions
        </Link>
      </footer>
      <Confirm
        open={fresh}
        onOpenChange={setFresh}
        title="Set up a fresh night?"
        description="Opening setup keeps your saved night until you choose Open lobby. Your question library and preferences stay saved."
        label="Go to setup"
        onConfirm={() => navigate("/setup")}
      />
    </div>
  );
}
export function NightSetup() {
  const [params] = useSearchParams();
  const selected = params.get("game") as Game | null;
  const existing = useNight((s) => s.night),
    create = useNight((s) => s.createNight),
    questions = useParty((s) => s.questions),
    navigate = useNavigate();
  const [name, setName] = useState(existing?.name || "The Friday Night Club");
  const [count, setCount] = useState(existing?.players.length || 14);
  const [length, setLength] = useState<"tour" | "night" | "custom">("night");
  const [vibe, setVibe] = useState<Night["vibe"]>("easygoing");
  const [itinerary, setItinerary] = useState<Segment[]>(
    selected && games[selected]
      ? [{ id: "single", game: selected, rounds: 3, pack: "starter" }]
      : starter(),
  );
  const [allowRepeats, setAllowRepeats] = useState(false),
    [replace, setReplace] = useState(false);
  const [demoMode, setDemoMode] = useState(false),
    [opening, setOpening] = useState(false),
    [liveError, setLiveError] = useState("");
  const issues = setupIssues(questions, itinerary, count, allowRepeats);
  const rounds = itinerary.reduce((s, g) => s + g.rounds, 0);
  const update = (i: number, p: Partial<Segment>) =>
    setItinerary((items) =>
      items.map((s, j) => (j === i ? { ...s, ...p } : s)),
    );
  const reorder = (i: number, delta: number) => {
    const copy = [...itinerary];
    [copy[i], copy[i + delta]] = [copy[i + delta], copy[i]];
    setItinerary(copy);
  };
  const open = async () => {
    if (demoMode) {
      if (create({ name, count, itinerary, vibe, allowRepeats, seed: 42 }))
        navigate("/lobby");
      return;
    }
    setOpening(true);
    setLiveError("");
    try {
      const { base, speed } = useParty.getState().settings;
      const connection = (await convex().mutation(
        roomMutation("create"),
        JSON.parse(
          JSON.stringify({
            name,
            capacity: count,
            itinerary,
            vibe,
            allowRepeats,
            questions,
            scoring: { base, speed },
          }),
        ),
      )) as Connection;
      remember(connection);
      navigate(`/room?room=${connection.code}&role=host`);
    } catch (e) {
      setLiveError(errorText(e));
    } finally {
      setOpening(false);
    }
  };
  return (
    <div className="night-ui n-prep">
      <PrepNav />
      <div className="n-setup-heading">
        <Link to="/" className="n-text-button">
          Back to start
        </Link>
        <h1>A good night starts here.</h1>
        <p>We’ve picked a little of everything. Make it your kind of party.</p>
      </div>
      <div className="n-setup-layout">
        <div className="n-setup-form">
          <section className="n-mode-choice">
            <label className="n-toggle">
              <span>
                Demo mode
                <small>
                  {demoMode
                    ? "Play one person. The simulated cast fills the room."
                    : "Live room. Everyone joins with their own phone."}
                </small>
              </span>
              <input
                aria-label="Demo mode"
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
              />
            </label>
            {!demoMode && !liveConfigured && (
              <p role="alert">
                Add VITE_CONVEX_URL to enable live rooms, or turn on demo mode.
              </p>
            )}
            {opening && <p role="status">Opening your live room…</p>}
            {liveError && (
              <p className="n-live-error" role="alert">
                {liveError}
              </p>
            )}
          </section>
          <section>
            <h2>How long are we playing?</h2>
            <div className="n-choice-row">
              {(
                [
                  {
                    id: "tour",
                    title: "Quick tour",
                    desc: "One round of each game",
                  },
                  {
                    id: "night",
                    title: "Game night",
                    desc: "Three rounds of each game",
                  },
                  {
                    id: "custom",
                    title: "Your mix",
                    desc: "Set the rounds below",
                  },
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  className={`n-setting-choice ${length === o.id ? "selected" : ""}`}
                  aria-pressed={length === o.id}
                  onClick={() => {
                    setLength(o.id);
                    if (o.id !== "custom")
                      setItinerary((s) =>
                        s.map((g) => ({
                          ...g,
                          rounds: o.id === "tour" ? 1 : 3,
                        })),
                      );
                  }}
                >
                  <b>{o.title}</b>
                  <span>{o.desc}</span>
                  {length === o.id && <Check size={17} />}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2>Set the mood.</h2>
            <div className="n-choice-row">
              {(
                [
                  {
                    id: "easygoing",
                    title: "Easygoing",
                    desc: "Timed, with no speed bonus",
                    icon: Heart,
                  },
                  {
                    id: "competitive",
                    title: "A little competitive",
                    desc: "Timed, with speed points",
                    icon: Gamepad2,
                  },
                  {
                    id: "comfortable",
                    title: "No rush",
                    desc: "Untimed, calm motion",
                    icon: Clock3,
                  },
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  className={`n-setting-choice ${vibe === o.id ? "selected" : ""}`}
                  aria-pressed={vibe === o.id}
                  onClick={() => setVibe(o.id)}
                >
                  <o.icon size={21} />
                  <b>{o.title}</b>
                  <span>{o.desc}</span>
                  {vibe === o.id && <Check size={17} />}
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="n-section-heading">
              <h2>Tonight’s lineup.</h2>
              <span>{rounds} scored rounds</span>
            </div>

            <ol className="n-lineup">
              {itinerary.map((s, i) => (
                <li key={s.id}>
                  <span className={`n-game-token game-${s.game}`}>
                    <GameIcon game={s.game} />
                  </span>
                  <div className="n-lineup-name">
                    <b>{games[s.game].name}</b>
                    <small>
                      {s.game === "ballpark"
                        ? "Everyone estimates"
                        : s.game === "bluff"
                          ? "Three writers, a room of guesses"
                          : "Everyone answers, guess the author"}
                    </small>
                    <label>
                      Question pack
                      <select
                        value={s.pack}
                        onChange={(e) => update(i, { pack: e.target.value })}
                      >
                        <option value="starter">
                          Easygoing starter selection
                        </option>
                        <option value="all">All enabled prompts</option>
                        {[
                          ...new Set(
                            questions
                              .filter((q) => q.game === s.game)
                              .map((q) => q.pack),
                          ),
                        ].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <small>
                      {poolFor(questions, s).length} enabled prompts available
                    </small>
                  </div>
                  <label className="n-rounds-field">
                    Rounds
                    <input
                      aria-label={`${games[s.game].name} rounds, game ${i + 1}`}
                      type="number"
                      min={1}
                      max={20}
                      value={s.rounds}
                      onChange={(e) => {
                        setLength("custom");
                        update(i, {
                          rounds: Math.max(
                            1,
                            Math.min(20, Number(e.target.value) || 1),
                          ),
                        });
                      }}
                    />
                  </label>
                  <div className="n-reorder">
                    <button
                      className="n-icon-button"
                      disabled={i === 0}
                      aria-label={`Move ${games[s.game].name} earlier`}
                      onClick={() => reorder(i, -1)}
                    >
                      <ArrowUp size={17} />
                    </button>
                    <button
                      className="n-icon-button"
                      disabled={i === itinerary.length - 1}
                      aria-label={`Move ${games[s.game].name} later`}
                      onClick={() => reorder(i, 1)}
                    >
                      <ArrowDown size={17} />
                    </button>
                    <button
                      className="n-icon-button"
                      disabled={itinerary.length === 1}
                      aria-label={`Remove ${games[s.game].name}`}
                      onClick={() =>
                        setItinerary((v) => v.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            <details className="n-details">
              <summary>Add another game</summary>
              <div className="n-inline-actions">
                {(["ballpark", "bluff", "who"] as Game[]).map((g) => (
                  <Action
                    secondary
                    key={g}
                    onClick={() => {
                      setLength("custom");
                      setItinerary((s) => [
                        ...s,
                        {
                          id: crypto.randomUUID(),
                          game: g,
                          rounds: 1,
                          pack: "all",
                        },
                      ]);
                    }}
                  >
                    <Plus size={16} />
                    {games[g].name}
                  </Action>
                ))}
              </div>
            </details>
          </section>
          <section>
            <h2>Bring the room together.</h2>
            <div className="n-form-two">
              <label>
                Night name
                <input
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Demo cast size
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  {Array.from({ length: 21 }, (_, i) => i + 4).map((n) => (
                    <option key={n} value={n}>
                      {n} participants
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="n-field-help">
              {demoMode
                ? "You control one player. The rest are simulated."
                : "This is the room capacity. The host can start once four people join."}
            </p>
          </section>
          <details className="n-details">
            <summary>Prompt repeats & scoring details</summary>
            <label className="n-toggle">
              <span>
                Allow repeated prompts
                <small>
                  Use when your lineup is longer than the available question
                  selection.
                </small>
              </span>
              <input
                type="checkbox"
                checked={allowRepeats}
                onChange={(e) => setAllowRepeats(e.target.checked)}
              />
            </label>
            <p>
              Championship scores use each game’s capped average, then add those
              averages together. A round can raise or lower your championship
              score. Round points are shown separately.
            </p>
            <p>
              Guess Who authors and Bluff writers rotate by fewest turns. A
              short night does not guarantee everyone a writing role.
            </p>
          </details>
        </div>
        <aside className="n-night-summary">
          <div className="n-summary-stickers">
            <Sticker index={0} size={96} />
            <Sticker index={6} size={96} />
            <Sticker index={7} size={96} />
          </div>
          <h2>{name || "Your game night"}</h2>
          <p>
            {rounds} rounds across {itinerary.length} game
            {itinerary.length === 1 ? "" : "s"}.
          </p>
          <ol>
            {itinerary.map((s, i) => (
              <li key={s.id}>
                <span>{i + 1}</span>
                <GameIcon game={s.game} size={20} />
                <b>{games[s.game].name}</b>
                <small>{s.rounds} rounds</small>
              </li>
            ))}
          </ol>
          <div className="n-summary-meta">
            <Users size={17} />
            {count} participants
            <span />
            {vibe === "comfortable"
              ? "No rush"
              : vibe === "competitive"
                ? "Speed points on"
                : "No speed bonus"}
          </div>
          {issues.length > 0 && (
            <Notice error>
              {issues.map((issue, i) => (
                <p key={i}>{issue}</p>
              ))}
            </Notice>
          )}
          <Action
            disabled={
              !!issues.length || opening || (!demoMode && !liveConfigured)
            }
            onClick={() =>
              demoMode && existing && existing.status !== "finished"
                ? setReplace(true)
                : open()
            }
          >
            {opening ? "Opening…" : "Open lobby"}
            <Play size={18} />
          </Action>
          <p className="n-local-explainer">
            {demoMode
              ? "Local demo. Your cast and scores save in this browser."
              : "Live room. Scan the QR code to join on your phones."}
          </p>
        </aside>
      </div>
      <Confirm
        open={replace}
        onOpenChange={setReplace}
        title="Open a new night?"
        description="This replaces the current demo cast, scores, and round. Your custom questions, sound, and motion preferences stay saved."
        label="Open new lobby"
        onConfirm={open}
      />
    </div>
  );
}
export function NightGames() {
  return (
    <div className="night-ui n-prep">
      <PrepNav />
      <div className="n-setup-heading">
        <h1>Pick your kind of chaos.</h1>
        <p>Play one game, or bring all three to the same night.</p>
        <Link className="n-button" to="/setup">
          Mix all three games
          <Play size={18} />
        </Link>
      </div>
      <div className="n-game-grid n-library">
        {(["ballpark", "bluff", "who"] as Game[]).map((g, i) => (
          <article className={`n-game-intro game-${g}`} key={g}>
            <span className="n-game-art">
              <GameIcon game={g} size={48} />
              <Sticker index={[3, 6, 1][i]} size={150} />
            </span>
            <h2>{games[g].name}</h2>
            <p>{gameCopy[g].rule}</p>
            <div className="n-game-facts">
              <Users size={17} />
              4–24 players<span>Practice included</span>
            </div>
            <Link className="n-button n-secondary" to={`/setup?game=${g}`}>
              Set up {games[g].name}
              <Play size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
