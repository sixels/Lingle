export interface IGameStats {
  winStreak: number;
  bestStreak: number;
  history: { attempt: number | string; count: number }[];
}

export function getGamesPlayed(stats: IGameStats): number {
  return stats.history.reduce(
    (accumulator, entry) => accumulator + entry.count,
    0
  );
}

export function getWinRate(stats: IGameStats): number {
  const total = getGamesPlayed(stats),
    losses = stats.history.at(-1)?.count || 0;

  return total !== 0 ? (total - losses) / total : 0;
}
