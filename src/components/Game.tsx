import { useRouteData } from "solid-app-router";
import { Component, createEffect, createSignal, on } from "solid-js";

import { createLingleStore } from "@/store";
import { DynamicModal, Modals } from "./Modal";

import Board from "./Board";
import Header from "./Header";
import Keyboard from "./Keyboard";

import keyboard from "@/keyboardProvider";

const Game: Component = () => {
  const { mode } = useRouteData();

  const store = createLingleStore(mode),
    {
      game: [game, { setRow, setGameNumber, createAttempts }],
    } = store;

  const openModalSignal = createSignal<keyof Modals>("none"),
    [_, setOpenModal] = openModalSignal;

  createEffect(
    on(keyboard.keyPressed, () => {
      setOpenModal("none");
    })
  );

  return (
    <>
      <DynamicModal openModalSignal={openModalSignal} store={store} />

      <Header gameState={game} openModalSignal={openModalSignal} />

      <Board
        gameState={game}
        keyboard={keyboard}
        createAttempts={createAttempts}
        setGameNumber={setGameNumber}
        setRow={setRow}
      />

      <Keyboard keyboard={keyboard} />
    </>
  );
};

export default Game;
