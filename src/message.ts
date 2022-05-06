export enum MessageKind {
  Error,
  Info,
}

export interface Message {
  kind: MessageKind;
  data: string;
  callback: (() => void) | undefined;
}

export const messages = {
  wrongSize: (expected_size: number, callback?: () => void): Message => {
    return {
      kind: MessageKind.Error,
      data: `A palavra deve ter ${expected_size} letras.`,
      callback,
    };
  },
  invalidWord: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Error,
      data: "Palavra não reconhecida.",
      callback,
    };
  },
  gameWin: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: "Parabéns, você ganhou!",
      callback,
    };
  },
  gameLost: (right_word: string, callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: `Você perdeu. A palavra certa era: ${right_word}.`,
      callback,
    };
  },
  resultCopied: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: "Resultado copiado para área de transferência. Use Ctrl+V para colar.",
      callback,
    };
  },
};
