import type { GameState, Player } from "./types";

/**
 * Number of players that are not eliminated.
 */
export function countRemainingPlayers(players: Player[]): number {
  return players.filter((p) => !p.eliminated).length;
}

/**
 * Index of the next non-eliminated player after current, wrapping around.
 * Returns -1 if no players or only one (or zero) remaining.
 */
export function nextPlayerIndex(state: GameState): number {
  const { players, currentPlayerIndex } = state;
  if (players.length === 0) return -1;
  const remaining = countRemainingPlayers(players);
  if (remaining <= 1) return currentPlayerIndex;

  let next = (currentPlayerIndex + 1) % players.length;
  let steps = 0;
  while (players[next].eliminated && steps < players.length) {
    next = (next + 1) % players.length;
    steps += 1;
  }
  return players[next].eliminated ? currentPlayerIndex : next;
}

/**
 * Whether the game is over (phase finished or ≤1 player remaining).
 */
export function isGameOver(state: GameState): boolean {
  if (state.phase === "finished") return true;
  return countRemainingPlayers(state.players) <= 1;
}

/**
 * Ensure each player has a non-empty id; assign one from index if missing.
 */
export function ensurePlayerIds(players: Player[]): Player[] {
  return players.map((p, i) => ({
    ...p,
    id: (p.id && p.id.trim() !== "" ? p.id : `player-${i}`).trim() || `player-${i}`,
  }));
}

/**
 * Validate that there is at least one player with a non-empty name.
 */
export function canStartGame(players: Player[]): boolean {
  const withNames = players.filter((p) => typeof p.name === "string" && p.name.trim() !== "");
  return withNames.length >= 1;
}
