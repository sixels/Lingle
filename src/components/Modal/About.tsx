import { Component } from "solid-js";
import { Modal, ModalProps } from ".";

const AboutModal: Component<ModalProps> = ({ close }) => {
  return (
    <Modal name="about" close={close}>
      <section class="about">
        <h1 class="title">Sobre</h1>
        <div class="content">
          <p>
            Lingle é um jogo de palavras inspirado em Wordle. Esse projeto é
            open source, o código está
            <a href="https://github.com/sixels/Lingle">hospedado no GitHub</a>
            com mais informações, caso queira dar uma olhada.
          </p>
        </div>
      </section>
      <section class="instructions">
        <h1 class="title">Como Jogar</h1>
        <div class="content">
          <p>
            Adivinhe a palavra do dia, mas se atente ao número de tentativas.
          </p>
          <p>
            Cada tentativa deve ser uma palavra válida de cinco letras. Após
            cada tentativa, as peças são reveladas, mostrando o quão próximo
            você está da palavra.
          </p>
          <p>
            Você pode usar tanto seu teclado físico, quanto o teclado do próprio
            jogo para inserir as palavras. Voce pode também se mover clicando em
            alguma coluna da tentativa atual, ou usando as setas do teclado,
            para ir para direita ou para esquerda. As teclas "Home" e "End"
            também podem ser usadas para ir para o começo ou final da palavra,
            respectivamente.
          </p>
          <p>
            Todo dia uma palavra é escolhida aleatoriamente. Não se esqueça de
            voltar amanhã para o próximo desafio.
          </p>
          <p>Ah, não se preocupe com acentuação, eu coloco pra você!</p>
          <p style="text-align: center">Boa sorte!</p>
        </div>
      </section>
      <section class="examples">
        <h1 class="title"> Exemplos </h1>
        <div class="content">
          <div class="example">
            <div class="letters">
              <div class="letter"> T </div>
              <div class="letter"> R </div>
              <div class="letter"> E </div>
              <div class="letter right"> N </div>
              <div class="letter"> S </div>
            </div>
            <div>
              <div class="letters">
                <div class="letter right"> N </div>
              </div>
              pertence à palavra, e sua posição está correta!
            </div>
          </div>
          <div class="example">
            <div class="letters">
              <div class="letter"> B </div>
              <div class="letter"> A </div>
              <div class="letter"> L </div>
              <div class="letter"> D </div>
              <div class="letter occur"> E </div>
            </div>
            <div>
              <div class="letters">
                <div class="letter occur"> E </div>
              </div>
              pertence à palavra, mas sua posição não está correta.
            </div>
          </div>
          <div class="example">
            <div class="letters">
              <div class="letter"> R </div>
              <div class="letter wrong"> A </div>
              <div class="letter"> D </div>
              <div class="letter"> I </div>
              <div class="letter"> O </div>
            </div>
            <div>
              <div class="letters">
                <div class="letter wrong"> A </div>
              </div>
              Não pertence à palavra.
            </div>
          </div>
        </div>
      </section>
    </Modal>
  );
};

export default AboutModal;
