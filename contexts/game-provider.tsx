"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePersistentReducer } from "@/hooks/usePersistentReducer";
import { gameReducer, getInitialState, DEFAULT_SETTINGS } from "@/lib/gameReducer";
import type { GameAction, GameState } from "@/lib/gameReducer";
import type { GameSettings } from "@/lib/types";

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch, settings, setSettings] = usePersistentReducer(
    gameReducer,
    getInitialState(),
    DEFAULT_SETTINGS
  );

  const value = useMemo<GameContextValue>(
    () => ({ state, dispatch, settings, setSettings }),
    [state, settings]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (ctx == null) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
}
