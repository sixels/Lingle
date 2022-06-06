import { Component, ParentProps } from "solid-js";

import "@styles/modal.scss";

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
