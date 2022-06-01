import { Component } from "solid-js";

import Board from "./Board";
import Keyboard from "./Keyboard";
import Header from "./Header";

import { createLingleStore } from "@/store";
import { Mode } from "@/game/mode";

import keyboard from "../keyboardProvider";

const default_mode = new Mode("lingle");

const App: Component = () => {
  const {
    game: [game, { setMode, setRow, createAttempts }],
    prefs: [prefs, _],
  } = createLingleStore(default_mode);

  return (
    <>
      <div id="app" data-theme={prefs.theme}>
        <Header gameState={game} setMode={setMode} />
        <Board
          gameState={game}
          keyboard={keyboard}
          setRow={setRow}
          createAttempts={createAttempts}
        />
        <Keyboard keyboard={keyboard} />
      </div>
    </>
  );
};

export default App;
