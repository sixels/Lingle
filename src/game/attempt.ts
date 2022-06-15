export namespace AttemptType {
  export const Occur: "occur" = "occur" as const;
  export const Right: "right" = "right" as const;
  export const Wrong: "wrong" = "wrong" as const;
  export const None: "none" = "none" as const;
  export const ALL = [Occur, Right, Wrong, None] as const;
  export type Any = typeof ALL[number];
}

export interface LetterAttempt<T = AttemptType.Any> {
  // Non-normalized letter
  letter: string;
  // Normalized letter
  normalized: string;
  // The index the letter occurs
  index: number;
  type: T;
}

export type WordAttempt = (LetterAttempt | undefined)[];

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
