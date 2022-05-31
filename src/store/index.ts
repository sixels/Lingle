import { createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

import { Mode, Modes } from "@/game/mode";
import { GameStatus } from "@/game";
import { defaultGameStore, GameState, GameStore } from "./game";
import { defaultPrefsStore, PrefsStore } from "./prefs";
import { WordAttempt } from "@/game/attempt";

const STORE_LINGLE_KEY: string = "v2.lingle.normal" as const;
const STORE_DUOLINGLE_KEY: string = "v2.lingle.duo" as const;
const STORE_PREFS_KEY: string = "v2.prefs" as const;

export interface LingleStore {
  game: GameStore;
  prefs: [PrefsStore, any];
}

interface AppState {
  game: [GameState, SetStoreFunction<GameState>];
  prefs: [PrefsStore, SetStoreFunction<PrefsStore>];
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
  game_state: GameState,
  prefs_state: PrefsStore
): AppState {
  const [game, setGame] = makeStore(
    getOrElse(storageKeyFromMode(game_state.mode), game_state)
  );
  const [prefs, setPrefs] = makeStore(getOrElse(STORE_PREFS_KEY, prefs_state));

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
  const state = createAppState(defaultGameStore(mode), defaultPrefsStore());

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

          setGame(
            getOrElse(storageKeyFromMode(mode.mode), defaultGameStore(mode))
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
        createAttempt: (attempt: WordAttempt): boolean => {
          setGame(({ mode, state }) => {
            state.boards.forEach((board) => {
              board.attempts.push([...attempt]);

              // win
              if (attempt.every((l) => (l ? l.type === "right" : false))) {
                board.status = "won";
              } else if (state.row === new Mode(mode).rows - 1) {
                board.status = "lost";
              }
            });
          });

          return true;
        },
      },
    ],
    prefs: [
      prefs,
      {
        setTheme: () => {
          // TODO
        },
      },
    ],
  };
}
