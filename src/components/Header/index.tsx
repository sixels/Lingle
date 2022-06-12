import {
  Component,
  createRenderEffect,
  on,
  onCleanup,
  onMount,
  Signal,
  createSignal,
} from "solid-js";
import { useRouteData } from "solid-app-router";

import ModeSelector from "./ModeSelector";
import Button from "./Button";

import "@styles/header.scss";

type Props = {
  openModalSignal: Signal<string>;
};

const Header: Component<Props> = ({
  openModalSignal: [openModal, setOpenModal],
}) => {
  const { mode } = useRouteData();

  let menuRef: HTMLElement | null = null,
    [menuOpen, setMenuOpen] = createSignal(false);

  const handleClickMenu = (event: Event) => {
    event.stopPropagation();
    setMenuOpen(menuOpen() !== true);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef && !menuRef.contains(event.target as Node)) {
      setMenuOpen(false);
    }
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
            setOpenModal(openModal() === "about" ? "none" : "about");
          }}
        />
        <span class="strong">{mode.mode}</span>
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
        classList={{ menu: true }}
        onClick={handleClickMenu}
      />
    </header>
  );
};

export default Header;
