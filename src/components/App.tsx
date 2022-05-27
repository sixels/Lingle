import { Component } from "solid-js";

import Board from "./Board";
import Keyboard from "./Keyboard";
import Header from "./header";

const App: Component = () => {
  return (
    <>
      <Header />
      <Board />
      <Keyboard />
    </>
  );
};

export default App;
