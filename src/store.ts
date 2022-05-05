import { WordAttempt } from "./game";
import { BoardPosition } from "./game/board";
import utils from "./utils";

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
  win_streak: number;
  longest_streak: number;
}

export class LingleStore {
  attempts: WordAttempt[] = [];
  current_position: BoardPosition = new BoardPosition(0, 0);
  state: GameState = GameState.Playing;
  expires: Date = new Date();

  invalidateCallbacks: (() => void)[] = [];

  longest_streak: number = 0;
  private _win_streak: number = 0;

  constructor() {
    this.expires = utils.tomorrow();
    this.load();
  }

  set win_streak(value: number) {
    this.longest_streak = Math.max(value, this.longest_streak);
    this._win_streak = value;
  }
  get win_streak(): number {
    return this._win_streak;
  }

  hasExpired = (): boolean => {
    return new Date() >= this.expires;
  };

  onInvalidateStore(callback: () => void) {
    this.invalidateCallbacks.push(callback);
  }

  invalidateStore() {
    this.reset();
    this.invalidateCallbacks.forEach((cb) => cb());
  }

  save = (): boolean => {
    if (this.hasExpired()) {
      this.invalidateStore();
      return false;
    }
    this.expires = utils.tomorrow();

    const object = {
      attempts: this.attempts,
      current_position: [this.current_position.row, this.current_position.col],
      state: this.state,
      expires: this.expires,
      win_streak: this.win_streak,
    } as StoreObject;

    localStorage.setItem("lingle", JSON.stringify(object));

    return true;
  };

  private load = (): LingleStore => {
    if (this.hasExpired()) {
      this.invalidateStore();
      return this;
    }

    const store = localStorage.getItem("lingle");
    if (store !== null) {
      const object: StoreObject = JSON.parse(store);
      this.expires = new Date(object.expires);

      // check if the state from local storage is valid
      if (this.hasExpired()) {
        this.invalidateStore();
        return this;
      }

      this.attempts = object.attempts;
      this.current_position = new BoardPosition(
        object.current_position[0],
        object.current_position[1]
      );
      this.state = object.state;
      this.win_streak = object.win_streak || 0;
    }

    return this;
  };

  private reset = () => {
    localStorage.removeItem("lingle");
    this.attempts = [];
    this.current_position = new BoardPosition(0, 0);
    this.state = GameState.Playing;
    this.expires = utils.tomorrow();
  };
}
