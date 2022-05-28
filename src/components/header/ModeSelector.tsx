import { For, Component } from "solid-js";
import { ALL_MODES, Mode, Modes } from "@/game/mode";
import { GameState, GameStoreMethods } from "@/store/game";

const ModeSelector: Component<{
  gameState: GameState;
  setMode: GameStoreMethods["setMode"];
}> = ({ gameState, setMode }) => {
  const changeMode = (m: Modes) => {
    setMode(new Mode(m));
  };

  return (
    <div id="mode-selector" class="btn open" aria-label="Modo">
      <label class="label">Modo</label>
      <div class="icon" data-legend="Modo">
        <i class="ri-input-method-fill"></i>
      </div>
      <div class="modes">
        <For each={ALL_MODES}>
          {(mode) => (
            <span
              class="mode"
              classList={{ selected: mode == gameState.mode }}
              onClick={() => changeMode(mode)}
            >
              {mode}
            </span>
          )}
        </For>
      </div>
    </div>
  );
};

export default ModeSelector;
