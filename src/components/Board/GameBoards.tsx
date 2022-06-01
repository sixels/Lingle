import {
  Component,
  createEffect,
  createSignal,
  on,
  Signal,
  Accessor,
  createRenderEffect,
  Index,
  createSelector,
} from "solid-js";

import { GameState } from "@/store/game";
import { Mode } from "@/game/mode";
import { makeWordAttempt } from "@/game/attempt";
import Letters from "./Letters";

type Props = {
  stateBoard: GameState["state"]["boards"][number];
  position: Signal<[number, number]>;
  mode: Mode;
  attempt: Accessor<(string | undefined)[]>;
  lock: Accessor<boolean>;
};

const GameBoard: Component<Props> = ({
  stateBoard,
  position: [position, setPosition],
  mode,
  attempt,
  lock,
}) => {
  const createBoard = () => {
    const attempts = stateBoard.attempts;
    // fill the remaining attempts with undefined
    const board = [...attempts].concat([
      ...new Array(mode.rows - attempts.length).fill([
        ...new Array(mode.columns).fill(undefined),
      ]),
    ]);
    return board;
  };

  const [inner_position, setInnerPosition] = createSignal<[number, number]>([
    0, 0,
  ]);

  // sharded signals
  const board = createBoard().map((attempt) => createSignal(attempt));

  const isFocused = createSelector(
    () => {
      return inner_position();
    },
    ([r1, c1]: [number, number], [r2, c2]) => {
      return r1 === r2 && c1 === c2;
    }
  );

  const selectLetter = ([r, c]: [number, number]) => {
    if (r < 0 || r >= mode.rows || c < 0 || c >= mode.columns) {
      return;
    }

    if (stateBoard.status === "playing") {
      setPosition([r, c]);
    }
  };

  createRenderEffect(
    on(position, (pos) => {
      switch (stateBoard.status) {
        case "playing":
          setInnerPosition(pos);
          break;
        default:
          setInnerPosition([-1, -1]);
          break;
      }
    })
  );

  createEffect(
    on(attempt, (attempt, prev) => {
      const [row, _col] = position();
      if (
        row < 0 ||
        row >= mode.rows ||
        stateBoard.status !== "playing" ||
        !prev
      ) {
        return;
      }

      const [_row, setRow] = board[row];
      setRow(makeWordAttempt(attempt));
    })
  );

  // update row after attempting a word
  createEffect(
    on(
      () => stateBoard.attempts,
      (attempts) => {
        const [r, _c] = position();
        if (r < 0 || r >= mode.rows) {
          return;
        }
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
              classList={{
                disabled: i > inner_position()[0],
                locked: stateBoard.status === "playing" && lock(),
              }}
            >
              <Letters
                letters={attempt}
                row={i}
                isFocused={isFocused}
                selectLetter={selectLetter}
              ></Letters>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default GameBoard;
