import { winningNumbers } from "../data/initialGameState"

import type { tictactoeButton } from "../data/initialGameState"

export function randomId() {
  let i = 0
  let str = ''
  while (i < 8) {    
    let random = Math.random() * 9
    random = Math.round(random)

    str = str.concat(random.toString())
    i++
  }

  return str
}

export function getId() {
  const hasId = localStorage.getItem('tttId')
  if (hasId) {
    return hasId
  } else {
    const newId = randomId()
    localStorage.setItem('tttId', newId)
    return newId
  }
}

export function checkIfWin(game: tictactoeButton[], host: string, user: string) {

  const letter = host === user ? 'x' : 'o'

  if (letter === 'x') {
    const hasWinningPattern = winningNumbers.some((pattern) => {
      return pattern.every(number => {
        return game.some((box, index) => box === 'x' && number === index
        )
      })
    })
  
    return hasWinningPattern
  }

  else if (letter === 'o') {
    const hasWinningPattern = winningNumbers.some((pattern) => {
      return pattern.every(number => {
        return game.some((box, index) => box === 'o' && number === index
        )
      })
    })
  
    return hasWinningPattern
  }

  
}