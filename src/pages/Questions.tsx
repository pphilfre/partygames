import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui";
import { games, validateQuestion, type Game, type Question } from "../engine";
import { useParty } from "../store";

import { PageTitle } from "../components/Host";
export function Questions() {
  const s = useParty();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [category, setCategory] = useState("all"),
    [pack, setPack] = useState("all"),
    [editing, setEditing] = useState<Question | null>(null),
    [preview, setPreview] = useState<Question | null>(null),
    [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!editing) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing]);
  const filtered = s.questions.filter(
    (q) =>
      (filter === "all" || q.game === filter) &&
      (category === "all" || q.category === category) &&
      (pack === "all" || q.pack === pack) &&
      (q.text + " " + q.pack).toLowerCase().includes(search.toLowerCase()),
  );
  const blank = (): Question => ({
    id: crypto.randomUUID(),
    game: filter === "all" ? "bluff" : (filter as Game),
    text: "",
    answer: "",
    category: "Custom",
    pack: "My Party Pack",
    enabled: true,
    tolerance: 100,
    unit: "",
    difficulty: "Medium",
    skip: true,
    sensitivity: "Light",
  });
  return (
    <>
      <PageTitle
        title="Good questions. Better stories"
        description="Curate the questions that get your people talking."
      >
        <Button variant="secondary" onClick={() => file.current?.click()}>
          <Upload size={15} />
          Import JSON
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
              new Blob([JSON.stringify(s.questions, null, 2)], {
                type: "application/json",
              }),
            );
            a.download = "afterparty-questions.json";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          <Download size={15} />
          Export
        </Button>
        <Button
          onClick={() => {
            setEditing(blank());
            setError("");
          }}
        >
          <Plus size={16} />
          New question
        </Button>
      </PageTitle>
      <input
        type="file"
        hidden
        ref={file}
        accept="application/json"
        onChange={async (e) => {
          try {
            const data = JSON.parse(await e.target.files![0].text());
            if (
              !Array.isArray(data) ||
              data.some(
                (q) =>
                  !q.id ||
                  !["bluff", "who", "ballpark"].includes(q.game) ||
                  typeof q.text !== "string" ||
                  typeof q.answer !== "string" ||
                  typeof q.pack !== "string" ||
                  typeof q.category !== "string" ||
                  typeof q.enabled !== "boolean" ||
                  validateQuestion(q),
              ) ||
              new Set(data.map((q) => q.id)).size !== data.length
            )
              throw Error(
                "Invalid question file. Export the library to see the supported JSON format.",
              );
            s.replaceQuestions(data);
            setError("");
          } catch (err) {
            setError((err as Error).message);
          }
          e.target.value = "";
        }}
      />
      {error && (
        <div role="alert" className="inline-error">
          {error}
        </div>
      )}
      <div className="pack-cards">
        {Object.entries(games).map(([id, g]) => (
          <button
            key={id}
            style={{ background: g.color }}
            className={filter === id ? "selected" : ""}
            onClick={() => setFilter(filter === id ? "all" : id)}
          >
            <Layers size={23} />
            <strong>{g.name}</strong>
            <span>
              {s.questions.filter((q) => q.game === id).length} questions{" "}
              <ArrowUpRight size={16} />
            </span>
          </button>
        ))}
      </div>
      <div className="question-toolbar">
        <div className="search-input">
          <Search size={17} />
          <input
            aria-label="Search questions"
            placeholder="Find a good question…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {[...new Set(s.questions.map((q) => q.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Filter by pack"
          value={pack}
          onChange={(e) => setPack(e.target.value)}
        >
          <option value="all">All packs</option>
          {[...new Set(s.questions.map((q) => q.pack))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span>{filtered.length} questions</span>
      </div>
      <div className="question-list panel">
        {filtered.map((q) => (
          <div className="question-row" key={q.id}>
            <label className="question-enable">
              <input
                aria-label={`Enable ${q.text}`}
                type="checkbox"
                checked={q.enabled}
                onChange={(e) =>
                  s.saveQuestion({ ...q, enabled: e.target.checked })
                }
              />
            </label>
            <div>
              <span
                className="question-game"
                style={{ background: games[q.game].color }}
              >
                {games[q.game].name}
              </span>
              <button className="question-text" onClick={() => setPreview(q)}>
                {q.text}
              </button>
              <small>
                {q.pack} · {q.category}{" "}
                {q.game !== "who" && `· ${q.answer} ${q.unit || ""}`}
              </small>
            </div>
            <div className="button-row">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit question"
                onClick={() => {
                  setEditing(q);
                  setError("");
                }}
              >
                <Pencil size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Duplicate question"
                onClick={() =>
                  s.saveQuestion({
                    ...q,
                    id: crypto.randomUUID(),
                    text: q.text + " (copy)",
                  })
                }
              >
                <Copy size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete question"
                onClick={() => {
                  if (confirm("Delete this question?")) s.deleteQuestion(q.id);
                }}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <Search size={35} />
            <h3>No questions found.</h3>
            <p>Try another filter, or add a question of your own.</p>
          </div>
        )}
      </div>
      <Dialog.Root
        open={!!editing}
        onOpenChange={(v) => {
          if (!v && confirm("Close the editor and discard unsaved changes?"))
            setEditing(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>
              {s.questions.some((q) => q.id === editing?.id)
                ? "Edit question"
                : "A great question starts here."}
            </Dialog.Title>
            <Dialog.Description>
              Make it memorable. Your questions save on this device.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Close editor">
              <X size={20} />
            </Dialog.Close>
            {editing && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const err = validateQuestion(editing);
                  if (err) {
                    setError(err);
                    return;
                  }
                  s.saveQuestion(editing);
                  setEditing(null);
                  setError("");
                }}
              >
                <label>
                  Game
                  <select
                    value={editing.game}
                    onChange={(e) =>
                      setEditing({ ...editing, game: e.target.value as Game })
                    }
                  >
                    {Object.entries(games).map(([id, g]) => (
                      <option key={id} value={id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Question
                  <textarea
                    required
                    value={editing.text}
                    onChange={(e) =>
                      setEditing({ ...editing, text: e.target.value })
                    }
                  />
                </label>
                {editing.game !== "who" && (
                  <label>
                    Correct {editing.game === "ballpark" ? "numerical " : ""}
                    answer
                    <input
                      required
                      type={editing.game === "ballpark" ? "number" : "text"}
                      step="any"
                      value={editing.answer}
                      onChange={(e) =>
                        setEditing({ ...editing, answer: e.target.value })
                      }
                    />
                  </label>
                )}
                <div className="form-grid">
                  <label>
                    Category
                    <input
                      required
                      value={editing.category}
                      onChange={(e) =>
                        setEditing({ ...editing, category: e.target.value })
                      }
                      list="categories"
                    />
                    <datalist id="categories">
                      {[
                        "Funny",
                        "Personal",
                        "School",
                        "Friendships",
                        "Unexpected facts",
                        "Hypotheticals",
                        "Custom",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </datalist>
                  </label>
                  <label>
                    Pack
                    <input
                      required
                      value={editing.pack}
                      onChange={(e) =>
                        setEditing({ ...editing, pack: e.target.value })
                      }
                    />
                  </label>
                </div>
                {editing.game === "ballpark" && (
                  <div className="form-grid">
                    <label>
                      Unit
                      <input
                        value={editing.unit || ""}
                        onChange={(e) =>
                          setEditing({ ...editing, unit: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Scoring tolerance
                      <input
                        type="number"
                        step="any"
                        min="0.00001"
                        value={editing.tolerance}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            tolerance: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                )}
                {editing.game === "who" ? (
                  <>
                    <label>
                      Guidance
                      <input
                        value={editing.guidance || ""}
                        onChange={(e) =>
                          setEditing({ ...editing, guidance: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Sensitivity
                      <select
                        value={editing.sensitivity || "Light"}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            sensitivity: e.target.value,
                          })
                        }
                      >
                        <option>Light</option>
                        <option>Personal</option>
                        <option>Spicy</option>
                      </select>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editing.skip !== false}
                        onChange={(e) =>
                          setEditing({ ...editing, skip: e.target.checked })
                        }
                      />
                      Allow skipping
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Difficulty
                      <select
                        value={editing.difficulty || "Medium"}
                        onChange={(e) =>
                          setEditing({ ...editing, difficulty: e.target.value })
                        }
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </label>
                    <label>
                      Explanation
                      <input
                        value={editing.explanation || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            explanation: e.target.value,
                          })
                        }
                      />
                    </label>
                    {editing.game === "ballpark" && (
                      <label>
                        Source reference
                        <input
                          value={editing.source || ""}
                          onChange={(e) =>
                            setEditing({ ...editing, source: e.target.value })
                          }
                        />
                      </label>
                    )}
                  </>
                )}
                {error && (
                  <p role="alert" className="inline-error">
                    {error}
                  </p>
                )}
                <Button type="submit">
                  Save question
                  <Check size={16} />
                </Button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content question-preview">
            <Dialog.Title>Question preview</Dialog.Title>
            <Dialog.Description>
              {preview && games[preview.game].name} · {preview?.pack}
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Close preview">
              <X />
            </Dialog.Close>
            <h2>{preview?.text}</h2>
            <strong>
              {preview?.answer} {preview?.unit}
            </strong>
            <p>{preview?.explanation || preview?.guidance}</p>
            <small>{preview?.source}</small>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
