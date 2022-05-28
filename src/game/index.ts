import Prando from "prando";

import events from "../events";
// import { messages } from "../message";
import utils from "../utils";
import { Solutions } from "../wordlist";
import { BoardColumn, BoardPosition, BoardRow, N_COLS } from "./board";
import { LingleStore } from "../store";
import { Mode, Modes } from "./mode";
import input from "./input";
import { Message, MessageKind, messages } from "../message";
import { renderAsText } from "./share";

export type GameStatus = "won" | "lost" | "playing";

export namespace AttemptType {
  export const Occur: "occur" = "occur" as const;
  export const Right: "right" = "right" as const;
  export const Wrong: "wrong" = "wrong" as const;
  export type Any =
    | typeof AttemptType.Occur
    | typeof AttemptType.Right
    | typeof AttemptType.Wrong;
}

export interface LetterAttempt<T> {
  // Non-normalized letter
  letter: string;
  // Normalized letter
  normalized: string;
  // The index the letter occurs
  index: number;
  type: T;
}

export interface WordAttempt {
  letters: LetterAttempt<AttemptType.Any>[];
  board: number;
}

export class GameManager {
  boards: GameBoard[] = [];
  edit_mode: boolean = false;

  private store: LingleStore;
  private title_elem: HTMLElement;
  private revealing: boolean = false;

  constructor(store: LingleStore) {
    this.store = store;

    this.boards = GameManager.createBoards(this.store);

    this.title_elem = document.createElement("span");
    this.title_elem.classList.add("strong");
    document.getElementById("header-left")?.appendChild(this.title_elem);

    this.store.onInvalidate(this.handleInvalidateStore);
    this.validateStore();

    this.store.state.game_number = GameManager.gameNumber();

    this.updatePositionAndState(this.store.state.current_position);

    this.updateTitle(this.store.state.game_number);

    document.addEventListener("copyresult", this.handleCopyResult);
    document.addEventListener("setposition", this.handleSetPosition);
    document.addEventListener("sendkey", this.handleSendKey);
    document.getElementById("app")?.addEventListener("click", (ev) => {
      if (store.state.status.every((state) => state !== GameStatus.Playing)) {
        ev.stopPropagation();
        events.dispatchOpenStatsEvent("toggle");
      }
    });
  }

  get current_position(): BoardPosition {
    // copy the position to prevent mutability
    return new BoardPosition(
      this.store.state.current_position.asTuple(),
      this.store.state.current_position.rows
    );
  }
  get mode(): Mode {
    return this.store.mode;
  }

  static dayOne = (): Date => {
    return new Date("2022/05/22");
  };

  static gameNumber = (): number => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0),
      now = new Date().setHours(0, 0, 0, 0);
    return Math.floor((now - day_one) / utils.ONE_DAY_IN_MS) + 1;
  };

  // Creates and initialize game boards
  static createBoards = (store: LingleStore): GameBoard[] => {
    const mode = store.mode;

    let board_wrapper = document.getElementById("board-wrapper");
    if (board_wrapper === null) {
      throw new Error("Missing #board-wrapper element");
    }

    let boards_elem = [];
    for (let i = 0; i < mode.boards; i++) {
      const board = document.createElement("div");
      board.classList.add("board", mode.mode);

      board_wrapper.appendChild(board);
      boards_elem.push(board);
    }

    return GameManager.initBoards(boards_elem, store);
  };

  static initBoards(
    boards_elem: HTMLElement[],
    store: LingleStore
  ): GameBoard[] {
    const mode = store.mode;
    const attempts = store.state.attempts;

    let boards: GameBoard[] = [];
    if (attempts) {
      boards_elem.forEach((board_elem, i) => {
        const board = new GameBoard(board_elem, mode, i);
        board.status = store.state.status[i];

        const attempts = store.state.attempts[i];
        attempts.forEach((attempt, j) => {
          let row = board.rowAtPosition(new BoardPosition([j, 0], mode.rows));
          board.paintAttempt(attempt, row, false);
        });

        boards.push(board);
      });
    }

    return boards;
  }

  setMode = (mode: Modes) => {
    if (this.mode.mode === mode) {
      return;
    }

    for (const board of this.boards) {
      board.elem.remove();
    }

    // will trigger StoreInvalidate
    this.store.setMode(mode);

    this.validateStore();
    this.store.state.game_number = GameManager.gameNumber();

    this.updatePositionAndState(this.store.state.current_position);
  };

  playingBoards = (): GameBoard[] => {
    return this.boards.filter((board) => board.status === GameStatus.Playing);
  };

  updatePositionAndState = (new_position: BoardPosition) => {
    const ccol =
      this.current_position.col < N_COLS ? this.current_position : undefined;
    const ncol = new_position.col < N_COLS ? new_position : undefined;

    this.boards.forEach((board) => {
      if (board.status !== GameStatus.Playing) {
        return;
      }

      ccol && board.columnAtPosition(ccol).setFocused(false);
      ncol && board.columnAtPosition(ncol).setFocused(true);
      board.rowAtPosition(new_position).setDisabled(false);
    });
    this.store.state.current_position = new_position;
  };

  attemptAll = (attempts: WordAttempt[]) => {
    const reveal_time = 1000;

    let n_attempt = 0;
    let next_word: BoardPosition | null = null;
    for (const attempt of attempts) {
      if (attempt.board >= this.boards.length) {
        continue;
      }
      this.store.state.attempts[attempt.board].push(attempt);
      n_attempt = this.store.state.attempts[attempt.board].length - 1;

      const board = this.boards[attempt.board];

      const position = this.current_position;
      const attempt_row = board.rowAtPosition(position);

      // paint letters
      this.revealing = true;
      board.paintAttempt(attempt, attempt_row, true);
      setTimeout(() => {
        this.revealing = false;
      }, reveal_time);

      // update game state
      if (
        attempt.letters.every((letter) => letter.type === AttemptType.Right)
      ) {
        board.status = GameStatus.Won;

        setTimeout(() => {
          attempt_row.animateJump();
        }, reveal_time);
      } else {
        next_word = this.current_position.next_word();
        if (!next_word) {
          board.status = GameStatus.Lost;

          setTimeout(() => {
            attempt_row.animateShake();
          }, reveal_time);
        }
      }
      this.store.state.status[attempt.board] = board.status;
    }

    if (next_word !== null) {
      this.store.state.current_position = next_word;
      setTimeout(() => {
        attempts.forEach(events.dispatchWordAttemptEvent);
        this.updatePositionAndState(this.current_position);
      }, reveal_time);
    } else {
      const status = this.boards.every(
        (board) => board.status == GameStatus.Won
      )
        ? GameStatus.Won
        : GameStatus.Lost;

      this.store.stats.update(status, n_attempt);
      this.store.solutions = this.boards.map((b) => b.solution);
      setTimeout(() => {
        events.dispatchSendMessageEvent(
          status === GameStatus.Won
            ? messages.gameWin()
            : messages.gameLost(this.boards.map((board) => board.solution))
        );
      }, reveal_time);
    }

    this.store.save();
  };

  private validateStore = () => {
    if (this.store.state.game_number === 0) {
      this.store.state.game_number = GameManager.gameNumber();
      this.updateTitle(this.store.state.game_number);
      return;
    }

    if (this.store.state.game_number !== GameManager.gameNumber()) {
      this.store.invalidateStore();
    }
  };

  private updateTitle = (value: number) => {
    this.title_elem.innerText = `${this.mode.mode} #${value}`;
  };

  private handleSendKey = (event: Event) => {
    let custom_ev = event as CustomEvent;
    let key = custom_ev.detail["key"] as string | null;
    if (key === null || this.revealing) {
      return;
    }

    const boards = this.playingBoards();

    events.dispatchOpenHtpEvent(false);
    if (boards.length === 0) {
      if (key === "escape") {
        events.dispatchOpenStatsEvent(false);
      } else {
        events.dispatchOpenStatsEvent("toggle");
      }
      return;
    }

    const handlers: { [key: string]: (_: GameManager) => void } = {
      enter: input.handleEnter,
      backspace: input.handleBackspace,
      arrowleft: input.handleLeft,
      arrowright: input.handleRight,
      home: input.handleHome,
      end: input.handleEnd,
      escape: (_) => {},
    };

    if (key in handlers) {
      handlers[key](this);
    } else {
      const position = this.current_position;

      if (position.col < N_COLS && boards.length > 0) {
        let next_position: BoardPosition | undefined = undefined;
        boards.forEach((board) => {
          if (position.col < N_COLS) {
            const row = board.rowAtPosition(position);
            const col = row.columns[position.col];

            if (col !== undefined && key) {
              col.value = key;
              // update the current position giving preference to the next letter
              if (next_position === undefined) {
                next_position = row.nextPosition(position.step_forward());
              }
            }
          }
        });

        // we already set next_position
        if (next_position) this.updatePositionAndState(next_position);
      }
    }

    // reset edit mode
    this.edit_mode = false;
  };

  private handleInvalidateStore = (store: LingleStore) => {
    this.updateTitle(GameManager.gameNumber());
    for (const board of this.boards) {
      board.elem.remove();
    }
    this.boards = GameManager.createBoards(store);
  };

  private handleCopyResult = (_: Event) => {
    if (this.playingBoards().length == 0) {
      const title = `${this.mode.mode} ${this.store.state.game_number} (🔥${this.store.stats.win_streak})`;
      utils
        .copyText(renderAsText(title, this.store.state.attempts))
        .then((method) => {
          if (method == "clipboard") {
            events.dispatchSendMessageEvent(messages.resultCopied());
          }
        });
    } else {
      events.dispatchSendMessageEvent({
        data: "Você ainda não terminou o jogo.",
        kind: MessageKind.Error,
      } as Message);
    }
  };

  private handleSetPosition = (event: Event) => {
    const boards = this.playingBoards();
    if (boards.length === 0) {
      return;
    }

    let custom_ev = event as CustomEvent;
    let position = custom_ev.detail["position"] as BoardPosition | null;
    if (position === null) {
      return;
    }
    if (this.store.state.current_position.row == position.row) {
      this.edit_mode = true;
      boards.forEach((board) => {
        board.columnAtPosition(position as BoardPosition).animateBounce();
      });
      this.updatePositionAndState(
        new BoardPosition([position.row, position.col], position.rows)
      );
    }
  };
}

export class GameBoard {
  readonly elem: HTMLElement;
  readonly id: number;
  readonly solution: string;
  readonly mode: Mode;
  status: GameStatus = GameStatus.Playing;

  private board: BoardRow[];

  constructor(board: HTMLElement, mode: Mode, id: number) {
    this.elem = board;
    this.mode = mode;
    this.board = [];
    this.id = id;

    this.solution = this.dailyWord();

    // initialize the game board
    this.generateBoard(mode);
  }

  // Generates a random solution based on the current day
  dailyWord = (): string => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0);

    let rng = new Prando(`${this.mode.mode}@${day_one}`);
    rng.skip((GameManager.gameNumber() - 1) * this.mode.boards + this.id);

    const index = rng.nextInt(0, Solutions.size - 1);
    return [...Solutions][index];
  };

  private generateBoard = (mode: Mode) => {
    for (let r = 0; r < mode.rows; r++) {
      let row = new BoardRow(createRowElement(), r);

      for (let c = 0; c < N_COLS; c++) {
        row.pushColumn(
          new BoardColumn(
            createLetterElement(null),
            new BoardPosition([r, c], this.mode.rows)
          )
        );
      }

      this.board.push(row);
      this.elem.appendChild(row.elem);
    }
  };

  paintAttempt = (attempt: WordAttempt, row: BoardRow, animate: boolean) => {
    const letters = attempt.letters.sort((a, b) => a.index - b.index);

    letters.forEach((letter, i) => {
      const col = row.columns[letter.index];

      if (!animate) {
        this.paintLetter(letter, row);
        return;
      }

      setTimeout(() => {
        col.elem.classList.add("reveal");
        col.animateBounce();

        this.paintLetter(letter, row);

        setTimeout(() => {
          col.elem.classList.remove("reveal");
          col.value = letter.letter;
        }, 180);
      }, i * 200);
    });
  };

  private paintLetter = (
    letter: LetterAttempt<AttemptType.Any>,
    row: BoardRow
  ) => {
    const col = row.columns[letter.index];

    switch (letter.type) {
      case AttemptType.Wrong:
        col.elem.classList.add("wrong");
        break;
      case AttemptType.Right:
        col.elem.classList.add("right");
        break;
      case AttemptType.Occur:
        col.elem.classList.add("occur");
        break;
      default:
        break;
    }

    col._value = letter.letter;
  };

  columnAtPosition = (position: BoardPosition): BoardColumn => {
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
