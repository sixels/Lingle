import { Component, createEffect, For, on, onCleanup } from "solid-js";

import { isKeySpecial, KeyboardState } from "@/keyboardProvider";
import { Key, KeyboardKey } from "./Key";

import "@styles/keyboard.scss";

type Props = { keyboard: KeyboardState };

const Keyboard: Component<Props> = ({ keyboard }) => {
  const makeKeys = (keys: string): KeyboardKey[] => {
    return [...keys].map((k) => ({ key: k }));
  };
  const keys: KeyboardKey[][] = [
    makeKeys("qwertyuiop"),
    [...makeKeys("asdfghjkl"), { key: "Backspace", icon: "delete-back-2" }],
    [...makeKeys("zxcvbnm"), { key: "Enter", icon: undefined }],
  ];

  let timeout: NodeJS.Timeout;

  const highlightKey = (keyElem: HTMLElement | null) => {
    if (!keyElem) {
      return;
    }

    keyElem.classList.add("highlighted");
    timeout = setTimeout(() => {
      keyElem.classList.remove("highlighted");
    }, 180);
  };

  const pressKey = (ev: MouseEvent, key: KeyboardKey) => {
    const target = ev.target;
    if (!target) return;

    keyboard.pressKey(key.key);
    highlightKey(target as HTMLElement);
  };

  onCleanup(() => {
    clearTimeout(timeout);
  });

  createEffect(
    on(keyboard.keyPressed, (key) => {
      if (key && !isKeySpecial(key))
        highlightKey(document.querySelector(`[data-key=${key}]`));
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
                    return <Key key={key} onClick={pressKey} />;
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
