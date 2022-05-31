import { Accessor, createRoot, createSignal } from "solid-js";

export type KeyboardState = {
  key_pressed: Accessor<string | null>;
  pressKey: (key: string | null) => void;
};

export const SPECIAL_KEYS = new Set([
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Backspace",
  "Delete",
]);

export const LETTER_KEYS = new Set([..."abcdefghijklmnopqrstuvwxyz"]);

const createKeyboard = () => {
  const [pressed, setPressed] = createSignal<string | null>(null),
    state: KeyboardState = {
      key_pressed: pressed,
      pressKey: (key: string | null) => {
        setPressed(key);
      },
    };

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    const key = event.key;
    // filter pressed key
    if (SPECIAL_KEYS.has(key) || LETTER_KEYS.has(key)) {
      setPressed(key);
    }
    setPressed(null);
  });

  return state;
};

export default createRoot(createKeyboard);
