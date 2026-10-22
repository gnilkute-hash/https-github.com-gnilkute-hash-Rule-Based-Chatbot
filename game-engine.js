(function () {
  class GameEngine {
    static WIN_LINES = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    static emptyBoard() {
      return Array(9).fill(null);
    }

    static availableMoves(board) {
      return board.reduce((moves, value, index) => {
        if (value === null) moves.push(index);
        return moves;
      }, []);
    }

    static isValidMove(board, index) {
      return Number.isInteger(index) && index >= 0 && index < 9 && board[index] === null;
    }

    static applyMove(board, index, player) {
      if (!GameEngine.isValidMove(board, index)) {
        throw new Error(`Invalid move at index ${index}`);
      }

      const next = board.slice();
      next[index] = player;
      return next;
    }

    static checkWinner(board) {
      for (const line of GameEngine.WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
          return { winner: board[a], line };
        }
      }

      return { winner: null, line: [] };
    }

    static isDraw(board) {
      return GameEngine.availableMoves(board).length === 0 && !GameEngine.checkWinner(board).winner;
    }

    static isTerminal(board) {
      return Boolean(GameEngine.checkWinner(board).winner) || GameEngine.isDraw(board);
    }
  }

  window.GameEngine = GameEngine;
})();
