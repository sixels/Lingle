import { batch, createEffect } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";

import { Mode, Modes } from "@/game/mode";
import { GameStatus } from "@/game";
import { defaultGameState, GameState, GameStore } from "./game";
import { defaultPrefsState, PrefsState, PrefsStore } from "./prefs";
import { WordAttempt } from "@/game/attempt";
import { Theme } from "@/theme";
import utils from "@/utils";
import { generateSolution } from "@/game/solution";

const STORE_LINGLE_KEY: string = "v2.lingle.normal" as const;
const STORE_DUOLINGLE_KEY: string = "v2.lingle.duo" as const;
const STORE_QUAD_KEY: string = "v2.lingle.quad" as const;
const STORE_OCTO_KEY: string = "v2.lingle.octo" as const;
const STORE_PREFS_KEY: string = "v2.prefs" as const;

export interface LingleStore {
  game: GameStore;
  prefs: PrefsStore;
}

interface AppState {
  game: [GameState, SetStoreFunction<GameState>];
  prefs: [PrefsState, SetStoreFunction<PrefsState>];
}

function storageKeyFromMode(mode: Modes): string {
  const table = {
    lingle: STORE_LINGLE_KEY,
    duolingle: STORE_DUOLINGLE_KEY,
    quadlingle: STORE_QUAD_KEY,
    octolingle: STORE_OCTO_KEY,
  };
  return table[mode];
}

function getOrElse<T extends Object>(
  key: string,
  fallback: T,
  reviver?: Parameters<typeof JSON.parse>["1"]
): T {
  const stored = localStorage.getItem(key);

  return stored
    ? utils.mergeObjectWith(JSON.parse(stored, reviver), fallback)
    : fallback;
}

function makeStore<T extends object>(value: T): [T, SetStoreFunction<T>] {
  return createStore(value);
}

function createGameState(state: GameState): AppState["game"] {
  const [game, setGame] = makeStore(
    getOrElse(storageKeyFromMode(state.mode), state, (key, value) => {
      switch (key as keyof GameState) {
        case "expires":
          return new Date(value);
        default:
          return value;
      }
    })
  );

  createEffect(() => {
    console.log("saving the state");
    localStorage.setItem(storageKeyFromMode(game.mode), JSON.stringify(game));
  });

  return [game, setGame];
}

function createPrefsState(state: PrefsState): AppState["prefs"] {
  const [prefs, setPrefs] = makeStore(getOrElse(STORE_PREFS_KEY, state));

  createEffect(() => {
    localStorage.setItem(STORE_PREFS_KEY, JSON.stringify(prefs));
  });

  return [prefs, setPrefs];
}

export function createGameStore(mode: Mode): GameStore {
  const [game, setGame] = createGameState(defaultGameState(mode));
  return [
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

        setGame((game) => {
          game.state.boards[board].status = status;
          return game;
        });
      },
      createAttempts: (attempts: (WordAttempt | null)[]): boolean => {
        attempts.forEach((attempt, i) => {
          if (!attempt) return;

          const solutions = generateSolution(new Mode(game.mode), new Date());

          setGame(
            "state",
            "boards",
            (b, n) => b.status === "playing" && i == n,

            produce((b) => {
              if (attempt.every((l) => (l ? l.type === "right" : false))) {
                b.status = "won";
                b.solution = attempt.map((l) => l?.letter).join("");
              } else if (game.state.row === new Mode(game.mode).rows - 1) {
                b.status = "lost";
                b.solution = solutions[i];
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
      resetState: () => {
        const defaultState = defaultGameState(new Mode(game.mode));
        batch(() => {
          setGame("state", defaultState.state);
          setGame("expires", new Date(defaultState.expires));
        });
      },
      updateStats: () => {
        if (game.state.boards.some((b) => b.status == "playing")) {
          return;
        }

        console.log("updating stats");

        const isLost = game.state.boards.some((b) => b.status == "lost");
        console.log("is game lost:", isLost);

        setGame(
          "stats",
          produce((stats) => {
            const attemptNumber = game.state.row + Number(isLost);

            console.log("finished at attempt:", attemptNumber);

            let historyIndex = stats.history.findIndex(
              (h) => h.attempt == attemptNumber
            );
            if (historyIndex < 0) {
              stats.history.push({ attempt: attemptNumber, count: 0 });
              historyIndex = stats.history.length - 1;
            }
            stats.history[historyIndex].count += 1;

            console.log("stats changed");
            console.table(stats.history);

            stats.bestStreak = Math.max(stats.winStreak, stats.bestStreak);
            stats.winStreak = isLost ? 0 : stats.winStreak + 1;
          })
        );
      },
    },
  ];
}

export function createPrefsStore(): PrefsStore {
  const [prefs, setPrefs] = createPrefsState(defaultPrefsState());

  return [
    prefs,
    {
      setTheme: (theme: Theme) => {
        setPrefs("theme", theme);
      },
    },
  ];
}

export function createLingleStore(mode: Mode): LingleStore {
  // create state with default values
  return {
    game: createGameStore(mode),
    prefs: createPrefsStore(),
  };
}
