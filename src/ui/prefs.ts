import { Modes } from "../game/mode";
import { LingleStore } from "../store";
import { allThemes, defaultTheme, Theme } from "../theme";

export class PrefsModal {
  elem: HTMLElement;

  private readonly title: string = "Ajustes";

  private pref_mode: Modes = "lingle";

  constructor(store: LingleStore) {
    this.elem = document.createElement("aside");
    this.elem.classList.add("modal-wrapper");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    this.elem.appendChild(overlay);

    const modal = document.createElement("div");
    modal.id = "stats";
    modal.classList.add("modal", "prefs");
    this.elem.appendChild(modal);

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    modal.prepend(title);

    const theme_selector = new ThemeSelector(store);

    modal.appendChild(theme_selector.elem);

    // TODO
    // store.onInvalidate((store) => {});
    // store.onSave((store) => {});

    modal.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
    });
    this.elem.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      this.show(false);
    });
    document.addEventListener("openhtp", (_) => {
      this.show(false);
    });
    document.addEventListener("openstats", (_) => {
      this.show(false);
    });
  }

  show = (option: boolean | "toggle") => {
    if (option === "toggle") {
      this.elem.classList.toggle("visible");
      return;
    }

    option === true
      ? this.elem.classList.add("visible")
      : this.elem.classList.remove("visible");
  };
}

class ThemeSelector {
  elem: HTMLElement;

  private themes_elem: HTMLElement;
  private themes: Map<Theme, HTMLElement> = new Map();
  private _theme: Theme = defaultTheme();

  constructor(store: LingleStore) {
    this.elem = document.createElement("div");
    this.elem.classList.add("theme-selector");

    const label = document.createElement("span");
    label.classList.add("label");
    label.innerText = "Tema";

    this.elem.appendChild(label);

    this.themes_elem = document.createElement("div");
    this.themes_elem.classList.add("themes");

    this.themes_elem.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      const target = ev.target as HTMLElement | null;
      if (target && target.dataset["theme"]) {
        const theme = target.dataset["theme"] as Theme;

        store.prefs.theme = theme;
        store.savePrefs();
        this.theme = theme;
      }
    });

    this.elem.appendChild(this.themes_elem);
    this.updateThemes(store.prefs.theme);
  }

  set theme(theme: Theme) {
    this._theme = theme;
    for (const [theme, elem] of this.themes) {
      if (this._theme === theme) {
        elem.classList.add("active");
      } else {
        elem.classList.remove("active");
      }
    }
  }

  updateThemes = (theme: Theme) => {
    for (const elem of this.themes.values()) {
      elem.remove();
    }

    this._theme = theme;
    for (const theme of allThemes) {
      const theme_elem = document.createElement("div");
      theme_elem.classList.add("theme");
      theme_elem.dataset["theme"] = theme;
      if (this._theme === theme) {
        theme_elem.classList.add("active");
      }
      theme_elem.innerText = theme;

      this.themes.set(theme, theme_elem);
      this.themes_elem.appendChild(theme_elem);
    }
  };
}
