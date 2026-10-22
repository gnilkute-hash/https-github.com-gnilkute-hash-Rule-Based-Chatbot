# Unbeatable Tic Tac Toe AI

A polished multi file Tic Tac Toe project built with HTML, CSS, JavaScript,
and a small Python smoke test. You play as X, the AI plays as O, and
Unbeatable mode uses Minimax with Alpha Beta pruning to avoid losing.

## Project Files

```text
tic-tac-toe.html
styles/main.css
scripts/app.js
scripts/ai-engine.js
scripts/game-engine.js
scripts/ui-controller.js
tests/tic_tac_toe_ai_test.py
README.md
```

## Features

1. Unbeatable AI powered by full game tree search.
2. Easy, Medium, and Unbeatable difficulty modes.
3. Scoreboard saved in browser local storage.
4. Reset score, undo, new round, move history, and round state controls.
5. Live search telemetry for visited nodes, pruned branches, depth, and score.
6. Responsive styling with keyboard accessible board cells.
7. Python smoke tests for the core AI expectations.

## How To Run

Open `tic-tac-toe.html` directly in a browser. No install step is needed.

To run the Python smoke test:

```bash
python tests/tic_tac_toe_ai_test.py
```

## Code Map

`scripts/game-engine.js` handles valid moves, board updates, winner detection,
draw detection, and terminal state checks.

`scripts/ai-engine.js` handles Minimax, Alpha Beta pruning, move scoring, and
difficulty behavior.

`scripts/ui-controller.js` handles rendering, player input, score persistence,
telemetry updates, undo, and round flow.

`styles/main.css` handles the layout, board design, panels, responsive rules,
and interaction states.

## AI Note

Tic Tac Toe is small enough to solve completely. In Unbeatable mode, the AI
searches every possible continuation from the current board and chooses the
move with the best guaranteed result. With perfect play from both sides, the
game ends in a draw.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
