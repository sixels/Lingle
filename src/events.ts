import { WordAttempt } from "./game";
import { BoardPosition } from "./game/board";
import { Message } from "./message";

export default {
  dispatchSendKeyEvent: (key: string) => {
    let send_key = new CustomEvent("sendkey", {
      detail: {
        key,
      },
      bubbles: false,
      cancelable: false,
      composed: true,
    });

    document.dispatchEvent(send_key);
  },

  dispatchSetPositionEvent: (position: BoardPosition) => {
    let set_position = new CustomEvent("setposition", {
      detail: {
        position,
      },
      bubbles: false,
      cancelable: false,
      composed: false,
    });

    document.dispatchEvent(set_position);
  },

  dispatchWordAttemptEvent: (attempt_desc: WordAttempt) => {
    let word_attempt = new CustomEvent("wordattempt", {
      detail: {
        attempt_desc,
      },
      bubbles: true,
      cancelable: false,
      composed: false,
    });

    document.dispatchEvent(word_attempt);
  },

  dispatchSendMessageEvent: (message: Message) => {
    let send_message = new CustomEvent("sendmessage", {
      detail: {
        message,
      },
      bubbles: false,
      cancelable: false,
      composed: false,
    });

    document.dispatchEvent(send_message);
  },

  dispatchCopyResultEvent: () => {
    let copy_result = new Event("copyresult", {
      bubbles: false,
      cancelable: false,
      composed: false,
    });

    document.dispatchEvent(copy_result);
  },

  dispatchOpenStatsEvent: (option: boolean | "toggle") => {
    let open_stats = new CustomEvent("openstats", {
      detail: {
        option,
      },
      bubbles: false,
      cancelable: false,
      composed: false,
    });

    document.dispatchEvent(open_stats);
  },
  dispatchOpenHtpEvent: (option: boolean | "toggle") => {
    let open_htp = new CustomEvent("openhtp", {
      detail: {
        option,
      },
      bubbles: false,
      cancelable: false,
      composed: false,
    });
    document.dispatchEvent(open_htp);
  },
};
