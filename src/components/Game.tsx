import { useRouteData } from "solid-app-router";
import { Component, createEffect, createSignal, on } from "solid-js";

import { createGameStore } from "@/store";
import { DynamicModal, Modals } from "./Modal";

import Board from "./Board";
import Header from "./Header";
import Keyboard from "./Keyboard";

import keyboard from "@/keyboardProvider";

const Game: Component = () => {
  const { mode, prefsStore } = useRouteData();

  const gameStore = createGameStore(mode),
    [game, { setRow, setGameNumber, createAttempts }] = gameStore;

  const openModalSignal = createSignal<keyof Modals>("none"),
    [_, setOpenModal] = openModalSignal;

  createEffect(
    on(keyboard.keyPressed, () => {
      setOpenModal("none");
    })
  );

  return (
    <>
      <DynamicModal
        openModalSignal={openModalSignal}
        store={{ game: gameStore, prefs: prefsStore }}
      />

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
