import { GameStatus } from "@/game";
import { WordAttempt } from "@/game/attempt";
import { Mode, Modes } from "@/game/mode";
import { IGameStats } from "./stats";

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
  resetState: () => void;
}

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
  const makeBoards = (): IGameState["boards"] => {
    const boards: IGameState["boards"] = [];
    for (let i = 0; i < mode.boards; i++) {
      boards.push({ status: "playing", attempts: [], solution: undefined });
    }
    return boards;
  };
  const makeHistory = (): IGameStats["history"] => {
    const history: IGameStats["history"] = [];
    for (let i = mode.boards; i <= mode.rows; i++) {
      history.push({ attempt: i, count: 0 });
    }
    history.push({ attempt: "X", count: 0 });
    return history;
  };

  return {
    stats: {
      winStreak: 0,
      bestStreak: 0,
      history: makeHistory(),
    },
    state: {
      boards: makeBoards(),
      gameNumber: 0,
      row: 0,
    },
    expires: utils.tomorrow(),
    mode: mode.mode,
  };
};
