import { Accessor, createRoot, createSignal } from "solid-js";

export type KeyboardState = {
  key_pressed: Accessor<string | null>;
  pressKey: (key: string | null) => void;
};

const createKeyboard = () => {
  const [pressed, setPressed] = createSignal<string | null>(null),
    state: KeyboardState = {
      key_pressed: pressed,
      pressKey: (key: string | null) => {
        setPressed(key);
      },
    };

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    const special_keys = new Set([
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Backspace",
    ]);
    const letters = new Set([..."abcdefghijklmnopqrstuvwxyz"]);

    const key = event.key;
    if (special_keys.has(key) || letters.has(key)) {
      setPressed(key);
    }
    setPressed(null);
  });

  return state;
};

export default createRoot(createKeyboard);
