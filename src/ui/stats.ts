import { GameStatus } from "../game";
import { LingleStore } from "../store";
import { Stats } from "../store/stats";

export class StatsModal {
  elem: HTMLElement;

  private readonly title: string = "Estatísticas";
  private summary: Summary;
  private chart: Chart;

  private show_timeout?: number;

  constructor(store: LingleStore) {
    this.elem = document.createElement("div");
    this.elem.id = "stats";
    this.elem.classList.add("modal", "statistics");

    this.chart = new Chart();
    this.summary = new Summary();

    this.elem.appendChild(this.summary.elem);
    this.elem.appendChild(this.chart.elem);

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    this.elem.prepend(title);

    this.update(store.stats);

    if (store.state.status !== GameStatus.Playing) {
      // wait a little before showing the stats
      this.show_timeout = setTimeout(() => this.show(true), 800);
    }

    store.onInvalidate((store) => {
      clearTimeout(this.show_timeout);
      this.show_timeout = undefined;
      this.update(store.stats);
    });
    store.onSave((store) => {
      this.update(store.stats);
      clearTimeout(this.show_timeout);
      this.show_timeout = undefined;
      if (store.state.status !== GameStatus.Playing) {
        // wait a little before showing the stats
        this.show_timeout = setTimeout(() => this.show(true), 2800);
      }
    });

    this.elem.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    });
    document.addEventListener("click", (_) => {
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

  private update(stats: Stats) {
    console.log("------------");
    console.log(stats.history);

    const n_games = stats.history.reduce((total, value) => total + value, 0);
    const wins = stats.history.reduce((total, value, i) => {
      return i < 5 ? total + value : total;
    }, 0);

    this.summary.updateData(
      n_games,
      Math.round((wins * 100) / n_games),
      stats.win_streak,
      stats.longest_streak
    );

    this.chart.max = 0;
    stats.history.forEach((n, i) => {
      this.chart.setValue(i, n);
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

  private readonly title: string = "Histórico";
  private lines: HTMLElement[] = [];

  constructor() {
    this.elem = document.createElement("div");
    this.elem.classList.add("chart");

    const title = document.createElement("span");
    title.innerText = this.title;
    title.classList.add("title");
    this.elem.prepend(title);

    for (let i = 0; i < 7; i++) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("line-wrapper");

      const legend = document.createElement("span");
      legend.innerText = `${i < 6 ? i + 1 : "X"}`;
      legend.classList.add("legend");

      const line = document.createElement("div");
      line.classList.add("line", "empty");

      wrapper.appendChild(legend);
      wrapper.appendChild(line);

      this.lines.push(wrapper);
      this.elem.appendChild(wrapper);
    }
  }

  setValue = (key: number, value: number) => {
    this.max = Math.max(value, this.max);
    const line = this.lines[key];
    if (value > 0) {
      line.classList.remove("empty");
    } else {
      line.classList.add("empty");
    }
    (this.lines[key].children[1] as HTMLElement).innerText = `${value}`;
  };

  updateWeights = () => {
    for (const line of this.lines) {
      const txt = (line.children[1] as HTMLElement).textContent;
      if (txt) {
        const value = Number.parseInt(txt);
        line.style.width = `${Math.round((value * 100) / this.max)}%`;
      }
    }
  };
}
