import { browserTheme, Theme } from "@/theme";

export type PrefsStore = [PrefsState, PrefsStoreMethods];

export interface PrefsState {
  theme: Theme;
}

export interface PrefsStoreMethods {
  setTheme: (theme: Theme) => void;
}

export const defaultPrefsState = (): PrefsState => {
  return { theme: browserTheme("escuro") };
};
