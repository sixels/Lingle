import utils from "@/utils";
import { Solutions } from "@/wordlist";
import Prando from "prando";
import { AttemptType, LetterAttempt, WordAttempt } from "./attempt";
import { Mode } from "./mode";

const DAY_ONE = Object.freeze(new Date("2022-05-22T00:00:00"));

export const getGameNumber = (day: Date): number => {
  return Math.floor((day.setHours(0, 0, 0, 0) - DAY_ONE.getTime()) / 864e5);
};

export const generateSolution = (mode: Mode, day: Date): string[] => {
  const dayOne = DAY_ONE.getTime();
  const gameNumber = getGameNumber(day);

  let rng = new Prando(`${mode.mode}@${dayOne}`);
  rng.skip(gameNumber * mode.boards);

  const solutions = [];
  for (let i = 0; i < mode.boards; i++) {
    const solutionIndex = rng.nextInt(0, Solutions.size - 1);
    solutions.push([...Solutions][solutionIndex]);
  }

  return solutions;
};

export const compareWordWithSolution = (
  word: string,
  solution: string
): WordAttempt => {
  const attemptLetters: LetterAttempt<AttemptType.Any>[] = [];

  // create a list of solution's letters
  let solutionLetters: (string | undefined)[] = utils
    .normalizedWord(solution)
    .split("");
  // normalize the word
  const wordNormalized = utils.normalizedWord(word);

  for (let i = 0; i < wordNormalized.length; i++) {
    const wordNormLetter = wordNormalized[i];
    const wordLetter = word[i];
    const occurrences: Set<number> = new Set();

    // modify the list to exclude already used letters
    solutionLetters
      .map((l) => {
        return l === wordNormLetter ? l : undefined;
      })
      .forEach((l, ind) => {
        if (l !== undefined) {
          occurrences.add(ind);
        }
      });

    // get the reference to the category
    let attemptType: AttemptType.Any = AttemptType.Wrong;
    if (occurrences.size > 0) {
      let hasRight: number = 0;
      let c = 1;
      while (true) {
        const id = wordNormalized.slice(i + c).indexOf(wordNormLetter);
        if (id < 0) {
          break;
        }
        hasRight += occurrences.has(id + (c + i)) ? 1 : 0;
        c += id + 1;
      }

      if (hasRight !== occurrences.size) {
        let index: number = occurrences.values().next().value;

        if (occurrences.has(i)) {
          index = i;
          attemptType = AttemptType.Right;
        } else {
          attemptType = AttemptType.Occur;
        }
        solutionLetters[index] = undefined;
      }
    }

    attemptLetters.push({
      letter: wordLetter,
      normalized: wordNormLetter,
      index: i,
      type: attemptType,
    });
  }

  return attemptLetters;
};
