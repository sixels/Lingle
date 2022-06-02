import { Component, createEffect, For, on } from "solid-js";
import { KeyboardState } from "@/keyboardProvider";

type SpecialKey = { name: "Backspace" | "Enter"; icon?: string };
type KeyboardKey = string | SpecialKey;

type Props = { keyboard: KeyboardState };

function isKeySpecial(key: KeyboardKey): key is SpecialKey {
  return (key as SpecialKey)["name"] !== undefined;
}

const Keyboard: Component<Props> = ({ keyboard }) => {
  const keys: KeyboardKey[][] = [
    [..."QWERTYUIOP"],
    [..."ASDFGHJKL", { name: "Backspace", icon: "delete-back-2" }],
    [..."ZXCVBNM", { name: "Enter" }],
  ];

  createEffect(
    on(keyboard.key_pressed, (key) => {
      // TODO: Animate key pressing
    })
  );
  const clickKey = (key: KeyboardKey) => {
    keyboard.pressKey(isKeySpecial(key) ? key.name : key);
  };

  return (
    <div class="keyboard-wrapper" id="keyboard-wrapper">
      <div class="keyboard" id="keyboard">
        <For each={keys}>
          {(keys) => {
            return (
              <div class="row">
                <For each={keys}>
                  {(key) => {
                    const is_special = isKeySpecial(key);
                    const key_name = is_special ? key.name : key;
                    return (
                      <div
                        class="key"
                        classList={{
                          special: is_special,
                          [key_name.toLowerCase()]: is_special,
                        }}
                      >
                        {is_special && key.icon ? (
                          <i class={`ri-${key.icon}-fill`}></i>
                        ) : (
                          key_name
                        )}
                      </div>
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
