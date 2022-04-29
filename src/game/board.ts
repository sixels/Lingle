import events from "../events";

export const N_ROWS = 6;
export const N_COLS = 5;

export class BoardPosition {
  private _row: number;
  private _col: number;

  // Create a new BoardPosition. row and col should not be greater than N_ROWS
  // and N_COLS, respectively. Negative positions are also invalid.
  constructor(row: number, col: number) {
    if (row < 0 || col < 0 || row >= N_ROWS || col > N_COLS) {
      throw new Error(`Invalid board position: row ${row}, column ${col}`);
    }

    this._row = row;
    this._col = col;
  }

  get row(): typeof this._row {
    return this._row;
  }
  get col(): typeof this._col {
    return this._col;
  }

  // Return a new position with column incremented by one
  step_forward = (): BoardPosition => {
    return new BoardPosition(
      this.row,
      this.col < N_COLS ? this.col + 1 : this.col
    );
  };
  step_backward = (): BoardPosition => {
    return new BoardPosition(
      this.row,
      this.col - 1 >= 0 ? this.col - 1 : this.col
    );
  };
  next_word = (): BoardPosition | null => {
    try {
      return new BoardPosition(this.row + 1, 0);
    } catch (_) {
      return null;
    }
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
    this.elem.innerText = new_value;
    if (new_value.length > 0) {
      this.animateBounce();
    }
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
  setFocused = (condition: boolean) => {
    condition
      ? this.elem.classList.add("focused")
      : this.elem.classList.remove("focused");
  };

  private handleClick = () => {
    events.dispatchSetPositionEvent(this.position);
  };
}

export class BoardRow {
  private readonly index;
  private _columns: BoardColumn[];
  elem: HTMLElement;

  constructor(elem: HTMLElement, index: number) {
    this.elem = elem;
    this._columns = [];
    this.index = index;
  }

  get columns(): typeof this._columns {
    return this._columns;
  }

  get value(): string {
    return this._columns.map((col) => col.value).join("");
  }

  animateShake = () => {
    this.elem.classList.add("shaking");
    setTimeout(() => {
      this.elem.classList.remove("shaking");
    }, 300);
  };

  // push a column to the row
  pushColumn = (column: BoardColumn) => {
    this.elem.appendChild(column.elem);
    this.columns.push(column);
  };

  // get the first empty column
  nextPosition = (): BoardPosition => {
    const col = this._columns.findIndex((col) => col.isEmpty());
    return new BoardPosition(this.index, col < 0 ? N_COLS : col);
  };
}
