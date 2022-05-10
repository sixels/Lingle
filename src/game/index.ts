import Prando from "prando";

import events from "../events";
import { messages } from "../message";
import utils from "../utils";
import { WordList } from "../wordlist";
import { BoardPosition, BoardRow, N_COLS, N_ROWS, BoardColumn } from "./board";
import { LingleStore } from "../store";
// import { renderAsText } from "./share";
import { Mode } from "../mode";
import key_handler from "./key_handler";

export enum GameStatus {
  Won,
  Lost,
  Playing,
}

export interface LetterAttempt {
  // Non-normalized letter
  letter: string;
  // Normalized letter
  normalized: string;
  // The index the letter occurs
  index: number;
}

export interface WordAttempt {
  wrong_letters: LetterAttempt[];
  right_letters: LetterAttempt[];
  occur_letters: LetterAttempt[];
  board: number;
}

const mode_boards = { lingle: 1, duolingle: 2 };

export class GameManager {
  boards: GameBoard[] = [];
  edit_mode: boolean = false;

  private store: LingleStore;
  private mode: Mode;

  private title_elem: HTMLElement;

  constructor(store: LingleStore, boards: HTMLElement[], mode: Mode) {
    this.store = store;
    this.mode = mode;

    this.store.onInvalidate(this.handleInvalidateStore);

    if (this.store.state.game_number !== GameManager.gameNumber()) {
      this.store.invalidateStore();
    }

    this.title_elem = document.createElement("span");
    this.title_elem.classList.add("strong");
    document.getElementById("header-left")?.appendChild(this.title_elem);

    boards.forEach((board_elem, i) => {
      const board = new GameBoard(board_elem, this.store, this.mode, i);

      const attempts = this.store.state.attempts;
      attempts.forEach((attempt, i) => {
        let row = board.rowAtPosition(new BoardPosition([i, 0]));
        board.paintAttempt(attempt, row, false);
      });

      this.boards.push(board);
    });
    this.updatePositionAndState(this.store.state.current_position);

    this.store.state.game_number = GameManager.gameNumber();
    this.updateTitle(this.store.state.game_number);

    document.addEventListener("wordattempt", this.handleWordAttempt);
    document.addEventListener("copyresult", this.handleCopyResult);
    document.addEventListener("setposition", this.handleSetPosition);
    document.addEventListener("sendkey", this.handleSendKey);
    // document.getElementById("app")?.addEventListener("click", (ev) => {
    //   if (store.state.status !== GameStatus.Playing) {
    //     ev.stopPropagation();
    //     events.dispatchOpenStatsEvent("toggle");
    //   }
    // });
  }

  get current_position(): BoardPosition {
    // copy the position to prevent mutability
    return new BoardPosition(this.store.state.current_position.asTuple());
  }

  static dayOne = (): Date => {
    return new Date("2022/05/07");
  };

  static gameNumber = (): number => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0),
      now = new Date().setHours(0, 0, 0, 0);
    return Math.floor((now - day_one) / utils.ONE_DAY_IN_MS) + 1;
  };

  private updateTitle = (value: number) => {
    this.title_elem.innerText = `${this.mode} #${value}`;
  };

  updatePositionAndState = (new_position: BoardPosition) => {
    const ccol =
      this.current_position.col < N_COLS ? this.current_position : undefined;
    const ncol = new_position.col < N_COLS ? new_position : undefined;

    this.boards.forEach((board) => {
      ccol && board.columnAtPosition(ccol).setFocused(false);
      ncol && board.columnAtPosition(ncol).setFocused(true);
      board.rowAtPosition(new_position).setDisabled(false);
    });
    this.store.state.current_position = new_position;
  };

  private handleSendKey = (event: Event) => {
    let custom_ev = event as CustomEvent;
    let key = custom_ev.detail["key"] as string | null;
    if (key === null) {
      return;
    }

    if (this.store.state.status !== GameStatus.Playing) {
      events.dispatchOpenStatsEvent(key !== "escape");
      return;
    }

    const handlers: { [key: string]: (_: GameManager) => void } = {
      enter: key_handler.handleEnter,
      backspace: key_handler.handleBackspace,
      arrowleft: key_handler.handleLeft,
      arrowright: key_handler.handleRight,
      home: key_handler.handleHome,
      end: key_handler.handleEnd,
      escape: (_) => {},
    };

    if (key in handlers) {
      handlers[key](this);
    } else {
      const boards = this.boards.filter(
        (board) => board.status === GameStatus.Playing
      );

      if (boards.length > 0) {
        const position = this.current_position;

        boards.forEach((board) => {
          if (position.col < N_COLS) {
            const row = board.rowAtPosition(position);
            const col = row.columns[position.col];

            if (col !== undefined && key) {
              col.value = key;
              // update the current position giving preference to the next letter
              this.updatePositionAndState(
                row.nextPosition(position.step_forward().col)
              );
            }
          }
        });
      }
    }

    // reset edit mode
    this.edit_mode = false;
  };

  private handleWordAttempt = (event: Event) => {
    const custom_ev = event as CustomEvent;
    const attempt = custom_ev.detail["attempt_desc"] as WordAttempt | null;

    if (
      attempt === null ||
      this.boards[attempt.board].status !== GameStatus.Playing
    ) {
      return;
    }
    const board = this.boards[attempt.board];

    this.store.state.attempts.push(attempt);
    const position = this.current_position;

    const row = board.rowAtPosition(position);
    // paint letters
    board.paintAttempt(attempt, row, true);

    // update game state
    if (attempt.right_letters.length == N_COLS) {
      this.store.state.status = GameStatus.Won;

      setTimeout(() => {
        board.rowAtPosition(position).animateJump();
        events.dispatchSendMessageEvent(messages.gameWin());
      }, 1000);
    } else {
      const next_word = this.store.state.current_position.next_word();
      if (next_word !== null) {
        this.store.state.current_position = next_word;
        setTimeout(
          () => this.updatePositionAndState(this.store.state.current_position),
          1000
        );
      } else {
        this.store.state.status = GameStatus.Lost;

        setTimeout(() => {
          board.rowAtPosition(position).animateShake();
          events.dispatchSendMessageEvent(
            messages.gameLost(
              this.boards.map((board) => board.solution).join(",")
            )
          );
        }, 1000);
      }
    }

    this.store.stats.update(
      this.store.state.status,
      this.store.state.attempts.length - 1
    );

    this.store.save();
  };
  private handleInvalidateStore = (store: LingleStore) => {
    // todo
  };
  private handleCopyResult = (event: Event) => {
    //todo
  };
  private handleSetPosition = (event: Event) => {
    if (this.store.state.status !== GameStatus.Playing) {
      return;
    }

    let custom_ev = event as CustomEvent;
    let position = custom_ev.detail["position"] as BoardPosition | null;
    if (position === null) {
      return;
    }
    if (this.store.state.current_position.row == position.row) {
      this.edit_mode = true;
      this.boards
        .filter((board) => board.status === GameStatus.Playing)
        .forEach((board) => {
          board.columnAtPosition(position as BoardPosition).animateBounce();
        });
      this.updatePositionAndState(
        new BoardPosition([position.row, position.col])
      );
    }
  };
}

export class GameBoard {
  readonly elem: HTMLElement;
  readonly id: number;
  status: GameStatus = GameStatus.Playing;

  private readonly title: string;
  private board: BoardRow[];
  private _solution: string;

  constructor(
    board: HTMLElement,
    store: LingleStore,
    title: string,
    id: number
  ) {
    this.elem = board;
    this.title = title;
    this.board = [];
    this.id = id;

    this._solution = this.dailyWord();

    // initialize the game board
    this.generateBoard();

    store.onInvalidate(this.handleInvalidateStore);
  }

  get solution(): typeof this._solution {
    return this._solution;
  }

  setPosition = (pos: BoardPosition) => {
    this.updatePositionAndState(pos);
  };

  // Generates a random solution based on the current day
  dailyWord = (): string => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0);

    let rng = new Prando(`${this.title}.${this.id}@${day_one}`);
    rng.skip(GameManager.gameNumber() - 1);

    const index = rng.nextInt(0, WordList.size - 1);
    return [...WordList][index];
  };

  private loadState = () => {};

  private handleInvalidateStore = () => {
    for (const row of this.board) {
      row.reset();
    }
    // this.edit_mode = false;
    this._solution = this.dailyWord();
    // this.store.state.game_number = GameManager.gameNumber();
    // this.game_title = this.store.state.game_number;
    // this.updatePositionAndState(this.store.state.current_position);
  };

  private generateBoard = () => {
    for (let r = 0; r < N_ROWS; r++) {
      let row = new BoardRow(createRowElement(), r);

      for (let c = 0; c < N_COLS; c++) {
        row.pushColumn(
          new BoardColumn(createLetterElement(null), new BoardPosition([r, c]))
        );
      }

      this.board.push(row);
      this.elem.appendChild(row.elem);
    }
  };

  private updatePositionAndState(new_position: BoardPosition) {
    // let cur_column = this.tryCurrentColumn();
    // cur_column?.setFocused(false);
    // let next_column = this.tryColumnAtPosition(new_position);
    // next_column?.setFocused(true);
    // this.store.state.current_position = new_position;
    // this.currentRow().setDisabled(false);
  }

  private handleCopyResult = () => {
    // const title = `${this.title} ${this.store.state.game_number} (🔥 ${this.store.stats.win_streak})`;
    // utils
    //   .copyText(renderAsText(title, [this.store.state.attempts]))
    //   .then((method) => {
    //     if (method == "clipboard") {
    //       events.dispatchSendMessageEvent(messages.resultCopied());
    //     }
    //   });
  };

  private handleSetPosition = (event: Event) => {
    // if (this.store.state.status !== GameStatus.Playing) {
    //   return;
    // }
    // let custom_ev = event as CustomEvent;
    // let position = custom_ev.detail["position"] as BoardPosition | null;
    // if (position === null) {
    //   return;
    // }
    // if (this.store.state.current_position.row == position.row) {
    //   this.edit_mode = true;
    //   this.columnAtPosition(position).animateBounce();
    //   this.updatePositionAndState(
    //     new BoardPosition([position.row, position.col])
    //   );
    // }
  };

  paintAttempt = (attempt: WordAttempt, row: BoardRow, animate: boolean) => {
    const letters = [
      ...attempt.wrong_letters,
      ...attempt.right_letters,
      ...attempt.occur_letters,
    ].sort((a, b) => a.index - b.index);

    letters.forEach((letter, i) => {
      const col = row.columns[letter.index];

      if (!animate) {
        this.paintLetter(attempt, letter, row);
        return;
      }

      setTimeout(() => {
        col.elem.classList.add("reveal");
        col.animateBounce();

        this.paintLetter(attempt, letter, row);

        setTimeout(() => {
          col.elem.classList.remove("reveal");
          col.value = letter.letter;
        }, 180);
      }, i * 200);
    });
  };

  private paintLetter = (
    attempt: WordAttempt,
    letter: LetterAttempt,
    row: BoardRow
  ) => {
    const col = row.columns[letter.index];

    if (attempt.wrong_letters.indexOf(letter) >= 0) {
      col.elem.classList.add("wrong");
    } else if (attempt.right_letters.indexOf(letter) >= 0) {
      col.elem.classList.add("right");
    } else if (attempt.occur_letters.indexOf(letter) >= 0) {
      col.elem.classList.add("occur");
    }

    col._value = letter.letter;
  };

  columnAtPosition = (position: BoardPosition): BoardColumn => {
    return this.board[position.row].columns[position.col];
  };
  private tryColumnAtPosition = (
    position: BoardPosition
  ): BoardColumn | undefined => {
    return this.board[position.row].columns[position.col];
  };
  rowAtPosition = (position: BoardPosition): BoardRow => {
    return this.board[position.row];
  };
}

// Create a div with class row
function createRowElement(): HTMLElement {
  let row = document.createElement("div");

  row.classList.add("row", "letters");

  return row;
}

// Create a div with class letter
function createLetterElement(value: string | null): HTMLElement {
  let letter = document.createElement("div");

  letter.dataset["letter"] = "";
  letter.classList.add("letter");
  if (value !== null) {
    letter.innerText = value;
  }

  return letter;
}
