import { GameManager, GameStatus } from ".";
import { messages } from "../message";
import { BoardPosition, N_COLS } from "./board";
import { WordListNormalized } from "../wordlist";

import compareWords from "./compare";
import events from "../events";
import utils from "../utils";

const handle_enter = (game: GameManager) => {
  const boards = game.boards.filter(
    (board) => board.status == GameStatus.Playing
  );
  // all boards already completed
  if (boards.length === 0) {
    return;
  }

  const position = game.current_position;

  // check if the length is 5
  const word = boards[0].rowAtPosition(position).value;
  if (word.length !== N_COLS) {
    events.dispatchSendMessageEvent(messages.wrongSize(N_COLS));
    boards.forEach((board) => board.rowAtPosition(position).animateShake());
    return;
  }

  // check if the word exists
  const normalized_word = utils.normalizedWord(word);
  const wordlist_word = WordListNormalized.get(normalized_word);

  // check if the word does exists
  if (wordlist_word) {
    boards.forEach((board) => {
      events.dispatchWordAttemptEvent({
        ...compareWords(board.solution, wordlist_word),
        board: board.id,
      });
    });
  } else {
    events.dispatchSendMessageEvent(messages.invalidWord());
    boards.forEach((board) => board.rowAtPosition(position).animateShake());
  }
};
const handle_backspace = (game: GameManager) => {
  const boards = game.boards.filter(
    (board) => board.status == GameStatus.Playing
  );
  // all boards already completed
  if (boards.length === 0) {
    return;
  }

  let position = game.current_position;
  if (position.col === N_COLS) {
    // When we finish a word, the column goes to N_COLS (an invalid)
    // position. In this case, we first need to go back to the position
    // N_COLS-1, then we can get the actual column.
    position = position.step_backward();
    game.updatePositionAndState(position);
    // Enter edit mode so we don't update the position again.
    game.edit_mode = true;
  }

  boards.forEach((board) => {
    const letter = board.columnAtPosition(position);

    let deleted = letter.value !== "";
    if (deleted) {
      letter.value = "";
    }

    if (!game.edit_mode) {
      position = position.step_backward();
      game.updatePositionAndState(position);
      // We already deleted a letter, just go back a position.
      if (!deleted) {
        board.columnAtPosition(position).value = "";
      }
    }
  });
};
const handle_left = (game: GameManager) => {
  events.dispatchSetPositionEvent(game.current_position.step_backward());
};
const handle_right = (game: GameManager) => {
  events.dispatchSetPositionEvent(game.current_position.step_forward());
};
const handle_home = (game: GameManager) => {
  let row = game.current_position.row;
  game.updatePositionAndState(new BoardPosition([row, 0]));
};
const handle_end = (game: GameManager) => {
  let row = game.current_position.row;
  game.updatePositionAndState(new BoardPosition([row, N_COLS - 1]));
};

export default Object.freeze({
  handleEnter: handle_enter,
  handleBackspace: handle_backspace,
  handleLeft: handle_left,
  handleRight: handle_right,
  handleHome: handle_home,
  handleEnd: handle_end,
});
