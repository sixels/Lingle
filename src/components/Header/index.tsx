import { Component, createRenderEffect, on, Signal } from "solid-js";

import { createSignal } from "solid-js";
import ModeSelector from "./ModeSelector";
import { GameState } from "@/store/game";
import Button from "./Button";

import "@styles/header.scss";

type Props = {
  gameState: GameState;
  openModalSignal: Signal<string>;
};

const Header: Component<Props> = ({
  gameState,
  openModalSignal: [openModal, setOpenModal],
}) => {
  const [menuOpen, setMenuOpen] = createSignal(false);
  const toggleMenu = () => {
    setMenuOpen(menuOpen() !== true);
  };

  createRenderEffect(
    on(openModal, (modal) => {
      if (modal !== "none") {
        setMenuOpen(false);
      }
    })
  );

  return (
    <header id="header" class="header">
      <div class="left" id="header-left">
        <Button
          label="Sobre"
          icon="information"
          onClick={() => {
            setOpenModal(openModal() === "about" ? "none" : "about");
          }}
        />
        <span class="strong">{gameState.mode}</span>
      </div>
      <div class="right" id="menu" classList={{ visible: menuOpen() }}>
        <ModeSelector state={gameState} />
        <Button
          label="Estatísticas"
          icon="bar-chart"
          onClick={() => {
            setOpenModal(openModal() === "stats" ? "none" : "stats");
          }}
        />
        <Button
          label="Ajustes"
          icon="settings"
          onClick={() => {
            setOpenModal(openModal() === "prefs" ? "none" : "prefs");
          }}
        />
      </div>
      <Button icon="menu" classList={{ menu: true }} onClick={toggleMenu} />
    </header>
  );
};

export default Header;
