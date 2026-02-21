import type { GameSettings, GameState } from "./types";

export const STORAGE_KEY = "country-guesser-game";

const GAME_PHASES = ["setup", "active", "finished"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

function isGamePhase(v: unknown): v is GameState["phase"] {
  return typeof v === "string" && GAME_PHASES.includes(v as (typeof GAME_PHASES)[number]);
}

function isPlayerLike(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.strikes === "number" &&
    typeof p.eliminated === "boolean"
  );
}

function isGameStateShape(obj: unknown): obj is GameState {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if (!isGamePhase(o.phase)) return false;
  if (!Array.isArray(o.players)) return false;
  if (typeof o.currentPlayerIndex !== "number") return false;
  if (typeof o.guessedCountries !== "object" || o.guessedCountries === null) return false;
  for (const p of o.players as unknown[]) {
    if (!isPlayerLike(p)) return false;
    const q = p as Record<string, unknown>;
    if (typeof q.id !== "string" || typeof q.name !== "string") return false;
    if (typeof q.strikes !== "number" || typeof q.eliminated !== "boolean") return false;
  }
  return true;
}

function isGameSettingsShape(obj: unknown): obj is GameSettings {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.timerEnabled !== "boolean" || typeof o.timerSeconds !== "number") return false;
  if (typeof o.strikesEnabled !== "boolean" || typeof o.maxStrikes !== "number") return false;
  if (typeof o.difficulty !== "string" || !DIFFICULTIES.includes(o.difficulty as (typeof DIFFICULTIES)[number])) return false;
  return true;
}

export type PersistedGame = { gameState: GameState; settings: GameSettings };

export function saveGame(state: GameState, settings: GameSettings): void {
  try {
    const payload: PersistedGame = { gameState: state, settings };
    const raw = JSON.stringify(payload);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch {
    // ignore write errors (quota, private mode, etc.)
  }
}

export function loadGame(): PersistedGame | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const o = parsed as Record<string, unknown>;
    const gameState = o.gameState;
    const settings = o.settings;
    if (!isGameStateShape(gameState) || !isGameSettingsShape(settings)) return null;
    return { gameState, settings };
  } catch {
    return null;
  }
}

export function clearGame(): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}
