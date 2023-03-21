import { useRouteData } from "solid-app-router";
import { Component, createEffect, createSignal, on } from "solid-js";

import { createGameStore } from "@/store";
import { DynamicModal, Modals } from "./Modal";

import Board from "./Board";
import Header from "./Header";
import Keyboard from "./Keyboard";

import keyboard from "@/providers/keyboard";
import { useTicker } from "@/providers/ticker";
import { PrefsStore } from "@/store/prefs";
import { Mode } from "@/game/mode";

const Game: Component = () => {
  const { onEachDay } = useTicker();
  const { mode, prefsStore } = useRouteData<{
    mode: Mode;
    prefsStore: PrefsStore;
  }>();

  const gameStore = createGameStore(mode),
    [game, { setRow, setGameNumber, createAttempts, resetState, updateStats }] =
      gameStore;

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
        setOpenModal={setOpenModal}
        setRow={setRow}
        updateStats={updateStats}
      />

      <Keyboard state={game} keyboard={keyboard} setOpenModal={setOpenModal} />
    </>
  );
};

export default Game;
