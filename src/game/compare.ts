import { AttemptType, LetterAttempt, WordAttempt } from ".";
import utils from "../utils";

const compareWords = (base: string, cmp: string): WordAttempt => {
  let attempt_letters: LetterAttempt<AttemptType.Any>[] = [];

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
    let attempt_type: AttemptType.Any = AttemptType.Wrong;
    if (occurrences.size > 0) {
      let has_right: number = 0;
      let c = 1;
      while (true) {
        const id = cmp_norm.slice(i + c).indexOf(cmp_norm_letter);
        if (id < 0) {
          break;
        }
        has_right += occurrences.has(id + (c + i)) ? 1 : 0;
        c += id + 1;
      }

      if (has_right !== occurrences.size) {
        let index: number = occurrences.values().next().value;

        if (occurrences.has(i)) {
          index = i;
          attempt_type = AttemptType.Right;
        } else {
          attempt_type = AttemptType.Occur;
        }
        base_letters[index] = undefined;
      }
    }

    attempt_letters.push({
      letter: cmp_unorm_letter,
      normalized: cmp_norm_letter,
      index: i,
      type: attempt_type,
    });
  }

  return {
    letters: attempt_letters,
    board: 0,
  };
};

export default compareWords;
