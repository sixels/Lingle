const { ClipboardItem } = window;

const ONE_DAY_IN_MS = 864e5; // 1000 * 60 * 60 * 24

export default {
  normalizedWord: (word: string): string => {
    return word.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  },

  copyCanvas: (canvas: HTMLCanvasElement | undefined): Promise<void> => {
    if (canvas === undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      canvas.toBlob(function (blob) {
        if (blob === null) {
          resolve();
          return;
        }
        resolve(
          navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        );
      });
    });
  },

  ONE_DAY_IN_MS,
  // Returns a date to tomorrow
  tomorrow: (): Date => {
    return new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY_IN_MS);
  },
};
