export default {
  normalizedWord: (word: string): string => {
    return word.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  },

};
