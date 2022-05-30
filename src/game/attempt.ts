export namespace AttemptType {
  export const Occur: "occur" = "occur" as const;
  export const Right: "right" = "right" as const;
  export const Wrong: "wrong" = "wrong" as const;
  export const None: "none" = "none" as const;
  export type Any =
    | typeof AttemptType.Occur
    | typeof AttemptType.Right
    | typeof AttemptType.Wrong
    | typeof AttemptType.None;
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

export type WordAttempt = (LetterAttempt<AttemptType.Any> | undefined)[];

/**
 * Create a WordAttempt from a given array
 * @param attempt the array to be converted
 * @returns a WordAttempt
 */
export const makeWordAttempt = (
  attempt: (string | undefined)[]
): WordAttempt => {
  return attempt.map((letter, i) =>
    letter
      ? ({
          letter,
          normalized: letter,
          index: i,
          type: "none",
        } as LetterAttempt<typeof AttemptType.None>)
      : undefined
  );
};
