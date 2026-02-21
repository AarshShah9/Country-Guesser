export interface Player {
  id: string;
  name: string;
  strikes: number;
  eliminated: boolean;
}

export interface GameSettings {
  timerEnabled: boolean;
  timerSeconds: number;
  strikesEnabled: boolean;
  maxStrikes: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface GuessedCountry {
  isoCode: string;
  displayName: string;
  guessedByPlayerId: string;
  timestamp: number;
}

export type GamePhase = "setup" | "active" | "finished";

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  guessedCountries: Record<string, GuessedCountry>;
  lastGuessedCountryIso?: string;
  timerRemaining?: number;
  /** Set when game starts; when defined, timer is enabled for this round. */
  timerSeconds?: number;
  strikesEnabled?: boolean;
  maxStrikes?: number;
  /** When true, current player guessed wrong this turn (strikes off) and must skip to continue. */
  wrongGuessThisTurn?: boolean;
  historyLog?: HistoryLogEntry[];
}

export interface HistoryLogEntry {
  type: string;
  payload?: unknown;
  timestamp: number;
}
