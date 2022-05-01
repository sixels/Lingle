const ONE_DAY_IN_MS = 864e5; // 1000 * 60 * 60 * 24

export default {
  normalizedWord: (word: string): string => {
    return word.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  },


  ONE_DAY_IN_MS,
  // Returns a date to tomorrow
  tomorrow: (): Date => {
    return new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY_IN_MS)
  }
};
