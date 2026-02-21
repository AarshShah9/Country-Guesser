import type {
  GamePhase,
  GameSettings,
  GameState,
  GuessedCountry,
  Player,
} from "./types";

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

// --- Reducer ---

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      // TODO: Build initial state from settings + players, set phase to "active", start timer if enabled
      return state;
    }
    case "SUBMIT_GUESS": {
      // TODO: Add to guessedCountries, set lastGuessedCountryIso, optionally advance turn
      return state;
    }
    case "APPLY_STRIKE": {
      // TODO: Increment strikes for current (or payload) player; if at max, eliminate
      return state;
    }
    case "ELIMINATE": {
      // TODO: Mark player eliminated, advance turn if needed
      return state;
    }
    case "ADVANCE_TURN": {
      // TODO: Move currentPlayerIndex to next non-eliminated player; check game over
      return state;
    }
    case "TIMER_TICK": {
      // TODO: Decrement timerRemaining; if 0, treat as timeout
      return state;
    }
    case "TIMER_TIMEOUT": {
      // TODO: Apply strike or skip turn per settings, advance turn
      return state;
    }
    case "RESET": {
      return getInitialState();
    }
    case "NEW_GAME": {
      // TODO: Same as RESET or optionally apply payload.settings for next setup
      return getInitialState();
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
