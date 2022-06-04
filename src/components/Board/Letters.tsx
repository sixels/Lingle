import { AttemptType, LetterAttempt, WordAttempt } from "@/game/attempt";
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  For,
  on,
} from "solid-js";

type LettersProps = {
  row: number;
  letters: Accessor<WordAttempt>;
  isFocused: (key: [number, number]) => boolean;
  selectLetter: (pos: [number, number]) => void;
  isRevealing: (row: number) => boolean;
};

const Letters: Component<LettersProps> = ({
  row,
  letters,
  isFocused,
  selectLetter,
  isRevealing,
}) => {
  const columns_ref: HTMLDivElement[] = [];

  const lettersShards = letters().map((la) =>
    createSignal<LetterAttempt<AttemptType.Any>>(
      la as LetterAttempt<AttemptType.Any>,
      {
        equals: false,
      }
    )
  );

  const setLettersColumn = (
    i: number,
    value: LetterAttempt<AttemptType.Any>
  ) => {
    const [_, setShard] = lettersShards[i];
    setShard(value);
  };
  const setLetters = (value: WordAttempt) => {
    lettersShards.forEach((shard, i) => {
      if (value[i]) {
        const [_, setShard] = shard;
        setShard(value[i] as LetterAttempt<AttemptType.Any>);
      }
    });
  };

  createEffect(
    on(
      () => [letters(), isRevealing(row)],
      async () => {
        if (!isRevealing(row)) {
          setLetters(letters());
          return;
        }

        for (let i = 0; i < columns_ref.length; i++) {
          const column = columns_ref[i];
          setLettersColumn(i, letters()[i] as LetterAttempt<AttemptType.Any>);
          column.classList.add("reveal");
          await new Promise((r: any) => setTimeout(r, 200));
        }
      }
    )
  );
  // createRenderEffect(() => setLettersProxy(letters()));

  return (
    <>
      <For each={lettersShards}>
        {(column, p) => {
          const pos: [number, number] = [row, p()];

          return (
            <div
              class="btn letter"
              classList={{
                focused: isFocused(pos),
                right: column[0]()?.type === AttemptType.Right,
                occur: column[0]()?.type === AttemptType.Occur,
                wrong: column[0]()?.type === AttemptType.Wrong,
              }}
              ref={(el) => columns_ref.push(el)}
              onClick={[selectLetter, pos]}
            >
              {column[0]()?.letter}
            </div>
          );
        }}
      </For>
    </>
  );
};

export default Letters;
