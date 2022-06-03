import { isKeySpecial, SpecialKey } from "@/keyboardProvider";
import { Component } from "solid-js";

interface KeyInterface<T> {
  key: T;
}
export type SpecialKeyWrapper = KeyInterface<SpecialKey> & { icon?: string };
export type LetterKeyWrapper = KeyInterface<string>;
export type KeyboardKey = LetterKeyWrapper | SpecialKeyWrapper;

type KeyProps = {
  key: KeyboardKey;
  onClick?: (event: MouseEvent, key: KeyboardKey) => void;
};

export const Key: Component<KeyProps> = ({ key, onClick }) => {
  const isSpecial = (key: KeyboardKey): key is SpecialKeyWrapper => {
    return isKeySpecial(key.key);
  };

  const is_special = isSpecial(key);
  const key_name = key.key;

  return (
    <div
      class="key"
      classList={{
        special: is_special,
        [key_name.toLowerCase()]: is_special,
      }}
      onClick={(event) => {
        onClick && onClick(event, key);
      }}
      data-key={key.key}
    >
      {is_special && key.icon ? (
        <i class={`ri-${key.icon}-fill`}></i>
      ) : (
        key_name
      )}
    </div>
  );
};
