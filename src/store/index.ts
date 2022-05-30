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

function getOrElse<T extends Object>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  return stored ? ({ ...fallback, ...JSON.parse(stored) } as T) : fallback;
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
          setGame({ state: { ...game.state, row } });
        },
        setBoardStatus: (board: number, status: GameStatus) => {
          if (board >= game.state.boards.length) {
            return;
          }

          const state = { ...game.state };
          state.boards[board].status = status;

          setGame({ state });
        },
        createAttempt: (attempt: WordAttempt) => {
          // TODO: validate attempt

          const boards: typeof game.state.boards = [];
          game.state.boards.forEach((board) => {
            const attempts = [...board.attempts];
            attempts.push(
              attempt.map((a) => {
                if (a) a.type = "right";
                return a;
              })
            );

            const copy: typeof board = {
              solution: board.solution,
              status: board.status,
              attempts: attempts,
            };
            boards.push(copy);
          });

          setGame({
            state: { ...game.state, row: game.state.row + 1, boards },
          });

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
