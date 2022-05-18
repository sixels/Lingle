export type Modes = "lingle" | "duolingle";
export const all_modes: readonly Modes[] = ["lingle", "duolingle"] as const;

const mode_boards: { [key: string]: number } = {
  lingle: 1,
  duolingle: 2,
};

export class Mode {
  constructor(private _mode: Modes) {}
  get boards(): number {
    return mode_boards[this.mode];
  }
  get rows(): number {
    return this.boards + 5;
  }
  get mode(): Modes {
    return this._mode;
  }
}
