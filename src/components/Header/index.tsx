import { Component } from "solid-js";

import { createSignal } from "solid-js";
import ModeSelector from "./ModeSelector";
import { GameState, GameStoreMethods } from "@/store/game";
import Button from "./Button";

import "@styles/header.scss";

type Props = {
  gameState: GameState;
  setMode: GameStoreMethods["setMode"];
};

const Header: Component<Props> = ({ gameState, setMode }) => {
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
            //TODO: Toggle HTP Modal
          }}
        />
        <span class="strong">{`${gameState.mode}#${
          gameState.state.game_number + 1
        }`}</span>
      </div>
      <div class="right" id="menu" classList={{ visible: menuOpen() }}>
        <ModeSelector gameState={gameState} setMode={setMode} />
        <Button
          label="Estatísticas"
          icon="bar-chart"
          onClick={() => {
            //TODO: Toggle Stats Modal
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
