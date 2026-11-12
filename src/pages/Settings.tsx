import { RotateCcw } from "lucide-react";
import { Button } from "../components/ui";
import { useParty } from "../store";

import { PageTitle } from "../components/Host";
export function SettingsPage() {
  const s = useParty();
  return (
    <>
      <PageTitle
        title="Make it your kind of night"
        description="A few small tweaks. A very good time."
      />
      <section className="panel settings-panel">
        <h2>Party settings</h2>
        <label>
          Party name
          <input
            value={s.settings.party}
            onChange={(e) => s.configure({ party: e.target.value })}
          />
        </label>
        <div className="form-grid">
          <label>
            Rounds per game
            <input
              type="number"
              min="1"
              max="20"
              value={s.settings.rounds}
              onChange={(e) =>
                s.configure({
                  rounds: Math.max(1, Math.min(20, Number(e.target.value))),
                })
              }
            />
          </label>
          <label>
            Answer timer (seconds)
            <input
              type="number"
              min="10"
              max="120"
              value={s.settings.timer}
              onChange={(e) =>
                s.configure({
                  timer: Math.max(10, Math.min(120, Number(e.target.value))),
                })
              }
            />
          </label>
        </div>
        <h3>Guess Who scoring</h3>
        <div className="form-grid">
          <label>
            Correct identity points
            <input
              type="number"
              min="0"
              max="500"
              value={s.settings.base}
              onChange={(e) =>
                s.configure({
                  base: Math.max(0, Math.min(500, Number(e.target.value))),
                })
              }
            />
          </label>
          <label>
            Maximum speed bonus
            <input
              type="number"
              min="0"
              max="500"
              value={s.settings.speed}
              onChange={(e) =>
                s.configure({
                  speed: Math.max(0, Math.min(500, Number(e.target.value))),
                })
              }
            />
          </label>
        </div>
        <p>
          Speed bands: 100% bonus within 5 seconds, 75% within 10, 37.5% within
          20, then 0. New settings apply when a round starts.
        </p>
        <h3>Presentation</h3>
        <label className="toggle-row">
          <span>
            <b>Sound effects</b>
            <small>
              Original synthesized tones. Audio starts after interaction.
            </small>
          </span>
          <input
            type="checkbox"
            checked={s.settings.sound}
            onChange={(e) => s.configure({ sound: e.target.checked })}
          />
        </label>
        <label className="toggle-row">
          <span>
            <b>Reduced motion</b>
            <small>
              Keep things calm. Your system preference is also respected.
            </small>
          </span>
          <input
            type="checkbox"
            checked={s.settings.reduced}
            onChange={(e) => s.configure({ reduced: e.target.checked })}
          />
        </label>
        <h3>Local storage</h3>
        <p>
          Questions, scores, settings, and your active round save automatically
          on this browser.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            if (
              confirm(
                "Restore default questions and settings? Championship scores will remain.",
              )
            )
              s.resetDefaults();
          }}
        >
          <RotateCcw size={15} />
          Restore default questions & settings
        </Button>
      </section>
    </>
  );
}
