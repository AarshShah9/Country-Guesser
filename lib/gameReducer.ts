import type {
  GameSettings,
  GameState,
  GuessedCountry,
  Player,
} from "./types";
import {
  canStartGame,
  ensurePlayerIds,
  nextPlayerIndex,
  countRemainingPlayers,
} from "./gameLogic";

// --- Initial state ---

const DEFAULT_SETTINGS: GameSettings = {
  timerEnabled: false,
  timerSeconds: 60,
  strikesEnabled: false,
  maxStrikes: 3,
  difficulty: "medium",
};

export function getInitialState(): GameState {
  return {
    phase: "setup",
    players: [],
    currentPlayerIndex: 0,
    guessedCountries: {},
    historyLog: [],
  };
}

// --- Action types ---

export type GameAction =
  | { type: "START_GAME"; payload: { settings: GameSettings; players: Player[] } }
  | {
      type: "SUBMIT_GUESS";
      payload: { isoCode: string; displayName: string; playerId: string };
    }
  | { type: "APPLY_STRIKE"; payload?: { playerId: string } }
  | { type: "ELIMINATE"; payload: { playerId: string } }
  | { type: "ADVANCE_TURN" }
  | { type: "TIMER_TICK" }
  | { type: "TIMER_TIMEOUT" }
  | { type: "RESET" }
  | { type: "NEW_GAME"; payload?: { settings?: GameSettings } }
  | { type: "REHYDRATE"; payload: { state: GameState } };

// --- Helpers ---

function withStrike(
  state: GameState,
  playerId: string
): { nextState: GameState; eliminated: boolean; gameOver: boolean } {
  const { strikesEnabled, maxStrikes = 0 } = state;
  const players = state.players.map((p) => {
    if (p.id !== playerId) return p;
    const nextStrikes = p.strikes + 1;
    const eliminated = Boolean(strikesEnabled && nextStrikes >= maxStrikes);
    return { ...p, strikes: nextStrikes, eliminated };
  });
  const eliminated = players.find((p) => p.id === playerId)?.eliminated ?? false;
  const remaining = countRemainingPlayers(players);
  const gameOver = remaining <= 1;
  const nextState: GameState = {
    ...state,
    players,
    phase: gameOver ? "finished" : state.phase,
  };
  return { nextState, eliminated, gameOver };
}

function advanceTurnState(state: GameState): GameState {
  if (state.phase !== "active") return state;
  const nextIndex = nextPlayerIndex(state);
  if (nextIndex < 0) return state;
  const next: GameState = {
    ...state,
    currentPlayerIndex: nextIndex,
  };
  if (state.timerSeconds != null) {
    next.timerRemaining = state.timerSeconds;
  }
  return next;
}

// --- Reducer ---

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const { settings, players: rawPlayers } = action.payload;
      const trimmed = rawPlayers
        .filter((p) => typeof p.name === "string" && p.name.trim() !== "")
        .map((p) => ({ ...p, name: p.name.trim(), strikes: 0, eliminated: false }));
      if (!canStartGame(trimmed)) return state;
      const players = ensurePlayerIds(trimmed);
      const next: GameState = {
        phase: "active",
        players,
        currentPlayerIndex: 0,
        guessedCountries: {},
        timerSeconds: settings.timerEnabled ? settings.timerSeconds : undefined,
        timerRemaining: settings.timerEnabled ? settings.timerSeconds : undefined,
        strikesEnabled: settings.strikesEnabled,
        maxStrikes: settings.maxStrikes,
      };
      return next;
    }

    case "SUBMIT_GUESS": {
      // Country validation done elsewhere; just return state for now.
      return state;
    }

    case "APPLY_STRIKE": {
      if (state.phase !== "active") return state;
      const playerId = action.payload?.playerId ?? state.players[state.currentPlayerIndex]?.id;
      if (!playerId) return state;
      const { nextState } = withStrike(state, playerId);
      return nextState;
    }

    case "ELIMINATE": {
      const { playerId } = action.payload;
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, eliminated: true } : p
      );
      const remaining = countRemainingPlayers(players);
      const next: GameState = {
        ...state,
        players,
        phase: remaining <= 1 ? "finished" : state.phase,
      };
      return advanceTurnState(next);
    }

    case "ADVANCE_TURN": {
      return advanceTurnState(state);
    }

    case "TIMER_TICK": {
      if (state.phase !== "active" || state.timerRemaining == null) return state;
      const nextRemaining = Math.max(0, state.timerRemaining - 1);
      return { ...state, timerRemaining: nextRemaining };
    }

    case "TIMER_TIMEOUT": {
      if (state.phase !== "active") return state;
      const current = state.players[state.currentPlayerIndex];
      if (!current) return state;
      if (state.strikesEnabled) {
        const { nextState } = withStrike(state, current.id);
        return advanceTurnState(nextState);
      }
      return advanceTurnState(state);
    }

    case "RESET": {
      return getInitialState();
    }

    case "NEW_GAME": {
      const settings = action.payload?.settings;
      const players = state.players.map((p) => ({ ...p, strikes: 0, eliminated: false }));
      const next: GameState = {
        ...state,
        phase: "active",
        players,
        currentPlayerIndex: 0,
        guessedCountries: {},
        lastGuessedCountryIso: undefined,
        timerSeconds: settings?.timerEnabled ? settings.timerSeconds : state.timerSeconds,
        timerRemaining:
          settings?.timerEnabled ? settings.timerSeconds : state.timerSeconds,
        strikesEnabled: settings?.strikesEnabled ?? state.strikesEnabled,
        maxStrikes: settings?.maxStrikes ?? state.maxStrikes,
      };
      return next;
    }

    case "REHYDRATE": {
      return action.payload.state;
    }

    default: {
      const _: never = action;
      return state;
    }
  }
}

// Re-export for convenience
export type { GameSettings, GameState, GuessedCountry, Player };
export { DEFAULT_SETTINGS };
