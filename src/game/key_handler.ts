import { GameManager, GameStatus } from ".";
import { messages } from "../message";
import { BoardPosition, N_COLS } from "./board";
import { WordListNormalized } from "../wordlist";

import compareWords from "./compare";
import events from "../events";
import utils from "../utils";

const handleEnter = (game: GameManager) => {
  const boards = game.playingBoards();
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
    game.attemptAll(
      boards.map((board) => {
        return {
          ...compareWords(board.solution, wordlist_word),
          board: board.id,
        };
      })
    );
  } else {
    events.dispatchSendMessageEvent(messages.invalidWord());
    boards.forEach((board) => board.rowAtPosition(position).animateShake());
  }
};

const handleBackspace = (game: GameManager) => {
  const boards = game.playingBoards();

  // all boards already completed
  if (boards.length === 0) {
    return;
  }

  let position = game.current_position;
  let next_position = position.step_backward();
  if (position.col === N_COLS) {
    // When we finish a word, the column goes to N_COLS (an invalid)
    // position. In this case, we first need to go back to the position
    // N_COLS-1, then we can get the actual column.
    position = position.step_backward();
    game.updatePositionAndState(position);
    // Enter edit mode so we don't update the position again.
    game.edit_mode = true;
  }

  if (game.edit_mode) {
    // edit mode prevent position update
    next_position = position;
  }

  boards.forEach((board) => {
    const letter = board.columnAtPosition(position);

    let empty = letter.value === "";
    if (!empty) {
      letter.value = "";
    }

    if (empty && !game.edit_mode && position.col !== 0) {
      board.columnAtPosition(next_position).value = "";
    }
  });
  game.updatePositionAndState(next_position);
};

const handleLeft = (game: GameManager) => {
  events.dispatchSetPositionEvent(game.current_position.step_backward());
};
const handleRight = (game: GameManager) => {
  events.dispatchSetPositionEvent(game.current_position.step_forward());
};
const handleHome = (game: GameManager) => {
  let row = game.current_position.row;
  game.updatePositionAndState(new BoardPosition([row, 0]));
};
const handleEnd = (game: GameManager) => {
  let row = game.current_position.row;
  game.updatePositionAndState(new BoardPosition([row, N_COLS - 1]));
};

export default Object.freeze({
  handleEnter,
  handleBackspace,
  handleLeft,
  handleRight,
  handleHome,
  handleEnd,
});
