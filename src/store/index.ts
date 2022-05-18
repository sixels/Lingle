import { Mode, Modes } from "../game/mode";
import utils from "../utils";
import { Preferences } from "./preferences";

import { State } from "./state";
import { Stats } from "./stats";

export type StoreCallback = (store: LingleStore) => void;

type LoadErrorType = "expired" | "not_found";
interface LoadError {
  type: LoadErrorType;
  data?: any;
}

export class LingleStore {
  expires: Date | undefined = undefined;
  mode: Mode;
  stats: Stats;
  state: State;
  prefs: Preferences = new Preferences();
  solutions: string[] = [];

  onInvalidateCallbacks: StoreCallback[] = [];
  onSaveCallbacks: StoreCallback[] = [];

  constructor(mode: Modes) {
    this.loadPrefs();

    this.mode =
      this.prefs.pref_mode !== mode
        ? new Mode(this.prefs.pref_mode)
        : new Mode(mode);

    this.stats = new Stats(this.mode);
    this.state = new State(this.mode);
    this.load();
  }

  private static hasExpired = (expiration: Date): boolean => {
    return new Date() >= expiration;
  };

  setMode(mode: Modes) {
    // save the current state then change the mode
    this.save();
    this.mode = new Mode(mode);

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
    if (!this.expires || LingleStore.hasExpired(this.expires)) {
      this.invalidateStore();
    }

    const object = {
      stats: this.stats.asJSON(),
      state: this.state.asJSON(),
      solutions: this.solutions,
      expires: this.expires,
    };

    localStorage.setItem(this.mode.mode, JSON.stringify(object));
    localStorage.setItem("prefs", JSON.stringify(this.prefs.asJSON()));
    this.onSaveCallbacks.forEach((cb) => cb(this));
  };

  private loadPrefs = () => {
    const prefs = localStorage.getItem("prefs");
    if (prefs) {
      this.prefs = Preferences.fromJSON(JSON.parse(prefs));
    } else {
      this.prefs = new Preferences();
      localStorage.setItem("prefs", JSON.stringify(this.prefs.asJSON()));
    }
  };

  private load = () => {
    try {
      this.tryLoad();
    } catch (error: any) {
      if ("type" in error === false) {
        this.reset();
        throw new Error(
          "Something weird happened while loading the game state"
        );
      }

      const e = error as LoadError;

      // retrieve the stats if the state was just expired, then reset
      this.stats =
        e.type === "expired"
          ? Stats.fromJSON(this.mode, e.data.stats)
          : new Stats(this.mode);

      this.reset();
    }
  };

  private tryLoad = (): void | never => {
    const store = localStorage.getItem(this.mode.mode);
    if (!store) {
      const error = {
        type: "not_found",
      } as LoadError;
      throw error;
    }

    this.loadPrefs();

    const object: any = JSON.parse(store);

    // check if the state from local storage is valid
    const expires = new Date(object.expires);
    if (LingleStore.hasExpired(expires)) {
      const error = {
        type: "expired",
        data: object,
      } as LoadError;
      throw error;
    }

    this.expires = expires;
    this.stats = Stats.fromJSON(this.mode, object.stats);
    this.state = State.fromJSON(this.mode, object.state);
    this.solutions = [...object.solutions];
  };

  private reset = () => {
    this.state = new State(this.mode);
    this.expires = utils.tomorrow();
    this.solutions = [];
    this.save();
  };
}
