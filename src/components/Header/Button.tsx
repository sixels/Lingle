import { Component, JSX } from "solid-js";

const Button: Component<{
  label?: string;
  icon: string;
  classList?: { [key: string]: boolean };
  refFn?: (e: HTMLDivElement) => void;
  onClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined;
}> = ({ label, icon, classList, onClick, refFn: ref }) => {
  return (
    <div class="btn" ref={ref} classList={classList} onClick={onClick}>
      {label ? <span class="label">{label}</span> : ""}
      <i class={`icon ri-${icon}-fill`}></i>
    </div>
  );
};

export default Button;
