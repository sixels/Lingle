import { LetterAttempt } from "@/game/attempt";
import { AttemptType, WordAttempt } from "@/game/attempt";
import { Accessor, Component, createSelector, For, Signal } from "solid-js";

type LettersProps = {
  row: number;
  letters: Accessor<WordAttempt>;
  isFocused: (key: [number, number]) => boolean;
  selectLetter: (pos: [number, number]) => void;
};

const Letters: Component<LettersProps> = ({
  row,
  letters,
  isFocused,
  selectLetter,
}) => {
  return (
    <>
      <For each={letters()}>
        {(col, j) => {
          const pos: [number, number] = [row, j()];
          return (
            <div
              class="btn letter"
              classList={{
                focused: isFocused(pos),
                right: col?.type === AttemptType.Right,
                occur: col?.type === AttemptType.Occur,
                wrong: col?.type === AttemptType.Wrong,
              }}
              onClick={[selectLetter, pos]}
            >
              {col?.letter}
            </div>
          );
        }}
      </For>
    </>
  );
};

export default Letters;
