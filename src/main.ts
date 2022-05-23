import "../styles/options.scss";
import "../styles/fonts.scss";
import "../styles/keyframes.scss";
import "../styles/media.scss";
import "../styles/style.scss";

import "remixicon/fonts/remixicon.css";

import { GameManager } from "./game";
import { KeyboardManager } from "./keyboard";
import { Message, MessageKind } from "./message";
import { LingleStore } from "./store";
import { Menu, StatsModal, HTPModal, PrefsModal } from "./ui";
import { init_wordlists } from "./wordlist";

init_wordlists();

if (typeof window !== "undefined") {
  import("./pwa");
}

window.onload = (_) => {
  const app = document.getElementById("app");
  window.onresize = () => {
    if (app !== null) {
      app.style.minHeight = `${window.innerHeight}px`;
    }
  };

  let store = new LingleStore("lingle");
  main(store);
};

const main = (store: LingleStore) => {
  let keyboard_elem = document.getElementById("keyboard");

  if (keyboard_elem === null) {
    console.error("ERROR: Missing HTML elements");
    return;
  }

  let keyboard = new KeyboardManager(keyboard_elem, store);

  const game = new GameManager(store);

  document.addEventListener("keyup", keyboard.handleKeyPress);
  document.addEventListener("sendmessage", handleMessage);

  document.getElementById("set-mode-duo")?.addEventListener("click", () => {
    game.setMode("duolingle");
  });
  document.getElementById("set-mode-lingle")?.addEventListener("click", () => {
    game.setMode("lingle");
  });

  setupUIElements(store);
};

function setupUIElements(store: LingleStore) {
  const menu = new Menu();
  const stats = new StatsModal(store);
  const htp = new HTPModal(store);
  const prefs = new PrefsModal(store);

  document.getElementById("toggle-stats")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    menu.show(false);
    stats.show(true);
  });
  document.getElementById("toggle-htp")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    menu.show(false);
    htp.show(true);
  });
  document.getElementById("toggle-prefs")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    menu.show(false);
    prefs.show(true);
  });

  const app = document.getElementById("app");
  if (app !== null) {
    app.style.minHeight = `${window.innerHeight}px`;
    app.prepend(stats.elem);
    app.prepend(htp.elem);
    app.prepend(prefs.elem);
  }
}

let ltimeout: NodeJS.Timeout | undefined = undefined;
const handleMessage = (event: Event) => {
  const custom_ev = event as CustomEvent;
  const message = custom_ev.detail["message"] as Message | undefined;
  const message_elem = document.getElementById("message");
  if (!message || !message_elem) {
    return;
  }

  const new_message_elem = message_elem.cloneNode(true);
  message_elem.parentNode?.replaceChild(new_message_elem, message_elem);

  if (message.on_click) {
    const cb = message.on_click;
    new_message_elem.addEventListener("click", () => {
      cb();
    });
  }
  new_message_elem.addEventListener("click", hideMessage);

  function setMessage(message: Message) {
    const elem = new_message_elem as HTMLElement;

    elem.classList.remove("error", "info");
    elem.classList.add(
      "message",
      message.kind === MessageKind.Error ? "error" : "info"
    );
    elem.classList.remove("hidden");
    elem.innerText = message.data;
  }

  setMessage(message);

  if (message.callback !== undefined) {
    message.callback();
  }

  if (ltimeout !== undefined) {
    clearTimeout(ltimeout);
  }

  const delay = message.timeout ? message.timeout : 0;
  ltimeout = setTimeout(() => {
    if (message.on_click) {
      new_message_elem.removeEventListener("click", message.on_click);
    }
    hideMessage(new_message_elem as HTMLElement);
  }, delay || (message.kind === MessageKind.Error ? 3000 : 6000));
};

const hideMessage = (m: HTMLElement | Event) => {
  let message_elem: HTMLElement | null;
  if (m instanceof Event) {
    m.stopPropagation();
    message_elem = m.target as HTMLElement | null;
  } else {
    message_elem = m;
  }
  message_elem?.classList.add("hidden");
};
