import { Component } from "solid-js";

import "@/../styles/header.scss";

import ModeSelector from "./ModeSelector";
import { GameStoreMethods } from "@/store/game";

const Header: Component<{ setMode: GameStoreMethods["setMode"] }> = ({
  setMode,
}) => {
  return (
    <header id="header" class="header">
      <div class="left" id="header-left">
        <div class="btn" id="toggle-htp">
          <i class="ri-information-fill"></i>
        </div>
      </div>
      <div class="right" id="menu">
        <ModeSelector setMode={setMode}/>
        <div class="btn" id="toggle-stats" aria-label="Estatísticas">
          <label>Estatísticas</label>
          <i class="ri-bar-chart-fill"></i>
        </div>
        <div class="btn" id="toggle-prefs" aria-label="Ajustes">
          <label>Ajustes</label>
          <i class="ri-settings-fill"></i>
        </div>
      </div>
      <div class="btn menu" id="menu-btn">
        <i class="ri-menu-fill"></i>
      </div>
    </header>
  );
};

export default Header;
