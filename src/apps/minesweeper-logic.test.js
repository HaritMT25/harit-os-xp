import { describe, it, expect } from 'vitest'
import { createBoard, ROWS, COLS, MINES } from './Minesweeper'

describe('Minesweeper board generation', () => {
  it('places exactly MINES mines', () => {
    for (let run = 0; run < 5; run++) {
      const mines = createBoard().flat().filter(c => c.mine).length
      expect(mines).toBe(MINES)
    }
  })

  it('computes neighbor counts correctly', () => {
    const board = createBoard()
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
        expect(board[r][c].count).toBe(count)
      }
    }
  })

  it('starts all cells hidden and unflagged', () => {
    expect(createBoard().flat().every(c => !c.revealed && !c.flagged)).toBe(true)
  })
})
