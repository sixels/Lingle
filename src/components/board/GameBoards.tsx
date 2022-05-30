import {
  Component,
  createEffect,
  createSignal,
  on,
  Index,
  Signal,
} from "solid-js";

import { GameState } from "@/store/game";
import { Mode } from "@/game/mode";
import { AttemptType, WordAttempt } from "@/game/attempt";

type Props = {
  gameState: GameState;
  boardNumber: number;
  position: Signal<[number, number]>;
  mode: Mode;
};

const GameBoard: Component<Props> = ({
  gameState,
  boardNumber,
  position: [position, setPosition],
  mode,
}) => {
  const createBoard = () => {
    const attempts = gameState.state.boards[boardNumber].attempts;
    // fill the remaining attempts with undefined
    const board = [...attempts].concat([
      ...new Array(mode.rows - attempts.length).fill({
        letters: [...new Array(mode.columns).fill(undefined)],
        board: boardNumber,
      } as WordAttempt),
    ]);
    return board;
  };

  const selectLetter = ([r, c]: [number, number]) => {
    const [row, col] = position();
    if (row === r && col !== c) {
      setPosition([r, c]);
    }
  };

  // sharded board
  const board = createBoard().map((row) => createSignal(row));

  // update row after attempting a word
  createEffect(
    on(
      () => gameState.state.boards[boardNumber].attempts,
      () => {
        const attempts = gameState.state.boards[boardNumber].attempts;
        const [r, _c] = position(),
          attempt = attempts[r];
        if (attempt) {
          const [_col, setCol] = board[r];

          setCol({ ...attempt });
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
              classList={{ disabled: i > position()[0] }}
            >
              <Index each={attempt().letters}>
                {(col, j) => {
                  const letter = col();

                  return (
                    <div
                      class="letter"
                      classList={{
                        focused: position()[0] === i && position()[1] === j,
                        right: letter && letter.type == AttemptType.Right,
                        occur: letter && letter.type == AttemptType.Occur,
                        wrong: letter && letter.type == AttemptType.Wrong,
                      }}
                      onClick={[selectLetter, [i, j]]}
                    >
                      {letter ? letter.letter : ""}
                    </div>
                  );
                }}
              </Index>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default GameBoard;
