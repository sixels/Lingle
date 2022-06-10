import { Component, onMount, lazy } from "solid-js";

import { Mode, Modes } from "@/game/mode";
import { initWordlists } from "@/wordlist";

import { RouteDefinition, useRoutes } from "solid-app-router";

const routeModes: { path: string; mode: Modes }[] = [
  { path: "/", mode: "lingle" },
  { path: "/duo", mode: "duolingle" },
];

const routes: RouteDefinition[] = routeModes.map((route) => {
  return {
    path: route.path,
    data: () => ({ mode: new Mode(route.mode) }),
    component: lazy(() => import("./Game")),
  };
});

const App: Component = () => {
  const Routes = useRoutes(routes);

  onMount(() => {
    initWordlists();
  });

  return (
    <>
      <div id="app" data-theme={"claro"}>
        <Routes />
      </div>
    </>
  );
};

export default App;
