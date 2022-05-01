import events from "./events";
import { WordAttempt } from "./game";
import { LingleStore } from "./store";

export class KeyboardManager {
  static VALID_KEYS = new Set([
    "enter",
    "backspace",
    "arrowleft",
    "arrowright",
    ..."qwertyuiopasdfghjklzxcvbnm".split(""),
  ]);

  private keys: HTMLElement[] = [];
  private effectTimeouts = new Map();

  // Create a new keyboard manager
  constructor(elem: HTMLElement) {
    // handle clicks from the virtual keyboard
    const rows: HTMLElement[] = [].slice.call(elem.children);
    for (const row of rows) {
      const keys: HTMLElement[] = [].slice.call(row.children);
      for (const key of keys) {
        key.addEventListener("click", this.handleKeyClick);
      }

      this.keys = [...this.keys, ...keys];
    }

    let store = new LingleStore();
    if (store.load()) {
      store.attempts.forEach(this.paintKeys);
    }

    document.addEventListener("wordattempt", this.handleWordAttempt);
    document.addEventListener("resetsignal", this.handleResetSignal);
  }

  // Check wether a key is valid or not
  static isKeyValid(key: string): boolean {
    return KeyboardManager.VALID_KEYS.has(key);
  }

  // Propagate the key event to the GameManager's queue
  pressKey = (key: string) => {
    key = key.toLocaleLowerCase();
    this.highlightKey(key);
    if (KeyboardManager.isKeyValid(key)) {
      events.dispatchSendKeyEvent(key);
    }
  };

  // Apply a highlight effect to the given key
  private highlightKey = (key: string) => {
    // avoid searching for invalid characters
    if (KeyboardManager.isKeyValid(key) === false) {
      return;
    }

    const key_element = this.keys.find((v) => {
      return key === v.dataset["key"];
    });

    if (key_element !== undefined) {
      key_element.classList.add("highlighted");

      let prevTimeout = this.effectTimeouts.get(key);
      if (prevTimeout !== null) {
        this.effectTimeouts.delete(key);
        clearTimeout(prevTimeout);
      }

      let timeout = setTimeout(() => {
        key_element.classList.remove("highlighted");
        this.effectTimeouts.delete(key);
      }, 150);

      this.effectTimeouts.set(key, timeout);
    }
  };

  // Handle keys from the physical keyboard
  handleKeyPress = (event: KeyboardEvent) => {
    this.pressKey(event.key);
  };

  // Handle keys from the virtual keyboard
  private handleKeyClick = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const target = event.target as HTMLElement | null;

    if (target !== null) {
      const key = target.dataset["key"];
      if (key !== undefined) {
        this.pressKey(key);
      }
    }
  };

  private handleWordAttempt = (event: Event) => {
    const custom_ev = event as CustomEvent;
    const attempt = custom_ev.detail["attempt_desc"] as WordAttempt | null;

    if (attempt === null) {
      return;
    }

    this.paintKeys(attempt);
  };

  private handleResetSignal = (_: Event) => {
    for (const key_elem of this.keys) {
      key_elem.classList.remove("wrong", "right", "occur");
    }
  };

  private paintKeys = (attempt: WordAttempt) => {
    for (const key_elem of this.keys) {
      let key = key_elem.dataset["key"];
      if (attempt.wrong_letters.some((v) => v.normalized == key)) {
        key_elem.classList.add("wrong");
      } else if (attempt.right_letters.some((v) => v.normalized == key)) {
        key_elem.classList.add("right");
        key_elem.classList.remove("occur");
      } else if (attempt.occur_letters.some((v) => v.normalized == key)) {
        key_elem.classList.add("occur");
      }
    }
  };
}
