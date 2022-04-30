export class Menu {
  btn_elem: HTMLElement;
  menu_elem: HTMLElement;
  _is_open: boolean;

  constructor() {
    const btn_elem = document.getElementById("menu-btn");
    const menu_elem = document.getElementById("menu");
    if (btn_elem === null || menu_elem === null) {
      throw new Error("Missing HTML elements");
    }

    this.btn_elem = btn_elem;
    this.menu_elem = menu_elem;
    this._is_open = false;

    this.btn_elem.addEventListener("click", this.handleClick);
    this.menu_elem.addEventListener("click", (event) =>
      event.stopPropagation()
    );
    document.addEventListener("click", (_) => (this.is_open = false));
  }

  set is_open(value: boolean) {
    value
      ? this.menu_elem.classList.add("visible")
      : this.menu_elem.classList.remove("visible");
    this._is_open = value;
  }

  private handleClick = (event: Event) => {
    event.stopPropagation();
    this.is_open = !this._is_open;
  };
}
