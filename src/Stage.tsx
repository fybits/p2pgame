import { Stage as PixiStage } from '@pixi/react';
import { GameStateContext } from './GameState';
import React from 'react';

// the context bridge:
const ContextBridge = ({ children, Context, render }) => {
  return (
    <Context.Consumer>
      {(value) =>
        render(<Context.Provider value={value}>{children}</Context.Provider>)
      }
    </Context.Consumer>
  );
};

// your Stage:

export const Stage = React.forwardRef(({ children, ...props }: any, ref) => {
  return (
    <ContextBridge
      Context={GameStateContext}
      render={(children) => <PixiStage {...props} ref={ref}>{children}</PixiStage>}
    >
      {children}
    </ContextBridge>
  );
});