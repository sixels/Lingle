import { Accessor, createRoot, createSignal } from "solid-js";

export type KeyboardState = {
  keyPressed: Accessor<string | null>;
  pressKey: (key: string | null) => void;
};

export const SPECIAL_KEYS = [
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Backspace",
  "Delete",
  "Escape",
  " ", // Space
] as const;
export type SpecialKey = typeof SPECIAL_KEYS[number];

const SPECIAL_KEYS_SET = new Set(SPECIAL_KEYS as readonly string[]);
export function isKeySpecial(key: string): key is SpecialKey {
  return SPECIAL_KEYS_SET.has(key);
}

export const LETTER_KEYS = new Set([..."abcdefghijklmnopqrstuvwxyz"]);

const createKeyboard = () => {
  const [pressed, setPressed] = createSignal<string | null>(null),
    state: KeyboardState = {
      keyPressed: pressed,
      pressKey: (key: string | null) => {
        setPressed(key);
        setPressed(null);
      },
    };

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    const key = event.key;
    // filter pressed key
    if (isKeySpecial(key) || LETTER_KEYS.has(key)) {
      setPressed(key);
    }
    setPressed(null);
  });

  return state;
};

export default createRoot(createKeyboard);
