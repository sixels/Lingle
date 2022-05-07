export class Menu {
  btn_elem: HTMLElement;
  menu_elem: HTMLElement;

  constructor() {
    const btn_elem = document.getElementById("menu-btn");
    const menu_elem = document.getElementById("menu");
    if (btn_elem === null || menu_elem === null) {
      throw new Error("Missing HTML elements");
    }

    this.btn_elem = btn_elem;
    this.menu_elem = menu_elem;

    this.btn_elem.addEventListener("click", this.handleClick);
    this.menu_elem.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    document.addEventListener("click", (_) => {
      this.show(false);
    });
  }

  show = (option: boolean | "toggle") => {
    if (option === "toggle") {
      this.menu_elem.classList.toggle("visible");
      return;
    }

    option
      ? this.menu_elem.classList.add("visible")
      : this.menu_elem.classList.remove("visible");
  };

  private handleClick = (event: Event) => {
    event.stopPropagation();
    this.menu_elem.classList.toggle("visible");
  };
}
