"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-provider";
import WorldMap from "@/components/WorldMap";
import { clearGame } from "@/lib/storage";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getCountryCountForPlayer(
  guessedCountries: Record<string, { guessedByPlayerId: string }>,
  playerId: string
): number {
  return Object.values(guessedCountries).filter(
    (g) => g.guessedByPlayerId === playerId
  ).length;
}

export default function GamePage() {
  const router = useRouter();
  const { state, dispatch, settings } = useGame();
  const [guess, setGuess] = useState("");
  const [showQuitModal, setShowQuitModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    if (state.phase !== "active" || !settings.timerEnabled) return;

    // If timer hit 0, dispatch timeout once (then stop; don't re-fire while wrongGuessThisTurn)
    if (state.timerRemaining !== undefined && state.timerRemaining <= 0) {
      if (!state.wrongGuessThisTurn) {
        dispatch({ type: "TIMER_TIMEOUT" });
      }
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "TIMER_TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase, settings.timerEnabled, state.timerRemaining, state.wrongGuessThisTurn, dispatch]);

  // Focus input on turn change
  useEffect(() => {
    if (state.phase === "active") {
      inputRef.current?.focus();
    }
  }, [state.currentPlayerIndex, state.phase]);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isGameOver = state.phase === "finished" || state.players.filter(p => !p.eliminated).length <= 1;

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || state.phase !== "active") return;
    
    dispatch({
      type: "SUBMIT_GUESS",
      payload: { rawGuess: guess, timestamp: Date.now() },
    });
    setGuess("");
  };

  const handleSkip = () => {
    dispatch({ type: "ADVANCE_TURN" });
    setGuess("");
    inputRef.current?.focus();
  };

  const handleNewGame = () => {
    dispatch({ type: "NEW_GAME" });
    router.push("/");
  };

  const handleReset = () => {
    clearGame();
    dispatch({ type: "RESET" });
    router.push("/");
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowQuitModal(true);
  };

  // Safe check if game is not ready
  if (state.phase === "setup" && state.players.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <p className="mb-4">No active game found.</p>
          <Link
            href="/"
            className="rounded-xl bg-sky-500 px-4 py-2 font-bold text-white transition-colors hover:bg-sky-600"
          >
            Go to Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-[#020617]">
      <WorldMap
        guessedCountries={state.guessedCountries}
        difficulty={settings.difficulty}
      />

      {/* Quit game modal */}
      {showQuitModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden
            onClick={() => setShowQuitModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Quit the game?
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              Your progress will be lost. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="flex-1 rounded-xl border border-white/20 bg-white/5 py-2.5 font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuitModal(false);
                  handleReset();
                }}
                className="flex-1 rounded-xl bg-red-500 py-2.5 font-semibold text-white transition-colors hover:bg-red-600 cursor-pointer"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
        
        {/* Top Bar */}
        <div className="pointer-events-auto flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={handleBackClick}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              Guessed: {Object.keys(state.guessedCountries).length}
            </div>
            {settings.timerEnabled && state.timerRemaining !== undefined && (
              <div 
                className={`min-w-[80px] rounded-xl border border-white/10 px-4 py-2 text-center text-sm font-bold backdrop-blur-md transition-colors ${
                  state.timerRemaining <= 10 ? "bg-red-500/80 text-white" : "bg-black/40 text-white"
                }`}
              >
                {formatTime(state.timerRemaining)}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Panel (Game Info & Controls) */}
        <div className="pointer-events-auto absolute right-4 top-20 flex w-72 flex-col gap-4 sm:right-6">
          
          {/* Current Player Card */}
          {!isGameOver && currentPlayer && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md shadow-lg">
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-sky-400">
                Current Turn
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white truncate">
                {currentPlayer.name}
              </h2>
              
              {state.strikesEnabled && (
                <div className="mb-4">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: state.maxStrikes || 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i < currentPlayer.strikes ? "bg-red-500" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-red-300 font-medium text-right">
                    {currentPlayer.strikes} / {state.maxStrikes} Strikes
                  </div>
                </div>
              )}

              {state.wrongGuessThisTurn && (
                <p className="mb-3 text-sm text-amber-400">
                  Wrong — skip your turn to continue
                </p>
              )}

              <form onSubmit={handleGuessSubmit} className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Type country name..."
                  className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!guess.trim()}
                    className="flex-1 rounded-xl bg-sky-500 py-2.5 font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Guess
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
                    title="Skip turn"
                  >
                    Skip
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Game Over Card */}
          {isGameOver && (
            <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-md text-center shadow-xl">
              <h2 className="mb-2 text-2xl font-bold text-white">Game Over!</h2>
              <p className="mb-2 text-slate-300">
                Total countries found: {Object.keys(state.guessedCountries).length}
              </p>
              <p className="mb-6 text-sm text-slate-400">
                {state.players
                  .map((p) => ({
                    name: p.name,
                    count: getCountryCountForPlayer(state.guessedCountries, p.id),
                  }))
                  .sort((a, b) => b.count - a.count)
                  .map(({ name, count }) => `${name}: ${count}`)
                  .join(" · ")}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleNewGame}
                  className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition-colors hover:bg-emerald-600 cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={handleReset}
                  className="w-full rounded-xl border border-white/20 bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}

          {/* Players List */}
          <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md custom-scrollbar">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Players
            </h3>
            <div className="flex flex-col gap-2">
              {state.players.map((p, i) => {
                const isCurrent = !isGameOver && i === state.currentPlayerIndex;
                const isEliminated = p.eliminated;
                const countryCount = getCountryCountForPlayer(
                  state.guessedCountries,
                  p.id
                );

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      isCurrent
                        ? "bg-sky-500/20 border border-sky-500/50"
                        : isEliminated
                        ? "opacity-40"
                        : "bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCurrent ? "bg-sky-500 text-white" : "bg-white/10 text-white"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className={`truncate text-sm font-medium ${
                          isCurrent ? "text-sky-300" : "text-slate-200"
                        } ${isEliminated ? "line-through text-slate-500" : ""}`}>
                          {p.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="min-w-[24px] rounded bg-white/10 px-1.5 py-0.5 text-center text-xs font-medium text-slate-200"
                        title={`${countryCount} countries`}
                      >
                        {countryCount}
                      </span>
                      {p.eliminated ? (
                        <span className="text-[10px] font-bold uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Out</span>
                      ) : state.strikesEnabled ? (
                        <div className="flex gap-1">
                          {Array.from({ length: p.strikes }).map((_, k) => (
                            <div key={k} className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
