import { LetterAttempt, WordAttempt } from ".";

enum LetterStyle {
  Wrong = "wrong",
  Right = "right",
  Occur = "occur",
}

const emoji_numbers: readonly string[] = Object.freeze([
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
]);

export const renderAsImage = (
  game_name: string,
  attempts: WordAttempt[][]
): HTMLCanvasElement | undefined => {
  const cell_width = 55;
  const cell_height = 56;
  const padding = 10;
  const margin = 40;
  const title_height = 40;
  const font_family = `${title_height}px Lilita One`;

  const colors = {
    right: getCSSBackground("letter-right"),
    occur: getCSSBackground("letter-occur"),
    wrong: getCSSBackground("letter-wrong"),
    background: getCSSBackground("default"),
    foreground: getCSSForeground("default"),
  };

  let canvas = document.createElement("canvas") as HTMLCanvasElement;

  const word_len = 5;
  const width =
      ((cell_width + padding) * word_len + margin + padding * (word_len - 1)) *
      attempts.length,
    height =
      (cell_height + padding) * (word_len + attempts.length) +
      (title_height + margin * 2);

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (context === null) {
    console.error("Could not get the canvas context to generate the image.");
    return undefined;
  }

  // render the background
  context.fillStyle = colors["background"];
  renderRoundedRect(context, 1, 1, width - 2, height - 2, 20);
  context.fill();

  // render the title
  context.textAlign = "center";
  context.textBaseline = "top";
  context.font = font_family;
  context.fillStyle = colors["foreground"];
  context.fillText(game_name.toUpperCase(), width / 2, margin, width);

  // render the attempts
  renderBoard(
    cell_width,
    cell_height,
    padding,
    margin,
    attempts,
    (ls, x, y) => {
      y += (3 * margin) / 2 + title_height;

      renderRoundedRect(context, x, y, cell_width, cell_height, 7);
      context.fillStyle = ls !== undefined ? colors[ls] || "blue" : "blue";
      context.fill();
    }
  );

  return canvas;
};

export const renderAsText = (
  game_name: string,
  attempts: WordAttempt[][]
): string => {
  const chars = {
    right: "🟩",
    occur: "🟨",
    wrong: "⬛",
  };
  const word_len = 5;
  const n_words = word_len + attempts.length;

  // get maximum attempt number
  let max_attempt = 0;
  attempts.forEach((attempt) => {
    max_attempt = Math.max(max_attempt, attempt.length);
  });

  // fill the empty rows with "wrong" letters
  const fill_attempts = () => {
    attempts.forEach((attempt, b) => {
      while (attempt.length < max_attempt) {
        const wrong: LetterAttempt[] = [];
        for (let i = 0; i < 5; i++) {
          wrong.push({
            index: i,
            letter: " ",
            normalized: " ",
          } as LetterAttempt);
        }

        attempt.push({
          wrong_letters: wrong,
          right_letters: [] as LetterAttempt[],
          occur_letters: [] as LetterAttempt[],
          board: b,
        } as WordAttempt);
      }
    });
  };

  const attempt_numbers = attempts.map((attempt) => {
    return attempt.length === n_words &&
      attempt[attempt.length - 1].right_letters.length < word_len
      ? "🟥"
      : `${emoji_numbers[attempt.length]}`;
  });

  fill_attempts();
  let board: string[][] = [...new Array(max_attempt)].map(() =>
    [...new Array(word_len * attempts.length + attempts.length - 1)].map(
      () => " "
    )
  );
  renderBoard(1, 1, 0, 0, attempts, (ls, x, y) => {
    const board_n = Math.floor(x / 5);
    x += board_n;
    board[y][x] = ls !== undefined ? chars[ls] || "x" : "x";
  });

  const attempts_string = attempt_numbers.join(" ");
  const board_string = board.join("\n").replaceAll(",", "").trimEnd();

  return `${game_name}

${attempts_string}

${board_string}

lingle.vercel.app`;
};

const renderBoard = (
  cell_width: number,
  cell_height: number,
  padding: number,
  margin: number,
  attempts: WordAttempt[][],
  render_function: (ls: LetterStyle | undefined, x: number, y: number) => void
) => {
  const width = (cell_width * 5 + margin + padding * 4) * attempts.length;
  attempts.forEach((attempt, i) => {
    attempt.forEach((letters, j) => {
      const sorted = [
        ...letters.wrong_letters,
        ...letters.right_letters,
        ...letters.occur_letters,
      ].sort((a, b) => a.index - b.index);

      sorted.forEach((letter, k) => {
        const x =
          i * (width / attempts.length - margin / (attempt.length * 10)) +
          k * (cell_width + padding) +
          margin / 2;
        const y = j * (cell_height + padding) + margin / 2;

        let letter_style: LetterStyle | undefined;
        if (letters.wrong_letters.indexOf(letter) >= 0) {
          letter_style = LetterStyle.Wrong;
        } else if (letters.right_letters.indexOf(letter) >= 0) {
          letter_style = LetterStyle.Right;
        } else if (letters.occur_letters.indexOf(letter) >= 0) {
          letter_style = LetterStyle.Occur;
        }
        render_function(letter_style, x, y);
      });
    });
  });
};

const renderRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) => {
  const left = x;
  const top = y;
  const right = x + w;
  const bottom = y + h;

  context.beginPath();
  context.moveTo(right, bottom);
  context.arcTo(left, bottom, left, top, radius);
  context.arcTo(left, top, right, top, radius);
  context.arcTo(right, top, right, bottom, radius);
  context.arcTo(right, bottom, left, bottom, radius);
  context.closePath();
};

const getCSSBackground = (name: string): string => {
  return getCSSVariable(`--${name}-color-bg`) || "red";
};

const getCSSForeground = (name: string): string => {
  return getCSSVariable(`--${name}-color-fg`) || "red";
};

const getCSSVariable = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};
