import { createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

import utils from "@/utils";
import { defaultGameStore, GameStore } from "./game";
import { defaultPrefsStore } from "./prefs";

const STORE_LINGLE_KEY: string = "lingle.v2" as const;
const STORE_DUOLINGLE_KEY: string = "duolingle.v2" as const;
const STORE_PREFS_KEY: string = "prefs.v2" as const;

function getOrInsertWith<T>(
  key: string,
  init_callback: () => T
): [T, SetStoreFunction<T>] {
  const stored = localStorage.getItem(key),
    store = createStore(stored ? (JSON.parse(stored) as T) : init_callback());
  return store;
}

function createAppState() {
  const lingle = getOrInsertWith(STORE_LINGLE_KEY, defaultGameStore);
  const duolingle = getOrInsertWith(STORE_DUOLINGLE_KEY, defaultGameStore);
  const prefs = getOrInsertWith(STORE_PREFS_KEY, defaultPrefsStore);

  createEffect(() => {
    localStorage.setItem(STORE_LINGLE_KEY, JSON.stringify(lingle[0]));
    localStorage.setItem(STORE_DUOLINGLE_KEY, JSON.stringify(duolingle[0]));
    localStorage.setItem(STORE_PREFS_KEY, JSON.stringify(prefs[0]));
  });

  return {
    lingle,
    duolingle,
    prefs,
  };
}

export {};
