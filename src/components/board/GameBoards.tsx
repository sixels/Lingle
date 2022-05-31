import {
  Component,
  createEffect,
  createSignal,
  on,
  Index,
  Signal,
  Accessor,
  For,
  createRenderEffect,
} from "solid-js";

import { GameState } from "@/store/game";
import { Mode } from "@/game/mode";
import { AttemptType, makeWordAttempt } from "@/game/attempt";

type Props = {
  gameState: GameState;
  boardNumber: number;
  position: Signal<[number, number]>;
  mode: Mode;
  attempt: Accessor<(string | undefined)[]>;
};

const GameBoard: Component<Props> = ({
  gameState,
  boardNumber,
  position: [position, setPosition],
  mode,
  attempt,
}) => {
  const getStateBoard = () => gameState.state.boards[boardNumber];

  const createBoard = () => {
    const attempts = getStateBoard().attempts;
    // fill the remaining attempts with undefined
    const board = [...attempts].concat([
      ...new Array(mode.rows - attempts.length).fill([
        ...new Array(mode.columns).fill(undefined),
      ]),
    ]);
    return board;
  };

  const selectLetter = ([r, c]: [number, number]) => {
    const [row, col] = position();
    if (getStateBoard().status === "playing" && row === r && col !== c) {
      setPosition([r, c]);
    }
  };

  const [inner_position, setInnerPosition] = createSignal<[number, number]>([
    0, 0,
  ]);

  createRenderEffect(
    on(position, (pos, prev) => {
      console.log(pos);
      if (!prev || getStateBoard().status === "playing") setInnerPosition(pos);
    })
  );

  // sharded board
  const board = createBoard().map((row) => createSignal(row));

  createEffect(
    on(attempt, () => {
      const [row, _col] = position();
      const [_attempt, setAttempt] = board[row];

      setAttempt(makeWordAttempt(attempt()));
    })
  );

  // update row after attempting a word
  createEffect(
    on(
      () => getStateBoard().attempts,
      (attempts) => {
        if (getStateBoard().status != "playing") {
          return;
        }
        const [r, _c] = position();
        const attempt = attempts[r];
        if (attempt) {
          const [_row, setRow] = board[r];
          setRow([...attempt]);
        }
      }
    )
  );

  return (
    <div class={`board ${mode.mode}`}>
      <Index each={board}>
        {(row, i) => {
          const [attempt, _] = row();

          return (
            <div
              class="row letters"
              classList={{ disabled: i > inner_position()[0] }}
            >
              <For each={attempt()}>
                {(col, j) => {
                  const letter = col;

                  return (
                    <div
                      class="letter"
                      classList={{
                        focused:
                          inner_position()[0] === i &&
                          inner_position()[1] === j(),
                        right: letter && letter.type == AttemptType.Right,
                        occur: letter && letter.type == AttemptType.Occur,
                        wrong: letter && letter.type == AttemptType.Wrong,
                      }}
                      onClick={[selectLetter, [i, j()]]}
                    >
                      {letter ? letter.letter : ""}
                    </div>
                  );
                }}
              </For>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default GameBoard;
