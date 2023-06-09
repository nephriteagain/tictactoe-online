import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"
import { useAppSelector, useAppDispatch } from "../features/hooks"

import { doc, onSnapshot, updateDoc, increment, deleteDoc } from 'firebase/firestore'

import { getGameData, leaveGame } from "../features/slices/tictactoeSlice"

import { initialGameState } from "../lib/data/initialGameState"
import { checkIfWin } from "../lib/helper/helper"
   
import { ImCross } from 'react-icons/im'
import { FaRegCircle } from 'react-icons/fa'

import type { gameType } from "../features/slices/tictactoeSlice"
import type { tictactoeButton } from "../lib/data/initialGameState"



export default function Game() {
  
  const dispatch = useAppDispatch()
  const { joinedGameId, game, id: userId } = useAppSelector(state => state.tictactoe)
  const [ movePending, setMovePending ] = useState(false)
  const [winnerStyle, setWinnerStyle ] = useState({top: '-7%'})

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
    const isWinner = checkIfWin(newGameBoard, host, userId)
    const allBoxesUsed = newGameBoard.every(box => box.length === 1)
  
    if (gameRef && isWinner && userId === host) {      
      showWinner()

      await updateDoc(gameRef, {
        "game": newGameBoard,
        "turn": userId === game.host ? false : true,
        "score.host": increment(1)
      })
      .then( async () => {
        setMovePending(false)
        await updateDoc(gameRef, {
          game: initialGameState
        })          
      })
        .catch(err =>  {
         throw new Error(err)
        })
        
    }

    else if (gameRef && isWinner && userId !== host) {
      showWinner()

      await updateDoc(gameRef, {
        "game": newGameBoard,
        "turn": userId === game.host ? false : true,
        "score.player": increment(1)
      })
        .then( async () => {
          setMovePending(false)
          await updateDoc(gameRef, {
            game: initialGameState
          })          
        })
        .catch(err =>  {
         throw new Error(err)
        })

    }

    else if (gameRef && allBoxesUsed) {
      await updateDoc(gameRef, {
        "game": newGameBoard,
        "turn": userId === game.host ? false : true,
      })
        .then( async () => {
          setMovePending(false)
          await updateDoc(gameRef, {
            game: initialGameState
          })          
        })
        .catch(err =>  {
         throw new Error(err)
        })
    }

    else if (gameRef) {
      await updateDoc(gameRef, {
        game: newGameBoard,
        turn: userId === game.host ? false : true,      
      })
        .then(  () => {
          setMovePending(false)        
        })
        .catch(err =>  {
         throw new Error(err)
        })
    }

  }


  async function leaveAndDeleteGame(gameId: string) {
    const gameRef = doc(db, 'tictactoe', gameId)
    
    await deleteDoc(gameRef)
      .catch(err => {
        throw new Error(err)
      })
  }

  function whosTurn(user: string, turn: boolean, host: string) {
    if ((turn && user !== host) || (!turn && user === host)) {
      return "Opponent's Turn"
    }
    return "Your Turn"
  }

  function showWinner() {
    const style = {
      top: '7%'
    }
    const noStyle = {
      top: '-7%'
    }

    setWinnerStyle(style)

      const timeOut = setTimeout(() => {
        setWinnerStyle(noStyle)
        clearTimeout(timeOut)
      }, 2000)
  }

  useEffect(() => {

    if (!joinedGameId) return 
    // console.log('game useEffect')
    const gameRef = doc(db, 'tictactoe', joinedGameId)
    const unsub = onSnapshot(gameRef, (doc) => {
      const game = doc.data() as gameType
      game && dispatch(getGameData(game))
      !game && dispatch(leaveGame())
    })

    return () => unsub()
  }, [joinedGameId])



  if (game && game.game.length > 0) return (
    <>
    <div className="result absolute right-[5%] bg-green-400 px-3 py-1 rounded-md shadow-sm drop-shadow-sm"
      style={winnerStyle}
    >
      You Win!!
    </div>
    <div className="mx-auto relative">      
      <div className="font-bold text-center text-3xl mt-4">
        TICTACTOE ONLINE
      </div>
      <div className="absolute top-[12%] left-[50%] translate-x-[-50%] w-full">
        <h2 className="text-center text-3xl font-semibold">
          Game is Live
        </h2>
        <div>

          <div className="flex flex-row my-1">
            <div className="basis-1/3 text-center font-semibold text-xl flex flex-row items-center justify-center">
              <span className="bg-slate-200 basis-1/2 flex items-center justify-center h-full py-[0.1rem]">
              <ImCross 
                className="inline text-orange-600"
                />
              </span>
              <span className="bg-green-300 basis-1/2 py-[0.1rem] text-2xl">
                {game.score.host}
              </span>
            </div>
            <div className="basis-1/3 text-center font-semibold text-2xl">
              SCORE
            </div>
            <div className="basis-1/3 text-center font-semibold text-xl flex flex-row items-center justify-center">
              <span className="bg-slate-200 basis-1/2 flex items-center justify-center h-full py-[0.1rem]">
              <FaRegCircle 
                className="inline text-blue-600"
                />
              </span>
              <span className="bg-green-300 basis-1/2 py-[0.1rem] text-2xl">
                {game.score.player}
              </span>
            </div>
          </div>
          <div className="text-center text-2xl font-bold mb-2">
            {whosTurn(userId, game.turn, game.host)}
          </div>
        </div>
      </div>
      
      <section
        className="mt-[150px] grid grid-cols-3 grid-rows-3 w-[300px] aspect-square rounded-lg overflow-hidden shadow-lg drop-shadow-md"
      >
        {game.game.map((box : tictactoeButton, index) => {
          return (
            <div key={index}
            onClick={() => play(index, game.host, box)}
            className={`odd:bg-gray-200 even:bg-gray-400 w-[100px] aspect-square flex items-center justify-center ${((game.turn && userId !== game.host) || (!game.turn && userId === game.host)) ? 'error' : 'pointer'}`}
            >
              <div className='m-auto'
              >
                {
                  box === 'o' 
                  ? <FaRegCircle 
                    className="text-7xl text-blue-600"
                  /> 
                  : box === 'x' 
                  ? <ImCross 
                    className="text-6xl text-orange-600"
                  /> 
                  : box}

              </div>
            </div>
          )
        })}
      </section>
      <div className="mt-4">
        <button className="px-3 py-1 bg-red-300 rounded-md shadow-md drop-shadow-md hover:scale-105 active:scale-100 hover:bg-red-800 hover:text-white transition-all duration-150"
          onClick={
            () => joinedGameId && leaveAndDeleteGame(joinedGameId)
          }
        >
          Leave Game
        </button>
      </div>
    </div>
    </>
  )
    
  

  return (
    <section
      className="mx-auto mt-[150px] grid grid-cols-3 grid-rows-3 w-[300px] aspect-square rounded-lg overflow-hidden shadow-lg drop-shadow-md"
    >
      {initialGameState.map((box : tictactoeButton, index) => {
        return (
          <div key={index}
            className="odd:bg-gray-200 even:bg-gray-400  w-[100px] aspect-square"
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
