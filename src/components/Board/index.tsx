import {
  batch,
  Component,
  createEffect,
  createRenderEffect,
  createSignal,
  For,
  on,
} from "solid-js";

import { GameState, GameStoreMethods } from "@/store/game";
import GameBoard from "./GameBoards";
import { Mode } from "@/game/mode";

import { KeyboardState } from "@/keyboardProvider";
import {
  compareWordWithSolution,
  getGameNumber,
  generateSolution,
} from "@/game/solution";
import { WordListNormalized } from "@/wordlist";

import "@styles/board.scss";
import "@styles/letters.scss";
import { WordAttempt } from "@/game/attempt";

type Props = {
  gameState: GameState;
  keyboard: KeyboardState;
  setRow: GameStoreMethods["setRow"];
  createAttempts: GameStoreMethods["createAttempts"];
  setGameNumber: GameStoreMethods["setGameNumber"];
};

const Board: Component<Props> = ({
  gameState,
  keyboard,
  setRow,
  createAttempts,
  setGameNumber,
}) => {
  const newAttempt = (mode: Mode): string[] => {
    return [...new Array(mode.columns).fill(" ")];
  };

  const [position, setPosition] = createSignal<[number, number]>([0, 0]),
    [attempt, setAttempt] = createSignal<string[]>([]),
    [solutions, setSolutions] = createSignal<string[]>([]),
    [lock, setLock] = createSignal<boolean>(false);

  const [animatedAttempt, setAnimatedAttempt] = createSignal(false),
    [submittedAttempt, setSubmittedAttempt] = createSignal<WordAttempt[]>([]);

  const keyboardHandler: any = {
    Enter() {
      // invalid attempt size
      if (attempt().includes(" ")) {
        return;
      }

      const word = WordListNormalized.get(attempt().join(""));
      if (!word) {
        // invalid word
        return;
      }

      const attempts = solutions().map((solution) =>
        compareWordWithSolution(word, solution)
      );
      batch(() => {
        setSubmittedAttempt(attempts);
        setAnimatedAttempt(false);
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

  // TODO: update on daily ticker
  setGameNumber(getGameNumber(new Date()));

  createRenderEffect(
    on(
      () => gameState.mode,
      (newMode) => {
        const mode = new Mode(newMode);
        setAttempt(newAttempt(mode));
        setSolutions(generateSolution(mode, new Date()));

        setLock(false);
        setPosition([gameState.state.row, 0]);
      }
    )
  );

  // handle keyboard
  createEffect(
    on(keyboard.keyPressed, (key) => {
      if (key && gameState.state.boards.some((b) => b.status == "playing")) {
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
      }
    })
  );

  createEffect(
    on(animatedAttempt, (animated) => {
      if (animated) {
        createAttempts(submittedAttempt());
        setSubmittedAttempt([]);
        setRow(position()[0] + 1);
      }
    })
  );

  createEffect(
    on(
      () => gameState.state.row,
      (cur, prev) => {
        if (prev === undefined || cur > prev) {
          setAttempt(attempt().map(() => " "));

          setLock(false);
          setPosition([gameState.state.row, 0]);
        }
      }
    )
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
              attempt={attempt}
              mode={new Mode(gameState.mode)}
              position={[position, setPosition]}
              boardNumber={i()}
              submittedAttempt={submittedAttempt}
              setAnimatedAttempts={setAnimatedAttempt}
            />
          );
        }}
      </For>
    </div>
  );
};

export default Board;
