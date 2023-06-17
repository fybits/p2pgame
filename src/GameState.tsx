import React, { createContext, useReducer } from 'react'
import { Address, Entity } from './types';
import { Action, ActionKind } from './GameStateActions';

export type State = {
  player: Entity;
  otherPlayers: {[key: Address]: Entity};
}

const initialState: State = {
  player: {
    address: '',
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
  },
  otherPlayers: {},
}

const reducer: React.Reducer<State, Action> = (state, { type, payload }) => {
  switch (type) {
    case ActionKind.UpdatePlayer:
      return {...state, player: { ...state.player, ...payload }};
    case ActionKind.UpdateOtherPlayer:
      const { address, player } = payload;
      state.otherPlayers[address] = player;
      return {...state, otherPlayers: state.otherPlayers};
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