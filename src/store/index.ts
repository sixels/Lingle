import utils from "../utils";

import { State } from "./state";
import { Stats } from "./stats";

export type StoreCallback = (store: LingleStore) => void;

export class LingleStore {
  stats: Stats = new Stats();
  state: State = new State();
  expires: Date = new Date();

  onInvalidateCallbacks: StoreCallback[] = [];
  onSaveCallbacks: StoreCallback[] = [];

  constructor() {
    this.expires = utils.tomorrow();
    this.load();
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

    localStorage.setItem("lingle", JSON.stringify(object));
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

    // keep stats
    this.state = new State();
    this.expires = utils.tomorrow();
  };
}
