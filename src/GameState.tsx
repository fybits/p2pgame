import { createContext, useContext, useReducer } from 'react'
import { Address, Entity } from './types';
import { Action, ActionKind } from './GameStateActions';

export type State = {
  player: Entity;
  otherPlayers: Map<Address, Entity>;
}

const initialState: State = {
  player: {
    address: '',
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
  },
  otherPlayers: new Map<Address, Entity>(),
}


const GameStateContext = createContext<{state: State, dispatch: React.Dispatch<Action>}>({state: initialState, dispatch: () => {}});

const reducer: React.Reducer<State, Action> = (state, { type, payload }) => {
  switch (type) {
    case ActionKind.UpdatePlayer:
      state.player = {...state.player, ...payload}
      return state;
    case ActionKind.UpdateOtherPlayer:
      const { address, player } = payload;
      state.otherPlayers.set(address, player);
      return state;
  }
  return state;
};

const GameStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameStateContext.Provider value={{ state, dispatch }} >
        {children}
    </GameStateContext.Provider>
  )
}

export const useGameStateContext = () => useContext(GameStateContext);

export default GameStateProvider;