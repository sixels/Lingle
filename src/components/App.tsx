import { Component, createEffect, createSignal, on, onMount } from "solid-js";

import { createLingleStore } from "@/store";
import { Mode } from "@/game/mode";
import { initWordlists } from "@/wordlist";

import Header from "./Header";
import Board from "./Board";
import Keyboard from "./Keyboard";

import keyboard from "../keyboardProvider";
import { DynamicModal, Modals } from "./Modal";

const defaultMode = new Mode("lingle");

const App: Component = () => {
  const store = createLingleStore(defaultMode),
    {
      game: [game, { setMode, setRow, setGameNumber, createAttempts }],
      prefs: prefsStore,
    } = store,
    prefs = prefsStore[0];

  const openModalSignal = createSignal<keyof Modals>("none"),
    setOpenModal = openModalSignal[1];

  onMount(() => {
    initWordlists();
  });

  createEffect(
    on(keyboard.keyPressed, () => {
      setOpenModal("none");
    })
  );

  return (
    <>
      <div id="app" data-theme={prefs.theme}>
        <DynamicModal openModalSignal={openModalSignal} store={store} />

        <Header
          gameState={game}
          openModalSignal={openModalSignal}
          setMode={setMode}
        />

        <Board
          gameState={game}
          keyboard={keyboard}
          createAttempts={createAttempts}
          setGameNumber={setGameNumber}
          setRow={setRow}
        />

        <Keyboard keyboard={keyboard} />
      </div>
    </>
  );
};

export default App;
