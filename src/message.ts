export enum MessageKind {
  Error,
  Info,
}

export interface Message {
  kind: MessageKind;
  data: string;
  timeout: number | undefined;
  callback: (() => void) | undefined;
  on_click: (() => void) | undefined;
}

export const messages = {
  wrongSize: (expected_size: number, callback?: () => void): Message => {
    return {
      kind: MessageKind.Error,
      data: `A palavra deve ter ${expected_size} letras.`,
      callback,
    } as Message;
  },
  invalidWord: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Error,
      data: "Palavra não reconhecida.",
      callback,
    } as Message;
  },
  gameWin: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: "Parabéns, você acertou!",
      callback,
    } as Message;
  },
  gameLost: (solutions: string[], callback?: () => void): Message => {
    const message =
      solutions.length > 1
        ? "As palavras de hoje eram"
        : "A palavra de hoje erX";
    return {
      kind: MessageKind.Info,
      data: `Você perdeu. ${message}: ${solutions.join(", ")}.`,
      callback,
    } as Message;
  },
  resultCopied: (callback?: () => void): Message => {
    return {
      kind: MessageKind.Info,
      data: "Resultado copiado para área de transferência. Use Ctrl+V para colar.",
      callback,
    } as Message;
  },
};
