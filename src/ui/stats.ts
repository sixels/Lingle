import events from "../events";
import { GameStatus } from "../game";
import { Mode, modeBoards, modeRows } from "../game/mode";
import { LingleStore } from "../store";
import utils from "../utils";

export class StatsModal {
  elem: HTMLElement;

  private readonly title: string = "Estatísticas Pessoais";
  private summary: Summary;
  private chart: Chart;
  private footer: Footer;

  private show_timeout?: number;

  constructor(store: LingleStore) {
    this.elem = document.createElement("div");
    this.elem.id = "stats";
    this.elem.classList.add("modal", "stats");

    this.chart = new Chart(store.mode);
    this.summary = new Summary();
    this.footer = new Footer();

    this.elem.appendChild(this.summary.elem);
    this.elem.appendChild(this.chart.elem);
    this.elem.appendChild(this.footer.elem);

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    this.elem.prepend(title);

    this.update(store);

    if (store.state.status.every((status) => status !== GameStatus.Playing)) {
      // wait a little before showing the stats
      this.show_timeout = setTimeout(() => this.show(true), 800);
    }

    store.onInvalidate((store) => {
      clearTimeout(this.show_timeout);
      this.show(false);
      this.show_timeout = undefined;
      this.update(store);
    });
    store.onSave((store) => {
      this.update(store);
      clearTimeout(this.show_timeout);
      this.show_timeout = undefined;
      if (store.state.status.every((status) => status !== GameStatus.Playing)) {
        // wait a little before showing the stats
        this.show_timeout = setTimeout(() => this.show(true), 2800);
      }
    });

    this.elem.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
    });
    document.addEventListener("click", (_) => {
      this.show(false);
    });
    document.addEventListener("openstats", (ev) => {
      let option = (ev as CustomEvent).detail["option"];
      this.show(option);
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

  private update(store: LingleStore) {
    const stats = store.stats;

    this.chart.destroyLines();
    this.chart.createLines(modeRows(store.mode), modeBoards(store.mode));

    const n_games = stats.history.reduce((total, value) => total + value, 0);
    const wins = stats.history.reduce((total, value, i) => {
      return i < 5 ? total + value : total;
    }, 0);

    this.summary.updateData(
      n_games,
      Math.round((wins * 100) / (n_games || 1)),
      stats.win_streak,
      stats.longest_streak
    );

    this.chart.max = 0;
    stats.history.forEach((n, i) => {
      this.chart.setValue(i - modeBoards(store.mode), n);
    });
    this.chart.updateWeights();
  }
}

class Summary {
  elem: HTMLElement;

  private _n_games: HTMLElement;
  private _win_rate: HTMLElement;
  private _win_streak: HTMLElement;
  private _longest_streak: HTMLElement;

  constructor() {
    this.elem = document.createElement("div");
    this.elem.classList.add("summary");

    const createStat = (stat: string): HTMLElement => {
      const elem = document.createElement("div");
      const value = document.createElement("span");
      const text = document.createElement("span");

      value.innerText = "0";
      text.innerText = stat;

      elem.appendChild(value);
      elem.appendChild(text);

      return elem;
    };

    this._n_games = createStat("jogos");
    this._win_rate = createStat("taxa de vitórias");
    this._win_streak = createStat("vitórias consecutivas");
    this._longest_streak = createStat("maior sequência");

    this.elem.appendChild(this._n_games);
    this.elem.appendChild(this._win_rate);
    this.elem.appendChild(this._win_streak);
    this.elem.appendChild(this._longest_streak);
  }

  set n_games(value: number) {
    (this._n_games.children[0] as HTMLElement).innerText = `${value}`;
  }
  set win_rate(value: number) {
    (this._win_rate.children[0] as HTMLElement).innerText = `${value}%`;
  }
  set win_streak(value: number) {
    (this._win_streak.children[0] as HTMLElement).innerText = `${value}`;
  }
  set longest_streak(value: number) {
    (this._longest_streak.children[0] as HTMLElement).innerText = `${value}`;
  }

  updateData = (
    n_games: number,
    win_rate: number,
    win_streak: number,
    longest_streak: number
  ) => {
    this.n_games = n_games;
    this.win_rate = win_rate;
    this.win_streak = win_streak;
    this.longest_streak = longest_streak;
  };
}

class Chart {
  elem: HTMLElement;
  max: number = 0;
  graph_elem: HTMLElement;

  private readonly title: string = "Histórico de Tentativas";
  private lines: HTMLElement[] = [];

  constructor(mode: Mode) {
    this.elem = document.createElement("div");
    this.elem.classList.add("chart");

    this.graph_elem = document.createElement("div");

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    this.elem.prepend(title);

    this.createLines(modeRows(mode), modeBoards(mode));
    this.elem.appendChild(this.graph_elem);
  }

  setValue = (key: number, value: number) => {
    if (key < 0) {
      return;
    }

    const line = this.lines.at(key);

    if (line !== undefined) {
      this.max = Math.max(value, this.max);

      if (value > 0) {
        line.classList.remove("empty");
      } else {
        line.classList.add("empty");
      }
      (this.lines[key].children[1] as HTMLElement).innerText = `${value}`;
    }
  };

  updateWeights = () => {
    for (const line of this.lines) {
      const txt = (line.children[1] as HTMLElement).textContent;
      if (txt) {
        const value = Number.parseInt(txt) || 0;
        line.style.width = `${Math.round((value * 100) / this.max)}%`;
      }
    }
  };

  destroyLines = () => {
    for (const line of this.lines) {
      line.remove();
    }
    this.lines = [];
  };

  createLines = (lines: number, start: number) => {
    for (let i = start; i < start + lines; i++) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("line-wrapper", "empty");

      const legend = document.createElement("span");
      legend.innerText = `${i + 1 < start + lines ? i : "X"}`;
      legend.classList.add("legend");

      const line = document.createElement("div");
      line.classList.add("line");

      wrapper.appendChild(legend);
      wrapper.appendChild(line);

      this.lines.push(wrapper);
      this.graph_elem.appendChild(wrapper);
    }
  };
}

class Footer {
  elem: HTMLElement;

  constructor() {
    this.elem = document.createElement("div");
    this.elem.classList.add("footer");

    const share_btn = document.createElement("button");
    share_btn.classList.add("btn", "copy-btn");
    share_btn.innerHTML = `<i class="ri-share-fill"></i> Compartilhar`;

    share_btn.addEventListener("click", () => {
      events.dispatchCopyResultEvent();
    });

    const next_word = document.createElement("div");
    next_word.classList.add("timer");
    const next_word_label = document.createElement("span");
    const next_word_timer = document.createElement("span");

    next_word_label.innerText = "Próxima palavra em";
    next_word_timer.innerText = "00:00:00";

    let tomorrow = utils.tomorrow().getTime();
    const updateTimer = () => {
      let now = new Date().getTime();
      let rem = tomorrow - now;

      if (rem < 0) {
        tomorrow = utils.tomorrow().getTime();
      }

      const hours = Math.floor(
        (rem % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((rem % (1000 * 60)) / 1000);
      next_word_timer.innerText = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTimeout(updateTimer, 1000);
    };
    setTimeout(updateTimer, 1000);

    next_word.appendChild(next_word_label);
    next_word.appendChild(next_word_timer);

    this.elem.appendChild(share_btn);
    this.elem.appendChild(next_word);
  }
}
