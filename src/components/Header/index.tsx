import { Component, Signal } from "solid-js";

import { createSignal } from "solid-js";
import ModeSelector from "./ModeSelector";
import { GameState, GameStoreMethods } from "@/store/game";
import Button from "./Button";

import "@styles/header.scss";

type Props = {
  gameState: GameState;
  setMode: GameStoreMethods["setMode"];
  openModal: Signal<string>;
};

const Header: Component<Props> = ({
  gameState,
  setMode,
  openModal: [openModal, setOpenModal],
}) => {
  const [menuOpen, setMenuOpen] = createSignal(false);

  const toggleMenu = () => {
    setMenuOpen(menuOpen() !== true);
  };

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
        <span class="strong">{`${gameState.mode}#${
          gameState.state.gameNumber + 1
        }`}</span>
      </div>
      <div class="right" id="menu" classList={{ visible: menuOpen() }}>
        <ModeSelector gameState={gameState} setMode={setMode} />
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
            //TODO: Toggle Stats Modal
          }}
        />
      </div>
      <Button icon="menu" classList={{ menu: true }} onClick={toggleMenu} />
    </header>
  );
};

export default Header;
