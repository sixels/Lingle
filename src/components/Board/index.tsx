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
import toast from "solid-toast";
import { MyToast } from "../Toast";

type Props = {
  gameState: GameState;
  keyboard: KeyboardState;
  setRow: GameStoreMethods["setRow"];
  updateStats: GameStoreMethods["updateStats"];
  createAttempts: GameStoreMethods["createAttempts"];
  setGameNumber: GameStoreMethods["setGameNumber"];
  setOpenModal: (modal: string) => void;
};

export type AttemptAnimation = [(WordAttempt | null)[], () => void];

const Board: Component<Props> = ({
  gameState,
  keyboard,
  setOpenModal,
  setRow,
  createAttempts,
  setGameNumber,
  updateStats,
}) => {
  console.log("building the board");
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

  const [submittedAttempt, setSubmittedAttempt] =
      createSignal<AttemptAnimation>(),
    [animating, setAnimating] = createSignal(false);

  const submitAttempt = (attempts: (WordAttempt | null)[], cb: () => void) => {
    const done = () => {
      if (!animating()) return;
      cb();
    };

    setSubmittedAttempt([attempts, done]);
  };

  const submitAttemptValidWord = (attempts: (WordAttempt | null)[]) => {
    setAnimating(true);

    const updateState = () => {
      batch(async () => {
        setAnimating(false);

        for (let i = 0; i < gameState.state.boards.length; i++) {
          const status = gameState.state.boards[i].status,
            [, setStatus] = boardStatus[i];
          setStatus(status);
        }

        setSubmittedAttempt(undefined);
        setPosition([gameState.state.row, 0]);

        setAttempt(attempt().map(() => " "));

        updateStats();
        keyboard.sendAttempt(attempts);

        if (gameState.state.boards.every((b) => b.status == "won")) {
          setTimeout(() => {
            toast.custom(
              (t) => <MyToast message="Parabéns, você ganhou!" toast={t} />,
              {
                duration: 10_000,
              }
            );
            setOpenModal("stats");
          }, 1000);
        } else if (gameState.state.boards.some((b) => b.status == "lost")) {
          const pluralStr = (p: string) => {
            return gameState.state.boards.length > 1 ? p : "";
          };

          setTimeout(() => {
            toast.custom(
              (t) => (
                <MyToast
                  message={`Você perdeu, a${pluralStr("s")} palavra${pluralStr(
                    "s"
                  )} de hoje era${pluralStr("m")}: ${gameState.state.boards
                    .map((b) => `"${b.solution}"`)
                    .join(", ")}`}
                  toast={t}
                />
              ),
              {
                duration: 10_000,
              }
            );
            setOpenModal("stats");
          }, 300);
        }
      });
    };

    submitAttempt(attempts, () => {
      if (gameState.state.boards.some((board) => board.status === "lost")) {
        // animate only lost attempts
        const lost_attempts = attempts.map((attempt, i) =>
          gameState.state.boards[i].status !== "won" ? null : attempt
        );
        submitAttemptInvalidWord(lost_attempts, updateState);
      } else {
        updateState();
      }
    });
  };

  const submitAttemptInvalidWord = (
    attempts: (WordAttempt | null)[],
    then?: () => void
  ) => {
    setAnimating(true);

    submitAttempt(attempts, () => {
      setAnimating(false);
      then && then();
    });
  };

  const keyboardHandler: any = {
    Enter() {
      const attemptStr = attempt().join(""),
        word = WordListNormalized.get(attemptStr);

      const attempts = solutions.map((solution, i) => {
        console.log(attemptStr, solution);
        return gameState.state.boards[i].status == "playing" && word
          ? compareWordWithSolution(word, solution)
          : null;
      });

      if (word == null) {
        submitAttemptInvalidWord(attempts);
        return;
      }

      batch(() => {
        setLock(false);
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
    Lock() {
      setLock(!lock());
    },
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
  createRenderEffect(
    on(
      () => gameState.state.row,
      (row) => {
        if (!animating()) setPosition([row, 0]);
      }
    )
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
