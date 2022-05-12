import { Mode } from "../game/mode";
import utils from "../utils";

import { State } from "./state";
import { Stats } from "./stats";

export type StoreCallback = (store: LingleStore) => void;

export class LingleStore {
  stats: Stats;
  state: State;
  expires: Date = new Date();
  mode: Mode;

  onInvalidateCallbacks: StoreCallback[] = [];
  onSaveCallbacks: StoreCallback[] = [];

  constructor(mode: Mode) {
    this.expires = utils.tomorrow();
    this.mode = mode;
    this.stats = new Stats(mode);
    this.state = new State(mode);
    this.load();
  }

  setMode(mode: Mode) {
    this.mode = mode;
    this.state = new State(mode);
    this.load();
    this.onInvalidateCallbacks.forEach((cb) => cb(this));
  }

  onInvalidate(callback: StoreCallback) {
    this.onInvalidateCallbacks.push(callback);
  }
  onSave(callback: StoreCallback) {
    this.onSaveCallbacks.push(callback);
  }

  invalidateStore() {
    this.reset();
    this.onInvalidateCallbacks.forEach((cb) => cb(this));
  }

  save = () => {
    if (this.hasExpired()) {
      this.invalidateStore();
    }
    this.expires = utils.tomorrow();

    const object = {
      stats: this.stats.asJSON(),
      state: this.state.asJSON(),
      expires: this.expires,
    };

    localStorage.setItem(this.mode, JSON.stringify(object));
    this.onSaveCallbacks.forEach((cb) => cb(this));
  };

  private hasExpired = (): boolean => {
    return new Date() >= this.expires;
  };

  private load = (): LingleStore => {
    if (this.hasExpired()) {
      this.invalidateStore();
      return this;
    }

    const store = localStorage.getItem(this.mode);
    if (store !== null) {
      const object: any = JSON.parse(store);

      try {
        this.expires = new Date(object.expires);

        // check if the state from local storage is valid
        if (this.hasExpired()) {
          this.invalidateStore();
        } else {
          this.stats = Stats.fromJSON(this.mode, object.stats);
          this.state = State.fromJSON(this.mode, object.state);
        }
      } catch (e) {
        console.error(e);
        this.invalidateStore();
      }
    }

    return this;
  };

  private reset = () => {
    // keep stats
    let stats = this.stats;
    localStorage.removeItem(this.mode);

    this.stats = stats;
    this.state = new State(this.mode);
    this.expires = utils.tomorrow();

    this.save();
  };
}
