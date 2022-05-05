export class Stats {
  win_streak: number = 0;
  longest_streak: number = 0;
  played_games: number = 0;

  constructor() {}

  asJSON = (): object => {
    return {
      win_streak: this.win_streak,
      longest_streak: this.longest_streak,
    };
  };

  static fromJSON(this: typeof Stats, data: any): Stats {
    let stats = new this();

    stats.win_streak = data.win_streak;
    stats.longest_streak = data.longest_streak;

    return stats;
  }
}
