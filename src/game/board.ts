import events from "../events";

export const N_ROWS = 6;
export const N_COLS = 5;

export class BoardPosition {
  private _row: number;
  private _col: number;
  readonly rows: number;

  // Create a new BoardPosition. row and col should not be greater than N_ROWS
  // and N_COLS, respectively. Negative positions are also invalid.
  constructor([row, col]: [number, number], rows?: number) {
    this.rows = rows || N_ROWS;
    if (row < 0 || col < 0 || row >= this.rows || col > N_COLS) {
      throw new Error(`Invalid board position: row ${row}, column ${col}`);
    }

    this._row = row;
    this._col = col;
  }

  get row(): number {
    return this._row;
  }
  get col(): number {
    return this._col;
  }

  // Return a new position with column incremented by one
  step_forward = (): BoardPosition => {
    return new BoardPosition(
      [this.row, this.col < N_COLS ? this.col + 1 : this.col],
      this.rows
    );
  };
  step_backward = (): BoardPosition => {
    return new BoardPosition(
      [this.row, this.col - 1 >= 0 ? this.col - 1 : this.col],
      this.rows
    );
  };
  next_word = (): BoardPosition | null => {
    try {
      return new BoardPosition([this.row + 1, 0], this.rows);
    } catch (_) {
      return null;
    }
  };

  asTuple = (): [number, number] => {
    return [this._row, this._col];
  };
}

export class BoardColumn {
  private readonly position: BoardPosition;
  elem: HTMLElement;

  constructor(elem: HTMLElement, position: BoardPosition) {
    this.elem = elem;
    this.position = position;

    this.elem.addEventListener("click", this.handleClick);
  }

  get value(): string {
    return this.elem.innerText.toLowerCase();
  }
  set value(new_value: string) {
    this._value = new_value;
    if (new_value.length > 0) {
      this.animateBounce();
    }
  }
  set _value(new_value: string) {
    this.elem.innerText = `${new_value}`;
  }

  animateBounce = () => {
    this.elem.classList.add("bouncing");
    setTimeout(() => {
      this.elem.classList.remove("bouncing");
    }, 70);
  };

  isEmpty = (): boolean => {
    return this.value.length == 0;
  };
  setFocused = (option: boolean) => {
    option
      ? this.elem.classList.add("focused")
      : this.elem.classList.remove("focused");
  };

  setLetterRight = (option: boolean) => {
    option
      ? (this.elem.classList.add("right"), this.elem.classList.remove("occur"))
      : this.elem.classList.remove("right");
  };
  setLetterOccur = (option: boolean) => {
    // prevent .occur to overlap .right
    option && !this.elem.classList.contains("right")
      ? this.elem.classList.add("occur")
      : this.elem.classList.remove("occur");
  };
  setLetterWrong = (option: boolean) => {
    option
      ? this.elem.classList.add("wrong")
      : this.elem.classList.remove("wrong");
  };

  reset = () => {
    this.elem.classList.remove(
      "focused",
      "bouncing",
      "reveal",
      "right",
      "wrong",
      "occur"
    );
    this._value = "";
  };

  private handleClick = () => {
    events.dispatchSetPositionEvent(this.position);
  };
}

export class BoardRow {
  private readonly index;
  columns: BoardColumn[];
  elem: HTMLElement;

  constructor(elem: HTMLElement, index: number) {
    this.elem = elem;
    this.columns = [];
    this.index = index;

    this.setDisabled(true);
  }

  get value(): string {
    return this.columns.map((col) => col.value).join("");
  }

  // push a column to the row
  pushColumn = (column: BoardColumn) => {
    this.elem.appendChild(column.elem);
    this.columns.push(column);
  };

  // get the first empty column
  nextPosition = (priority: BoardPosition): BoardPosition => {
    const priority_column = this.columns.at(priority.col);

    if (priority_column !== undefined && priority_column.isEmpty()) {
      return new BoardPosition([this.index, priority.col], priority.rows);
    }

    const col = this.columns.findIndex((col) => col.isEmpty());
    return new BoardPosition(
      [this.index, col < 0 ? N_COLS : col],
      priority.rows
    );
  };

  setDisabled = (option: boolean) => {
    option
      ? this.elem.classList.add("disabled")
      : this.elem.classList.remove("disabled");
  };

  reset = () => {
    for (const col of this.columns) {
      col.reset();
    }
    this.setDisabled(true);
  };

  animateShake = () => {
    this.elem.classList.add("shaking");
    setTimeout(() => {
      this.elem.classList.remove("shaking");
    }, 300);
  };

  animateJump = () => {
    for (let j = 0; j < 4; j++) {
      this.columns.forEach((col, i) => {
        setTimeout(() => {
          col.elem.classList.add("jumping");
          setTimeout(() => {
            col.elem.classList.remove("jumping");
          }, 1000 * 10);
        }, ((4 * 180) / 9) * i);
      });
    }
  };
}
