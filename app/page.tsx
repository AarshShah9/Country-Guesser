"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/contexts/game-provider";
import { clearGame } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/gameReducer";
import type { GameSettings } from "@/lib/types";

const DIFFICULTY_OPTIONS: { value: GameSettings["difficulty"]; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function SetupPage() {
  const router = useRouter();
  const { state, dispatch, settings, setSettings } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    if (state.phase === "setup" && state.players.length > 0) {
      return state.players.map((p) => p.name);
    }
    return [""];
  });

  const addPlayer = useCallback(() => {
    setPlayerNames((prev) => [...prev, ""]);
  }, []);

  const removePlayer = useCallback((index: number) => {
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setPlayerName = useCallback((index: number, name: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  }, []);

  const canStart =
    playerNames.some((n) => typeof n === "string" && n.trim() !== "");

  const handleStartGame = useCallback(() => {
    const players = playerNames
      .map((name) => (typeof name === "string" ? name.trim() : ""))
      .filter((name) => name !== "")
      .map((name) => ({
        id: "",
        name,
        strikes: 0,
        eliminated: false,
      }));
    if (players.length === 0) return;
    dispatch({
      type: "START_GAME",
      payload: { settings, players },
    });
    router.push("/game");
  }, [playerNames, settings, dispatch, router]);

  const handleResetAllData = useCallback(() => {
    clearGame();
    dispatch({ type: "RESET" });
    setSettings(DEFAULT_SETTINGS);
    setPlayerNames([""]);
  }, [dispatch, setSettings]);

  const updateSettings = useCallback(
    (key: keyof GameSettings, value: GameSettings[keyof GameSettings]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const isHard = settings.difficulty === "hard";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Hero */}
      <header className="text-center pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Country Guesser
        </h1>
        <p className="mt-2 text-[var(--muted)] text-sm sm:text-base">
          Name countries. Take turns. Don't get eliminated.
        </p>
      </header>

      {/* Players card */}
      <section
        className="rounded-2xl border border-[var(--card-border)] p-5 sm:p-6 shadow-sm"
        style={{ background: "var(--card)" }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Players
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Add at least one player to start
        </p>
        <ul className="flex flex-col gap-3">
          {playerNames.map((name, index) => (
            <li key={index} className="flex gap-2 items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-medium">
                {index + 1}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setPlayerName(index, e.target.value)}
                placeholder="Player name"
                className="min-h-[44px] flex-1 rounded-xl border border-[var(--card-border)] bg-transparent px-4 py-2.5 text-foreground placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-colors"
                aria-label={`Player ${index + 1} name`}
              />
              <button
                type="button"
                onClick={() => removePlayer(index)}
                disabled={playerNames.length <= 1}
                className="min-h-[44px] min-w-[44px] shrink-0 rounded-xl border border-[var(--card-border)] px-3 py-2 text-[var(--muted)] cursor-pointer transition-colors hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-600 disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:border-[var(--card-border)] disabled:hover:text-[var(--muted)]"
                aria-label="Remove player"
              >
                <span className="sr-only">Remove</span>
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addPlayer}
          className="mt-3 min-h-[44px] w-full rounded-xl border-2 border-dashed border-[var(--card-border)] px-3 py-2 text-[var(--muted)] font-medium cursor-pointer transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
        >
          + Add player
        </button>
      </section>

      {/* Game options card */}
      <section
        className="rounded-2xl border border-[var(--card-border)] p-5 sm:p-6 shadow-sm"
        style={{ background: "var(--card)" }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Game options
        </h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          Timer, strikes, and difficulty
        </p>

        <div className="space-y-5">
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer group">
            <span className="relative flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--card-border)] transition-colors group-focus-within:ring-2 group-focus-within:ring-[var(--accent)]/40">
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.timerEnabled ? "translate-x-5.5 bg-[var(--accent)]" : "translate-x-0.5"
                }`}
              />
            </span>
            <input
              type="checkbox"
              checked={settings.timerEnabled}
              onChange={(e) => updateSettings("timerEnabled", e.target.checked)}
              className="sr-only"
            />
            <span className="text-foreground font-medium">Timer enabled</span>
          </label>
          {settings.timerEnabled && (
            <div className="pl-14 flex items-center gap-3">
              <span className="text-sm text-[var(--muted)]">Seconds per turn</span>
              <input
                type="number"
                min={5}
                max={300}
                value={settings.timerSeconds}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  updateSettings("timerSeconds", Number.isNaN(n) ? 60 : Math.max(5, Math.min(300, n)));
                }}
                className="min-h-[44px] w-24 rounded-xl border border-[var(--card-border)] bg-transparent px-3 py-2 text-foreground text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
            </div>
          )}

          <label
            className={`flex items-center gap-3 min-h-[44px] ${isHard ? "cursor-default opacity-90" : "cursor-pointer group"}`}
          >
            <span className="relative flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--card-border)] transition-colors group-focus-within:ring-2 group-focus-within:ring-[var(--accent)]/40">
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isHard ? "translate-x-5.5 bg-[var(--accent)]" : settings.strikesEnabled ? "translate-x-5.5 bg-[var(--accent)]" : "translate-x-0.5"
                }`}
              />
            </span>
            <input
              type="checkbox"
              checked={isHard ? true : settings.strikesEnabled}
              onChange={(e) => !isHard && updateSettings("strikesEnabled", e.target.checked)}
              disabled={isHard}
              className="sr-only"
            />
            <span className="text-foreground font-medium">
              Strikes enabled{isHard ? " (Hard: always on)" : ""}
            </span>
          </label>
          {(isHard || settings.strikesEnabled) && (
            <div className="pl-14 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-[var(--muted)]">
                Max strikes{isHard ? " (Hard: 1)" : ""}
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={isHard ? 1 : settings.maxStrikes}
                onChange={(e) => {
                  if (isHard) return;
                  const n = parseInt(e.target.value, 10);
                  updateSettings("maxStrikes", Number.isNaN(n) ? 1 : Math.max(1, Math.min(10, n)));
                }}
                disabled={isHard}
                className="min-h-[44px] w-20 rounded-xl border border-[var(--card-border)] bg-transparent px-3 py-2 text-foreground text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 disabled:opacity-70"
              />
            </div>
          )}

          <div>
            <span className="block text-sm text-[var(--muted)] mb-2">Difficulty</span>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    updateSettings("difficulty", opt.value);
                    if (opt.value === "hard") {
                      setSettings((prev) => ({ ...prev, strikesEnabled: true, maxStrikes: 1 }));
                    }
                  }}
className={`min-h-[44px] px-4 rounded-xl font-medium cursor-pointer transition-colors ${
                      settings.difficulty === opt.value
                      ? "bg-[var(--accent)] text-white shadow-md"
                      : "border border-[var(--card-border)] text-foreground hover:bg-[var(--accent)]/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleStartGame}
          disabled={!canStart}
          className="min-h-[52px] w-full rounded-xl font-semibold text-white shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={{ background: "var(--accent)" }}
        >
          Start game
        </button>
        <button
          type="button"
          onClick={handleResetAllData}
          className="min-h-[44px] rounded-xl border border-[var(--danger)]/50 px-4 py-2 text-[var(--danger)] text-sm font-medium cursor-pointer transition-colors hover:bg-[var(--danger)]/10"
        >
          Reset all data
        </button>
      </div>
    </div>
  );
}
