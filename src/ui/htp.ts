import { LingleStore } from "../store";

export class HTPModal {
  elem: HTMLElement;

  private readonly title: string = "Como jogar";

  private show_timeout?: number;

  constructor(store: LingleStore) {
    this.elem = document.createElement("div");
    this.elem.id = "stats";
    this.elem.classList.add("modal", "htp");

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    this.elem.prepend(title);

    if (store.stats.played_games === 0 && store.state.attempts.length === 0) {
      // wait a little before showing how to play
      this.show_timeout = setTimeout(() => this.show(true), 800);
    }

    this.elem.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    });
    document.addEventListener("click", (_) => {
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
