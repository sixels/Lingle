export type Modes = "lingle" | "duolingle";

const modeBoards: { [key: string]: number } = {
  lingle: 1,
  duolingle: 2,
};

export class Mode {
  constructor(private _mode: Modes) {}
  get boards(): number {
    return modeBoards[this.mode];
  }
  get rows(): number {
    return this.boards + 5;
  }
  get mode(): Modes {
    return this._mode;
  }
}
