import { MountableElement, render } from "solid-js/web";

import App from "./components/App";

import "normalize.css/normalize.css";
import "remixicon/fonts/remixicon.css";

import "@styles/options.scss";
import "@styles/keyframes.scss";
import "@styles/fonts.scss";
import "@styles/media.scss";
import "@styles/style.scss";

render(() => <App />, document.getElementById("root") as MountableElement);
