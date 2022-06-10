import { For, Component } from "solid-js";
import { Modes } from "@/game/mode";
import { GameState } from "@/store/game";
import { Link } from "solid-app-router";

type SelectorProps = { state: GameState };

const ModeSelector: Component<SelectorProps> = ({ state }) => {
  const modes: { path: string; mode: Modes }[] = [
    { path: "/", mode: "lingle" },
    { path: "/duo", mode: "duolingle" },
  ];

  return (
    <div id="mode-selector" class="btn open" aria-label="Modo">
      <label class="label">Modo</label>
      <div class="icon" data-legend="Modo">
        <i class="ri-input-method-fill"></i>
      </div>
      <div class="modes">
        <For each={modes}>
          {(mode) => (
            <Link
              href={mode.path}
              class="mode"
              classList={{ selected: mode.mode == state.mode }}
            >
              {mode.mode}
            </Link>
          )}
        </For>
      </div>
    </div>
  );
};

export default ModeSelector;
