import { For, Component } from "solid-js";
import { Modes } from "@/game/mode";
import { Link } from "solid-app-router";

type SelectorProps = { currentMode: Modes };

const ModeSelector: Component<SelectorProps> = ({ currentMode }) => {
  const modes: { path: string; mode: Modes; label: string }[] = [
    { path: "/", mode: "lingle", label: "Lingle" },
    { path: "/duo", mode: "duolingle", label: "DuoLingle" },
    { path: "/quad", mode: "quadlingle", label: "QuadLingle" },
    { path: "/octo", mode: "octolingle", label: "OctoLingle" },
    { path: "/dec", mode: "declingle", label: "DecLingle" },
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
              classList={{ selected: mode.mode == currentMode }}
            >
              {mode.label}
            </Link>
          )}
        </For>
      </div>
    </div>
  );
};

export default ModeSelector;
