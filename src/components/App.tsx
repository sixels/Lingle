import { Component } from "solid-js";

import Board from "./Board";
import Keyboard from "./Keyboard";
import Header from "./header";

import { createLingleStore } from "@/store";
import { Mode } from "@/game/mode";

const default_mode = new Mode("lingle");

const App: Component = () => {
  const {
    game: [game, { setMode }],
    // prefs: [prefs, prefsMethods],
  } = createLingleStore(default_mode);

  return (
    <>
      <Header setMode={setMode} />
      {game.mode}
      <Board />
      <Keyboard />
    </>
  );
};

export default App;
