import toast from "solid-toast";
import { registerSW } from "virtual:pwa-register";

import { MyToast } from "./components/Toast";

const refresh = registerSW({
  onNeedRefresh: () => {
    toast.custom(
      (t) =>
        MyToast({
          toast: t,
          message: "Atualização disponível! Deseja atualizar agora?",
          options: [
            {
              name: "Sim",
              callback: () => {
                console.log("Refreshing the page");
                refresh && refresh(true);
              },
            },
            {
              name: "Não",
              callback: () => {
                refresh && refresh(false);
              },
            },
          ],
        }),
      {
        duration: 30_000,
      }
    );
  },
});
