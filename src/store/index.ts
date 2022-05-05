import utils from "../utils";

import { State } from "./state";
import { Stats } from "./stats";

export class LingleStore {
  stats: Stats = new Stats();
  state: State = new State();
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
      state: this.state.asJSON(),
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
          this.state = State.fromJSON(object.state);
        }
      } catch (e) {
        console.error(e);
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
