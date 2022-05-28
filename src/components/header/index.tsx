import { Component } from "solid-js";

import "@/../styles/header.scss";

import { createSignal } from "solid-js";
import ModeSelector from "./ModeSelector";
import { GameState, GameStoreMethods } from "@/store/game";

const Header: Component<{
  gameState: GameState;
  setMode: GameStoreMethods["setMode"];
}> = ({ gameState, setMode }) => {
  const [menuOpen, setMenuOpen] = createSignal(false);

  const toggleMenu = () => {
    setMenuOpen(menuOpen() !== true);
  };

  return (
    <header id="header" class="header">
      <div class="left" id="header-left">
        <div class="btn" id="toggle-htp" aria-label="Sobre">
          <span class="label">Sobre</span>
          <i class="ri-information-fill"></i>
        </div>
      </div>
      <div class="right" id="menu" classList={{ visible: menuOpen() }}>
        <ModeSelector gameState={gameState} setMode={setMode} />
        <div class="btn" id="toggle-stats" aria-label="Estatísticas">
          <span class="label">Estatísticas</span>
          <i class="ri-bar-chart-fill"></i>
        </div>
        <div class="btn" id="toggle-prefs" aria-label="Ajustes">
          <span class="label">Ajustes</span>
          <i class="ri-settings-fill"></i>
        </div>
      </div>
      <div class="btn menu" id="menu-btn" onClick={toggleMenu}>
        <i class="ri-menu-fill"></i>
      </div>
    </header>
  );
};

export default Header;
