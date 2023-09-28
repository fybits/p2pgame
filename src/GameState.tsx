import React, { createContext, useReducer } from 'react'
import { Address, Entity } from './types';
import { Action, ActionKind } from './GameStateActions';

export type State = {
  player: Entity;
  otherPlayers: {[key: Address]: Entity};
  bullets: Entity[];
  scoreBoard: {[key: Address]: number};
}

export const initialState: State = {
  player: {
    health: 100,
    rotation: 0,
    address: '',
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
  },
  otherPlayers: {},
  bullets: [],
  scoreBoard: {},
}

const reducer: React.Reducer<State, Action> = (state, { type, payload }) => {
  switch (type) {
    case ActionKind.UpdatePlayer:
      const newPlayer: Entity = { ...state.player, ...payload }
      return {...state, player: newPlayer};
    case ActionKind.UpdateOtherPlayer: {
      const { address, player } = payload;
      state.otherPlayers[address] = player;
      return {...state, otherPlayers: state.otherPlayers};
    }
    case ActionKind.ShootBullet:
      if (state.bullets.length > 500) {
        state.bullets.shift()
      }
      return {...state, bullets: [ ...state.bullets, payload]};
    case ActionKind.UpdateBullet: {
      const bullets = state.bullets;
      const { address, ...rest } = payload;
      const index = bullets.findIndex(b => b.address === address);
      bullets[index] = { ...bullets[index], ...rest };
      return {...state, bullets };
    }
    case ActionKind.UpdateScoreBoard: {
      const scoreBoard = state.scoreBoard;
      if (!scoreBoard[payload.killer]) {
        scoreBoard[payload.killer] = 0;
      }
      return { ...state, scoreBoard: {...scoreBoard, [payload.killer]: scoreBoard[payload.killer] + 1 } };
    }
    case ActionKind.RemovePlayer:
      delete state.otherPlayers[payload.address];
      return { ...state, otherPlayers: { ...state.otherPlayers } };
  }
  return state;
};

export const GameStateContext = createContext<{state: State, dispatch: React.Dispatch<Action>} | undefined>(undefined);


const GameStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GameStateContext.Provider value={{state, dispatch}}>
      {children}
    </GameStateContext.Provider>
  )
}

export default GameStateProvider;