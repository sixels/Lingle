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
  const app_elem = document.getElementById("app");
  if (!message || !app_elem) {
    return;
  }
  const old_message_elem = document.getElementById("message");

  const message_elem = document.createElement("aside");
  message_elem.id = "message";

  const text_elem = document.createElement("div");
  text_elem.classList.add("text");
  text_elem.innerText = message.data;

  message_elem.append(text_elem);
  if (message.options) {
    const options_wrapper = document.createElement("div");
    options_wrapper.classList.add("options");

    Object.entries(message.options).forEach(([option, callback]) => {
      const button_elem = document.createElement("div");
      button_elem.classList.add("option", "btn");
      button_elem.innerText = option;

      button_elem.addEventListener("click", () => {
        callback();
        hideMessage(message_elem);
      });

      options_wrapper.append(button_elem);
    });

    message_elem.append(options_wrapper);
  }

  message_elem.classList.add(
    "message",
    "hidden",
    message.kind === MessageKind.Error ? "error" : "info"
  );

  // message_elem.addEventListener("click", (_) => {
  //   hideMessage(message_elem);
  // });

  if (old_message_elem) {
    old_message_elem.remove();
    clearTimeout(ltimeout);
  }
  app_elem.prepend(message_elem);

  if (message.callback !== undefined) {
    message.callback();
  }

  message_elem.classList.remove("hidden");
  const delay = message.timeout ? message.timeout : 0;
  ltimeout = setTimeout(() => {
    hideMessage(message_elem);
  }, delay || (message.kind === MessageKind.Error ? 3000 : 6000));
};

const hideMessage = (m: HTMLElement) => {
  m.classList.add("hidden");
};
