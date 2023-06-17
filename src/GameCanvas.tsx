import { KeyboardEvent, useContext, useEffect, useRef } from "react"
import { Container, Stage } from '@pixi/react';
import Player from "./Player";
import { GameStateContext } from "./GameState";
import Entity from "./Entity";
import Bugout from 'bugout';

interface GameCanvasProps {
  bugout: React.MutableRefObject<Bugout>
  myAddress: React.MutableRefObject<string>;
}

const GameCanvas = ({ bugout, myAddress }: GameCanvasProps) => {
  const { state, dispatch } = useContext(GameStateContext);
  const keyboard = useRef<Map<string,number>>(new Map<string,number>());

  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 1;
  }
  const keyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 0;
  }


  return (
    <Stage tabIndex={1} autoFocus onKeyDown={keyDown} onKeyUp={keyUp} width={800} height={600}>
      <Container>
        <Player bugout={bugout} keyboard={keyboard} player={state.player} dispatch={dispatch}></Player>
        {Object.values(state.otherPlayers).filter((p) => p.address !== myAddress.current).map((player) => (
          <Entity player={player}></Entity>
        ))}
      </Container>
    </Stage>
  )
}

export default GameCanvas