import { createEffect } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";

import { Mode, Modes } from "@/game/mode";
import { GameStatus } from "@/game";
import { defaultGameState, GameState, GameStore } from "./game";
import { defaultPrefsState, PrefsState, Theme } from "./prefs";
import { WordAttempt } from "@/game/attempt";

const STORE_LINGLE_KEY: string = "v2.lingle.normal" as const;
const STORE_DUOLINGLE_KEY: string = "v2.lingle.duo" as const;
const STORE_PREFS_KEY: string = "v2.prefs" as const;

export interface LingleStore {
  game: GameStore;
  prefs: [PrefsState, any];
}

interface AppState {
  game: [GameState, SetStoreFunction<GameState>];
  prefs: [PrefsState, SetStoreFunction<PrefsState>];
}

function storageKeyFromMode(mode: Modes): string {
  const table = {
    lingle: STORE_LINGLE_KEY,
    duolingle: STORE_DUOLINGLE_KEY,
  };
  return table[mode];
}

function getOrElse<T extends Object>(
  key: string,
  fallback: T,
  reviver?: typeof JSON.parse
): T {
  const stored = localStorage.getItem(key);
  return stored
    ? ({ ...fallback, ...JSON.parse(stored, reviver) } as T)
    : fallback;
}

function makeStore<T>(value: T): [T, SetStoreFunction<T>] {
  const store = createStore(value);
  return store;
}

function createAppState(
  gameState: GameState,
  prefsState: PrefsState
): AppState {
  const [game, setGame] = makeStore(
    getOrElse(storageKeyFromMode(gameState.mode), gameState)
  );
  const [prefs, setPrefs] = makeStore(getOrElse(STORE_PREFS_KEY, prefsState));

  createEffect(() => {
    localStorage.setItem(storageKeyFromMode(game.mode), JSON.stringify(game));
    localStorage.setItem(STORE_PREFS_KEY, JSON.stringify(prefs));
  });

  return {
    game: [game, setGame],
    prefs: [prefs, setPrefs],
  };
}

export function createLingleStore(mode: Mode): LingleStore {
  // create state with default values
  const state = createAppState(defaultGameState(mode), defaultPrefsState());

  const [game, setGame] = state.game;
  const [prefs, setPrefs] = state.prefs;

  return {
    game: [
      game,
      {
        setMode: (mode: Mode) => {
          if (game.mode === mode.mode) {
            return;
          }

          setGame(() =>
            getOrElse(storageKeyFromMode(mode.mode), defaultGameState(mode))
          );
        },
        setRow: (row: number) => {
          setGame("state", "row", row);
        },
        setBoardStatus: (board: number, status: GameStatus) => {
          if (board >= game.state.boards.length) {
            return;
          }

          setGame(({ state }) => {
            state.boards[board].status = status;
          });
        },
        createAttempts: (attempts: WordAttempt[]): boolean => {
          attempts.forEach((attempt, i) => {
            setGame(
              "state",
              "boards",
              (b, n) => b.status === "playing" && i == n,
              produce((b) => {
                if (attempt.every((l) => (l ? l.type === "right" : false))) {
                  b.status = "won";
                } else if (game.state.row === new Mode(game.mode).rows - 1) {
                  b.status = "lost";
                }
                b.attempts = b.attempts.concat([[...attempt]]);
              })
            );
          });

          return true;
        },
        setGameNumber: (n: number) => {
          setGame("state", "gameNumber", n);
        },
      },
    ],
    prefs: [
      prefs,
      {
        setTheme: (theme: Theme) => {
          setPrefs("theme", theme);
        },
      },
    ],
  };
}
