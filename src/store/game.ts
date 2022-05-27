import utils from "@/utils";

export interface GameStats {}

export interface GameState {}

export interface GameStore {
  stats: GameStats;
  state: GameState;
  solutions: string[];
  expires: Date;
}

export const defaultGameStore = (): GameStore => {
  return {
    stats: {},
    state: {},
    solutions: [],
    expires: utils.tomorrow(),
  };
};
