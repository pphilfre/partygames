import { Link } from "react-router-dom";
import { useParty } from "../store";
import { useNight } from "../session/store";
import { Notice } from "../components/night/common";
export function SettingsPage() {
  const s = useParty(),
    night = useNight((v) => v.night);
  return (
    <div className="n-preferences">
      <h1>Make yourself comfortable.</h1>
      <p>
        Personal preferences for this browser. Your next game night can have its
        own pace.
      </p>
      <section>
        <h2>The way it feels.</h2>
        {(
          [
            {
              key: "sound",
              title: "Music & sound",
              copy: "Background music and game sounds. Off by default.",
            },
            {
              key: "haptics",
              title: "Haptic feedback",
              copy: "Light taps on supported devices. Visual feedback always stays available.",
            },
            {
              key: "reduced",
              title: "Reduced motion",
              copy: "Keep the character cast still. Your system’s reduced-motion preference is always respected.",
            },
          ] as const
        ).map((o) => (
          <label className="n-toggle" key={o.key}>
            <span>
              <b>{o.title}</b>
              <small>{o.copy}</small>
            </span>
            <input
              type="checkbox"
              checked={s.settings[o.key] ?? true}
              onChange={(e) => s.configure({ [o.key]: e.target.checked })}
            />
          </label>
        ))}
      </section>
      <section>
        <h2>Tonight’s rules.</h2>
        <p>
          Choose timed or untimed play, speed bonuses, question packs, cast, and
          the game order in setup. Rules are fixed for each attempt when it
          starts.
        </p>
        {night && (
          <Notice>
            Current night: {night.name}.{" "}
            {night.vibe === "comfortable"
              ? "Untimed with no speed bonus."
              : night.vibe === "competitive"
                ? "Timed with speed bonuses."
                : "Timed with no speed bonus."}
          </Notice>
        )}
        <Link className="n-button n-secondary" to="/setup">
          Set up a night
        </Link>
        <details className="n-details">
          <summary>Advanced Guess Who scoring</summary>
          <div className="n-form-two">
            <label>
              Correct identity points
              <input
                type="number"
                min={0}
                max={500}
                value={s.settings.base}
                onChange={(e) =>
                  s.configure({
                    base: Math.max(
                      0,
                      Math.min(500, Number(e.target.value) || 0),
                    ),
                  })
                }
              />
            </label>
            <label>
              Maximum speed points
              <input
                type="number"
                min={0}
                max={500}
                value={s.settings.speed}
                onChange={(e) =>
                  s.configure({
                    speed: Math.max(
                      0,
                      Math.min(500, Number(e.target.value) || 0),
                    ),
                  })
                }
              />
            </label>
          </div>
          <p>
            Applies to future attempts. Speed points apply only to the
            competitive setting. Speed bands: full bonus within 5 seconds; 75%
            within 10; 37.5% within 20; then zero.
          </p>
        </details>
      </section>
      <section>
        <h2>A local night, saved here.</h2>
        <p>
          Names, accepted answers, score history, drafts, questions, and
          preferences save in this browser. This demo has no accounts or remote
          joining.
        </p>
        <p>
          Refresh pauses an active night until you resume. Export results or
          reset the demo from Demo tools during your night. Custom questions and
          preferences are preserved when you reset a demo.
        </p>
      </section>
    </div>
  );
}
