import { WordList, Solutions } from "./wordlist";

test("wordlist should have all solutions", () => {
  for (const solution of Solutions) {
    expect(
      WordList.has(solution),
      `${solution} not found in wordlist`
    ).toBeTruthy();
  }
});
