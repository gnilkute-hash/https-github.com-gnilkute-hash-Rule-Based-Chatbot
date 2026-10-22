(function () {
  class UIController {
    constructor(gameEngine, AIEngineClass) {
      this.game = gameEngine;
      this.ai = new AIEngineClass(gameEngine);
      this.human = "X";
      this.aiPlayer = "O";
      this.difficulty = "unbeatable";
      this.storageKey = "ticTacToeAiScores";
      this.scores = this.loadScores();

      this.startRound();
      this.cacheDom();
      this.bindEvents();
      this.render();
      this.renderScores();
      this.renderRoundState();
      this.updateStatus("Your move. You are X.");
    }

    startRound() {
      this.board = this.game.emptyBoard();
      this.current = this.human;
      this.locked = false;
      this.moveLog = [];
      this.snapshots = [];
    }

    cacheDom() {
      this.boardEl = document.getElementById("board");
      this.statusEl = document.getElementById("statusText");
      this.scoreYouEl = document.getElementById("scoreYou");
      this.scoreAIEl = document.getElementById("scoreAI");
      this.scoreDrawEl = document.getElementById("scoreDraw");
      this.nodesVisitedEl = document.getElementById("nodesVisited");
      this.nodesPrunedEl = document.getElementById("nodesPruned");
      this.maxDepthEl = document.getElementById("maxDepth");
      this.evalScoreEl = document.getElementById("evalScore");
      this.pruneBarEl = document.getElementById("pruneBar");
      this.historyEl = document.getElementById("history");
      this.difficultyToggle = document.getElementById("difficultyToggle");
      this.resetBtn = document.getElementById("resetBtn");
      this.undoBtn = document.getElementById("undoBtn");
      this.resetScoresBtn = document.getElementById("resetScoresBtn");
      this.turnStateEl = document.getElementById("turnState");
      this.difficultyStateEl = document.getElementById("difficultyState");
      this.openCellsStateEl = document.getElementById("openCellsState");
    }

    bindEvents() {
      this.boardEl.addEventListener("click", (event) => {
        const cell = event.target.closest(".cell");
        if (cell) this.handleHumanMove(Number(cell.dataset.index));
      });

      this.boardEl.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const cell = event.target.closest(".cell");
        if (!cell) return;
        event.preventDefault();
        this.handleHumanMove(Number(cell.dataset.index));
      });

      this.resetBtn.addEventListener("click", () => this.newRound());
      this.undoBtn.addEventListener("click", () => this.undoTurn());
      this.resetScoresBtn.addEventListener("click", () => this.resetScores());

      this.difficultyToggle.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        this.difficulty = button.dataset.level;
        [...this.difficultyToggle.children].forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        this.renderRoundState();
      });
    }

    render(winLine = []) {
      this.boardEl.innerHTML = "";

      this.board.forEach((value, index) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = `cell${value ? " filled" : ""}${this.locked ? " locked" : ""}`;
        cell.dataset.index = String(index);
        cell.setAttribute("aria-label", this.describeCell(value, index));

        if (value) {
          const mark = document.createElement("span");
          mark.className = value === "X" ? "x-mark" : "o-mark";
          mark.textContent = value;
          cell.appendChild(mark);
        }

        if (winLine.includes(index)) cell.classList.add("win-cell");
        this.boardEl.appendChild(cell);
      });

      this.renderRoundState();
    }

    describeCell(value, index) {
      const row = Math.floor(index / 3) + 1;
      const column = (index % 3) + 1;
      return value ? `${value} at row ${row}, column ${column}` : `Empty row ${row}, column ${column}`;
    }

    updateStatus(text, mood = "") {
      this.statusEl.textContent = text;
      this.statusEl.className = `status-text${mood ? ` ${mood}` : ""}`;
    }

    saveSnapshot() {
      this.snapshots.push({
        board: this.board.slice(),
        current: this.current,
      });
    }

    handleHumanMove(index) {
      if (this.locked || this.current !== this.human || !this.game.isValidMove(this.board, index)) {
        return;
      }

      this.saveSnapshot();
      this.board = this.game.applyMove(this.board, index, this.human);
      this.moveLog.push({ player: this.human, index });
      this.renderHistory();
      this.render();

      if (this.finishIfGameOver()) return;

      this.current = this.aiPlayer;
      this.locked = true;
      this.boardEl.classList.add("thinking");
      this.updateStatus("AI is thinking...");
      this.renderRoundState();
      this.render();

      window.setTimeout(() => this.handleAiMove(), 240);
    }

    handleAiMove() {
      const move = this.ai.chooseMove(this.board, this.aiPlayer, this.difficulty);

      this.saveSnapshot();
      this.board = this.game.applyMove(this.board, move.index, this.aiPlayer);
      this.moveLog.push({ player: this.aiPlayer, index: move.index });
      this.updateTelemetry(move);
      this.renderHistory();

      this.locked = false;
      this.boardEl.classList.remove("thinking");

      if (this.finishIfGameOver()) return;

      this.current = this.human;
      this.render();
      this.updateStatus("Your move.");
      this.renderRoundState();
    }

    finishIfGameOver() {
      const result = this.game.checkWinner(this.board);

      if (result.winner) {
        this.endGame(result.winner, result.line);
        return true;
      }

      if (this.game.isDraw(this.board)) {
        this.endGame(null, []);
        return true;
      }

      return false;
    }

    endGame(winner, line) {
      this.locked = true;
      this.boardEl.classList.remove("thinking");
      this.render(line);

      if (winner === this.human) {
        this.scores.X += 1;
        this.updateStatus("You won. Try Unbeatable mode next.", "win");
      } else if (winner === this.aiPlayer) {
        this.scores.O += 1;
        this.updateStatus("AI wins. New round?", "lose");
      } else {
        this.scores.draw += 1;
        this.updateStatus("Draw. Perfect play holds the line.", "draw");
      }

      this.renderScores();
      this.saveScores();
      this.renderRoundState();
    }

    renderScores() {
      this.scoreYouEl.textContent = String(this.scores.X);
      this.scoreAIEl.textContent = String(this.scores.O);
      this.scoreDrawEl.textContent = String(this.scores.draw);
    }

    loadScores() {
      try {
        const saved = window.localStorage.getItem(this.storageKey);
        if (!saved) return { X: 0, O: 0, draw: 0 };

        const parsed = JSON.parse(saved);
        return {
          X: Number(parsed.X) || 0,
          O: Number(parsed.O) || 0,
          draw: Number(parsed.draw) || 0,
        };
      } catch (error) {
        return { X: 0, O: 0, draw: 0 };
      }
    }

    saveScores() {
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
      } catch (error) {
        // Score persistence is optional; gameplay still works without storage.
      }
    }

    resetScores() {
      this.scores = { X: 0, O: 0, draw: 0 };
      this.saveScores();
      this.renderScores();
      this.updateStatus("Scoreboard reset. Your move.");
    }

    renderRoundState() {
      if (!this.turnStateEl) return;

      let turnText = this.current === this.human ? "Human X" : "AI O";
      if (this.locked && this.game.isTerminal(this.board)) turnText = "Round over";
      else if (this.locked) turnText = "AI O";

      this.turnStateEl.textContent = turnText;
      this.difficultyStateEl.textContent = this.labelDifficulty(this.difficulty);
      this.openCellsStateEl.textContent = String(this.game.availableMoves(this.board).length);
    }

    labelDifficulty(level) {
      return level.charAt(0).toUpperCase() + level.slice(1);
    }

    updateTelemetry(move) {
      this.nodesVisitedEl.textContent = move.nodesVisited.toLocaleString();
      this.nodesPrunedEl.textContent = move.nodesPruned.toLocaleString();
      this.maxDepthEl.textContent = String(move.maxDepth);

      if (move.score > 0) this.evalScoreEl.textContent = `+${move.score} favors X`;
      else if (move.score < 0) this.evalScoreEl.textContent = `${move.score} favors O`;
      else this.evalScoreEl.textContent = "0 draw line";

      const total = move.nodesVisited + move.nodesPruned;
      const percent = total ? Math.round((move.nodesPruned / total) * 100) : 0;
      this.pruneBarEl.style.width = `${percent}%`;
    }

    renderHistory() {
      if (!this.moveLog.length) {
        this.historyEl.innerHTML = '<span class="empty">No moves yet.</span>';
        return;
      }

      const formatCell = (index) => `(${Math.floor(index / 3) + 1},${(index % 3) + 1})`;
      this.historyEl.innerHTML = this.moveLog
        .map((move, index) => `${index + 1}. ${move.player} to ${formatCell(move.index)}`)
        .join("<br>");
      this.historyEl.scrollTop = this.historyEl.scrollHeight;
    }

    undoTurn() {
      if (this.locked || this.snapshots.length === 0) return;

      const steps = Math.min(2, this.snapshots.length);
      for (let i = 0; i < steps; i += 1) {
        const snapshot = this.snapshots.pop();
        this.board = snapshot.board;
        this.current = snapshot.current;
      }

      this.moveLog = this.moveLog.slice(0, Math.max(0, this.moveLog.length - steps));
      this.renderHistory();
      this.render();
      this.updateStatus("Move undone. Your turn.");
      this.renderRoundState();
    }

    newRound() {
      this.startRound();
      this.resetTelemetry();
      this.renderHistory();
      this.render();
      this.updateStatus("Your move. You are X.");
      this.renderRoundState();
    }

    resetTelemetry() {
      this.nodesVisitedEl.textContent = "Waiting";
      this.nodesPrunedEl.textContent = "Waiting";
      this.maxDepthEl.textContent = "Waiting";
      this.evalScoreEl.textContent = "Waiting";
      this.pruneBarEl.style.width = "0%";
    }
  }

  window.UIController = UIController;
})();
