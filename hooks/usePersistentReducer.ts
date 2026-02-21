"use client";

import { useEffect, useRef, useReducer, useState } from "react";
import { loadGame, saveGame } from "@/lib/storage";
import type { GameAction, GameState } from "@/lib/gameReducer";
import type { GameSettings } from "@/lib/types";

type Reducer = (state: GameState, action: GameAction) => GameState;

export function usePersistentReducer(
  reducer: Reducer,
  initialState: GameState,
  initialSettings: GameSettings
): [GameState, React.Dispatch<GameAction>, GameSettings, React.Dispatch<React.SetStateAction<GameSettings>>] {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const hasRehydrated = useRef(false);

  useEffect(() => {
    const loaded = loadGame();
    if (loaded) {
      dispatch({ type: "REHYDRATE", payload: { state: loaded.gameState } });
      setSettings(loaded.settings);
    }
    hasRehydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hasRehydrated.current) return;
    saveGame(state, settings);
  }, [state, settings]);

  return [state, dispatch, settings, setSettings];
}
