import {
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

import "@/../styles/board.scss";
import { KeyboardState } from "@/keyboardProvider";
import { makeWordAttempt } from "@/game/attempt";

type Props = {
  gameState: GameState;
  keyboard: KeyboardState;
  setRow: GameStoreMethods["setRow"];
  createAttempt: GameStoreMethods["createAttempt"];
};

const Board: Component<Props> = ({
  gameState,
  keyboard,
  setRow,
  createAttempt,
}) => {
  const newAttempt = (): undefined[] => {
    return [...new Array(new Mode(gameState.mode).columns).fill(undefined)];
  };

  const [position, setPosition] = createSignal<[number, number]>([
    gameState.state.row,
    0,
  ]);
  const [attempt, setAttempt] = createSignal<(string | undefined)[]>(
    newAttempt()
  );

  const keyboardHandler: any = {
    Enter() {
      createAttempt(makeWordAttempt(attempt()));
    },
    Backspace() {
      let word = [...attempt()];
      let [row, col] = position();

      if (col < word.length && word[col]) {
        word[Math.max(col, 0)] = undefined;
        setAttempt(word);
      } else {
        word[Math.max(col - 1, 0)] = undefined;
        setAttempt(word);
        setPosition([row, Math.max(col - 1, 0)]);
      }
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
  };

  // handle keyboard
  createEffect(
    on(keyboard.key_pressed, (key) => {
      if (key && gameState.state.boards.some((b) => b.status == "playing")) {
        let handler = keyboardHandler[key];
        if (handler) {
          handler();
        } else {
          let word = [...attempt()];
          let [row, col] = position();

          if (col >= word.length) {
            return;
          }

          word[col] = key;
          setAttempt(word);

          setPosition([row, Math.min(col + 1, attempt().length)]);
          console.log(position());
        }
      }
    })
  );

  createRenderEffect(
    on(
      () => gameState.mode,
      () => {
        setAttempt(newAttempt());
      }
    )
  );

  createEffect(
    on(
      () => gameState.state.row,
      () => {
        setAttempt(attempt().map(() => ""));
        setPosition([gameState.state.row, 0]);
      }
    )
  );

  return (
    <div id="board-wrapper" class="board-wrapper">
      <For each={gameState.state.boards}>
        {(_, i) => {
          return (
            <GameBoard
              gameState={gameState}
              boardNumber={i()}
              attempt={attempt}
              mode={new Mode(gameState.mode)}
              position={[position, setPosition]}
            />
          );
        }}
      </For>
    </div>
  );
};

export default Board;
