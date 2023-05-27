import { useEffect, useState } from 'react'

import { useAppSelector, useAppDispatch } from "../features/hooks"
import {
  getLobby, 
  createNewLobby, 
  deleteMyLobby,
  joinNewLobby,
  leaveLobby as leaveTheLobby,
  tictactoeStart
  
} from '../features/slices/tictactoeSlice'


import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import {
  setDoc,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore'

import { initialGameState } from '../lib/data/initialGameState'

import type { lobbyType } from '../features/slices/tictactoeSlice'
import type { tictactoeButton } from '../lib/data/initialGameState'

export default function Lobby() {

  const [ playerJoined, setPlayerJoined ] = useState<string|null>(null)

  const dispatch = useAppDispatch()

  const {
    id: userId,
    lobby,
    createdLobby,
    joinedLobby, 
    joinedLobbyId,
  } = useAppSelector(state => state.tictactoe)

  async function createLobby() {
    if (createdLobby|| joinedLobby)  return

    const newLobbyRef = doc(db, 'lobby', userId)
    await setDoc(newLobbyRef, {
      host: userId,
      player: null,
      gameStarted: false
    })
      .then(() => dispatch(createNewLobby()))
      .catch(err => console.log(err))
  }

  async function deleteLobby() {
    const lobbyRef = doc(db, 'lobby', userId)
    await deleteDoc(lobbyRef)
      .then(() => dispatch(deleteMyLobby()))
      .catch(err => console.log(err))
  }

  async function joinLobby(id: string) {
    if (id === userId|| createdLobby|| joinedLobby) return

    const lobbyRef = doc(db, 'lobby', id)
    await updateDoc(lobbyRef, {
      player: userId,
    })
      .then(() => dispatch(joinNewLobby(id)))
      .catch(err => console.log(err))
  }

  async function leaveLobby(id: string) {
    const lobbyRef = doc(db, 'lobby', id)
    await updateDoc(lobbyRef, {
      player: null,
    })
      .then(() => dispatch(leaveTheLobby()))
      .catch(err => console.log(err))
  }

  async function startGame() {
    if (!createdLobby) return
    console.log('start game ran')

    const singleLobbyRef = doc(db, 'lobby', userId)
    const gameRef = doc(db, 'tictactoe', userId)
    
    await setDoc(gameRef, {
      game: initialGameState,
      score: {
        host: 0,
        player: 0
      },
      turn: true,
      host: userId
    })
      .then(async () => {
        await updateDoc(singleLobbyRef, {
          gameStarted: true
        })
      })
      .catch(err => console.log(err))
  }



  useEffect(() => {
    console.log('all lobbies useEffect')

    const lobbyRef = collection(db, 'lobby')
    const unsub = onSnapshot(lobbyRef, (snapshot) => {
      const data : lobbyType[] = []
      snapshot.forEach(doc => {
        doc.data() && data.push(doc.data() as lobbyType)
      })  
      dispatch(getLobby([...data]))
    })

    return () => unsub()
  }, [])


  useEffect(() => {
    if (!joinedLobbyId) return
    console.log('single lobby useEffect')
    const singleLobbyRef = doc(db, 'lobby', joinedLobbyId)
    const unsub = onSnapshot(singleLobbyRef, (doc) => {
      const data = doc.data() as lobbyType      
      console.log(data, 'data')
      if (data?.gameStarted) {        
        setPlayerJoined(null)
        joinedLobbyId && dispatch(tictactoeStart(joinedLobbyId))
        deleteLobby()
      }
      else if (userId === data?.host && data?.player) {
        setPlayerJoined(data.player)
      }
      else if (!data?.player) {
        setPlayerJoined(null)
      }
    })

    return () => unsub()
  }, [joinedLobbyId])

  return (
    <div className='mx-auto my-8'>
      <section className='min-w-[300px] max-w-[600px] min-h-[300px] bg-slate-100 rounded-2xl shadow-xl drop-shadow-lg'>
      {lobby.length > 0 && lobby.map((item : lobbyType, index: number) => {
        return (
            <div className='flex flex-row' key={index}>
              <div className='basis-1/3 bg-red-300 text-center flex items-center justify-center text-lg my-1'>
                {item?.host}
              </div>
              <div className='basis-1/3 bg-blue-300 text-center flex items-center justify-center text-lg my-1'>
                {item?.player}
              </div>
              <div className='basis-1/3 text-center bg-slate-200 py-2 my-1'>
                { (!joinedLobby && !item?.player) &&
                  <button className='bg-green-300 px-3 rounded-md'
                    onClick={(() => joinLobby(item?.host))}
                  >
                    JOIN
                  </button> }
                { (joinedLobbyId && (item?.player === userId)) && 
                  <button className='bg-red-300 px-3  rounded-md'
                    onClick={() => leaveLobby(item?.host)}
                  >
                    LEAVE
                  </button>
                }
                { (joinedLobbyId && (item?.host === userId)) && 
                  <button className='bg-red-300 px-3  rounded-md'
                    onClick={deleteLobby}
                  >
                    DELETE
                  </button>
                }
                { (item?.player && item?.player !== userId && joinedLobbyId !== userId) && 
                  <button className='bg-orange-300 px-3  rounded-md'>
                    FULL  
                  </button>
                }
              </div>
            </div>           
        )
      })}
          </section>
          <div className='my-4'>
            {!createdLobby && 
            <button onClick={createLobby}
              className='bg-green-300 px-3 py-2 rounded-lg drop-shadow-sm shadow-md hover:scale-105 active:scale-100 transition-all duration-150'
            >
              Create Lobby
            </button>}
            {(createdLobby && playerJoined) && 
            <button onClick={startGame}
              className='bg-green-300 px-3 py-2 rounded-lg drop-shadow-sm shadow-md hover:scale-105 active:scale-100 transition-all duration-150'
            >
              Start
            </button>}
          </div>
    </div>
  )
}
