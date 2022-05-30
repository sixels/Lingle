import { Component, createEffect, createSignal, Index, on } from "solid-js";

import { GameState, GameStoreMethods } from "@/store/game";
import GameBoard from "./GameBoards";
import { Mode } from "@/game/mode";

import "@/../styles/board.scss";
import { KeyboardState } from "@/keyboardProvider";

type Props = {
  gameState: GameState;
  keyboard: KeyboardState;
  setRow: GameStoreMethods["setRow"];
  createAttempt: GameStoreMethods["createAttempt"];
};

const Board: Component<Props> = ({
  gameState,
  keyboard,
  setRow,
  createAttempt,
}) => {
  const [active_row, setActiveRow] = createSignal(gameState.state.row);
  const [position, setPosition] = createSignal<[number, number]>([
    active_row(),
    0,
  ]);

  // update row when state changes
  createEffect(
    on(
      () => gameState.state.row,
      () => {
        setActiveRow(gameState.state.row);
      }
    )
  );
  // update position when row changes
  createEffect(
    on(active_row, () => {
      setPosition([active_row(), 0]);
    })
  );

  // update row when position changes
  createEffect(
    on(position, (pos) => {
      if (pos[0] > gameState.state.row) setRow(pos[1]);
    })
  );

  return (
    <div id="board-wrapper" class="board-wrapper">
      <Index each={gameState.state.boards}>
        {(_, i) => {
          return (
            <GameBoard
              gameState={gameState}
              boardNumber={i}
              mode={new Mode(gameState.mode)}
              position={[position, setPosition]}
            />
          );
        }}
      </Index>
    </div>
  );
};

export default Board;
