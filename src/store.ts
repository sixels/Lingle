import { WordAttempt } from "./game";
import { BoardPosition } from "./game/board";

export enum GameState {
  Won,
  Lost,
  Playing,
}

interface StoreObject {
  attempts: WordAttempt[];
  state: GameState;
  current_position: [number, number];
  expires: Date;
}

export class LingleStore {
  attempts: WordAttempt[];
  current_position: BoardPosition;
  state: GameState;
  expires: Date;

  constructor() {
    this.attempts = [];
    this.current_position = new BoardPosition(0, 0);
    this.state = GameState.Playing;
    this.expires = new Date(new Date().setHours(0, 0, 0, 0) + 864e5);
  }

  hasExpired = (): boolean => {
    return new Date() >= this.expires;
  };

  load = (): boolean => {
    if (this.hasExpired()) {
      this.reset();
      return false;
    }

    const store = localStorage.getItem("lingle");
    if (store !== null) {
      const object: StoreObject = JSON.parse(store);
      this.attempts = object.attempts;
      this.current_position = new BoardPosition(
        object.current_position[0],
        object.current_position[1]
      );
      this.state = object.state;
      this.expires = object.expires;
    }

    return true;
  };

  save = (): boolean => {
    if (this.hasExpired()) {
      this.reset();
      return false;
    }

    this.expires = new Date(new Date().setHours(0, 0, 0, 0) + 864e5);

    const object = {
      attempts: this.attempts,
      current_position: [this.current_position.row, this.current_position.col],
      state: this.state,
      expires: this.expires,
    } as StoreObject;

    localStorage.setItem("lingle", JSON.stringify(object));

    return true;
  };

  reset = () => {
    localStorage.removeItem("lingle");
    this.attempts = [];
    this.current_position = new BoardPosition(0, 0);
    this.state = GameState.Playing;
    this.expires = new Date(new Date().setHours(0, 0, 0, 0) + 864e5);
  };
}
