import {
  Accessor,
  Component,
  createSignal,
  on,
  onCleanup,
  onMount,
  ParentProps,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

export type ModalProps = {
  close: () => void;
  openModal: Accessor<string>;
};

export const Modal: Component<ParentProps & ModalProps & { name: string }> = ({
  name,
  openModal,
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
