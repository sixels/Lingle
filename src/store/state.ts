import { GameStatus, WordAttempt } from "../game";
import { BoardPosition } from "../game/board";

export class State {
  attempts: WordAttempt[][] = [[], []];
  status: GameStatus[] = [GameStatus.Playing];
  current_position: BoardPosition = new BoardPosition([0, 0], 6);
  game_number: number = 0;

  constructor() {}

  static fromJSON(this: typeof State, data: any): State {
    let state = new this();

    state.attempts = data.attempts;
    state.status = data.state;
    state.current_position = new BoardPosition(data.current_position, 6);
    state.game_number = data.game_number;

    return state;
  }
  asJSON = (): object => {
    return {
      attempts: this.attempts,
      state: this.status,
      current_position: this.current_position.asTuple(),
      game_number: this.game_number,
    };
  };
}
