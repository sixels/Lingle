import {
  batch,
  Component,
  createEffect,
  createSignal,
  For,
  on,
} from "solid-js";

import { GameState, GameStoreMethods } from "@/store/game";
import GameBoard from "./GameBoards";
import { Mode } from "@/game/mode";

import { KeyboardState } from "@/providers/keyboard";
import {
  compareWordWithSolution,
  getGameNumber,
  generateSolution,
} from "@/game/solution";
import { WordListNormalized } from "@/wordlist";

import "@styles/board.scss";
import "@styles/letters.scss";
import { WordAttempt } from "@/game/attempt";
import { useTicker } from "@/providers/ticker";

type Props = {
  gameState: GameState;
  keyboard: KeyboardState;
  setRow: GameStoreMethods["setRow"];
  createAttempts: GameStoreMethods["createAttempts"];
  setGameNumber: GameStoreMethods["setGameNumber"];
};

export type AttemptAnimation = [WordAttempt[], () => void];

const Board: Component<Props> = ({
  gameState,
  keyboard,
  setRow,
  createAttempts,
  setGameNumber,
}) => {
  const { onEachDay } = useTicker();

  const newAttempt = (mode: Mode): string[] => {
    return [...new Array(mode.columns).fill(" ")];
  };

  const mode = new Mode(gameState.mode),
    solutions = generateSolution(mode, new Date());

  const [position, setPosition] = createSignal<[number, number]>([
      gameState.state.row,
      0,
    ]),
    [attempt, setAttempt] = createSignal<string[]>(newAttempt(mode)),
    [lock, setLock] = createSignal<boolean>(false),
    boardStatus = gameState.state.boards.map((board) =>
      createSignal(board.status)
    );

  const [submittedAttempt, setSubmittedAttempt] = createSignal<
      AttemptAnimation | undefined
    >(undefined),
    [animating, setAnimating] = createSignal(false);

  const submitAttempt = (attempts: WordAttempt[], cb: () => void) => {
    const done = () => {
      if (!animating()) return;
      cb();
    };

    console.log("Submit attempt", attempts);
    setSubmittedAttempt([attempts, done]);
  };

  const submitAttemptValidWord = (attempts: WordAttempt[]) => {
    submitAttempt(attempts, () => {
      batch(() => {
        setAnimating(false);

        for (let i = 0; i < gameState.state.boards.length; i++) {
          const status = gameState.state.boards[i].status,
            [, setStatus] = boardStatus[i];
          setStatus(status);
        }

        setSubmittedAttempt(undefined);
        setPosition([gameState.state.row, 0]);

        setAttempt(attempt().map(() => " "));
        setLock(false);
      });
    });
  };

  const keyboardHandler: any = {
    Enter() {
      const attemptStr = attempt().join("");

      if (attemptStr.includes(" ")) {
        // invalid attempt size
        console.info("Invalid attempt size");
        return;
      }

      const word = WordListNormalized.get(attemptStr);
      if (!word) {
        // invalid word
        console.info("Unknown word");
        return;
      }

      const attempts = solutions.map((solution) =>
        compareWordWithSolution(word, solution)
      );
      batch(() => {
        setAnimating(true);

        createAttempts(attempts);
        setRow(position()[0] + 1);

        submitAttemptValidWord(attempts);
      });
    },
    Backspace() {
      let word = [...attempt()];
      let [row, col] = position();
      const mode = new Mode(gameState.mode);

      if (row > mode.rows || row < 0 || col > mode.columns || col < 0) {
        return;
      }

      let deleteIndex = col;
      if (!lock() && (col >= word.length || word[col] === " ")) {
        deleteIndex = Math.max(position()[1] - 1, 0);
        setPosition([row, deleteIndex]);
      }

      word[deleteIndex] = " ";
      setAttempt(word);
    },
    Delete() {
      let word = [...attempt()];
      let [row, col] = position();
      const mode = new Mode(gameState.mode);

      if (row > mode.rows || row < 0 || col > mode.columns || col < 0) {
        return;
      }

      word[col] = " ";
      setAttempt(word);
    },
    ArrowRight() {
      let [row, col] = position();
      setPosition([row, Math.min(col + 1, attempt().length - 1)]);
    },
    ArrowLeft() {
      let [row, col] = position();
      setPosition([row, Math.max(col - 1, 0)]);
    },
    Home() {
      let [row, _] = position();
      setPosition([row, 0]);
    },
    End() {
      let [row, _] = position();
      setPosition([row, attempt().length - 1]);
    },
    " "() {
      setLock((l) => {
        return !l;
      });
    },
    Escape() {},
  };

  onEachDay(() => {
    setGameNumber(getGameNumber(new Date()));
  });

  // handle keyboard
  createEffect(
    on(keyboard.keyPressed, (key) => {
      if (
        !key ||
        gameState.state.boards.every((b) => b.status !== "playing") ||
        animating()
      )
        return;

      let handler = keyboardHandler[key];
      if (handler) {
        handler();
        return;
      }
      let word = [...attempt()];
      let [row, col] = position();

      if (col >= word.length) {
        return;
      }

      word[col] = key.toLowerCase();
      setAttempt(word);

      let nextColumn = Math.min(col + 1, attempt().length);
      if (word[nextColumn] !== " ") {
        nextColumn = word.indexOf(" ");
      }
      if (!lock()) {
        setPosition([row, nextColumn >= 0 ? nextColumn : attempt().length]);
      }
    })
  );

  createEffect(
    on(position, () => {
      setLock(false);
    })
  );

  return (
    <div id="board-wrapper" class="board-wrapper">
      <For each={gameState.state.boards}>
        {(board, i) => {
          return (
            <GameBoard
              lock={lock}
              stateBoard={board}
              status={boardStatus[i()][0]}
              attempt={attempt}
              mode={mode}
              position={[position, setPosition]}
              boardNumber={i()}
              submittedAttempt={submittedAttempt}
            />
          );
        }}
      </For>
    </div>
  );
};

export default Board;
