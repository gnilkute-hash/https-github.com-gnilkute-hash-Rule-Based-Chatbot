WIN_LINES = (
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
)


def available_moves(board):
    return [index for index, value in enumerate(board) if value is None]


def check_winner(board):
    for a, b, c in WIN_LINES:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]
    return None


def apply_move(board, index, player):
    next_board = board[:]
    next_board[index] = player
    return next_board


def minimax(board, depth, maximizing, alpha=float("-inf"), beta=float("inf")):
    winner = check_winner(board)
    if winner == "X":
        return 10 - depth
    if winner == "O":
        return depth - 10
    if not available_moves(board):
        return 0

    if maximizing:
        best = float("-inf")
        for index in available_moves(board):
            best = max(best, minimax(apply_move(board, index, "X"), depth + 1, False, alpha, beta))
            alpha = max(alpha, best)
            if beta <= alpha:
                break
        return best

    best = float("inf")
    for index in available_moves(board):
        best = min(best, minimax(apply_move(board, index, "O"), depth + 1, True, alpha, beta))
        beta = min(beta, best)
        if beta <= alpha:
            break
    return best


def choose_o_move(board):
    scored = []
    for index in available_moves(board):
        scored.append((minimax(apply_move(board, index, "O"), 0, True), index))
    return min(scored)[1]


def test_ai_takes_immediate_win():
    board = ["O", "O", None, "X", "X", None, None, None, None]
    assert choose_o_move(board) == 2


def test_ai_blocks_immediate_loss():
    board = ["X", "X", None, None, "O", None, None, None, None]
    assert choose_o_move(board) == 2


def test_empty_board_is_draw_with_perfect_play():
    assert minimax([None] * 9, 0, True) == 0


if __name__ == "__main__":
    test_ai_takes_immediate_win()
    test_ai_blocks_immediate_loss()
    test_empty_board_is_draw_with_perfect_play()
    print("All Tic-Tac-Toe AI smoke tests passed.")
