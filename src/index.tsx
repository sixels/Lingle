import { MountableElement, render } from "solid-js/web";
import { Router } from "solid-app-router";

import { Ticker } from "./providers/ticker";
import App from "./components/App";

import "normalize.css/normalize.css";
import "remixicon/fonts/remixicon.css";

import "@styles/options.scss";
import "@styles/keyframes.scss";
import "@styles/fonts.scss";
import "@styles/media.scss";
import "@styles/style.scss";

if (typeof window !== "undefined") {
  import("./pwa");
}

render(
  () => (
    <>
      <Router>
        <Ticker date={new Date()}>
          <App />
        </Ticker>
      </Router>
    </>
  ),
  document.getElementById("root") as MountableElement
);
