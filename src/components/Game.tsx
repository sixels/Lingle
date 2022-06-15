import { useRouteData } from "solid-app-router";
import { Component, createEffect, createSignal, on } from "solid-js";

import { createGameStore } from "@/store";
import { DynamicModal, Modals } from "./Modal";

import Board from "./Board";
import Header from "./Header";
import Keyboard from "./Keyboard";

import keyboard from "@/providers/keyboard";
import { useTicker } from "@/providers/ticker";

const Game: Component = () => {
  const { onEachDay } = useTicker();
  const { mode, prefsStore } = useRouteData();

  const gameStore = createGameStore(mode),
    [game, { setRow, setGameNumber, createAttempts, resetState }] = gameStore;

  const openModalSignal = createSignal<keyof Modals>("none"),
    [_, setOpenModal] = openModalSignal;

  onEachDay(() => {
    if (new Date().getTime() >= game.expires.getTime()) {
      resetState();
    }
  });

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

      <Header openModalSignal={openModalSignal} />

      <Board
        gameState={game}
        keyboard={keyboard}
        createAttempts={createAttempts}
        setGameNumber={setGameNumber}
        setRow={setRow}
      />

      <Keyboard state={game} keyboard={keyboard} />
    </>
  );
};

export default Game;
