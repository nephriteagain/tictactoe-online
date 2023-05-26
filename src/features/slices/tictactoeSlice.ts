import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// import { getId } from "../../lib/helper/randomId";
import { randomId } from "../../lib/helper/randomId";

import type { tictactoeButton } from "../../lib/data/initialGameState";

export interface lobbyType {
  host: string
  player: string|null,
  gameStarted: boolean
}

export interface gameType {
  game: tictactoeButton[]
  score: {
    host: number
    player: number
  }
  turn: boolean
  host: string,  
}

interface initialStateType {
  id: string
  game: gameType|null
  lobby: lobbyType[]
  createdLobby: boolean
  joinedLobby: boolean
  joinedLobbyId: string|null
  joinedGameId: null|string
}

const initialState : initialStateType = {
  id: randomId(),
  game: null,
  lobby: [], 
  createdLobby: false,
  joinedLobby: false,
  joinedLobbyId: null,
  joinedGameId: null

}

export const tictactoeSlice = createSlice({
  name: 'tictactoe',
  initialState,
  reducers: {
    getLobby: (state, action: PayloadAction<lobbyType[]>) => {
      state.lobby = action.payload
    },
    createNewLobby: (state) => {
      if (state.createdLobby || state.joinedLobby) return
      state.createdLobby = true
      state.joinedLobby = true
      state.joinedLobbyId = state.id
    },
    deleteMyLobby: (state) => {
      state.createdLobby = false
      state.joinedLobby = false
      state.joinedLobbyId = null
    },
    joinNewLobby: (state, action: PayloadAction<string>) => {      
      if (state.createdLobby || state.joinedLobby) return
      state.joinedLobby = true
      state.createdLobby = false
      state.joinedLobbyId = action.payload
    },
    leaveLobby: (state) => {
      state.joinedLobby = false
      state.createdLobby = false
      state.joinedLobbyId = null
    },
    tictactoeStart: (state, action : PayloadAction<string>) => {
      state.joinedGameId = action.payload
    },
    getGameData: (state, action : PayloadAction<gameType>) => {
      state.game = action.payload
    }
    

  }

})

export const {
  getLobby, 
  createNewLobby, 
  deleteMyLobby,
  joinNewLobby,
  leaveLobby,
  tictactoeStart,
  getGameData
} = tictactoeSlice.actions

export default tictactoeSlice.reducer