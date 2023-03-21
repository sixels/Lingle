import { Component, createEffect, For, on, onCleanup, onMount } from "solid-js";

import { KeyboardState } from "@/providers/keyboard";
import { Key, KeyboardKey } from "./Key";

import "@styles/keyboard.scss";
import { GameState } from "@/store/game";
import { LetterAttempt, WordAttempt } from "@/game/attempt";

interface svgRectProps {
  fill: string;
  fg: string;
  x: string;
  y: string;
  w: string;
  h: string;
  i: number;
}
function svgRect({ fill, fg, x, y, w, h, i }: svgRectProps) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg'><g>` +
    `<rect fill='${fill}' x='${x}'  y='${y}' width='${w}' height='${h}'/>` +
    `<text font-family='sans-serif' font-weight='bold' font-size='10' fill='${fg}' y='${y}'> <tspan x='${x}' dy='9' dx='4'> ${i} </tspan> </text>` +
    `</g></svg>`;

  return `url("data:image/svg+xml,${encodeURI(svg)}")`;
}

type Props = {
  state: GameState;
  keyboard: KeyboardState;
  setOpenModal: (modal: string) => void;
};

const Keyboard: Component<Props> = ({ state, keyboard, setOpenModal }) => {
  const makeKeys = (keys: string): KeyboardKey[] => {
    return [...keys].map((k) => ({ key: k }));
  };
  const keys: KeyboardKey[][] = [
      makeKeys("qwertyuiop"),
      [...makeKeys("asdfghjkl"), { key: "Backspace", icon: "delete-back-2" }],
      [
        { key: "Lock", icon: "lock-2" },
        ...makeKeys("zxcvbnm"),
        { key: "Enter", icon: undefined },
      ],
    ],
    keysRef: Map<string, HTMLElement> = new Map();

  // const [playingBoards, setPlayingBoards] = createSignal(
  //   state.state.boards.filter((b) => b.status === "playing").length
  // );

  let timeout: NodeJS.Timeout;

  const highlightKey = (keyName: string) => {
    setOpenModal("_");

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
    key.dataset["paint"] = "";
  };
  const resetKeyboard = () => {
    for (const [name, key] of keysRef.entries()) {
      if (name.length > 1) {
        continue;
      }
      resetKey(key);
    }
  };

  const updateKeyPaint = (keyRef: HTMLElement, paints: string[]) => {
    const total = paints.length;

    const paintWidth = 100 / Math.min(2, total),
      paintHeight = 100 / (total / 2);

    const makeRect = (kind: "right" | "occur" | "wrong", i: number) => {
      const fill = getCSSVariable(`--key-${kind}-color-bg`);
      const fg = getCSSVariable(`--key-${kind}-color-fg`);

      return svgRect({
        fill,
        fg,
        h: `${paintHeight}%`,
        w: `${paintWidth}%`,
        x: `${(i % 2) * paintWidth}%`,
        y: `${Math.floor(i / 2) * paintHeight}%`,
        i: i + 1,
      });
    };

    const paintMap: { [key: string]: (i: number) => string } = {
      right: (i) => makeRect("right", i),
      occur: (i) => makeRect("occur", i),
      wrong: (i) => makeRect("wrong", i),
    };

    const backgrounds = paints.map((paint, i) =>
      paint in paintMap ? paintMap[paint](i) : paintMap["wrong"](i)
    );
    keyRef.style.backgroundImage = backgrounds.join(",");
  };
  const paintKey = (letter: LetterAttempt, board: number, boards: number) => {
    const key = keysRef.get(letter.normalized);
    if (!key) return;

    const keyPaints = [
      ...(key.dataset["paint"]?.split(",") || []),
      ...new Array(state.state.boards.length).fill("wrong"),
    ].slice(0, state.state.boards.length);

    switch (letter.type) {
      case "right":
        keyPaints[board] = "right";
        break;
      case "occur":
        if (keyPaints[board] == "right") {
          break;
        }
        keyPaints[board] = "occur";
        break;
      default:
        if (keyPaints[board] == "occur" || keyPaints[board] == "right") {
          break;
        }
        keyPaints[board] = "wrong";
        break;
    }

    let keyDataset: string = keyPaints[board];
    if (boards > 1) {
      keyDataset = keyPaints.join(",");
    }
    key.dataset["paint"] = keyDataset;

    updateKeyPaint(key, keyDataset.split(","));
  };

  const paintAttempt = (attempt: WordAttempt, board: number) => {
    const playing = state.state.boards.filter(
      (board) => board.status === "playing"
    ).length;

    if (state.state.boards[board].status != "playing") {
      // setPlayingBoards(playing);
      resetKeyboard();

      state.state.boards.forEach((board, b) => {
        if (board.status != "playing") {
          return;
        }

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
      // .filter((board) => board.status === "playing")
      .forEach((board, b) => {
        if (board.status == "playing") {
          board.attempts.forEach((attempt) => paintAttempt(attempt, b));
        }
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

const getCSSVariable = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};
