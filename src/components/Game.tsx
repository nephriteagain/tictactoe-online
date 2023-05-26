import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"
import { useAppSelector, useAppDispatch } from "../features/hooks"

import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'

import { getGameData } from "../features/slices/tictactoeSlice"

import { initialGameState } from "../lib/data/initialGameState"

import { ImCross } from 'react-icons/im'
import { FaRegCircle } from 'react-icons/fa'

import type { gameType } from "../features/slices/tictactoeSlice"
import type { tictactoeButton } from "../lib/data/initialGameState"

export default function Game() {
  
  const dispatch = useAppDispatch()
  const { joinedGameId, game, id: userId } = useAppSelector(state => state.tictactoe)
  const [ movePending, setMovePending ] = useState(false)

  async function play(moveIndex: number,  host: string, box: string) {
    if (!game || movePending || box) return

    if ((game.turn && userId !== host) || (!game.turn && userId === host)) {
      throw new Error('wait for your turn')
    }
    setMovePending(true)
    const newGameBoard = game.game.map((box, index) => {
      if (index === moveIndex && userId !== joinedGameId) {
        return 'o'
      }
      if (index === moveIndex && userId === joinedGameId) {
        return 'x'
      }
      return box
    })
    const gameRef = joinedGameId && doc(db, 'tictactoe', joinedGameId)

    if (gameRef) {
      await updateDoc(gameRef, {
        game: newGameBoard,
        turn: userId === game.host ? false : true
      })
        .then(() => setMovePending(false))
        .catch(err =>  {
         throw new Error(err)
        })
    }

  }


  useEffect(() => {

    if (!joinedGameId) return 
    console.log('game useEffect')
    const gameRef = doc(db, 'tictactoe', joinedGameId)
    const unsub = onSnapshot(gameRef, (doc) => {
      const game = doc.data() as gameType
      game && dispatch(getGameData(game))
    })

    return () => unsub()
  }, [joinedGameId])


  function whosTurn(user: string, turn: boolean, host: string) {
    if ((turn && user !== host) || (!turn && user === host)) {
      return "Opponent's Turn"
    }
    return "Your Turn"
  }

  if (game && game.game.length > 0) return (
    <div className="mx-auto my-8 ">
      <h2 className="text-center text-3xl font-bold">
        Game is Live
      </h2>
      <div>

        <div className="flex flex-row my-1">
          <div className="basis-1/3 text-center font-semibold text-xl">
            x: {game.score.host}
          </div>
          <div className="basis-1/3 text-center font-semibold text-xl">
            SCORE
          </div>
          <div className="basis-1/3 text-center font-semibold text-xl">
            o: {game.score.player}
          </div>
        </div>
        <div className="text-center text-2xl font-bold mb-2">
          {whosTurn(userId, game.turn, game.host)}
        </div>
      </div>
      <section
        className="grid grid-cols-3 grid-rows-3 w-[300px] aspect-square border border-black"
      >
        {game.game.map((box : tictactoeButton, index) => {
          return (
            <div key={index}
            onClick={() => play(index, game.host, box)}
            className="border border-black w-[100px] aspect-square flex items-center justify-center"
            >
              <div className="m-auto"
              >
                {
                  box === 'o' 
                  ? <FaRegCircle 
                    className="text-7xl"
                  /> 
                  : box === 'x' 
                  ? <ImCross 
                    className="text-6xl"
                  /> 
                  : box}

              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
    
  

  return (
    <section
      className="mx-auto my-8 grid grid-cols-3 grid-rows-3 w-[300px] aspect-square border border-black"
    >
      {initialGameState.map((box : tictactoeButton, index) => {
        return (
          <div key={index}
            className="border border-black w-[100px] aspect-square"
          >
            <div className="w-full aspect-square cursor-pointer">
              {box}
            </div>
          </div>
        )
      })}
    </section>
  )
}
