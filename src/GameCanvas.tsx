import { KeyboardEvent, MouseEventHandler, useContext, useEffect, useRef, useState } from "react"
import { Container, Stage } from '@pixi/react';
import Player from "./Player";
import { GameStateContext } from "./GameState";
import Entity from "./Entity";
import Bugout from 'bugout';
import { Vector } from "./types";
import ZoomableContainer from "./ZoomableContainer";

interface GameCanvasProps {
  bugout: React.MutableRefObject<Bugout>
  myAddress: React.MutableRefObject<string>;
}

const WIDTH = 1280;
const HEIGHT = 720;

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

  const playersList = Object.values(state.otherPlayers);

  let deziredZoom = 1;
  let desiredPos = { x: 0, y: 0 };

  if (playersList.length > 1) {
    const minX = playersList.reduce((min, cur) => cur.position.x < min ? cur.position.x : min, 9999999)
    const maxX = playersList.reduce((max, cur) => cur.position.x > max ? cur.position.x : max, -9999999)
    const minY = playersList.reduce((min, cur) => cur.position.y < min ? cur.position.y : min, 9999999)
    const maxY = playersList.reduce((max, cur) => cur.position.y > max ? cur.position.y : max, -9999999)

    const deziredZoomX = WIDTH * 0.75 / (maxX - minX);
    const deziredZoomY = HEIGHT * 0.75 / (maxY - minY);
    deziredZoom = Math.min(1, deziredZoomX, deziredZoomY);

    const averageX = playersList.reduce((acc, cur) => cur.position.x + acc, 0) / playersList.length;
    const averageY = playersList.reduce((acc, cur) => cur.position.y + acc, 0) / playersList.length;
    desiredPos = { x: (WIDTH/2-averageX*deziredZoom), y: (HEIGHT/2-averageY*deziredZoom) };
  }

  return (
    <Stage onPointerMove={mouseMove}  tabIndex={1} autoFocus onKeyDown={keyDown} onKeyUp={keyUp} width={WIDTH} height={HEIGHT}>
      <ZoomableContainer anchor={0.5} desiredPos={desiredPos} defaultZoom={1} desiredZoom={deziredZoom}>
        <Player bugout={bugout} keyboard={keyboard} player={state.player} dispatch={dispatch}></Player>
        {Object.values(state.otherPlayers).filter((p) => p.address !== myAddress.current).map((player) => (
          <Entity player={player}></Entity>
        ))}
      </ZoomableContainer>
    </Stage>
  )
}

export default GameCanvas