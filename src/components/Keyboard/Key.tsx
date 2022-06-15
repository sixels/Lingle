import { isKeySpecial, SpecialKey } from "@/providers/keyboard";
import { Component, Ref } from "solid-js";

interface KeyInterface<T> {
  key: T;
}
export type SpecialKeyWrapper = KeyInterface<SpecialKey> & { icon?: string };
export type LetterKeyWrapper = KeyInterface<string>;
export type KeyboardKey = LetterKeyWrapper | SpecialKeyWrapper;

type KeyProps = {
  key: KeyboardKey;
  onClick?: (key: KeyboardKey) => void;
};

export const Key: Component<{ ref: Ref<HTMLDivElement> } & KeyProps> = ({
  ref,
  key,
  onClick,
}) => {
  const isSpecial = (key: KeyboardKey): key is SpecialKeyWrapper => {
    return isKeySpecial(key.key);
  };

  const keyName = key.key;

  return (
    <div
      ref={ref}
      class="key"
      classList={{
        special: isSpecial(key),
        [keyName.toLowerCase()]: isSpecial(key),
      }}
      onClick={onClick && [onClick, key]}
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
