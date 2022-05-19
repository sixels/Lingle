export const allThemes = ["claro", "escuro", "alternativo"] as const;
export type Theme = typeof allThemes[number];

export const defaultTheme = (): Theme => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "claro";
  }

  return "escuro";
};
