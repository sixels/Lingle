import Prando from "prando";

import events from "../events";
import { messages } from "../message";
import utils from "../utils";
import { WordList, WordListNormalized } from "../wordlist";
import { BoardPosition, BoardRow, N_COLS, N_ROWS, BoardColumn } from "./board";
import { GameState, LingleStore } from "../store";
import { renderAsText } from "./share";

interface LetterAttempt {
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
}

export class GameManager {
  private elem: HTMLElement;

  private board: BoardRow[];
  private edit_mode: boolean = false;
  private _solution: string;
  private title_elem: HTMLElement;
  private readonly title: string;

  // private current_position: BoardPosition;
  // private state: GameState;

  private store: LingleStore;

  static dayOne = (): Date => {
    return new Date("2022/5/03");
  };

  // Generates a random solution based on the current day
  static dailyWord = (): string => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0);

    let rng = new Prando(day_one);
    rng.skip(GameManager.gameNumber());

    const index = rng.nextInt(0, WordList.size - 1);
    return [...WordList][index];
  };

  static gameNumber = (): number => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0),
      now = new Date().setHours(0, 0, 0, 0);
    return Math.floor((now - day_one) / utils.ONE_DAY_IN_MS);
  };

  constructor(board: HTMLElement, title: string, store: LingleStore) {
    this.elem = board;
    this.title = title;
    this.board = [];

    this.title_elem = document.createElement("span");
    this.title_elem.classList.add("strong");

    this._solution = GameManager.dailyWord();
    this.store = store;

    this.store.onInvalidateStore(this.handleInvalidateStore);

    // initialize the game board
    this.generateBoard();
    this.loadState();

    if (this.store.state !== GameState.Playing) {
      const last_attempt = [...this.store.attempts].pop();
      if (
        last_attempt !== undefined &&
        last_attempt.right_letters.length === N_COLS
      ) {
        const attempt = last_attempt.right_letters
          .sort((a, b) => a.index - b.index)
          .map((a) => a.letter)
          .join("");
        if (attempt !== this._solution) {
          this.store.invalidateStore();
        }
      }
    }
    this.game_title = GameManager.gameNumber();

    document.getElementById("header-left")?.appendChild(this.title_elem);
    document.addEventListener("wordattempt", this.handleWordAttempt);
  }

  get solution(): typeof this._solution {
    return this._solution;
  }

  set game_title(value: number) {
    this.title_elem.innerText = `${this.title} #${value}`;
  }

  start = () => {
    this.updatePositionAndState(this.store.current_position);
    document.addEventListener("sendkey", this.handleSendKey);
    document.addEventListener("setposition", this.handleSetPosition);
  };

  private loadState = () => {
    const attempts = this.store.attempts;
    attempts.forEach((attempt, i) => {
      let row = this.rowAtPosition(new BoardPosition(i, 0));
      this.paintAttempt(attempt, row, false);
    });
    this.updatePositionAndState(this.store.current_position);
  };

  private handleInvalidateStore() {
    for (const row of this.board) {
      row.reset();
    }
    this.edit_mode = false;
    this._solution = GameManager.dailyWord();
    this.game_title = GameManager.gameNumber();
    this.updatePositionAndState(this.store.current_position);
  }

  private generateBoard = () => {
    for (let r = 0; r < N_ROWS; r++) {
      let row = new BoardRow(createRowElement(), r);

      for (let c = 0; c < N_COLS; c++) {
        row.pushColumn(
          new BoardColumn(createLetterElement(null), new BoardPosition(r, c))
        );
      }

      this.board.push(row);
      this.elem.appendChild(row.elem);
    }
  };

  private updatePositionAndState(new_position: BoardPosition) {
    let cur_column = this.tryCurrentColumn();
    cur_column?.setFocused(false);

    let next_column = this.tryColumnAtPosition(new_position);
    next_column?.setFocused(true);

    this.store.current_position = new_position;
    this.currentRow().setDisabled(false);
  }

  private copyResult() {
    const title = `${this.title} ${GameManager.gameNumber()}`;
    utils.copyText(renderAsText(title, [this.store.attempts])).then(() => {
        events.dispatchSendMessageEvent(messages.resultCopied);
      });

    // utils
    //   .openCanvas(
    //     renderImage(this._game_number.innerText, [this.store.attempts])
    //   )
    //   .then(() => {
    //     events.dispatchSendMessageEvent(messages.resultCopied);
    //   });
  }

  private handleSendKey = (event: Event) => {
    if (this.store.state !== GameState.Playing) {
      this.copyResult();
      return;
    }

    let custom_ev = event as CustomEvent;
    let key = custom_ev.detail["key"] as string | null;
    if (key === null) {
      return;
    }

    switch (key) {
      case "enter":
        // check if the length is 5
        const word = this.currentRow().value;
        if (word.length != N_COLS) {
          events.dispatchSendMessageEvent(messages.wrongSize(N_COLS));
          this.currentRow().animateShake();
          break;
        }

        // check if the word exists
        const normalized_word = utils.normalizedWord(word);
        const wordlist_word = WordListNormalized.get(normalized_word);

        // check if the word does exists
        if (wordlist_word) {
          events.dispatchWordAttemptEvent(
            compareWords(this.solution, wordlist_word)
          );
        } else {
          events.dispatchSendMessageEvent(messages.invalidWord);
          this.currentRow().animateShake();
        }

        break;
      case "backspace":
        let column = this.tryCurrentColumn();
        if (column === undefined) {
          // When we finish a word, the column goes to N_COLS (an invalid)
          // position. In this case, we first need to go back to the position
          // N_COLS-1, then we can get the actual column.
          this.updatePositionAndState(
            this.store.current_position.step_backward()
          );
          column = this.currentColumn();
          // Enter edit mode so we don't update the position.
          this.edit_mode = true;
        }

        let deleted = false;
        if (column.value !== "") {
          column.value = "";
          deleted = true;
        }

        if (!this.edit_mode) {
          this.updatePositionAndState(
            this.store.current_position.step_backward()
          );
          // We already deleted a letter, just go back a position.
          if (!deleted) {
            this.currentColumn().value = "";
          }
        }

        break;
      case "arrowleft":
        events.dispatchSetPositionEvent(
          this.store.current_position.step_backward()
        );
        break;
      case "arrowright":
        let p = this.store.current_position.step_forward();
        if (p.col < N_COLS) {
          events.dispatchSetPositionEvent(p);
        }
        break;
      default:
        let cur_column = this.tryCurrentColumn();
        if (cur_column !== undefined) {
          cur_column.value = key;
          this.updatePositionAndState(
            this.currentRow().nextPosition(
              this.store.current_position.step_forward().col
            )
          );
        }
    }

    // reset edit mode
    this.edit_mode = false;
  };

  private handleSetPosition = (event: Event) => {
    if (this.store.state !== GameState.Playing) {
      return;
    }

    let custom_ev = event as CustomEvent;

    let position = custom_ev.detail["position"] as BoardPosition | null;
    if (position === null) {
      return;
    }

    if (this.store.current_position.row == position.row) {
      this.edit_mode = true;
      this.columnAtPosition(position).animateBounce();
      this.updatePositionAndState(
        new BoardPosition(position.row, position.col)
      );
    }
  };

  private handleWordAttempt = (event: Event) => {
    const custom_ev = event as CustomEvent;
    const attempt = custom_ev.detail["attempt_desc"] as WordAttempt | null;

    if (attempt === null) {
      return;
    }

    this.store.attempts.push(attempt);

    // paint letters
    this.paintAttempt(attempt, this.currentRow(), true);

    // update game state
    if (attempt.right_letters.length == N_COLS) {
      this.store.state = GameState.Won;
      setTimeout(() => events.dispatchSendMessageEvent(messages.gameWin), 740);
    } else {
      const next_word = this.store.current_position.next_word();
      if (next_word !== null) {
        this.store.current_position = next_word;
        setTimeout(() => this.updatePositionAndState(next_word), 740);
      } else {
        this.store.state = GameState.Lost;
        setTimeout(() => {
          this.currentRow().animateShake();
          events.dispatchSendMessageEvent(messages.gameLost(this._solution));
        }, 740);
      }
    }

    this.store.save();
  };

  private paintAttempt = (
    attempt: WordAttempt,
    row: BoardRow,
    animate: boolean
  ) => {
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
          col.value = letter.letter;
        }, 130);
      }, i * 100);
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

  private columnAtPosition = (position: BoardPosition): BoardColumn => {
    return this.board[position.row].columns[position.col];
  };
  private tryColumnAtPosition = (
    position: BoardPosition
  ): BoardColumn | undefined => {
    return this.board[position.row].columns[position.col];
  };
  private currentColumn = (): BoardColumn => {
    return this.columnAtPosition(this.store.current_position);
  };
  private tryCurrentColumn = (): BoardColumn | undefined => {
    return this.tryColumnAtPosition(this.store.current_position);
  };

  private rowAtPosition = (position: BoardPosition): BoardRow => {
    return this.board[position.row];
  };
  private currentRow = (): BoardRow => {
    return this.rowAtPosition(this.store.current_position);
  };
}

function compareWords(base: string, cmp: string): WordAttempt {
  let right_letters: LetterAttempt[] = [];
  let occur_letters: LetterAttempt[] = [];
  let wrong_letters: LetterAttempt[] = [];

  // create a list of base's letters
  let base_letters: (string | undefined)[] = utils
    .normalizedWord(base)
    .split("");
  // normalize the cmp
  const cmp_norm = utils.normalizedWord(cmp);

  for (let i = 0; i < cmp_norm.length; i++) {
    const cmp_norm_letter = cmp_norm[i];
    const cmp_unorm_letter = cmp[i];
    const occurrences: Set<number> = new Set();

    // modify the list to exclude already used letters
    base_letters
      .map((l) => {
        return l === cmp_norm_letter ? l : undefined;
      })
      .forEach((l, ind) => {
        if (l !== undefined) {
          occurrences.add(ind);
        }
      });

    // get the reference to the category
    let category: LetterAttempt[] | undefined = undefined;
    if (occurrences.size > 0) {
      let index: number = occurrences.values().next().value;
      if (occurrences.has(i)) {
        index = i;
        category = right_letters;
      } else {
        category = occur_letters;
      }
      base_letters[index] = undefined;
    } else {
      category = wrong_letters;
    }

    category?.push({
      letter: cmp_unorm_letter,
      normalized: cmp_norm_letter,
      index: i,
    });
  }

  return {
    right_letters,
    occur_letters,
    wrong_letters,
  };
}

// Create a div with class row
function createRowElement(): HTMLElement {
  let row = document.createElement("div");

  row.classList.add("row");

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
