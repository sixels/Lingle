import { Modes } from "../game/mode";
import { Theme } from "../theme";

export class Preferences {
  pref_mode: Modes = "lingle";
  theme: Theme = "dark";

  constructor() {}

  static fromJSON(this: typeof Preferences, data: any): Preferences {
    let prefs = new this();

    prefs.pref_mode = data.pref_mode;
    prefs.theme = data.theme;

    return prefs;
  }
  asJSON = (): object => {
    return Object.freeze({
      pref_mode: this.pref_mode,
      theme: this.theme,
    });
  };
}
