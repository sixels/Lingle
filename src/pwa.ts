import { registerSW } from "virtual:pwa-register";
import events from "./events";
import { MessageKind } from "./message";

const refresh = registerSW({
  onNeedRefresh: () => {
    events.dispatchSendMessageEvent({
      data: "Atualização disponível! Clique aqui para atualizar.",
      kind: MessageKind.Info,
      timeout: 20_000,
      callback: undefined,
      on_click: () => {
        console.log("Refreshing the page");
        if (refresh) refresh(true);
      },
    });
  },
});
