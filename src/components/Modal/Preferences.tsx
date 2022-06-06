import { PrefsStore } from "@/store/prefs";
import { THEMES } from "@/theme";
import { Component, createSelector, For } from "solid-js";
import { Modal, ModalProps } from ".";

type PreferencesProps = {
  prefsStore: PrefsStore;
};

const PreferencesModal: Component<ModalProps & PreferencesProps> = ({
  close,
  prefsStore: [state, { setTheme }],
}) => {
  const isThemeSelected = createSelector(() => state.theme);

  return (
    <Modal name="prefs" close={close}>
      <section class="preferences">
        <h1 class="title">Ajustes</h1>
        <section class="theme-selector">
          <h2 class="subtitle">Tema</h2>
          <div class="content">
            <div class="themes">
              <For each={THEMES}>
                {(theme) => {
                  return (
                    <span
                      class="theme"
                      classList={{ active: isThemeSelected(theme) }}
                      onClick={() => {
                        setTheme(theme);
                      }}
                    >
                      {theme}
                    </span>
                  );
                }}
              </For>
            </div>
          </div>
        </section>
      </section>
    </Modal>
  );
};

export default PreferencesModal;
