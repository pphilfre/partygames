import { QRCodeSVG } from "qrcode.react";
import { FaceEditor } from "./Faces";
import {
  Check,
  ChevronRight,
  Copy,
  LockKeyhole,
  Maximize2,
  Play,
  Smartphone,
  UnlockKeyhole,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { games, makePlayers } from "../../engine";
import { lobbyPlayers, roomCode, type Night } from "../../session/model";
import { useNight } from "../../session/store";
import { Action, GameIcon, Sheet, SoundButton, Sticker } from "./common";

export function LobbyScene({
  night: n,
  playerOnly = false,
  tvOnly = false,
  live = false,
  joinUrl,
}: {
  night: Night;
  playerOnly?: boolean;
  tvOnly?: boolean;
  live?: boolean;
  joinUrl?: string;
}) {
  const s = useNight();
  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [code, setCode] = useState(
    new URLSearchParams(window.location.search).get("room") || "",
  );
  const [mobileTab, setMobileTab] = useState<"room" | "phone">("room");
  const me =
    n.players.find((p) => p.id === s.demo.controlled) ||
    n.players[0] ||
    makePlayers(1)[0];
  const [name, setName] = useState(me.name);
  useEffect(() => {
    setName(me.name);
    setCode(new URLSearchParams(window.location.search).get("room") || "");
  }, [me.id]);
  const cast = lobbyPlayers(n);
  const joined = cast.some((p) => p.id === me.id);
  const p = n.players.find((p) => p.id === editing);
  const pin = roomCode(n);
  const formatted = `${pin.slice(0, 3)} ${pin.slice(3)}`;
  const locked = !!n.lobby?.locked;
  const ready = cast.length >= 4;
  return (
    <section
      className={`n-room-layout n-room-mobile-${mobileTab} ${playerOnly ? "n-room-player-only" : ""} ${tvOnly ? "n-room-tv-only" : ""}`}
      aria-label="Game lobby"
    >
      {!playerOnly && !tvOnly && (
        <div
          className="n-lobby-mobile-tabs"
          role="group"
          aria-label="Lobby preview"
        >
          <button
            aria-pressed={mobileTab === "room"}
            onClick={() => setMobileTab("room")}
          >
            Lobby screen
          </button>
          <button
            aria-pressed={mobileTab === "phone"}
            onClick={() => setMobileTab("phone")}
          >
            Your phone
          </button>
        </div>
      )}
      {!playerOnly && (
        <div className="n-room-main">
          {!tvOnly && (
            <div className="n-room-host">
              <div>
                <b>{ready ? "Ready to start" : "Waiting for players"}</b>
                <span>
                  {ready
                    ? ""
                    : `Waiting for ${4 - cast.length} more to reach the four-player minimum.`}
                </span>
              </div>
              <div className="n-room-host-actions">
                <Action secondary aria-pressed={locked} onClick={s.lockLobby}>
                  {locked ? (
                    <LockKeyhole size={17} />
                  ) : (
                    <UnlockKeyhole size={17} />
                  )}
                  {locked ? "Unlock room" : "Lock room"}
                </Action>
                <Action
                  disabled={!ready || s.needsResume}
                  onClick={s.startNight}
                >
                  Start night
                  <Play size={19} />
                </Action>
              </div>
            </div>
          )}
          <div className="n-room-screen" id="lobby-display">
            <header className="n-room-screen-top">
              <span className="n-room-live">
                <span />
                {locked ? "Room locked" : "Lobby open"}
              </span>
              <div>
                <SoundButton />
                <button
                  className="n-icon-button"
                  aria-label="Make lobby fullscreen"
                  onClick={() => {
                    void document
                      .querySelector(".n-room-screen")
                      ?.requestFullscreen?.()
                      .catch(() => {});
                  }}
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </header>
            <div className="n-room-invitation">
              <h1>
                {live
                  ? ready
                    ? "Ready when you are."
                    : "Waiting for players."
                  : cast.length > 0 && cast.length === n.players.length
                    ? "Everybody’s here."
                    : "Waiting for players."}
              </h1>
              <div className="n-lobby-join">
                <div className="n-lobby-qr">
                  <QRCodeSVG
                    title={
                      live
                        ? "Join this room on your phone"
                        : "Open the player preview"
                    }
                    value={
                      live
                        ? joinUrl ||
                          `${window.location.origin}/join?room=${pin}`
                        : `${window.location.origin}/play?previewRoom=${pin}`
                    }
                    size={132}
                    marginSize={2}
                    level="M"
                  />
                  <span>Scan to open</span>
                </div>
                <div className="n-room-code">
                  <span>Room code</span>
                  <strong aria-label={`Room code ${pin}`}>{formatted}</strong>
                  <button
                    className="n-room-copy"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(pin);
                        setCopied(true);
                        setCopyError(false);
                      } catch {
                        setCopyError(true);
                      }
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Code copied" : "Copy code"}
                  </button>
                </div>
              </div>
            </div>
            <p className="n-room-demo-note">
              {live
                ? "Scan with your phone camera to join."
                : "Local demo · players are simulated."}
            </p>
            {copyError && (
              <p className="n-room-demo-note" role="status">
                Select the six digits above to copy the code manually.
              </p>
            )}
            <div className="n-lobby-roster">
              <div className="n-lobby-roster-heading">
                <h2>
                  <Users size={20} />
                  {cast.length} {cast.length === 1 ? "player" : "players"}{" "}
                  joined
                </h2>
                <span>
                  {locked
                    ? "Joining paused"
                    : cast.length < n.players.length
                      ? "Waiting for the rest of the room…"
                      : "Everyone’s here!"}
                </span>
              </div>
              <div className="n-room-cast">
                {cast.map((player) => (
                  <button
                    key={player.id}
                    className="n-room-guest"
                    disabled={live && tvOnly}
                    onClick={() => setEditing(player.id)}
                    aria-label={`Edit ${player.name}`}
                  >
                    <Sticker player={player} size={72} />
                    <div>
                      <b>{player.name}</b>
                    </div>
                  </button>
                ))}
                {cast.length < n.players.length && (
                  <div className="n-room-empty-seat">
                    <Users size={25} />
                    <span>{n.players.length - cast.length} more invited</span>
                  </div>
                )}
              </div>
              <div className="n-room-arrival" role="status" aria-live="polite">
                {cast.length
                  ? `${cast[cast.length - 1].name} joined the party.`
                  : "Waiting for players"}
              </div>
            </div>
            <footer className="n-room-screen-footer">
              <span>afterparty</span>
              <span>{n.name}</span>
            </footer>
          </div>
          {!tvOnly && (
            <div className="n-room-lineup">
              <div>
                <h2>Tonight’s running order</h2>
                <Link to="/setup">Edit lineup</Link>
              </div>
              <ol>
                {n.itinerary.map((seg, i) => (
                  <li key={seg.id} className={`game-${seg.game}`}>
                    <span className="n-room-lineup-number">{i + 1}</span>
                    <GameIcon game={seg.game} size={23} />
                    <div>
                      <b>{games[seg.game].name}</b>
                      <span>
                        {seg.rounds} {seg.rounds === 1 ? "round" : "rounds"}
                        {i === 0 ? " · Everyone plays first" : ""}
                      </span>
                    </div>
                    {i < n.itinerary.length - 1 && <ChevronRight size={18} />}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      {!tvOnly && (
        <aside className="n-room-phone-column">
          <div className="n-phone-preview-label">
            <Smartphone size={15} />
            Your phone<span>Local player preview</span>
          </div>
          <div className="n-room-phone">
            <div className="n-room-phone-brand">afterparty</div>
            {joined ? (
              <div className="n-room-waiting">
                <div className="n-room-my-character">
                  <Sticker player={me} size={150} />
                  <span>
                    <Check size={20} />
                  </span>
                </div>
                <h2>{me.name}</h2>
                <div className="n-room-waiting-status">
                  <span />
                  Waiting for the host
                </div>
                <button
                  className="n-text-button"
                  onClick={() => setEditing(me.id)}
                >
                  Edit your avatar
                </button>
                <button
                  className="n-text-button n-room-try-join"
                  onClick={() => {
                    s.leaveLobby();
                    setCode("");
                    setName(me.name);
                  }}
                >
                  Try joining with the code
                </button>
              </div>
            ) : (
              <form
                className="n-room-join-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  s.joinLobby(code, name);
                }}
              >
                <h2>Join the party.</h2>
                <p>Enter the code on the shared screen.</p>
                <label>
                  Room code
                  <input
                    name="room-code"
                    autoComplete="off"
                    inputMode="numeric"
                    placeholder="000 000"
                    maxLength={7}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/[^\d\s]/g, ""))
                    }
                    required
                  />
                </label>
                <label>
                  Your name
                  <input
                    name="player-name"
                    value={name}
                    maxLength={32}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                {locked && (
                  <p className="n-room-join-error">
                    The host has locked this room. Unlock it on the shared
                    screen to join.
                  </p>
                )}
                <Action
                  type="submit"
                  disabled={
                    locked ||
                    !name.trim() ||
                    code.replace(/\s/g, "").length !== 6
                  }
                >
                  Join room
                  <ChevronRight size={19} />
                </Action>
                <small>Preview only. This joins the local demo.</small>
              </form>
            )}
            <div className="n-room-phone-pin">Room {formatted}</div>
          </div>
          {!playerOnly && (
            <div className="n-room-demo-actions">
              <b>Demo players</b>
              <p></p>
              <button
                className="n-text-button"
                disabled={
                  locked ||
                  cast.length === n.players.filter((p) => p.connected).length
                }
                onClick={s.fillLobby}
              >
                Fill demo lobby
                <Users size={15} />
              </button>
            </div>
          )}
        </aside>
      )}
      <Sheet
        open={!!p}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title="Edit player"
        description="Choose your look."
      >
        {p && (
          <>
            <label>
              Display name
              <input
                maxLength={32}
                value={p.name}
                onChange={(e) => s.updatePlayer(p.id, { name: e.target.value })}
                onBlur={() => {
                  if (!p.name.trim()) s.updatePlayer(p.id, { name: "Guest" });
                }}
              />
            </label>
            <FaceEditor
              player={p}
              onChange={(avatar) => s.updatePlayer(p.id, { avatar })}
            />
            <div className="n-dialog-actions">
              <Action onClick={() => setEditing(null)}>
                Save avatar
                <Check size={17} />
              </Action>
            </div>
          </>
        )}
      </Sheet>
    </section>
  );
}
