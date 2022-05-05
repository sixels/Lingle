import { GameStatus } from "../game";

export class Stats {
  win_streak: number = 0;
  longest_streak: number = 0;
  played_games: number = 0;

  constructor() {}

  static fromJSON(this: typeof Stats, data: any): Stats {
    let stats = new this();

    stats.win_streak = data.win_streak;
    stats.longest_streak = data.longest_streak;

    return stats;
  }
  asJSON = (): object => {
    return {
      win_streak: this.win_streak,
      longest_streak: this.longest_streak,
    };
  };

  updateStats = (game_status: GameStatus) => {
    if (game_status === GameStatus.Playing) {
      return;
    }

    if (game_status === GameStatus.Won) {
      this.win_streak += 1;
      this.longest_streak = Math.max(this.win_streak, this.longest_streak);
    } else if (game_status === GameStatus.Lost) {
      this.win_streak = 0;
    }

    this.played_games += 1;
  };
}
