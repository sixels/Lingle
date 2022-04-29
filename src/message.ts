export enum MessageKind {
  Error,
  Info,
}

export interface Message {
  kind: MessageKind;
  data: string;
}

export const messages = {
  wrongSize: (expected_size: number): Message => {
    return {
      kind: MessageKind.Error,
      data: `A palavra deve ter ${expected_size} letras.`,
    };
  },
  invalidWord: {
    kind: MessageKind.Error,
    data: "Palavra não reconhecida.",
  } as Message,
  gameWin: {
    kind: MessageKind.Info,
    data: "Parabens, você ganhou.",
  } as Message,
  gameLost: (right_word: string): Message => {
    return {
      kind: MessageKind.Info,
      data: `Você perdeu. A palavra certa era: ${right_word}.`,
    };
  },
};
