import { AttemptType, LetterAttempt, WordAttempt } from "@/game/attempt";
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
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
  const columnsRef: HTMLDivElement[] = [];
  let bounceTimeout: NodeJS.Timeout;

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
      () =>
        [letters(), isRevealing(row)] as [ReturnType<typeof letters>, boolean],
      async ([attempt]) => {
        if (!isRevealing(row)) {
          setLetters(letters());
          return;
        }

        for (let i = 0; i < columnsRef.length; i++) {
          const column = columnsRef[i];
          setLettersColumn(i, letters()[i] as LetterAttempt<AttemptType.Any>);
          column.classList.add("reveal");

          await new Promise((r) => setTimeout(r, 65));
          column.classList.add("bouncing");
          await new Promise((r) => setTimeout(r, 70));
          column.classList.remove("bouncing");
          await new Promise((r) => setTimeout(r, 65));
        }

        if (attempt.every((letter) => letter?.type == "right")) {
          for (let i = 0; i < columnsRef.length; i++) {
            const column = columnsRef[i];

            setTimeout(() => {
              column.classList.add("jumping");
              setTimeout(() => {
                column.classList.remove("jumping");
              }, 1000 * 10);
            }, ((4 * 180) / 9) * i);
          }
        }
      }
    )
  );

  createEffect(() => {
    for (const [i, column] of Object.entries(columnsRef)) {
      const c = Number.parseInt(i);
      const pos: [number, number] = [row, !Number.isNaN(c) ? c : -1];

      if (isFocused(pos)) {
        column.classList.add("bouncing");
        bounceTimeout = setTimeout(() => {
          column.classList.remove("bouncing");
        }, 70);
      }
    }
  });

  onCleanup(() => {
    clearTimeout(bounceTimeout);
  });

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
              ref={(el) => columnsRef.push(el)}
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
