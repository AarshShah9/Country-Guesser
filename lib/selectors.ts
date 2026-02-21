import type { GameState, Player } from "./types";

export function getCurrentPlayer(state: GameState): Player | null {
  if (state.phase !== "active" || state.players.length === 0) {
    return null;
  }
  const player = state.players[state.currentPlayerIndex];
  return player ?? null;
}

export function getActivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => !p.eliminated);
}

export function getEliminatedPlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.eliminated);
}

export function isGameOver(state: GameState): boolean {
  if (state.phase === "finished") return true;
  if (state.phase !== "active") return false;
  const active = getActivePlayers(state);
  return active.length <= 1;
}

export function getGuessedCountriesList(state: GameState): Array<{
  isoCode: string;
  displayName: string;
  guessedByPlayerId: string;
  timestamp: number;
}> {
  return Object.values(state.guessedCountries);
}

export function getGuessedCount(state: GameState): number {
  return Object.keys(state.guessedCountries).length;
}
