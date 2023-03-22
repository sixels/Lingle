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
  onMount,
  onCleanup,
} from "solid-js";

import { GameState } from "@/store/game";
import { Mode } from "@/game/mode";
import { makeWordAttempt, WordAttempt } from "@/game/attempt";
import Letters from "./Letters";
import { AttemptAnimation } from ".";
import { GameStatus } from "@/game";

type Props = {
  stateBoard: GameState["state"]["boards"][number];
  position: Signal<[number, number]>;
  mode: Mode;
  status: Accessor<GameStatus>;
  attempt: Accessor<(string | undefined)[]>;
  lock: Accessor<boolean>;
  boardNumber: number;
  submittedAttempt: Accessor<AttemptAnimation | undefined>;
};

const GameBoard: Component<Props> = ({
  stateBoard,
  position: [position, setPosition],
  mode,
  status,
  attempt,
  lock,
  boardNumber,
  submittedAttempt,
}) => {
  const createBoard = () => {
    const attempts = stateBoard.attempts;
    // fill the remaining attempts with undefined
    const board = [...attempts]
      .concat([
        ...new Array(Math.max(mode.rows - attempts.length, 0)).fill([
          ...new Array(mode.columns).fill(undefined),
        ]),
      ])
      .slice(0, mode.rows);
    return board;
  };

  let animateTimeout: NodeJS.Timeout;

  const [innerPosition, setInnerPosition] = createSignal<[number, number]>([
      0, 0,
    ]),
    [reveal, setReveal] = createSignal(-1),
    isRevealing = createSelector(reveal);

  const [invalidAttemptRow, setInvalidAttemptRow] = createSignal(-1);

  // sharded signals
  const [board, setBoard] = createSignal<Signal<WordAttempt>[]>([]);

  const isFocused = createSelector(
    () => innerPosition(),
    ([r1, c1]: [number, number], [r2, c2]) => {
      return r1 === r2 && c1 === c2;
    }
  );

  const selectLetter = ([r, c]: [number, number]) => {
    if (r != innerPosition()[0] || c < 0 || c >= mode.columns) {
      return;
    }

    if (status() === "playing") {
      setPosition([r, c]);
    }
  };

  onMount(() => {
    const b = createBoard().map((attempt) => createSignal(attempt));
    setBoard(b);

    const [r, _c] = position();
    if (r < 0 || r >= mode.rows) {
      return;
    }

    const attempt = stateBoard.attempts[r];
    if (attempt !== undefined) {
      const [_row, setRow] = b[r];
      setRow([...attempt]);
    }
  });

  createRenderEffect(
    on(position, (pos) => {
      switch (status()) {
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
      if (row < 0 || row >= mode.rows || status() !== "playing" || !prev) {
        return;
      }

      const [_row, setRow] = board()[row];
      setRow(makeWordAttempt(attempt));
    })
  );

  // update row after attempting a word
  createEffect(
    on(submittedAttempt, (attemptAnimation) => {
      if (!attemptAnimation) return;

      const [row, _col] = position();
      if (row < 0 || row >= mode.rows || status() !== "playing") {
        return;
      }

      const [attempts, done] = attemptAnimation,
        attempt = attempts[boardNumber];
      if (attempt == null) {
        // animate invalid word
        setInvalidAttemptRow(position()[0]);
        setTimeout(() => {
          setInvalidAttemptRow(-1);
          done();
        }, 305);
        return;
      }

      const [_row, setRow] = board()[row];

      batch(() => {
        setReveal(row);
        setRow(attempt);
      });

      animateTimeout = setTimeout(() => {
        setReveal(-1);
        done();
      }, mode.columns * 180 + 160);
    })
  );

  onCleanup(() => {
    clearTimeout(animateTimeout);
  });

  return (
    <div class={`board ${mode.mode}`} data-board={`${boardNumber + 1}`}>
      <Index each={board()}>
        {(row, i) => {
          const [attempt, _] = row();

          return (
            <div
              class="row letters"
              classList={{
                disabled: i != innerPosition()[0],
                locked: status() === "playing" && lock(),
                shaking: status() === "playing" && invalidAttemptRow() == i,
              }}
            >
              <Letters
                letters={attempt}
                row={i}
                isFocused={isFocused}
                selectLetter={selectLetter}
                isRevealing={isRevealing}
              />
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default GameBoard;
