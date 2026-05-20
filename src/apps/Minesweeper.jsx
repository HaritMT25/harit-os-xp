import { useState, useEffect, useCallback } from 'react'

const ROWS = 9
const COLS = 9
const MINES = 10

function createBoard() {
  const board = Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({
      mine: false, revealed: false, flagged: false, count: 0,
    }))
  )
  // Place mines
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (!board[r][c].mine) {
      board[r][c].mine = true
      placed++
    }
  }
  // Count neighbors
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++
        }
      }
      board[r][c].count = count
    }
  }
  return board
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => ({ ...cell })))
}

const COLORS = {
  1: '#0000ff', 2: '#008000', 3: '#ff0000', 4: '#000080',
  5: '#800000', 6: '#008080', 7: '#000000', 8: '#808080',
}

export default function Minesweeper() {
  const [board, setBoard] = useState(() => createBoard())
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [face, setFace] = useState('🙂')
  const [time, setTime] = useState(0)
  const [started, setStarted] = useState(false)

  // Timer
  useEffect(() => {
    if (!started || gameOver || won) return
    const interval = setInterval(() => {
      setTime(t => Math.min(t + 1, 999))
    }, 1000)
    return () => clearInterval(interval)
  }, [started, gameOver, won])

  const flagCount = board.flat().filter(c => c.flagged).length

  const reveal = useCallback((board, r, c) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
    const cell = board[r][c]
    if (cell.revealed || cell.flagged) return
    cell.revealed = true
    if (cell.count === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          reveal(board, r + dr, c + dc)
        }
      }
    }
  }, [])

  const handleClick = useCallback((r, c) => {
    if (gameOver || won) return
    if (!started) setStarted(true)

    const newBoard = cloneBoard(board)
    const cell = newBoard[r][c]
    if (cell.flagged || cell.revealed) return

    if (cell.mine) {
      // Game over — reveal all mines
      newBoard.forEach(row => row.forEach(c => { if (c.mine) c.revealed = true }))
      setBoard(newBoard)
      setGameOver(true)
      setFace('😵')
      return
    }

    reveal(newBoard, r, c)

    // Check win
    const unrevealed = newBoard.flat().filter(c => !c.revealed).length
    if (unrevealed === MINES) {
      setWon(true)
      setFace('😎')
      newBoard.forEach(row => row.forEach(c => { if (c.mine) c.flagged = true }))
    }

    setBoard(newBoard)
  }, [board, gameOver, won, started, reveal])

  const handleRightClick = useCallback((e, r, c) => {
    e.preventDefault()
    if (gameOver || won) return
    const newBoard = cloneBoard(board)
    const cell = newBoard[r][c]
    if (cell.revealed) return
    cell.flagged = !cell.flagged
    setBoard(newBoard)
  }, [board, gameOver, won])

  const reset = () => {
    setBoard(createBoard())
    setGameOver(false)
    setWon(false)
    setFace('🙂')
    setTime(0)
    setStarted(false)
  }

  const padNum = (n) => String(n).padStart(3, '0')

  return (
    <div style={styles.container}>
      {/* Header bar */}
      <div style={styles.header}>
        <div style={styles.counter}>{padNum(MINES - flagCount)}</div>
        <button style={styles.faceBtn} onClick={reset}>{face}</button>
        <div style={styles.counter}>{padNum(time)}</div>
      </div>

      {/* Board */}
      <div style={styles.board}>
        {board.map((row, r) => (
          <div key={r} style={styles.row}>
            {row.map((cell, c) => (
              <button
                key={c}
                onClick={() => handleClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                onMouseDown={() => { if (!gameOver && !won) setFace('😮') }}
                onMouseUp={() => { if (!gameOver && !won) setFace('🙂') }}
                style={{
                  ...styles.cell,
                  ...(cell.revealed ? styles.cellRevealed : styles.cellHidden),
                  ...(cell.revealed && cell.mine && gameOver ? styles.cellMineHit : {}),
                }}
              >
                {cell.revealed
                  ? cell.mine
                    ? '💣'
                    : cell.count > 0
                      ? <span style={{ color: COLORS[cell.count], fontWeight: 700 }}>{cell.count}</span>
                      : ''
                  : cell.flagged
                    ? '🚩'
                    : ''
                }
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Win/lose message */}
      {(gameOver || won) && (
        <div style={styles.message}>
          {won ? '🎉 You win!' : '💥 Game over!'}
          {' '}
          <button onClick={reset} style={styles.replayBtn}>Play again</button>
        </div>
      )}
    </div>
  )
}

const CELL_SIZE = 26

const styles = {
  container: {
    height: '100%',
    background: 'var(--xp-surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    fontFamily: "'Tahoma', sans-serif",
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: CELL_SIZE * COLS + 4,
    padding: '4px 6px',
    background: '#c0c0c0',
    border: '2px inset #fff',
    marginBottom: 6,
  },
  counter: {
    fontFamily: "'Courier New', monospace",
    fontSize: 18,
    fontWeight: 700,
    color: '#ff0000',
    background: '#000',
    padding: '2px 6px',
    letterSpacing: 2,
    minWidth: 46,
    textAlign: 'center',
  },
  faceBtn: {
    width: 30,
    height: 30,
    fontSize: 18,
    border: '2px outset #fff',
    background: '#c0c0c0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  board: {
    border: '3px inset #888',
    background: '#c0c0c0',
    lineHeight: 0,
  },
  row: {
    display: 'flex',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    cursor: 'pointer',
    lineHeight: 1,
    fontFamily: "'Arial', sans-serif",
    border: 'none',
    outline: 'none',
  },
  cellHidden: {
    border: '2px outset #fff',
    background: '#c0c0c0',
  },
  cellRevealed: {
    border: '1px solid #808080',
    background: '#d0d0d0',
  },
  cellMineHit: {
    background: '#ff4444',
  },
  message: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 700,
    color: '#333',
  },
  replayBtn: {
    padding: '3px 12px',
    border: '1px solid #003c74',
    borderRadius: 3,
    background: 'linear-gradient(180deg, #fff, #ece9d8)',
    cursor: 'pointer',
    fontFamily: "'Tahoma', sans-serif",
    fontSize: 11,
    marginLeft: 6,
  },
}
