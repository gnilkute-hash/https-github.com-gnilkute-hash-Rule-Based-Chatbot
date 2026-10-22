(function () {
  class AIEngine {
    constructor(gameEngine) {
      this.game = gameEngine;
      this.reset();
    }

    reset() {
      this.nodesVisited = 0;
      this.nodesPruned = 0;
      this.maxDepthReached = 0;
    }

    chooseMove(board, player, difficulty = "unbeatable") {
      this.reset();

      const scoredMoves = this.game.availableMoves(board).map((index) => {
        const nextBoard = this.game.applyMove(board, index, player);
        return {
          index,
          score: this.minimax(nextBoard, 0, player === "O"),
        };
      });

      const bestFirst = player === "O"
        ? scoredMoves.sort((a, b) => a.score - b.score)
        : scoredMoves.sort((a, b) => b.score - a.score);

      const chosen = this.pickByDifficulty(bestFirst, board, player, difficulty);

      return {
        index: chosen.index,
        score: chosen.score,
        nodesVisited: this.nodesVisited,
        nodesPruned: this.nodesPruned,
        maxDepth: this.maxDepthReached,
      };
    }

    pickByDifficulty(scoredMoves, board, player, difficulty) {
      if (difficulty === "unbeatable" || scoredMoves.length === 1) {
        return scoredMoves[0];
      }

      if (difficulty === "medium") {
        return Math.random() < 0.7 ? scoredMoves[0] : scoredMoves[1] || scoredMoves[0];
      }

      const opponent = player === "X" ? "O" : "X";
      const safeMoves = scoredMoves.filter((move) => {
        const afterAiMove = this.game.applyMove(board, move.index, player);
        return !this.game.availableMoves(afterAiMove).some((reply) => {
          const afterReply = this.game.applyMove(afterAiMove, reply, opponent);
          return this.game.checkWinner(afterReply).winner === opponent;
        });
      });

      const pool = safeMoves.length ? safeMoves : scoredMoves;
      const limit = Math.min(pool.length, 3);
      return pool[Math.floor(Math.random() * limit)];
    }

    minimax(board, depth, maximizing, alpha = -Infinity, beta = Infinity) {
      this.nodesVisited += 1;
      this.maxDepthReached = Math.max(this.maxDepthReached, depth);

      const { winner } = this.game.checkWinner(board);
      if (winner === "X") return 10 - depth;
      if (winner === "O") return depth - 10;
      if (this.game.isDraw(board)) return 0;

      const moves = this.game.availableMoves(board);

      if (maximizing) {
        let best = -Infinity;

        for (let i = 0; i < moves.length; i += 1) {
          const nextBoard = this.game.applyMove(board, moves[i], "X");
          best = Math.max(best, this.minimax(nextBoard, depth + 1, false, alpha, beta));
          alpha = Math.max(alpha, best);

          if (beta <= alpha) {
            this.nodesPruned += moves.length - i - 1;
            break;
          }
        }

        return best;
      }

      let best = Infinity;

      for (let i = 0; i < moves.length; i += 1) {
        const nextBoard = this.game.applyMove(board, moves[i], "O");
        best = Math.min(best, this.minimax(nextBoard, depth + 1, true, alpha, beta));
        beta = Math.min(beta, best);

        if (beta <= alpha) {
          this.nodesPruned += moves.length - i - 1;
          break;
        }
      }

      return best;
    }
  }

  window.AIEngine = AIEngine;
})();
