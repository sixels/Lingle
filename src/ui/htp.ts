import events from "../events";
import { LingleStore } from "../store";

export class HTPModal {
  elem: HTMLElement;

  private readonly title: string = "Sobre";

  constructor(store: LingleStore) {
    this.elem = document.createElement("aside");
    this.elem.classList.add("modal-wrapper");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    this.elem.appendChild(overlay);

    const modal = document.createElement("div");
    modal.id = "htp";
    modal.classList.add("modal", "htp");
    this.elem.appendChild(modal);

    const about = document.createElement("section");
    about.innerHTML = `
        <p> Lingle é um jogo de palavras inspirado em Wordle.
        Todo o código é aberto, e está
        <a href="https://github.com/sixels/Lingle">hospedado no GitHub</a> com mais informações.</p>
    `.trim();
    about.classList.add("about");

    const instructions = document.createElement("section");
    instructions.innerHTML = `
    <h2 class="title"> Como Jogar </h2>
    <p class="instructions">Adivinhe a palavra do dia em seis tentativas. </p>
    <p class="instructions"> Cada tentativa deve ser uma palavra válida de cinco letras. Após uma
    tentativa, as peças são reveladas, mostrando o quão próximo você está da palavra.</p>
    <p class="instructions">Não se preocupe com acentuação, eu coloco pra você!</p>`;
    instructions.classList.add("instruction");

    const examples = document.createElement("div");
    examples.innerHTML = `
    <h2 class="title"> Exemplos </h2>
    <div class="example">
        <div class="letters">
            <div class="letter"> T </div>
            <div class="letter"> R </div>
            <div class="letter"> E </div>
            <div class="letter right"> N </div>
            <div class="letter"> S </div>
        </div>
        <section>
            <div class="letters"><div class="letter right"> N </div></div> pertence à
            palavra, e sua posição está correta!
        </section>
    </div>
    <div class="example">
        <div class="letters">
            <div class="letter"> B </div>
            <div class="letter"> O </div>
            <div class="letter"> L </div>
            <div class="letter"> D </div>
            <div class="letter occur"> O </div>
        </div>
        <section>
            <div class="letters"><div class="letter occur"> O </div></div> pertence à
            palavra, mas sua posição não está correta.
        </section>
    </div>
    <div class="example">
        <div class="letters">
            <div class="letter"> R </div>
            <div class="letter wrong"> A </div>
            <div class="letter"> D </div>
            <div class="letter"> I </div>
            <div class="letter"> O </div>
        </div>
        <section>
            <div class="letters"><div class="letter wrong"> A </div></div> Não pertence à
            palavra.
        </section>
    </div>`.trim();
    examples.classList.add("examples");

    modal.appendChild(about);
    modal.appendChild(instructions);
    modal.appendChild(examples);

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    modal.prepend(title);

    if (store.stats.played_games === 0 && store.state.attempts.length === 0) {
      // wait a little before showing how to play
      setTimeout(() => this.show(true), 800);
    }

    modal.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
    });
    this.elem.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      this.show(false);
    });
    document.addEventListener("openstats", (_) => {
      this.show(false);
    });
    document.addEventListener("openhtp", (ev) => {
      let option = (ev as CustomEvent).detail["option"];
      this.show(option);
    });

    const is_board_empty = store.state.attempts.every((attempts) => {
      return attempts.length === 0;
    });
    if (is_board_empty && store.stats.played_games === 0) {
      setTimeout(() => {
        events.dispatchOpenStatsEvent(false);
        this.show(true);
      }, 500);
    }
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
