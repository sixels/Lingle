import { GameStatus } from "../game";
import { Mode } from "../game/mode";

export class Stats {
  win_streak: number = 0;
  longest_streak: number = 0;
  played_games: number = 0;
  history: number[] = [];

  constructor(mode: Mode) {
    for (let i = 0; i <= mode.rows; i++) {
      this.history.push(0);
    }
  }

  static fromJSON(this: typeof Stats, mode: Mode, data: any): Stats {
    let stats = new this(mode);

    stats.win_streak = data.win_streak;
    stats.longest_streak = data.longest_streak;
    stats.history = data.history;
    stats.played_games = data.played_games;

    return stats;
  }
  asJSON = (): object => {
    return {
      win_streak: this.win_streak,
      longest_streak: this.longest_streak,
      history: this.history,
      played_games: this.played_games,
    };
  };

  update = (game_status: GameStatus, attempt: number) => {
    if (game_status === GameStatus.Playing) {
      return;
    }

    if (game_status === GameStatus.Won) {
      this.win_streak += 1;
      this.longest_streak = Math.max(this.win_streak, this.longest_streak);
      this.history[attempt] += 1;
    } else if (game_status === GameStatus.Lost) {
      this.win_streak = 0;
      this.history[attempt + 1] += 1;
    }

    this.played_games += 1;
  };
}
