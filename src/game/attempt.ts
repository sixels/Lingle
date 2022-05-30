export interface WordAttempt {
  letters: LetterAttempt<AttemptType.Any>[];
  board: number;
}

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
