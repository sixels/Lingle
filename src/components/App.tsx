import { Component, createSignal, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { createLingleStore } from "@/store";
import { Mode } from "@/game/mode";
import { initWordlists } from "@/wordlist";

import AboutModal from "./Modal/About";
import StatsModal from "./Modal/Stats";
import Header from "./Header";
import Board from "./Board";
import Keyboard from "./Keyboard";

import keyboard from "../keyboardProvider";

const defaultMode = new Mode("lingle");

const modals = {
  about: AboutModal,
  stats: StatsModal,
  none: undefined,
};

const App: Component = () => {
  const {
    game: [game, { setMode, setRow, setGameNumber, createAttempts }],
    prefs: [prefs, _],
  } = createLingleStore(defaultMode);

  const [openModal, setOpenModal] = createSignal<keyof typeof modals>("none");

  onMount(() => {
    initWordlists();
  });

  return (
    <>
      <Transition
        onBeforeEnter={(el) => el.setAttribute("style", "opacity:0")}
        onAfterEnter={(el) => el.setAttribute("style", "opacity:1")}
        onEnter={(el, done) => {
          const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
            easing: "ease-in-out",
            fill: "forwards",
          });
          anim.finished.then(done);
        }}
        onExit={(el, done) => {
          const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 300,
            easing: "ease-in-out",
            fill: "forwards",
          });
          anim.finished.then(done);
        }}
      >
        <Dynamic
          component={modals[openModal()]}
          close={() => {
            setOpenModal("none");
          }}
        />
      </Transition>
      <div id="app" data-theme={prefs.theme}>
        <Header
          gameState={game}
          openModal={[openModal, setOpenModal]}
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
