import { GameStatus } from "@/game";
import { WordAttempt } from "@/game/attempt";
import { Mode, Modes } from "@/game/mode";
import utils from "@/utils";

export type GameStore = [GameState, GameStoreMethods];

export interface GameState {
  stats: IGameStats;
  state: IGameState;
  expires: Date;
  mode: Modes;
}

export interface GameStoreMethods {
  setMode: (mode: Mode) => void;
  setRow: (row: number) => void;
  setBoardStatus: (board: number, status: GameStatus) => void;
  createAttempts: (attempts: WordAttempt[]) => boolean;
  setGameNumber: (n: number) => void;
}

interface IGameStats {}

interface IGameState {
  row: number;
  gameNumber: number;
  boards: {
    status: GameStatus;
    attempts: WordAttempt[];
    solution: string | undefined;
  }[];
}

/**
 * Get the default state for the given mode
 * @param mode The game mode
 * @returns A GameState
 */
export const defaultGameState = (mode: Mode): GameState => {
  const makeBoards = (mode: Mode): IGameState["boards"] => {
    let boards: IGameState["boards"] = [];
    for (let i = 0; i < mode.boards; i++) {
      boards.push({ status: "playing", attempts: [], solution: undefined });
    }
    return boards;
  };

  return {
    stats: {},
    state: {
      boards: makeBoards(mode),
      gameNumber: 0,
      row: 0,
    },
    expires: utils.tomorrow(),
    mode: mode.mode,
  };
};
