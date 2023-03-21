export const MODES = [
  "lingle",
  "duolingle",
  "quadlingle",
  "octolingle",
  "declingle",
] as const;
export type Modes = typeof MODES[number];

const ModeNames = {
  lingle: "Lingle",
  duolingle: "Duo-lingle",
  quadlingle: "Quad-lingle",
  octolingle: "Octo-lingle",
  declingle: "Dec-lingle",
};

const modeBoards: { [key: string]: number } = {
  lingle: 1,
  duolingle: 2,
  quadlingle: 4,
  octolingle: 8,
  declingle: 10,
};

export class Mode {
  constructor(private _mode: Modes) {}
  get mode(): Modes {
    return this._mode;
  }
  get boards(): number {
    return modeBoards[this.mode];
  }
  get displayName(): string {
    return ModeNames[this._mode];
  }
  get rows(): number {
    return this.boards + this.columns;
  }
  get columns(): number {
    return 5;
  }
}
