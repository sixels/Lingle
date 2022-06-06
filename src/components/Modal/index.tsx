import { Component, createEffect, ParentProps, Signal } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { PrefsStore } from "@/store/prefs";

import AboutModal from "./About";
import StatsModal from "./Stats";
import PreferencesModal from "./Preferences";

import "@styles/modal.scss";

const MODALS = {
  about: AboutModal,
  stats: StatsModal,
  prefs: PreferencesModal,
  none: undefined,
};
export type Modals = typeof MODALS;

export type ModalProps = {
  close: () => void;
};
export const Modal: Component<ParentProps & ModalProps & { name: string }> = ({
  name,
  close,
  children,
}) => {
  return (
    <aside class="modal-wrapper">
      <div class="overlay" onClick={close} />
      <div class={`modal ${name}`}>{children}</div>
    </aside>
  );
};

type DynamicModalProps = {
  prefsStore: PrefsStore;
  openModalSignal: Signal<keyof Modals>;
};
export const DynamicModal: Component<DynamicModalProps> = ({
  prefsStore,
  openModalSignal: [openModal, setOpenModal],
}) => {
  return (
    <Transition
      onBeforeEnter={(el) => el.setAttribute("style", "opacity:0")}
      onAfterEnter={(el) => el.setAttribute("style", "opacity:1")}
      onEnter={(el, done) => {
        const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 120,
          easing: "ease-in-out",
          fill: "forwards",
        });
        anim.finished.then(done);
      }}
      onExit={(el, done) => {
        const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 120,
          easing: "ease-in-out",
          fill: "forwards",
        });
        anim.finished.then(done);
      }}
    >
      <Dynamic
        component={MODALS[openModal()]}
        close={() => {
          setOpenModal("none");
        }}
        prefsStore={prefsStore}
      />
    </Transition>
  );
};
