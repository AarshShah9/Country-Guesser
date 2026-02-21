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
  historyLog?: HistoryLogEntry[];
}

export interface HistoryLogEntry {
  type: string;
  payload?: unknown;
  timestamp: number;
}
