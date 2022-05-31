import { Solutions } from "@/wordlist";
import Prando from "prando";
import { Mode } from "./mode";

const DAY_ONE = Object.freeze(new Date("2022-05-22T00:00:00"));

export const generateSolution = (mode: Mode): string[] => {
  const day_one = DAY_ONE.getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  const day = Math.floor((today - day_one) / 864e5);

  let rng = new Prando(`${mode.mode}@${day_one}`);
  rng.skip(day * mode.boards);

  const solutions = [];
  for (let i = 0; i < mode.boards; i++) {
    const solution_id = rng.nextInt(0, Solutions.size - 1);
    solutions.push([...Solutions][solution_id]);
  }

  return solutions;
};
