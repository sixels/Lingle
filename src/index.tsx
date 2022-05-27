import { render } from "solid-js/web";

import App from "./components/App";

import "../styles/options.scss";
import "../styles/keyframes.scss";
import "../styles/fonts.scss";
import "../styles/media.scss";
import "../styles/style.scss";
import "remixicon/fonts/remixicon.css";

render(() => <App />, document.getElementById("app") as HTMLElement);
