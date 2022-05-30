import { Component } from "solid-js";

import Board from "./board";
import Keyboard from "./Keyboard";
import Header from "./header";

import { createLingleStore } from "@/store";
import { Mode } from "@/game/mode";

import keyboard from "../keyboardProvider";

const default_mode = new Mode("lingle");

const App: Component = () => {
  const {
    game: [game, { setMode, setRow, createAttempt }],
    // prefs: [prefs, prefsMethods],
  } = createLingleStore(default_mode);

  return (
    <>
      <Header gameState={game} setMode={setMode} />
      <Board
        gameState={game}
        keyboard={keyboard}
        setRow={setRow}
        createAttempt={createAttempt}
      />
      <Keyboard keyboard={keyboard} />
    </>
  );
};

export default App;
