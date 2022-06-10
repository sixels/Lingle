import { Component, onMount, lazy } from "solid-js";

import { Mode, Modes } from "@/game/mode";
import { initWordlists } from "@/wordlist";

import { RouteDefinition, useRoutes } from "solid-app-router";
import { createPrefsStore } from "@/store";

const routeModes: { path: string; mode: Modes }[] = [
  { path: "/", mode: "lingle" },
  { path: "/duo", mode: "duolingle" },
];

const App: Component = () => {
  const prefsStore = createPrefsStore(),
    [prefs] = prefsStore;

  const routes: RouteDefinition[] = routeModes.map((route) => {
      return {
        path: route.path,
        data: () => ({ mode: new Mode(route.mode), prefsStore }),
        component: lazy(() => import("./Game")),
      };
    }),
    Routes = useRoutes(routes);

  onMount(() => {
    initWordlists();
  });

  return (
    <>
      <div id="app" data-theme={prefs.theme}>
        <Routes />
      </div>
    </>
  );
};

export default App;
