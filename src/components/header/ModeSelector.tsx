import { For, Component } from "solid-js";
import { ALL_MODES, Mode, Modes } from "@/game/mode";
import { GameStoreMethods } from "@/store/game";

interface MappedMode {
  mode: Modes;
  active: boolean;
}

// this will be in the store
const modes = ALL_MODES.map(
  (mode, i) => ({ mode, active: i === 0 } as MappedMode)
);

const ModeSelector: Component<{ setMode: GameStoreMethods["setMode"] }> = ({
  setMode,
}) => {
  return (
    <div id="mode-selector" class="btn open" aria-label="Modo">
      <label class="label">Modo</label>
      <div class="icon" data-legend="Modo">
        <i class="ri-input-method-fill"></i>
      </div>
      <For each={modes}>
        {(mode) => (
          <div class="modes">
            <span
              class="mode"
              classList={{ selected: mode.active }}
              data-select-mode={mode}
              onClick={() => setMode(new Mode(mode.mode))}
            >
              {mode.mode}
            </span>
          </div>
        )}
      </For>
    </div>
  );
};

export default ModeSelector;
