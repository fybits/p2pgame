import { KeyboardEvent, MouseEventHandler, useContext, useEffect, useRef } from "react"
import { Container, Stage, useApp,  } from '@pixi/react';
import Player from "./Player";
import { GameStateContext } from "./GameState";
import Entity from "./Entity";
import Bugout from 'bugout';
import { Vector } from "./types";

interface GameCanvasProps {
  bugout: React.MutableRefObject<Bugout>
  myAddress: React.MutableRefObject<string>;
}

const GameCanvas = ({ bugout, myAddress }: GameCanvasProps) => {
  const { state, dispatch } = useContext(GameStateContext);
  const keyboard = useRef<Map<string,number>>(new Map<string,number>());
  const mousePosition = useRef<Vector>();

  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 1;
  }
  const keyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 0;
  }

  const mouseMove = (event) => {
    var rect = event.target.getBoundingClientRect();
    mousePosition.current =  { x: event.clientX - rect.left, y: event.clientY - rect.top};
  }


  return (
    <Stage onPointerMove={mouseMove} tabIndex={1} autoFocus onKeyDown={keyDown} onKeyUp={keyUp} width={1280} height={720}>
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