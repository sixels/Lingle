import { WordAttempt } from ".";

// TODO: Adjust these values manually
const CELL_WIDTH = 55;
const CELL_HEIGHT = 56;
const PADDING = 10;
const MARGIN = 40;
const TITLE_HEIGHT = 40;
const FONT_FAMILY = `${TITLE_HEIGHT}px Lilita One`;

export const shareResult = (
  game_name: string,
  attempts: WordAttempt[][]
): HTMLCanvasElement | undefined => {
  const colors = {
    right: getCSSBackground("letter-right"),
    occur: getCSSBackground("letter-occur"),
    wrong: getCSSBackground("letter-wrong"),
    background: getCSSBackground("default"),
    foreground: getCSSForeground("default"),
  };

  let canvas = document.createElement("canvas") as HTMLCanvasElement;

  const width = (CELL_WIDTH * 5 + MARGIN + PADDING * 4) * attempts.length,
    height =
      (CELL_HEIGHT + PADDING) * (5 + attempts.length) +
      (TITLE_HEIGHT + MARGIN * 2);

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
  context.font = FONT_FAMILY;
  context.fillStyle = colors["foreground"];
  context.fillText(game_name.toUpperCase(), width / 2, MARGIN, width);

  // render the attempts
  attempts.forEach((attempt, i) => {
    attempt.forEach((letters, j) => {
      const sorted = [
        ...letters.wrong_letters,
        ...letters.right_letters,
        ...letters.occur_letters,
      ].sort((a, b) => a.index - b.index);

      sorted.forEach((letter, k) => {
        let color: string | undefined;

        if (letters.wrong_letters.indexOf(letter) >= 0) {
          color = colors["wrong"];
        } else if (letters.right_letters.indexOf(letter) >= 0) {
          color = colors["right"];
        } else if (letters.occur_letters.indexOf(letter) >= 0) {
          color = colors["occur"];
        }

        const x =
          i * (width / attempts.length - MARGIN / (attempt.length * 10)) +
          k * (CELL_WIDTH + PADDING) +
          MARGIN / 2;
        const y =
          (3 * MARGIN) / 2 +
          TITLE_HEIGHT +
          j * (CELL_HEIGHT + PADDING) +
          MARGIN / 2;

        renderRoundedRect(context, x, y, CELL_WIDTH, CELL_HEIGHT, 7);

        context.fillStyle = color || "blue";
        context.fill();
      });
    });
  });

  return canvas;
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
