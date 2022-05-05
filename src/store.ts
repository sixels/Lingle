import { WordAttempt } from "./game";
import { BoardPosition } from "./game/board";
import utils from "./utils";

export enum GameState {
  Won,
  Lost,
  Playing,
}

class Stats {
  attempts: WordAttempt[] = [];
  state: GameState = GameState.Playing;
  current_position: BoardPosition = new BoardPosition([0, 0]);
  win_streak: number = 0;
  longest_streak: number = 0;

  constructor() {}

  asJSON = (): object => {
    return {
      attempts: this.attempts,
      state: this.state,
      current_position: this.current_position.asTuple(),
      win_streak: this.win_streak,
      longest_streak: this.longest_streak,
    };
  };

  static fromJSON(this: typeof Stats, data: any): Stats {
    let stats = new this();

    stats.attempts = data.attempts;
    stats.state = data.state;
    stats.current_position = new BoardPosition(data.current_position);
    stats.win_streak = data.win_streak;
    stats.longest_streak = data.longest_streak;

    return stats;
  }
}

export class LingleStore {
  stats: Stats = new Stats();
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
      stats: this.stats.asJSON(),
      expires: this.expires,
    };

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
      const object: any = JSON.parse(store);

      try {
        this.expires = new Date(object.expires);

        // check if the state from local storage is valid
        if (this.hasExpired()) {
          this.invalidateStore();
        } else {
          this.stats = Stats.fromJSON(object.stats);
        }

      } catch (e) {
        console.log(e)
        this.invalidateStore();
      }
    }

    return this;
  };

  private reset = () => {
    localStorage.removeItem("lingle");

    // keep win streak
    const stats = new Stats();
    stats.longest_streak = this.stats.longest_streak;
    stats.win_streak = this.stats.win_streak;

    this.stats = stats;
    this.expires = utils.tomorrow();
  };
}
