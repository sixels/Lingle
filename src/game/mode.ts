export type Mode = "lingle" | "duolingle";

const mode_boards: { [key: string]: number } = {
  lingle: 1,
  duolingle: 2,
};

export const modeBoards = (mode: Mode): number => {
  return mode_boards[mode];
};

export const modeRows = (mode: Mode): number => {
  return modeBoards(mode) + 5;
};
