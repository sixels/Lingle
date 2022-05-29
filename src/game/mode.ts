export const ALL_MODES = ["lingle", "duolingle"] as const;
export type Modes = typeof ALL_MODES[number];

const modeBoards: { [key: string]: number } = {
  lingle: 1,
  duolingle: 2,
};

export class Mode {
  constructor(private _mode: Modes) {}
  get mode(): Modes {
    return this._mode;
  }
  get boards(): number {
    return modeBoards[this.mode];
  }
  get rows(): number {
    return this.boards + this.columns;
  }
  get columns(): number {
    return 5;
  }
}
