export type PrefsStore = [PrefsState, PrefsStoreMethods];

export interface PrefsState {
  theme: Theme;
}

export const THEMES = ["claro", "escuro", "alternativo"] as const;
export type Theme = typeof THEMES[number];

export interface PrefsStoreMethods {
  setTheme: (theme: Theme) => void;
}

export const defaultPrefsState = (): PrefsState => {
  return { theme: browserTheme() };
};

const browserTheme = (): Theme => {
  if (
    "matchMedia" in window &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "claro";
  }

  return "escuro";
};
