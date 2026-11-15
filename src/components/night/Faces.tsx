import type { Player } from "../../engine";

export type FaceStyle = {
  skin: number;
  hair: number;
  hairColor: number;
  eyes: number;
  eyeColor: number;
  glasses: number;
  moustache: number;
};
export const skins = [
  "#F8D9B8",
  "#E9B185",
  "#C98B63",
  "#9A6042",
  "#694333",
  "#F3C8AE",
];
export const hairColors = [
  "#28202B",
  "#624334",
  "#B77738",
  "#E7C66B",
  "#A8A6B5",
  "#A84368",
];
export const eyeColors = [
  "#272336",
  "#79502F",
  "#28638B",
  "#3E754E",
  "#776C57",
];
export function faceStyle(avatar: string, seed = 0): FaceStyle {
  if (avatar.startsWith("face:")) {
    try {
      return { ...faceStyle("", seed), ...JSON.parse(avatar.slice(5)) };
    } catch {
      /* Fall back to a preset. */
    }
  }
  const n =
    Number.isFinite(Number(avatar)) && avatar !== "" ? Number(avatar) : seed;
  return {
    skin: n % skins.length,
    hair: n % 6,
    hairColor: (n * 3 + Math.floor(n / 4)) % hairColors.length,
    eyes: n % 4,
    eyeColor: n % eyeColors.length,
    glasses: n % 4 === 1 ? 1 : 0,
    moustache: n % 5 === 3 ? 1 : 0,
  };
}
export const faceAvatar = (style: FaceStyle) => `face:${JSON.stringify(style)}`;
export function Face({ style: f }: { style: FaceStyle }) {
  const skin = skins[f.skin % skins.length],
    hair = hairColors[f.hairColor % hairColors.length];
  return (
    <svg viewBox="0 0 100 108" fill="none" aria-hidden="true">
      <path
        d="M12 108C13 82 29 78 50 78s37 4 38 30"
        fill={["#6142D8", "#2258C7", "#137451", "#BB334D"][f.eyes % 4]}
      />
      <path d="M40 76v14c7 6 13 6 20 0V76" fill={skin} />
      {f.hair === 4 && (
        <path d="M15 79V36C15 4 85 3 85 36v46L68 91 31 88Z" fill={hair} />
      )}
      <ellipse cx="23" cy="52" rx="9" ry="12" fill={skin} />
      <ellipse cx="77" cy="52" rx="9" ry="12" fill={skin} />
      <rect x="23" y="15" width="54" height="70" rx="27" fill={skin} />
      {f.hair === 0 && (
        <path
          d="M23 42C13 12 38 4 52 6c21-5 34 15 25 36l-8-22C51 35 42 25 30 29Z"
          fill={hair}
        />
      )}
      {f.hair === 1 && (
        <path d="M22 40V24C22 3 79 4 79 29v11l-10-15-40 4Z" fill={hair} />
      )}
      {f.hair === 2 && (
        <path
          d="M20 43C2 20 24 2 38 11 46-4 69 1 70 14c25-3 23 27 9 30l-7-15c-16 10-26-3-40 2Z"
          fill={hair}
        />
      )}
      {f.hair === 3 && (
        <path
          d="M23 38C19 22 27 12 40 10c17-5 35 1 38 17l-7-7c-20 13-28 7-41 13Z"
          fill={hair}
        />
      )}
      {f.hair === 4 && (
        <path
          d="M22 43V26c3-21 53-23 56 4v13L64 22C49 39 33 29 28 36Z"
          fill={hair}
        />
      )}
      <path
        d="M32 43l10-2M58 41l10 2"
        stroke={hair}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {f.eyes === 2 ? (
        <path
          d="M33 53q4-6 8 0m18 0q4-6 8 0"
          stroke="#272336"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse
            cx="37"
            cy="52"
            rx={f.eyes === 1 ? 6 : 5}
            ry={f.eyes === 3 ? 4 : 6}
            fill="white"
          />
          <ellipse
            cx="63"
            cy="52"
            rx={f.eyes === 1 ? 6 : 5}
            ry={f.eyes === 3 ? 4 : 6}
            fill="white"
          />
          <ellipse
            cx="37"
            cy="52"
            rx={f.eyes === 1 ? 4 : 3}
            ry={f.eyes === 3 ? 3 : 5}
            fill={eyeColors[f.eyeColor % eyeColors.length]}
          />
          <ellipse
            cx="63"
            cy="52"
            rx={f.eyes === 1 ? 4 : 3}
            ry={f.eyes === 3 ? 3 : 5}
            fill={eyeColors[f.eyeColor % eyeColors.length]}
          />
          <circle cx="38" cy="50" r="1" fill="white" />
          <circle cx="64" cy="50" r="1" fill="white" />
        </>
      )}
      <path
        d="M49 54l-3 8h6"
        stroke="#774D3A"
        strokeOpacity=".45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M40 69q10 11 20 0"
        fill="white"
        stroke="#51352F"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {f.moustache === 1 && (
        <path
          d="M50 63c-8-6-9 7-19 3 4 11 15 6 19 2 4 4 15 9 19-2-10 4-11-9-19-3"
          fill={hair}
        />
      )}
      {f.moustache === 2 && <path d="M37 64q13-7 26 0v4H37Z" fill={hair} />}
      {f.moustache === 3 && (
        <path d="M26 61q4 24 24 24t24-24l-8 7-6 9H40l-6-9Z" fill={hair} />
      )}
      {f.glasses > 0 && (
        <g stroke={f.glasses === 2 ? "#BA3F54" : "#25283D"} strokeWidth="3">
          <rect
            x="27"
            y="45"
            width="19"
            height="15"
            rx={f.glasses === 2 ? 7 : 4}
            fill={f.glasses === 3 ? "#25283D" : "none"}
          />
          <rect
            x="54"
            y="45"
            width="19"
            height="15"
            rx={f.glasses === 2 ? 7 : 4}
            fill={f.glasses === 3 ? "#25283D" : "none"}
          />
          <path d="M46 50h8M22 48l5 1m46 0 5-1" />
        </g>
      )}
    </svg>
  );
}
export function FaceEditor({
  player,
  onChange,
}: {
  player: Pick<Player, "id" | "avatar">;
  onChange: (avatar: string) => void;
}) {
  const f = faceStyle(player.avatar, Number(player.id.replace("p", "")) || 0);
  const controls: [keyof FaceStyle, string, string[]][] = [
    ["skin", "Skin colour", skins],
    ["hair", "Hair", ["Sweep", "Short", "Curls", "Side part", "Long", "Bald"]],
    ["hairColor", "Hair colour", hairColors],
    ["eyes", "Eyes", ["Classic", "Wide", "Happy", "Relaxed"]],
    ["eyeColor", "Eye colour", eyeColors],
    ["moustache", "Facial hair", ["None", "Moustache", "Trimmed", "Beard"]],
    ["glasses", "Glasses", ["None", "Square", "Round", "Sunglasses"]],
  ];
  return (
    <div className="n-face-editor">
      <div className="n-face-preview">
        <Face style={f} />
      </div>
      {controls.map(([key, label, options]) => (
        <fieldset key={key}>
          <legend>{label}</legend>
          <div>
            {options.map((option, i) => (
              <button
                type="button"
                key={option}
                aria-label={
                  option.startsWith("#") ? `${label} ${i + 1}` : option
                }
                aria-pressed={f[key] === i}
                className={option.startsWith("#") ? "n-colour-swatch" : ""}
                style={
                  option.startsWith("#") ? { background: option } : undefined
                }
                onClick={() => onChange(faceAvatar({ ...f, [key]: i }))}
              >
                {!option.startsWith("#") && option}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
