import { Face, faceStyle } from "./Faces";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Fingerprint,
  Sparkles,
  Target,
  VenetianMask,
  X,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from "react";
import type { Game, Player } from "../../engine";
import { useParty } from "../../store";
import { useNight } from "../../session/store";

export function Brand() {
  return (
    <Link to="/" className="n-brand" aria-label="Afterparty home">
      afterparty
      <span aria-hidden="true">
        <Sparkles size={23} strokeWidth={2.7} />
      </span>
    </Link>
  );
}
export function Action({
  children,
  secondary = false,
  quiet = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
  quiet?: boolean;
}) {
  return (
    <button
      {...props}
      className={`n-button ${secondary ? "n-secondary" : ""} ${quiet ? "n-quiet" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
export function GameIcon({ game, size = 24 }: { game: Game; size?: number }) {
  const Icon =
    game === "ballpark"
      ? Target
      : game === "bluff"
        ? VenetianMask
        : Fingerprint;
  return <Icon size={size} strokeWidth={2} />;
}
export const characterNames = [
  "Frog",
  "Tiger",
  "Flower",
  "Alien",
  "Cherries",
  "Bear",
  "Mushroom",
  "Star",
];
export function Sticker({
  player,
  index,
  size = 64,
  className = "",
}: {
  player?: Pick<Player, "avatar" | "id">;
  index?: number;
  size?: number;
  className?: string;
}) {
  const seed = index ?? (Number(player?.id.replace("p", "")) || 0);
  return (
    <span
      className={`n-sticker n-face ${className}`}
      aria-hidden="true"
      style={{ "--sticker-size": `${size}px` } as CSSProperties}
    >
      <Face style={faceStyle(player?.avatar ?? String(seed), seed)} />
    </span>
  );
}
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="n-overlay" />
        <Dialog.Content
          className={`night-ui n-sheet ${wide ? "n-sheet-wide" : ""}`}
        >
          <header>
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close className="n-icon-button" aria-label="Close dialog">
              <X size={21} />
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Confirm({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  label: string;
}) {
  return (
    <Sheet {...{ open, onOpenChange, title, description }}>
      <div className="n-dialog-actions">
        <Action secondary onClick={() => onOpenChange(false)}>
          Keep playing
        </Action>
        <Action
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {label}
        </Action>
      </div>
    </Sheet>
  );
}
export function SoundButton() {
  const settings = useParty((s) => s.settings),
    configure = useParty((s) => s.configure);
  return (
    <button
      className="n-icon-button"
      aria-label={settings.sound ? "Turn sound off" : "Turn sound on"}
      aria-pressed={settings.sound}
      onClick={() => configure({ sound: !settings.sound })}
    >
      {settings.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
    </button>
  );
}
export function Itinerary({ compact = false }: { compact?: boolean }) {
  const n = useNight((s) => s.night);
  if (!n) return null;
  return (
    <ol
      className={`n-itinerary ${compact ? "n-itinerary-compact" : ""}`}
      aria-label="Tonight’s games"
    >
      {n.itinerary.map((s, i) => (
        <li
          key={s.id}
          className={`${i === n.segment ? "is-current" : ""} ${n.stamps.includes(s.id) ? "is-done" : ""}`}
        >
          <span className={`n-game-token game-${s.game}`}>
            {n.stamps.includes(s.id) ? (
              <Check size={18} />
            ) : (
              <GameIcon game={s.game} size={18} />
            )}
          </span>
          <span>
            {s.game === "ballpark"
              ? "Ballpark"
              : s.game === "bluff"
                ? "Bluff Battle"
                : "Guess Who"}
            {!compact && (
              <small>
                {n.stamps.includes(s.id)
                  ? "Completed"
                  : `${s.rounds} round${s.rounds === 1 ? "" : "s"}`}
              </small>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`n-notice ${error ? "n-notice-error" : ""}`}
      role={error ? "alert" : undefined}
    >
      {children}
    </div>
  );
}
