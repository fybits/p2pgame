import React, { createContext, useReducer } from 'react'
import { Address, Entity } from './types';
import { Action, ActionKind } from './GameStateActions';

export type State = {
  player: Entity;
  otherPlayers: {[key: Address]: Entity};
  bullets: Entity[];
}

const initialState: State = {
  player: {
    rotation: 0,
    address: '',
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
  },
  otherPlayers: {},
  bullets: [],
}

const reducer: React.Reducer<State, Action> = (state, { type, payload }) => {
  switch (type) {
    case ActionKind.UpdatePlayer:
      return {...state, player: { ...state.player, ...payload }};
    case ActionKind.UpdateOtherPlayer:
      const { address, player } = payload;
      state.otherPlayers[address] = player;
      return {...state, otherPlayers: state.otherPlayers};
    case ActionKind.ShootBullet:
      if (state.bullets.length > 40) {
        state.bullets.shift()
      }
      return {...state, bullets: [ ...state.bullets, payload]};
    case ActionKind.UpdateBullet:
      const bullets = state.bullets;
      const index = bullets.findIndex(b => b.address === payload.address);
      bullets[index] = { ...bullets[index], position: payload.position };
      return {...state, bullets };
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