import { Component, createEffect, createSignal, For, on, Show } from "solid-js";
import { toast } from "solid-toast";

import { useTicker } from "@/providers/ticker";
import { getGamesPlayed, getWinRate } from "@/store/game/stats";
import { Modal, StatefulModalProps } from ".";
import { renderAsText } from "@/game/share";

import utils from "@/utils";
import { MyToast } from "../Toast";
import { Mode } from "@/game/mode";

const StatsModal: Component<StatefulModalProps> = ({
  store: {
    game: [{ stats, state, mode }],
  },
  close,
}) => {
  const { onEachSecond, tomorrow } = useTicker();

  const [countdown, setCountdown] = createSignal<[number, number, number]>([
      0, 0, 0,
    ]),
    countdownFormat = () => {
      const [hours, minutes, seconds] = countdown().map((value) =>
        value.toString().padStart(2, "0")
      );
      return `${hours}:${minutes}:${seconds}`;
    };
  let shareBtnRef: HTMLButtonElement | undefined = undefined;

  const isGameOver = () =>
    state.boards.every((board) => board.status != "playing");

  createEffect(
    on(isGameOver, (isOver) => {
      if (!shareBtnRef) return;

      shareBtnRef.disabled = !isOver;

      const styles = window.getComputedStyle(shareBtnRef, null);
      shareBtnRef.style.backgroundImage = styles.backgroundImage.replace(
        "[...]",
        styles.getPropertyValue("--self-color-bd")
      );
    })
  );

  onEachSecond((time) => {
    if (!time) return;

    const rem = tomorrow().getTime() - time;

    const hours = Math.floor((rem % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes = Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60)),
      seconds = Math.floor((rem % (1000 * 60)) / 1000);

    setCountdown([hours, minutes, seconds]);
  });

  const maxHistoryCount = stats.history.reduce(
    (cur, h) => Math.max(cur, h.count),
    0
  );

  return (
    <Modal name="stats" close={close}>
      <section class="summary">
        <h1 class="title"> Estatísticas Pessoais </h1>
        <div class="content">
          <div class="stat game-count">
            <span class="value">{getGamesPlayed(stats)}</span>
            <span class="label">jogos</span>
          </div>
          <div class="stat win-rate">
            <span class="value">
              {(getWinRate(stats) * 100).toFixed(2).replace(/\.00$/, "")}%
            </span>
            <span class="label">taxa de vitórias</span>
          </div>
          <div class="stat current-sequency">
            <span class="value">{stats.winStreak}</span>
            <span class="label">sequência atual</span>
          </div>
          <div class="stat best-sequency">
            <span class="value">{stats.bestStreak}</span>
            <span class="label">maior sequência</span>
          </div>
        </div>
      </section>

      <Show when={isGameOver()}>
        <section class="solutions">
          <h1 class="title"> As palavras de hoje eram </h1>
          <div class="content">
            <For each={state.boards}>
              {(board, i) => {
                return (
                  <span class="solution">
                    <a
                      href={`https://dicio.com.br/${board.solution}`}
                      target="_blank"
                    >
                      {board.solution}
                      {i() < state.boards.length - 1 ? "," : ""}
                    </a>
                  </span>
                );
              }}
            </For>
          </div>
        </section>
      </Show>

      <section class="history">
        <h1 class="title">Histórico de Tentativas</h1>
        <div class="content">
          <div class="chart">
            <For each={stats.history}>
              {({ attempt, count }) => {
                return (
                  <div class="line-wrapper" classList={{ empty: count === 0 }}>
                    <span class="legend">
                      {attempt - new Mode(mode).boards ==
                      stats.history.length - 1
                        ? "X"
                        : attempt}
                    </span>
                    <div
                      class="line"
                      style={{ width: `${(count / maxHistoryCount) * 100}%` }}
                    >
                      {count}
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </section>

      <div class="footer">
        <button
          class="btn copy-btn"
          onClick={() => {
            utils
              .copyText(
                renderAsText(
                  mode,
                  Object.freeze(state.boards.map((board) => board.attempts))
                )
              )
              .then((target) => {
                if (target == "clipboard") {
                  toast.custom((t) => (
                    <MyToast
                      toast={t}
                      message="Copiado para área de transferência"
                    />
                  ));
                }
              });
          }}
          id="copy-btn"
          ref={shareBtnRef}
        >
          <i class="ri-share-fill" /> Compartilhar
        </button>
        <div class="timer">
          <span class="label">Próxima palavra em</span>
          <span class="time">{countdownFormat()}</span>
        </div>
      </div>
    </Modal>
  );
};

export default StatsModal;
