import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Copy,
  Check,
  Monitor,
  Play,
  Users,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNight } from "../session/store";
import { setLiveTransport } from "../session/transport";
import {
  appJoinUrl,
  convex,
  errorText,
  liveConfigured,
  phoneToken,
  recalled,
  remember,
  roomMutation,
  roomQuery,
  useLiveStatus,
  type Connection,
  type RoomView,
} from "../session/live";
import { games } from "../engine";
import { gameCopy, roomCode } from "../session/model";
import { isLoopbackAddress, resolveJoinBase } from "../session/urls";
import {
  Action,
  Brand,
  SoundButton,
  Sticker,
} from "../components/night/common";
import { FaceEditor } from "../components/night/Faces";
import { LobbyScene } from "../components/night/Lobby";
import { Stage, Standings } from "../components/night/Stage";
import { Player } from "../components/night/Player";
import { HostBar } from "../components/night/Host";
import { Podium } from "../components/night/Showtime";

export function JoinLive() {
  const [params] = useSearchParams(),
    navigate = useNavigate();
  const [code, setCode] = useState(params.get("room") || ""),
    [name, setName] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const pin = code.replace(/\s/g, "");
    try {
      const old = recalled("player", pin);
      const token =
        old?.token ||
        sessionStorage.getItem(`afterparty-joining-${pin}`) ||
        phoneToken();
      sessionStorage.setItem(`afterparty-joining-${pin}`, token);
      const connection = (await convex().mutation(roomMutation("join"), {
        code: pin,
        name,
        token,
      })) as Connection;
      remember(connection);
      navigate(`/room?room=${pin}&role=player`);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const saved = recalled("player", code.replace(/\s/g, ""));
  return (
    <div className="night-ui n-live-join">
      <Brand />
      <form onSubmit={submit} className="n-room-join-form">
        <h1>Join the party.</h1>
        <p>Scan the host’s QR code or enter the room code.</p>
        <label>
          Room code
          <input
            name="room-code"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="000 000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))}
            required
          />
        </label>
        <label>
          Your name
          <input
            name="player-name"
            autoComplete="nickname"
            maxLength={32}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!saved}
          />
        </label>
        {error && (
          <p role="alert" className="n-live-error">
            {error}
          </p>
        )}
        {!liveConfigured && (
          <p role="alert">
            Live mode needs a Convex URL. You can still try the demo.
          </p>
        )}
        <Action
          type="submit"
          disabled={
            busy ||
            !liveConfigured ||
            code.replace(/\s/g, "").length !== 6 ||
            (!saved && !name.trim())
          }
        >
          {busy ? "Joining…" : saved ? "Rejoin room" : "Join room"}
          <Users size={18} />
        </Action>
        <Link to="/">Back to start</Link>
      </form>
    </div>
  );
}

export function LiveRoom() {
  const [params] = useSearchParams(),
    navigate = useNavigate();
  const code = params.get("room") || "",
    role =
      params.get("role") === "host"
        ? "host"
        : params.get("role") === "display"
          ? "display"
          : "player";
  const [connection] = useState<Connection | null>(() => {
    if (role === "display" && params.get("key")) {
      const c: Connection = {
        code,
        token: params.get("key")!,
        role,
        playerId: "",
      };
      remember(c);
      return c;
    }
    return recalled(role, code);
  });
  const [room, setRoom] = useState<RoomView | null>(null),
    [fatal, setFatal] = useState("");
  const [base, setBase] = useState(() =>
    resolveJoinBase(
      location.origin,
      localStorage.getItem("afterparty-join-base"),
      import.meta.env.VITE_PUBLIC_APP_URL,
    ),
  );
  const [addresses, setAddresses] = useState<string[]>([]),
    [copied, setCopied] = useState(false);
  const status = useLiveStatus(),
    n = useNight((s) => s.night);
  const localHost = isLoopbackAddress(location.origin);
  useEffect(() => {
    if (role !== "host" || !import.meta.env.DEV) return;
    void fetch("/api/network")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        if (
          isLoopbackAddress(
            resolveJoinBase(
              location.origin,
              localStorage.getItem("afterparty-join-base"),
              import.meta.env.VITE_PUBLIC_APP_URL,
            ),
          ) &&
          data.addresses?.[0]
        )
          setBase(data.addresses[0]);
      })
      .catch(() => {});
  }, [role]);
  useEffect(() => {
    if (!connection) return;
    let alive = true;
    const saved = useNight.getState();
    const snapshot = {
      night: saved.night,
      demo: saved.demo,
      promptHistory: saved.promptHistory,
      roleHistory: saved.roleHistory,
      drafts: saved.drafts,
    };
    let client: ReturnType<typeof convex>;
    try {
      client = convex();
    } catch (e) {
      setFatal(errorText(e));
      return;
    }
    const credentials = { code: connection.code, token: connection.token };
    const run = async (name: string, args: Record<string, unknown>) => {
      useLiveStatus.setState({ pending: true, error: "" });
      try {
        await client.mutation(roomMutation(name), { ...credentials, ...args });
      } catch (e) {
        if (alive) {
          useLiveStatus.setState({ error: errorText(e) });
          useNight.setState({ error: errorText(e) });
        }
      } finally {
        if (alive) useLiveStatus.setState({ pending: false });
      }
    };
    setLiveTransport((action, ...args) => {
      if (action === "tick") return true;
      if (action === "send") {
        if (
          useLiveStatus.getState().pending ||
          !client.connectionState().isWebSocketConnected
        )
          return false;
        const r = useNight.getState().night?.round;
        if (r)
          void run("send", { roundId: r.id, phase: r.phase, value: args[0] });
        return !!r;
      }
      if (action === "updatePlayer" || action === "removePlayer") {
        void run("edit", {
          playerId: args[0],
          ...(action === "removePlayer"
            ? { remove: true }
            : { name: args[1].name, avatar: args[1].avatar }),
        });
        return true;
      }
      if (connection.role !== "host") return true;
      if (
        [
          "startNight",
          "next",
          "begin",
          "pause",
          "resume",
          "lockLobby",
          "addTime",
          "skip",
          "fallback",
          "rematch",
          "finish",
          "presented",
        ].includes(action)
      ) {
        if (useLiveStatus.getState().pending) return true;
        const n = useNight.getState().night,
          r = n?.round;
        void run("command", {
          action,
          status: n?.status,
          ...(action === "begin" ? { practice: !!args[0] } : {}),
          ...(r
            ? { roundId: r.id, phase: r.phase, revealReady: r.revealReady }
            : {}),
        });
      }
      return true;
    }, snapshot);
    let liveDrafts = {};
    try {
      liveDrafts = JSON.parse(
        localStorage.getItem(
          `afterparty-drafts-${code}-${connection.playerId}`,
        ) || "{}",
      );
    } catch {}
    useNight.setState({
      night: null,
      needsResume: false,
      error: "",
      drafts: liveDrafts,
    });
    const offDrafts = useNight.subscribe((s, before) => {
      if (s.drafts !== before.drafts) {
        try {
          localStorage.setItem(
            `afterparty-drafts-${code}-${connection.playerId}`,
            JSON.stringify(s.drafts),
          );
        } catch {}
      }
    });
    const unsubscribe = client.onUpdate(
      roomQuery,
      credentials,
      (view) => {
        if (!alive) return;
        setRoom(view);
        setFatal("");
        useNight.setState({
          night: view.night,
          needsResume: false,
          demo: {
            ...saved.demo,
            view: "tv",
            auto: false,
            controlled: view.playerId,
            preview: view.playerId,
            disconnected: [],
          },
        });
      },
      (e) => {
        if (alive) setFatal(errorText(e));
      },
    );
    useLiveStatus.setState({
      connected: client.connectionState().isWebSocketConnected,
      pending: false,
      error: "",
    });
    const offConnection = client.subscribeToConnectionState((s) =>
      useLiveStatus.setState({ connected: s.isWebSocketConnected }),
    );
    return () => {
      alive = false;
      unsubscribe();
      offConnection();
      offDrafts();
      setLiveTransport(null);
      useNight.setState({
        ...snapshot,
        needsResume: saved.needsResume,
        error: "",
      });
    };
  }, [connection]);
  if (!connection)
    return (
      <div className="night-ui n-live-join">
        <Brand />
        <h1>Connect to your room.</h1>
        <p>
          {role === "host"
            ? "The host controls are saved in the browser that created the room."
            : "Join with the code on the shared screen."}
        </p>
        <Link className="n-button" to={`/join?room=${code}`}>
          Join room
        </Link>
        <Link to="/setup">Set up a night</Link>
      </div>
    );
  if (fatal || !room || !n || roomCode(n) !== code)
    return (
      <div className="night-ui n-live-join">
        <Brand />
        <h1>
          {fatal ? "Couldn’t open this room." : "Connecting to the party…"}
        </h1>
        {fatal && <p role="alert">{fatal}</p>}
        <Link to={`/join?room=${code}`}>Join again</Link>
        <Link to="/setup">Back to setup</Link>
      </div>
    );
  const host = room.role === "host",
    player = room.role === "player",
    me = n.players.find((p) => p.id === room.playerId);
  let joinUrl = "";
  try {
    const u = new URL(base);
    if (!["http:", "https:"].includes(u.protocol)) throw Error();
    joinUrl = appJoinUrl(base, code);
  } catch {
    /* The host sees validation beside the address input. */
  }
  const command = (
    action: "startNight" | "next" | "pause" | "rematch" | "finish",
  ) => useNight.getState()[action]();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
    } catch {
      useLiveStatus.setState({
        error: "Copy the joining address shown below.",
      });
    }
  };
  return (
    <div
      className={`night-ui n-session n-live ${player ? "n-live-player" : ""}`}
    >
      <header className="n-live-header">
        <Brand />
        <span className="n-live-connection" role="status">
          {status.connected ? <Wifi size={17} /> : <WifiOff size={17} />}{" "}
          {status.connected ? `Live · ${code}` : "Reconnecting…"}
        </span>
        <SoundButton />
        <Link to="/" aria-label="Leave room">
          <LogOut size={19} />
        </Link>
      </header>
      {!status.connected && (
        <p className="n-live-notice" role="status">
          Connection lost. Reconnecting automatically. Your accepted answers are
          saved.
        </p>
      )}
      {status.error && (
        <p className="n-live-error" role="alert">
          {status.error}
        </p>
      )}
      {host && (
        <div className="n-live-host-tools">
          <b>{n.name}</b>
          <span>
            {n.players.length}/{room.capacity} players
          </span>
          <Link
            className="n-text-button"
            target="_blank"
            rel="noreferrer"
            to={`/room?room=${code}&role=display&key=${room.displayToken}`}
          >
            <Monitor size={17} /> Open TV display
          </Link>
          <Action
            secondary
            disabled={status.pending}
            onClick={() => command("finish")}
          >
            End night
          </Action>
        </div>
      )}
      {n.status === "lobby" ? (
        player && me ? (
          <div className="n-live-waiting">
            <Sticker player={me} size={130} />
            <h1>{me.name}</h1>
            <p>You’re in. Waiting for the host.</p>
            <FaceEditor
              player={me}
              onChange={(avatar) =>
                useNight.getState().updatePlayer(me.id, { avatar })
              }
            />
            <Action
              secondary
              onClick={() => {
                useNight.getState().removePlayer(me.id);
                navigate(`/join?room=${code}`);
              }}
            >
              Leave room
            </Action>
          </div>
        ) : (
          <>
            <LobbyScene night={n} tvOnly={!host} live joinUrl={joinUrl} />
            {host && (
              <section className="n-live-address">
                <h2>Connect your phones.</h2>
                <p>
                  {localHost
                    ? "Use the same Wi-Fi. Scan the QR code with your phone’s camera, or open this link."
                    : "Scan the QR code with your phone’s camera, or share this link."}
                </p>
                <label>
                  App address
                  <input
                    aria-label="App address"
                    list="network-addresses"
                    value={base}
                    readOnly={!localHost}
                    onChange={(e) => {
                      setBase(e.target.value);
                      setCopied(false);
                      try {
                        localStorage.setItem(
                          "afterparty-join-base",
                          e.target.value,
                        );
                      } catch {}
                    }}
                  />
                </label>
                <datalist id="network-addresses">
                  {addresses.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
                {joinUrl ? (
                  <>
                    <a href={joinUrl} target="_blank" rel="noreferrer">
                      {joinUrl}
                    </a>
                    <Action secondary onClick={copy}>
                      {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
                      {copied ? "Link copied" : "Copy join link"}
                    </Action>
                  </>
                ) : (
                  <p role="alert">
                    Enter a full http:// or https:// app address.
                  </p>
                )}
                {joinUrl.includes("localhost") ||
                joinUrl.includes("127.0.0.1") ? (
                  <p className="n-live-error">
                    Phones can’t reach localhost. Choose your computer’s Wi-Fi
                    address above, or use a deployed app URL.
                  </p>
                ) : null}
                <p className="n-field-help">
                  {localHost
                    ? "For different Wi-Fi networks, use a deployed frontend URL. The host computer must allow incoming connections on the app’s port."
                    : "Players can join from any internet connection. Keep the host controls open in this browser."}
                </p>
              </section>
            )}
          </>
        )
      ) : ["intro", "transition"].includes(n.status) ? (
        <section className="n-live-intro">
          <h1>{games[n.itinerary[n.segment].game].name}</h1>
          <p>{gameCopy[n.itinerary[n.segment].game].rule}</p>
          {host ? (
            <>
              <Action
                disabled={status.pending}
                onClick={() => useNight.getState().begin(true)}
              >
                Start practice
                <Play size={18} />
              </Action>
              <Action
                secondary
                disabled={status.pending}
                onClick={() => useNight.getState().begin(false)}
              >
                Start game
              </Action>
            </>
          ) : (
            <p>Waiting for the host to start.</p>
          )}
        </section>
      ) : ["finale", "finished"].includes(n.status) ? (
        <>
          <Podium night={n} />
          <Standings night={n} full />
          {host && (
            <Action
              disabled={status.pending}
              onClick={() => command("rematch")}
            >
              Play again
            </Action>
          )}
        </>
      ) : player ? (
        <fieldset
          className="n-live-controller"
          disabled={!status.connected || status.pending}
        >
          <Player night={n} />
        </fieldset>
      ) : (
        <div className="n-live-stage">
          <Stage night={n} />
          {host && (
            <fieldset disabled={status.pending || !status.connected}>
              <HostBar night={n} expanded />
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}
