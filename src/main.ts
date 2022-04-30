import "../styles/options.scss";
import "../styles/style.scss";
import "../styles/media.scss";

import { GameManager } from "./game";
import { KeyboardManager } from "./keyboard";
import { Message, MessageKind } from "./message";
import { Menu } from "./ui/menu";

window.onload = (_) => {
  const app = document.getElementById("app");
  if (app !== null) {
    app.style.minHeight = `${window.innerHeight}px`;
  }

  window.onresize = () => {
    if (app !== null) {
      app.style.minHeight = `${window.innerHeight}px`;
    }
  };

  main();
};

const main = () => {
  //setup ui elements
  new Menu();

  // setup game and keyboard
  let board_elem = document.getElementById("board");
  let keyboard_elem = document.getElementById("keyboard");

  if (keyboard_elem === null || board_elem === null) {
    console.error("ERROR: Missing HTML elements");
    return;
  }

  let keyboard = new KeyboardManager(keyboard_elem);
  let game = new GameManager(board_elem);

  document.addEventListener("keyup", keyboard.handleKeyPress);
  document.addEventListener("sendmessage", handleMessage);

  game.start();

  // TODO: REMOVE
  console.log(game.solution);
};

let ltimeout: number | undefined = undefined;
const handleMessage = (event: Event) => {
  const custom_ev = event as CustomEvent;
  const message = custom_ev.detail["message"] as Message | undefined;
  if (message === undefined) {
    return;
  }

  function setMessage(message: Message) {
    const elem = document.getElementById("message");
    if (elem === null) {
      return;
    }

    elem.classList.remove("error", "info");
    elem.classList.add(
      "message",
      message.kind === MessageKind.Error ? "error" : "info"
    );
    elem.classList.remove("hidden");
    elem.innerText = message.data;

    return elem;
  }

  setMessage(message);
  if (ltimeout !== undefined) {
    clearTimeout(ltimeout);
  }
  ltimeout = setTimeout(
    () => {
      document.getElementById("message")?.classList.add("hidden");
    },
    message.kind === MessageKind.Error ? 3000 : 6000
  );
};
