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

  const keyName = key.key;

  return (
    <div
      class="key"
      classList={{
        special: isSpecial(key),
        [keyName.toLowerCase()]: isSpecial(key),
      }}
      onClick={(event) => {
        onClick && onClick(event, key);
      }}
      data-key={key.key}
    >
      {isSpecial(key) && key.icon ? (
        <i class={`ri-${key.icon}-fill`}></i>
      ) : (
        keyName
      )}
    </div>
  );
};
