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
  batch,
  Setter,
  onMount,
  onCleanup,
} from "solid-js";

import { GameState } from "@/store/game";
import { Mode } from "@/game/mode";
import { makeWordAttempt, WordAttempt } from "@/game/attempt";
import Letters from "./Letters";

type Props = {
  stateBoard: GameState["state"]["boards"][number];
  position: Signal<[number, number]>;
  mode: Mode;
  attempt: Accessor<(string | undefined)[]>;
  lock: Accessor<boolean>;
  boardNumber: number;
  submittedAttempt: Accessor<WordAttempt[]>;
  setAnimatedAttempts: Setter<boolean>;
};

const GameBoard: Component<Props> = ({
  stateBoard,
  position: [position, setPosition],
  mode,
  attempt,
  lock,
  boardNumber,
  submittedAttempt,
  setAnimatedAttempts,
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

  let animateTimeout: NodeJS.Timeout;

  const [innerPosition, setInnerPosition] = createSignal<[number, number]>([
      0, 0,
    ]),
    [reveal, setReveal] = createSignal(-1),
    isRevealing = createSelector(reveal);

  // sharded signals
  const board = createBoard().map((attempt) => createSignal(attempt));

  const isFocused = createSelector(
    () => {
      return innerPosition();
    },
    ([r1, c1]: [number, number], [r2, c2]) => {
      return r1 === r2 && c1 === c2;
    }
  );

  const selectLetter = ([r, c]: [number, number]) => {
    if (r != innerPosition()[0] || c < 0 || c >= mode.columns) {
      return;
    }

    if (stateBoard.status === "playing") {
      setPosition([r, c]);
    }
  };

  onMount(() => {
    const [r, _c] = position();
    if (r < 0 || r >= mode.rows) {
      return;
    }
    const attempt = stateBoard.attempts[r];
    if (attempt !== undefined) {
      const [_row, setRow] = board[r];
      setRow([...attempt]);
    }
  });

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
    on(submittedAttempt, (attempts) => {
      const attempt = attempts[boardNumber];
      if (attempt === undefined) return;

      const [row, _col] = position();
      if (row < 0 || row >= mode.rows || stateBoard.status !== "playing") {
        return;
      }
      const [_row, setRow] = board[row];
      batch(() => {
        setReveal(row);
        setRow(attempt);
      });

      animateTimeout = setTimeout(() => {
        batch(() => {
          setAnimatedAttempts(true);
          setReveal(-1);
        });
      }, mode.columns * 180 + 160);
    })
  );

  onCleanup(() => {
    clearTimeout(animateTimeout);
  });

  return (
    <div class={`board ${mode.mode}`}>
      <Index each={board}>
        {(row, i) => {
          const [attempt, _] = row();

          return (
            <div
              class="row letters"
              classList={{
                disabled: i != innerPosition()[0],
                locked: stateBoard.status === "playing" && lock(),
              }}
            >
              <Letters
                letters={attempt}
                row={i}
                isFocused={isFocused}
                selectLetter={selectLetter}
                isRevealing={isRevealing}
              ></Letters>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default GameBoard;
