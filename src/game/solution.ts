import utils from "@/utils";
import { Solutions } from "@/wordlist";
import Prando from "prando";
import { AttemptType, LetterAttempt, WordAttempt } from "./attempt";
import { Mode } from "./mode";

const DAY_ONE = Object.freeze(new Date("2022-05-22T00:00:00"));

export const gameNumber = (day: Date): number => {
  return Math.floor((day.setHours(0, 0, 0, 0) - DAY_ONE.getTime()) / 864e5);
};

export const generateSolution = (mode: Mode, day: Date): string[] => {
  const day_one = DAY_ONE.getTime();
  const game_number = gameNumber(day);

  let rng = new Prando(`${mode.mode}@${day_one}`);
  rng.skip(game_number * mode.boards);

  const solutions = [];
  for (let i = 0; i < mode.boards; i++) {
    const solution_id = rng.nextInt(0, Solutions.size - 1);
    solutions.push([...Solutions][solution_id]);
  }

  return solutions;
};

export const compareWordWithSolution = (
  word: string,
  solution: string
): WordAttempt => {
  let attempt_letters: LetterAttempt<AttemptType.Any>[] = [];

  // create a list of solution's letters
  let solution_letters: (string | undefined)[] = utils
    .normalizedWord(solution)
    .split("");
  // normalize the word
  const word_norm = utils.normalizedWord(word);

  for (let i = 0; i < word_norm.length; i++) {
    const word_norm_letter = word_norm[i];
    const word_unorm_letter = word[i];
    const occurrences: Set<number> = new Set();

    // modify the list to exclude already used letters
    solution_letters
      .map((l) => {
        return l === word_norm_letter ? l : undefined;
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
        const id = word_norm.slice(i + c).indexOf(word_norm_letter);
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
        solution_letters[index] = undefined;
      }
    }

    attempt_letters.push({
      letter: word_unorm_letter,
      normalized: word_norm_letter,
      index: i,
      type: attempt_type,
    });
  }

  return attempt_letters;
};
