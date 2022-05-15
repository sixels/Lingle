import { Mode } from "../game/mode";
import utils from "../utils";

import { State } from "./state";
import { Stats } from "./stats";

export type StoreCallback = (store: LingleStore) => void;

type LoadErrorType = "expired" | "not_found";
interface LoadError {
  type: LoadErrorType;
  data?: any;
}

export class LingleStore {
  // I don't really care about theses values, this is just to keep the
  // constructor clean
  expires: Date = new Date();
  mode: Mode = "lingle";
  stats: Stats = new Stats(this.mode);
  state: State = new State(this.mode);

  onInvalidateCallbacks: StoreCallback[] = [];
  onSaveCallbacks: StoreCallback[] = [];

  constructor(mode: Mode) {
    this.mode = mode;
    this.load();
  }

  private static hasExpired = (expiration: Date): boolean => {
    return new Date() >= expiration;
  };

  setMode(mode: Mode) {
    // save the current state then change the mode
    this.save();
    this.mode = mode;

    // load the new state and trigger store invalidate
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
    if (LingleStore.hasExpired(this.expires)) {
      this.invalidateStore();
    }

    const object = {
      stats: this.stats.asJSON(),
      state: this.state.asJSON(),
      expires: this.expires,
    };

    localStorage.setItem(this.mode, JSON.stringify(object));
    this.onSaveCallbacks.forEach((cb) => cb(this));
  };

  private load = () => {
    try {
      this.tryLoad();
    } catch (error: any) {
      if ("type" in error === false) {
        throw new Error(
          "Something weird happened while loading the game state"
        );
      }

      const e = error as LoadError;

      console.log(e.data);
      // retrieve the stats if the state was just expired, then reset
      this.stats =
        e.type === "expired"
          ? Stats.fromJSON(this.mode, e.data.stats)
          : new Stats(this.mode);

      this.reset();
    }
  };

  private tryLoad = (): void | never => {
    const store = localStorage.getItem(this.mode);
    if (!store) {
      const error = {
        type: "not_found",
      } as LoadError;
      throw error;
    }

    const object: any = JSON.parse(store);

    // check if the state from local storage is valid
    const expires = new Date(object.expires);
    if (LingleStore.hasExpired(this.expires)) {
      const error = {
        type: "expired",
        data: object,
      } as LoadError;
      throw error;
    }

    this.expires = expires;
    this.stats = Stats.fromJSON(this.mode, object.stats);
    this.state = State.fromJSON(this.mode, object.state);
  };

  private reset = () => {
    this.state = new State(this.mode);
    this.expires = utils.tomorrow();
    this.save();
  };
}
