import {
  Component,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
} from "solid-js";

import { KeyboardState } from "@/providers/keyboard";
import { Key, KeyboardKey } from "./Key";

import "@styles/keyboard.scss";
import { GameState } from "@/store/game";
import { LetterAttempt, AttemptType, WordAttempt } from "@/game/attempt";
import utils from "@/utils";

const SIDES = ["left", "right"] as const;
type Side = typeof SIDES[number] | "all";

type Props = { state: GameState; keyboard: KeyboardState };

const Keyboard: Component<Props> = ({ state, keyboard }) => {
  const makeKeys = (keys: string): KeyboardKey[] => {
    return [...keys].map((k) => ({ key: k }));
  };
  const keys: KeyboardKey[][] = [
      makeKeys("qwertyuiop"),
      [...makeKeys("asdfghjkl"), { key: "Backspace", icon: "delete-back-2" }],
      [...makeKeys("zxcvbnm"), { key: "Enter", icon: undefined }],
    ],
    keysRef: Map<string, HTMLElement> = new Map();

  const [playingBoards, setPlayingBoards] = createSignal(
    state.state.boards.filter((b) => b.status === "playing").length
  );

  let timeout: NodeJS.Timeout;

  const highlightKey = (keyName: string) => {
    const key = keysRef.get(keyName);
    if (!key) return;

    key.classList.add("highlighted");
    timeout = setTimeout(() => {
      key.classList.remove("highlighted");
    }, 180);
  };

  const pressKey = (key: KeyboardKey) => {
    keyboard.pressKey(key.key);
  };

  const resetKey = (key: HTMLElement) => {
    const typesAndSides = utils
      .combineArray(AttemptType.ALL, SIDES)
      .map(([a, b]) => `${a}-${b}`);
    key.classList.remove(...AttemptType.ALL);
    key.classList.remove(...typesAndSides);
  };
  const resetKeyboard = () => {
    keysRef.forEach((key) => {
      resetKey(key);
    });
  };

  const paintKey = (letter: LetterAttempt, board: number, boards: number) => {
    const key = keysRef.get(letter.normalized);
    if (!key) return;

    const side: Side = boards === 1 ? "all" : SIDES[board],
      paintSide = side === "all" ? "" : "-" + side;

    let paintType = "";
    switch (letter.type) {
      case "right":
        if (key.classList.contains("occur" + paintSide)) {
          key.classList.remove("occur" + paintSide);
        }
        paintType = "right";
        break;
      case "occur":
        if (key.classList.contains("right" + paintSide)) {
          break;
        }
        paintType = "occur";
        break;
      case "wrong":
        if (
          key.classList.contains("occur" + paintSide) ||
          key.classList.contains("right" + paintSide)
        ) {
          break;
        }
        paintType = "wrong";
        break;
      default:
        break;
    }
    paintType && key.classList.add(paintType + paintSide);
  };

  const paintAttempt = (attempt: WordAttempt, board: number) => {
    const playing = state.state.boards.filter(
      (board) => board.status === "playing"
    ).length;

    if (playing !== playingBoards()) {
      setPlayingBoards(playing);
      resetKeyboard();

      state.state.boards
        .filter((board) => board.status === "playing")
        .forEach((board, b) => {
          board.attempts.forEach((attempt) => {
            attempt.forEach((letter) => {
              if (!letter) return;
              paintKey(letter, b, playing);
            });
          });
        });

      return;
    }
    attempt.forEach((letter) => {
      if (!letter) return;
      paintKey(letter, board, playing);
    });
  };

  onMount(() => {
    state.state.boards
      .filter((board) => board.status === "playing")
      .forEach((board, b) => {
        board.attempts.forEach((attempt) => paintAttempt(attempt, b));
      });
  });
  onCleanup(() => {
    clearTimeout(timeout);
  });

  createEffect(
    on(keyboard.sentAttempt, (attempt) => {
      if (attempt !== undefined) {
        attempt.forEach((attempt, a) => attempt && paintAttempt(attempt, a));
        keyboard.sendAttempt(undefined);
      }
    })
  );

  createEffect(
    on(keyboard.keyPressed, (key) => {
      if (!key) return;
      highlightKey(key);
    })
  );

  return (
    <div class="keyboard-wrapper" id="keyboard-wrapper">
      <div class="keyboard" id="keyboard">
        <For each={keys}>
          {(keys) => {
            return (
              <div class="row">
                <For each={keys}>
                  {(key) => {
                    return (
                      <Key
                        ref={(ref) => {
                          keysRef.set(key.key, ref);
                        }}
                        key={key}
                        onClick={pressKey}
                      />
                    );
                  }}
                </For>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default Keyboard;
