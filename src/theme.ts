export const THEMES = ["claro", "escuro", "alternativo"] as const;

export type Theme = typeof THEMES[number];

export const browserTheme = (fallback: Theme = "escuro"): Theme => {
  if ("matchMedia" in window) {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "claro";
    } else if (window.matchMedia("(prefers-color-scheme: dark)")) {
      return "escuro";
    }
  }

  return fallback;
};
