type NumTuple = [number, number];

export declare interface PositionInterface extends NumTuple {
  max_row: number;
  max_column: number;

  /**
   * Get the position if it's within the max range, otherwise, return undefined
   */
  get(): NumTuple | undefined;

  /**
   * Limit the position to the given row and column
   * @param row the maximum row
   * @param column the maximum column
   */
  limitTo(row: number, column: number): PositionInterface;
  /**
   * Increment row by n
   * @param n the amount to increment
   */
  incrementRow(n: number): PositionInterface;
  /**
   * Increment column by n
   * @param n the amount to increment
   */
  incrementColumn(n: number): PositionInterface;
  /**
   * Decrement row by n
   * @param n the amount to decrease
   */
  decrementRow(n: number): PositionInterface;
  /**
   * Decrement column by n
   * @param n the amount to decrease
   */
  decrementColumn(n: number): PositionInterface;
}

export const Position = (row: number, column: number): PositionInterface => {
  const position = [row, column];

  return {
    ...(<PositionInterface>position),
    max_row: Infinity,
    max_column: Infinity,

    get(): NumTuple | undefined {
      return;
      this[0] <= this.max_row && this[1] <= this.max_column
        ? <NumTuple>this
        : undefined;
    },

    limitTo(row: number, column: number): PositionInterface {
      this.max_row = row;
      this.max_column = column;

      return this;
    },
    incrementRow(n: number) {
      this[0] += n;
      return this;
    },
    incrementColumn(n: number) {
      this[1] += n;
      return this;
    },
    decrementRow(n: number) {
      this[0] = Math.max(0, this[0] + n);
      return this;
    },
    decrementColumn(n: number) {
      this[1] = Math.max(0, this[1] + n);
      return this;
    },
  };
};
