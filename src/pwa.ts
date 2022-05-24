import { registerSW } from "virtual:pwa-register";
import events from "./events";
import { MessageKind } from "./message";

const refresh = registerSW({
  onNeedRefresh: () => {
    events.dispatchSendMessageEvent({
      data: "Atualização disponível! Deseja atualizar agora?",
      kind: MessageKind.Info,
      timeout: 30_000,
      callback: undefined,
      options: {
        Sim: () => {
          console.log("Refreshing the page");
          if (refresh) refresh(true);
        },
        Não: () => {
          if (refresh) refresh(false);
        },
      },
    });
  },
});
