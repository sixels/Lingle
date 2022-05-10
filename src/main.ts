import "../styles/options.scss";
import "../styles/keyframes.scss";
import "../styles/media.scss";
import "../styles/style.scss";

import { GameManager } from "./game";
import { KeyboardManager } from "./keyboard";
import { Message, MessageKind } from "./message";
import { Menu } from "./ui/menu";
import { LingleStore } from "./store";
import { StatsModal } from "./ui/stats";
import { HTPModal } from "./ui/htp";
import { ModeManager } from "./mode";

window.onload = (_) => {
  const app = document.getElementById("app");
  window.onresize = () => {
    if (app !== null) {
      app.style.minHeight = `${window.innerHeight}px`;
    }
  };

  let store = new LingleStore();

  main(store);
};

const main = (store: LingleStore) => {
  let keyboard_elem = document.getElementById("keyboard");

  if (keyboard_elem === null) {
    console.error("ERROR: Missing HTML elements");
    return;
  }

  let keyboard = new KeyboardManager(keyboard_elem, store);

  let mm = new ModeManager("duolingle");
  let gm = new GameManager(store, mm.boards, mm.mode);

  document.addEventListener("keyup", keyboard.handleKeyPress);
  document.addEventListener("sendmessage", handleMessage);
};

function setupUIEelements(store: LingleStore) {
  //setup ui elements
  const menu = new Menu();
  const stats = new StatsModal(store);
  const htp = new HTPModal(store);

  document.getElementById("toggle-stats")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    menu.show(false);
    htp.show(false);
    stats.show(true);
  });
  document.getElementById("toggle-htp")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    menu.show(false);
    stats.show(false);
    htp.show(true);
  });

  const app = document.getElementById("app");
  if (app !== null) {
    app.style.minHeight = `${window.innerHeight}px`;
    app.prepend(stats.elem);
    app.prepend(htp.elem);
  }
}

let ltimeout: number | undefined = undefined;
const handleMessage = (event: Event) => {
  const custom_ev = event as CustomEvent;
  const message = custom_ev.detail["message"] as Message | undefined;
  if (message === undefined) {
    return;
  }

  function setMessage(message: Message): Promise<void> {
    const elem = document.getElementById("message");
    if (elem === null) {
      return Promise.reject();
    }

    elem.classList.remove("error", "info");
    elem.classList.add(
      "message",
      message.kind === MessageKind.Error ? "error" : "info"
    );
    elem.classList.remove("hidden");
    elem.innerText = message.data;

    return Promise.resolve();
  }

  setMessage(message).then(() => {
    if (message.callback !== undefined) {
      message.callback();
    }

    if (ltimeout !== undefined) {
      clearTimeout(ltimeout);
    }
    ltimeout = setTimeout(
      () => {
        document.getElementById("message")?.classList.add("hidden");
      },
      message.kind === MessageKind.Error ? 3000 : 6000
    );
  });
};
