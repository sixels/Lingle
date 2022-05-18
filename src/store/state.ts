import { GameStatus, WordAttempt } from "../game";
import { BoardPosition } from "../game/board";
import { Mode } from "../game/mode";

export class State {
  attempts: WordAttempt[][] = [];
  status: GameStatus[] = [];
  game_number: number = 0;

  mode: Mode;
  current_position: BoardPosition;

  constructor(mode: Mode) {
    this.mode = mode;
    this.current_position = new BoardPosition([0, 0], mode.rows);

    for (let i = 0; i < mode.boards; i++) {
      this.attempts.push([]);
      this.status.push(GameStatus.Playing);
    }
  }

  static fromJSON(this: typeof State, mode: Mode, data: any): State {
    let state = new this(mode);

    state.attempts = data.attempts;
    state.status = data.status;
    state.current_position = new BoardPosition(
      data.current_position,
      state.mode.rows
    );
    state.game_number = data.game_number;

    return state;
  }
  asJSON = (): object => {
    return {
      attempts: this.attempts,
      status: this.status,
      current_position: this.current_position.asTuple(),
      game_number: this.game_number,
    };
  };
}
