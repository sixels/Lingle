import Prando from "prando";

import events from "../events";
import { messages } from "../message";
import utils from "../utils";
import { WordList, WordListNormalized } from "../wordlist";
import { BoardPosition, BoardRow, N_COLS, N_ROWS, BoardColumn } from "./board";

enum GameState {
  Won,
  Lost,
  Playing,
}
// type GameState = "won" | "lost" | "playing";

interface LetterAttempt {
  letter: string;
  normalized: string;
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
  private current_position: BoardPosition;
  private edit_mode: boolean = false;
  private _solution: string;
  private state: GameState;

  constructor(board: HTMLElement) {
    this.elem = board;
    this.current_position = new BoardPosition(0, 0);
    this.board = [];
    this.state = GameState.Playing;

    // initialize the game board
    this.generateBoard();

    // generate a random solution based on the current day
    this._solution = GameManager.dailyWord();

    document.addEventListener("wordattempt", this.handleWordAttempt);
  }

  static dayOne = (): Date => {
    return new Date("2022/3/28");
  };

  static dailyWord = (): string => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0);

    let rng = new Prando(day_one);
    rng.skip(GameManager.gameNumber());

    const index = rng.nextInt(0, WordList.size - 1);
    return [...WordList][index];
  };

  static gameNumber = (): number => {
    const day_one = GameManager.dayOne().setHours(0, 0, 0, 0);
    const now = new Date().setHours(0, 0, 0, 0);
    const day_in_ms = 1000 * 60 * 60 * 24;

    return Math.floor((now - day_one) / day_in_ms);
  };

  get solution(): typeof this._solution {
    return this._solution;
  }

  start = () => {
    this.updatePositionAndState(this.current_position);
    document.addEventListener("sendkey", this.handleSendKey);
    document.addEventListener("setposition", this.handleSetPosition);
  };

  private generateBoard = () => {
    for (let r = 0; r < N_ROWS; r++) {
      let row = new BoardRow(create_row_element(), r);

      for (let c = 0; c < N_COLS; c++) {
        row.pushColumn(
          new BoardColumn(create_letter_element(null), new BoardPosition(r, c))
        );
      }

      row.elem.classList.add("disabled");
      this.board.push(row);
      this.elem.appendChild(row.elem);
    }
  };

  private updatePositionAndState(new_position: BoardPosition) {
    let cur_column = this.tryCurrentColumn();
    cur_column?.setFocused(false);

    let next_column = this.tryColumnAtPosition(new_position);
    next_column?.setFocused(true);

    this.current_position = new_position;
    this.currentRow().elem.classList.remove("disabled");
  }

  private handleSendKey = (event: Event) => {
    if (this.state !== GameState.Playing) {
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

          if (this._solution == wordlist_word) {
            this.state = GameState.Won;
            events.dispatchSendMessageEvent(messages.gameWin);
          } else {
            let next_word = this.current_position.next_word();
            if (next_word !== null) {
              this.updatePositionAndState(next_word);
            } else {
              this.state = GameState.Lost;
              events.dispatchSendMessageEvent(
                messages.gameLost(this._solution)
              );
            }
          }
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
          this.updatePositionAndState(this.current_position.step_backward());
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
          this.updatePositionAndState(this.current_position.step_backward());
          // We already deleted a letter, just go back a position.
          if (!deleted) {
            this.currentColumn().value = "";
          }
        }

        break;
      case "arrowleft":
        events.dispatchSetPositionEvent(this.current_position.step_backward());
        break;
      case "arrowright":
        let p = this.current_position.step_forward();
        if (p.col < N_COLS) {
          events.dispatchSetPositionEvent(p);
        }
        break;
      default:
        let cur_column = this.tryCurrentColumn();
        if (cur_column !== undefined) {
          cur_column.value = key;
          this.updatePositionAndState(this.currentRow().nextPosition());
        }
    }

    // reset edit mode
    this.edit_mode = false;
  };

  private handleSetPosition = (event: Event) => {
    if (this.state !== GameState.Playing) {
      return;
    }

    let custom_ev = event as CustomEvent;

    let position = custom_ev.detail["position"] as BoardPosition | null;
    if (position === null) {
      return;
    }

    if (this.current_position.row == position.row) {
      this.edit_mode = true;
      this.columnAtPosition(position).animateBounce();
      this.updatePositionAndState(
        new BoardPosition(position.row, position.col)
      );
    }
  };

  private handleWordAttempt = (event: Event) => {
    const custom_ev = event as CustomEvent;
    const attempt_desc = custom_ev.detail["attempt_desc"] as WordAttempt | null;

    if (attempt_desc === null) {
      return;
    }

    const row = this.currentRow();

    for (const letter of attempt_desc.wrong_letters) {
      const col = row.columns[letter.index];
      col.elem.classList.add("wrong");
      col.value = letter.letter;
    }
    for (const letter of attempt_desc.right_letters) {
      const col = row.columns[letter.index];
      col.elem.classList.add("right");
      col.value = letter.letter;
    }
    for (const letter of attempt_desc.occur_letters) {
      const col = row.columns[letter.index];
      if (!col.elem.classList.contains("right")) {
        col.elem.classList.add("occur");
        col.value = letter.letter;
      }
    }
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
    return this.columnAtPosition(this.current_position);
  };
  private tryCurrentColumn = (): BoardColumn | undefined => {
    return this.tryColumnAtPosition(this.current_position);
  };

  private rowAtPosition = (position: BoardPosition): BoardRow => {
    return this.board[position.row];
  };
  private currentRow = (): BoardRow => {
    return this.rowAtPosition(this.current_position);
  };
}

function compareWords(base: string, cmp: string): WordAttempt {
  let right_letters: LetterAttempt[] = [];
  let occur_letters: LetterAttempt[] = [];
  let wrong_letters: LetterAttempt[] = [];

  let letters: (string | undefined)[] = utils.normalizedWord(base).split("");
  const norm = utils.normalizedWord(cmp);

  for (let i = 0; i < norm.length; i++) {
    const letter = norm[i];
    const j: Set<number> = new Set();

    letters
      .map((l) => {
        if (l === letter) {
          return l;
        } else {
          return undefined;
        }
      })
      .forEach((l, ind) => {
        if (l === undefined) {
          return;
        }
        console.log(ind);
        j.add(ind);
      });

    const nonnormalized = cmp[i];
    let collection: LetterAttempt[] | undefined = undefined;
    if (j.size > 0) {
      let ind: number = j.values().next().value;
      if (j.has(i)) {
        ind = i;
        collection = right_letters;
      } else {
        collection = occur_letters;
      }
      letters[ind] = undefined;
    } else {
      collection = wrong_letters;
    }

    collection?.push({
      letter: nonnormalized,
      normalized: letter,
      index: i,
    });
  }

  console.log(occur_letters);

  return {
    right_letters,
    occur_letters,
    wrong_letters,
  };
}

// Create a div with class row
function create_row_element(): HTMLElement {
  let row = document.createElement("div");

  row.classList.add("row");

  return row;
}

// Create a div with class letter
function create_letter_element(value: string | null): HTMLElement {
  let letter = document.createElement("div");

  letter.classList.add("letter");
  if (value !== null) {
    letter.innerText = value;
  }

  return letter;
}
