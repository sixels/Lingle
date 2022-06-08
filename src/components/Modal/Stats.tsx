import { getGamesPlayed, getWinRate } from "@/store/game/stats";
import { Component, For, Show } from "solid-js";
import { Modal, StatefulModalProps } from ".";

const StatsModal: Component<StatefulModalProps> = ({
  store: {
    game: [{ stats, state }],
  },
  close,
}) => {
  return (
    <Modal name="stats" close={close}>
      <section class="summary">
        <h1 class="title"> Estatísticas Pessoais </h1>
        <div class="content">
          <div class="stat game-count">
            <span class="value">0</span>
            <span class="label">jogos</span>
          </div>
          <div class="stat win-rate">
            <span class="value">0%</span>
            <span class="label">taxa de vitórias</span>
          </div>
          <div class="stat current-sequency">
            <span class="value">0</span>
            <span class="label">sequência atual</span>
          </div>
          <div class="stat best-sequency">
            <span class="value">0</span>
            <span class="label">maior sequência</span>
          </div>
        </div>
      </section>

      <section class="solutions">
        <h1 class="title"> As palavras de hoje eram </h1>
        <div class="content">
          <span class="solution">surja, tedio</span>
        </div>
      </section>

      <section class="history">
        <h1 class="title">Histórico de Tentativas</h1>
        <div class="content">
          <div class="chart">
            <div class="line-wrapper">
              <span class="legend">1</span>
              <div class="line">0</div>
            </div>
          </div>
        </div>
      </section>

      <div class="footer">
        <button class="btn copy-btn">
          <i class="ri-share-fill"></i> Compartilhar
        </button>
        <div class="timer">
          <span class="label">Próxima palavra em</span>
          <span class="time">00:00:00</span>
        </div>
      </div>
    </Modal>
  );
};

export default StatsModal;
