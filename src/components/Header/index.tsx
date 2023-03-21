import {
  Component,
  createRenderEffect,
  on,
  onCleanup,
  onMount,
  Signal,
  createSignal,
  createEffect,
} from "solid-js";
import { useRouteData } from "solid-app-router";

import ModeSelector from "./ModeSelector";
import Button from "./Button";

import "@styles/header.scss";
import { Mode } from "@/game/mode";
import { getGameNumber } from "@/game/solution";

type Props = {
  openModalSignal: Signal<string>;
};

const Header: Component<Props> = ({
  openModalSignal: [openModal, setOpenModal],
}) => {
  const { mode } = useRouteData<{ mode: Mode }>();

  let menuBtnRef: HTMLElement | null = null,
    menuRef: HTMLElement | null = null,
    [menuOpen, setMenuOpen] = createSignal(false);

  const handleClickMenu = () => {
    setMenuOpen(!menuOpen());
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      (menuBtnRef && menuBtnRef.contains(event.target as Node)) ||
      (menuRef && menuRef.contains(event.target as Node))
    ) {
      return;
    }

    setMenuOpen(false);
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside, true);
  });
  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside, true);
  });

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
            setOpenModal(openModal() == "about" ? "none" : "about");
          }}
        />
        <span class="strong">
          {mode.displayName}{" "}
          <span class="game-number">#{getGameNumber(new Date())}</span>
        </span>
      </div>
      <div
        class="right"
        id="menu"
        classList={{ visible: menuOpen() }}
        ref={(elem) => {
          menuRef = elem;
        }}
      >
        <ModeSelector currentMode={mode.mode} />
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
      <Button
        icon="menu"
        refFn={(e) => {
          menuBtnRef = e;
        }}
        classList={{ menu: true }}
        onClick={handleClickMenu}
      />
    </header>
  );
};

export default Header;
