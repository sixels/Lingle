export enum MessageKind {
  Error,
  Info,
}

export interface Message {
  kind: MessageKind;
  data: string;
  callback: (() => void) | undefined;
  timeout: number | undefined;
}

export const messages = {
  wrongSize: (expected_size: number, callback?: () => void): Message => {
    return {
      kind: MessageKind.Error,
      data: `A palavra deve ter ${expected_size} letras.`,
      callback,
      timeout: undefined,
    };
  },
  invalidWord: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Error,
      data: "Palavra não reconhecida.",
      callback,
      timeout: undefined,
    };
  },
  gameWin: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: "Parabéns, você acertou!",
      callback,
      timeout: undefined,
    };
  },
  gameLost: (solutions: string[], callback?: () => void): Message => {
    const message =
      solutions.length > 1
        ? "As palavras de hoje eram"
        : "A palavra de hoje era";
    return {
      kind: MessageKind.Info,
      data: `Você perdeu. ${message}: ${solutions.join(", ")}.`,
      callback,
      timeout: undefined,
    };
  },
  resultCopied: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: "Resultado copiado para área de transferência. Use Ctrl+V para colar.",
      callback,
      timeout: undefined,
    };
  },
};
