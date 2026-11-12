import { type Game } from "../engine";
export function GameArt({
  game,
  hero = false,
}: {
  game: Game;
  hero?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={`game-art ${hero ? "hero-art" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`dots-${game}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="#161716" opacity=".12" />
        </pattern>
      </defs>
      <rect width="400" height="220" fill={`url(#dots-${game})`} />
      {game === "bluff" ? (
        <>
          <path
            d="M78 153L95 70 155 60 171 151Z"
            fill="#9a77c7"
            stroke="#222"
            strokeWidth="3"
          />
          <path
            d="M85 77L121 28 159 68"
            fill="#f7f3dd"
            stroke="#222"
            strokeWidth="3"
          />
          <circle cx="116" cy="102" r="5" />
          <circle cx="144" cy="101" r="5" />
          <path
            d="M117 123Q132 138 145 118"
            fill="none"
            stroke="#222"
            strokeWidth="3"
          />
          <g transform="rotate(13 245 100)">
            <rect
              x="190"
              y="41"
              width="106"
              height="142"
              rx="19"
              fill="#fff9e9"
              stroke="#222"
              strokeWidth="3"
            />
            <path
              d="M210 83Q226 65 241 84M253 84Q269 66 281 84"
              stroke="#222"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M224 114L275 114Q250 153 224 114"
              fill="#ff7158"
              stroke="#222"
              strokeWidth="3"
            />
            <path
              d="M200 49L212 30M282 50L296 31"
              stroke="#222"
              strokeWidth="3"
            />
          </g>
          <path
            d="M310 136L321 119 332 138 351 143 335 154 331 175 316 159 296 157Z"
            fill="#faef9d"
            stroke="#222"
            strokeWidth="2"
          />
          <path
            d="M49 47L55 35M56 52L70 48M168 191L179 176"
            stroke="#222"
            strokeWidth="3"
          />
        </>
      ) : game === "who" ? (
        <>
          <g transform="rotate(-12 135 115)">
            <rect
              x="62"
              y="47"
              width="121"
              height="146"
              rx="15"
              fill="#f6f5df"
              stroke="#222"
              strokeWidth="3"
            />
            <path
              d="M91 162Q88 123 124 123Q161 123 158 162"
              fill="#9f83c7"
              stroke="#222"
              strokeWidth="3"
            />
            <circle
              cx="124"
              cy="101"
              r="29"
              fill="#ffb88a"
              stroke="#222"
              strokeWidth="3"
            />
            <path
              d="M96 97Q82 56 121 66Q157 58 152 97L134 77 119 94Z"
              fill="#242522"
            />
            <circle cx="114" cy="102" r="3" />
            <circle cx="134" cy="102" r="3" />
            <path
              d="M117 115Q125 121 133 113"
              fill="none"
              stroke="#222"
              strokeWidth="2"
            />
          </g>
          <g transform="rotate(12 260 108)">
            <rect
              x="195"
              y="25"
              width="123"
              height="150"
              rx="16"
              fill="#516948"
              stroke="#222"
              strokeWidth="3"
            />
            <text
              x="256"
              y="133"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="110"
              fontWeight="800"
              fill="#e3efb8"
            >
              ?
            </text>
          </g>
          <path
            d="M330 144L337 129 344 146 362 153 344 160 339 178 332 161 315 154Z"
            fill="#fff0a0"
            stroke="#222"
            strokeWidth="2"
          />
          <path
            d="M38 80L49 75M329 46L344 35M352 60L366 57"
            stroke="#222"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <path d="M64 168L337 168" stroke="#222" strokeWidth="3" />
          <path
            d="M85 159V180M138 159V180M191 159V180M244 159V180M297 159V180"
            stroke="#222"
            strokeWidth="3"
          />
          <g transform="rotate(-13 177 95)">
            <rect
              x="117"
              y="47"
              width="123"
              height="102"
              rx="24"
              fill="#ff7659"
              stroke="#222"
              strokeWidth="3"
            />
            <text
              x="178"
              y="119"
              textAnchor="middle"
              fontSize="66"
              fontFamily="sans-serif"
              fontWeight="800"
              fill="#262521"
            >
              42
            </text>
          </g>
          <path
            d="M246 89L270 35 294 89 281 82 281 137 260 137 260 82Z"
            fill="#f8f1cc"
            stroke="#222"
            strokeWidth="3"
          />
          <circle
            cx="75"
            cy="73"
            r="18"
            fill="#a6bb93"
            stroke="#222"
            strokeWidth="3"
          />
          <path
            d="M322 104L329 89 337 103 355 108 340 119 338 137 324 124 307 122Z"
            fill="#f7e18a"
            stroke="#222"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}
export function PartyArt() {
  return (
    <svg viewBox="0 0 420 270" className="party-art" aria-hidden="true">
      <path
        d="M90 229C42 195 53 131 116 125S170 44 231 46S292 118 341 127S384 213 329 233Z"
        fill="#f5c94f"
      />
      <g transform="rotate(-12 160 160)">
        <rect
          x="99"
          y="95"
          width="117"
          height="133"
          rx="37"
          fill="#e4d2f7"
          stroke="#282722"
          strokeWidth="3"
        />
        <path
          d="M111 103L95 58 140 92M181 94L219 64 208 122"
          fill="#e4d2f7"
          stroke="#282722"
          strokeWidth="3"
        />
        <ellipse cx="137" cy="144" rx="8" ry="12" />
        <ellipse cx="178" cy="144" rx="8" ry="12" />
        <path
          d="M132 177Q158 208 184 174"
          fill="#fff6da"
          stroke="#282722"
          strokeWidth="3"
        />
      </g>
      <g transform="rotate(13 285 160)">
        <path
          d="M230 206L237 103Q276 66 323 103L337 210Q286 239 230 206"
          fill="#b8cb8c"
          stroke="#282722"
          strokeWidth="3"
        />
        <circle
          cx="254"
          cy="111"
          r="22"
          fill="#b8cb8c"
          stroke="#282722"
          strokeWidth="3"
        />
        <circle
          cx="310"
          cy="111"
          r="22"
          fill="#b8cb8c"
          stroke="#282722"
          strokeWidth="3"
        />
        <circle cx="257" cy="112" r="6" />
        <circle cx="306" cy="112" r="6" />
        <path
          d="M259 161Q282 189 311 157"
          fill="#fff6da"
          stroke="#282722"
          strokeWidth="3"
        />
      </g>
      <path
        d="M55 87L67 60M50 113L25 108M346 66L361 44M366 91L393 85M187 39L178 17"
        stroke="#262522"
        strokeWidth="4"
      />
      <path
        d="M64 184L38 174M346 195L374 184"
        stroke="#262522"
        strokeWidth="4"
      />
      <path
        d="M88 39L96 27 103 41 119 45 105 54 103 70 91 58 76 56Z"
        fill="#fff5d8"
        stroke="#222"
        strokeWidth="2"
      />
      <circle cx="355" cy="145" r="7" fill="#fff5d8" />
    </svg>
  );
}
