import { Component, JSX } from "solid-js";

const Button: Component<{
  label?: string;
  icon: string;
  classList?: { [key: string]: boolean };
  onClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined;
}> = ({ label, icon, classList, onClick }) => {
  return (
    <div class="btn" classList={classList} onClick={onClick}>
      {label ? <span class="label">{label}</span> : ""}
      <i class={`icon ri-${icon}-fill`}></i>
    </div>
  );
};

export default Button;
