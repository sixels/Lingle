import events from "./events";
import { AttemptType, GameStatus, WordAttempt } from "./game";
import { LingleStore } from "./store";

export class KeyboardManager {
  static VALID_KEYS = new Set([
    "enter",
    "backspace",
    "arrowleft",
    "arrowright",
    "escape",
    "home",
    "end",
    ..."qwertyuiopasdfghjklzxcvbnm".split(""),
  ]);

  private keys: Map<string, HTMLElement> = new Map();
  private effectTimeouts = new Map();
  private playing_boards: number[] = [];
  private prev_playing_boards: number;

  // Create a new keyboard manager
  constructor(elem: HTMLElement, store: LingleStore) {
    // handle clicks from the virtual keyboard
    const rows: HTMLElement[] = [].slice.call(elem.children);
    for (const row of rows) {
      const keys: HTMLElement[] = [].slice.call(row.children);
      keys.map((elem) => {
        const key = elem.dataset["key"];
        if (key) this.keys.set(key, elem);
      });
    }
    elem.addEventListener("click", this.handleKeyClick);

    this.prev_playing_boards = this.updatePlayingBoards(store);

    store.state.attempts.forEach((board_attempt) =>
      board_attempt.forEach(this.paintKeys)
    );
    store.onInvalidate(this.handleInvalidateStore);
    store.onSave((store) => {
      const cur_playing_boards = this.updatePlayingBoards(store);
      if (this.prev_playing_boards !== cur_playing_boards) {
        this.prev_playing_boards = cur_playing_boards;

        this.reset_keyboard();
        store.state.attempts.forEach((board_attempt) =>
          board_attempt.forEach(this.paintKeys)
        );
      }
    });

    document.addEventListener("wordattempt", this.handleWordAttempt);
  }

  updatePlayingBoards = (store: LingleStore): number => {
    this.playing_boards = store.state.status
      .map((s, i) => [s === GameStatus.Playing, i] as [boolean, number])
      .filter(([s, _]) => s)
      .map(([_, i]) => i);
    return this.playing_boards.length;
  };

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

  private reset_keyboard() {
    const dirs = ["left", "right"] as const;
    const types = ["right", "occur", "wrong"] as const;

    // combine types and directions
    const classes: string[] = types.flatMap((type) =>
      dirs.map((dir) => type + "-" + dir)
    );

    for (const key of this.keys.values()) {
      key.classList.remove(...classes, ...types);
    }
  }

  // Apply a highlight effect to the given key
  private highlightKey = (key: string) => {
    // avoid searching for invalid characters
    if (KeyboardManager.isKeyValid(key) === false) {
      return;
    }

    const key_element = this.keys.get(key);

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

  private handleInvalidateStore = (store: LingleStore) => {
    this.prev_playing_boards = this.updatePlayingBoards(store);

    this.reset_keyboard();

    store.state.attempts.forEach((board_attempt) =>
      board_attempt.forEach(this.paintKeys)
    );
  };

  private paintKeys = (attempt: WordAttempt) => {
    let side: "left" | "right" | undefined = undefined;
    if (this.prev_playing_boards == 2) {
      side = attempt.board === 0 ? "left" : "right";
    }

    for (const letter of attempt.letters) {
      const key = this.keys.get(letter.normalized);

      if (
        !key ||
        this.prev_playing_boards === 0 ||
        this.playing_boards.indexOf(attempt.board) < 0
      ) {
        key?.classList.add("wrong");
        continue;
      }

      const mkClass = (type: string): string => {
        return type.concat(side ? "-" + side : "");
      };

      let key_class: string | undefined = undefined;
      switch (letter.type) {
        case AttemptType.Wrong:
          key_class = "wrong";
          break;
        case AttemptType.Right:
          // we've got the right position for that letter, remove the "occur"
          const occur = mkClass("occur");
          if (key.classList.contains(occur)) {
            key.classList.remove(occur);
          }
          key_class = "right";
          break;
        case AttemptType.Occur:
          // we already have it right, just skip
          if (key.classList.contains(mkClass("right"))) {
            break;
          }

          key_class = "occur";
          break;
      }

      if (key_class) {
        key.classList.add(mkClass(key_class));
      }
    }
  };
}
