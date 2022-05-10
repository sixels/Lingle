export type Mode = "lingle" | "duolingle";

const mode_boards = { lingle: 1, duolingle: 2 };

export class ModeManager {
  private _mode: Mode;

  boards: HTMLElement[] = [];

  constructor(mode: Mode) {
    this._mode = mode;

    let board_wrapper = document.getElementById("board-wrapper");
    if (board_wrapper === null) {
      throw Error("Missing #board-wrapper element");
    }

    for (let i = 0; i < mode_boards[mode]; i++) {
      const board = document.createElement("div");
      board.classList.add("board", this._mode);

      board_wrapper.appendChild(board);
      this.boards.push(board);
    }
  }

  get mode(): Mode {
    return this._mode;
  }

  changeMode(mode: Mode) {
    // todo
  }
}
