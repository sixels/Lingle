import { GameStatus, WordAttempt } from "@/game";
import { BoardPosition } from "@/game/board";
import { Mode, Modes } from "@/game/mode";
import utils from "@/utils";

export type GameStore = [GameState, GameStoreMethods];

export interface GameState {
  stats: IGameStats;
  state: IGameState;
  solutions: string[];
  expires: Date;
  mode: Modes;
}

export interface GameStoreMethods {
  setMode: (mode: Mode) => void;
  setPosition: (position: BoardPosition) => void;
  setBoardStatus: (board: number, status: GameStatus) => void;
}

interface IGameStats {}

interface IGameState {
  position: [number, number];
  game_number: number;
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
export const defaultGameStore = (mode: Mode): GameState => {
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
      game_number: 0,
      position: [0, 0],
    },
    solutions: [],
    expires: utils.tomorrow(),
    mode: mode.mode,
  };
};
