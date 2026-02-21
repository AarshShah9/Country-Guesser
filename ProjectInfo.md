Build a Next.js (App Router) + TypeScript web app (mobile web friendly) for a multiplayer country guessing game.

High-level goal:
A local-only party game for now (share screen on Discord or play in person). Store state in memory + persist to localStorage so refreshes don’t wipe the game. Later, we may add online rooms with a server, so structure state and logic cleanly (pure reducer/state machine) so we can swap the state source later.

Tech choices (must use):
- Next.js App Router (flatten it in the current directory when initalizing)
- TypeScript
- react-simple-maps for SVG map rendering
- world-atlas TopoJSON for world country shapes
- localStorage persistence (no backend yet)

Core gameplay:
1) Setup Screen
- Let user add/remove player names (dynamic list)
- Game configuration:
- Turn timer: off or on, with duration in seconds
- Strikes: off or on, with max strikes per player
- Difficulty mode: Easy / Medium / Hard
- Start Game button

2) Game Screen
- Show:
- Current player turn
- Input to guess a country name
- Timer countdown if enabled
- Players list with strikes + eliminated status
- List or count of guessed countries
- Buttons: Submit guess, Skip turn (optional), Reset game, New game
- Turn order loops through players; skip eliminated players.

Country validation rules:
- Accept guess only if:
- It matches a real country in our country dataset
- It has not already been guessed
- Normalize user input (trim, case-insensitive).
- Optionally support aliases (e.g., "USA" => "United States of America") via a small mapping table.
- If invalid or already guessed:
- Apply a strike if strikes enabled
- If strikes hit max, eliminate player
- Timer rules:
- If timer enabled and time runs out: apply strike (if enabled) or auto-skip to next player

Map behavior:
- Initial map must be fully “blacked out”: no names, no visible borders/outlines.
- When a country is correctly guessed:
- Reveal its outline (stroke visible)
- Fill with a color
- Display the country name on the map (label positioned at centroid or reasonable label point)
- Difficulty modes:
- Easy: show country borders from the start (light stroke), but no labels until guessed
- Medium: borders hidden until guessed
- Hard (choose one simple rule): e.g., only countries that border the last guessed country are allowed OR always-on timer + fewer strikes. Implement a minimal “Hard” that is easy to code.

State architecture (important):
- Implement game logic as a pure reducer/state machine:
- state + action -> newState
- Keep UI components dumb; reducer handles:
- start game
- submit guess
- validate guess
- apply strike
- eliminate player
- advance turn
- handle timer tick/timeout
- reset/new game

Data model (suggested):
- Player: { id, name, strikes, eliminated }
- GameSettings: { timerEnabled, timerSeconds, strikesEnabled, maxStrikes, difficulty }
- GameState:
- phase: "setup" | "active" | "finished"
- players: Player[]
- currentPlayerIndex: number
- guessedCountries: Record<string, { isoCode, displayName, guessedByPlayerId, timestamp }>
- lastGuessedCountryIso?: string
- timerRemaining?: number
- historyLog: array of events (optional)

Persistence:
- Persist the entire GameState + GameSettings to localStorage on change.
- On app load, rehydrate from localStorage if present.
- Provide a “Reset all data” option to clear localStorage.

Country datasets:
- Use world-atlas TopoJSON for shapes.
- Maintain a separate country name list keyed by ISO code (or a mapping) for validation + canonical display names.
- Create a mapping from TopoJSON feature id/properties -> ISO code/name.
- Ensure the guessed country lookup is consistent across validation and map rendering.

Pages / routes (Next.js App Router):
- / (Setup screen)
- /game (Game screen)
Optional: /about or /how-to-play later.

Component structure (suggested):
- app/page.tsx: Setup UI
- app/game/page.tsx: Game UI
- components/WorldMap.tsx (react-simple-maps rendering, takes guessedCountries + difficulty)
- components/PlayerList.tsx
- components/GameControls.tsx
- components/GuessInput.tsx
- lib/gameReducer.ts (all logic)
- lib/countries.ts (country validation list + alias mapping)
- lib/storage.ts (load/save to localStorage)
- lib/mapData.ts (load topojson + helpers to map features to ISO/name)

Implementation deliverables:
1) Scaffold the Next.js project structure and key files.
2) Implement reducer + actions.
3) Implement localStorage hydration/persistence.
4) Implement map rendering:
- blacked out baseline
- reveal/fill/label when guessed
- easy/medium differences
5) Implement validation + strikes + turn rotation + timer.
6) Keep UI responsive for mobile web (large touch targets, simple layout).

Stretch (optional):
- Basic animations when revealing a country
- Sound toggle for correct/incorrect (optional)
- Export game results summary

Important constraints:
- No server, no database, no auth right now, but make sure you create clear seperation of concerns so that if we want to swap it out later to replace local storage you easily can
- Keep code clean so later we can replace local state persistence with a multiplayer room server.
