export type Player = "cat" | "pigeon";
export type CellValue = Player | null;
export type BoardState = CellValue[];

export const WINNING_LINES: readonly [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export interface GameEvaluation {
  status: "playing" | "win" | "draw";
  winner: Player | null;
  winningLine: [number, number, number] | null;
}

export function createInitialBoard(): BoardState {
  return Array<CellValue>(9).fill(null);
}

export function evaluateBoard(board: BoardState): GameEvaluation {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const first = board[a];
    if (first && first === board[b] && first === board[c]) {
      return {
        status: "win",
        winner: first,
        winningLine: line,
      };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return {
      status: "draw",
      winner: null,
      winningLine: null,
    };
  }

  return {
    status: "playing",
    winner: null,
    winningLine: null,
  };
}
