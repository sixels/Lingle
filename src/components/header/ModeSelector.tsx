import { For, Component } from "solid-js";
import { ALL_MODES, Modes } from "@/game/mode";

interface MappedMode {
  mode: Modes;
  active: boolean;
}

// this will be in the store
const modes = ALL_MODES.map(
  (mode, i) => ({ mode, active: i === 0 } as MappedMode)
);

const selectMode = (next_mode: MappedMode) => {
  const current_active = modes.find(({ active }) => active);
  if (current_active) current_active.active = false;

  next_mode.active = true;
};

const ModeSelector: Component = () => {
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
              onClick={() => selectMode(mode)}
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
