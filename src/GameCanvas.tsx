import { KeyboardEvent, MouseEventHandler, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Container, Graphics, Stage } from '@pixi/react';
import PlayerObject from "./PlayerObject";
import { GameStateContext } from "./GameState";
import EntityObject from "./EntityObject";
import Bugout from 'bugout';
import { Entity, Vector } from "./types";
import ZoomableContainer from "./ZoomableContainer";
import BulletObject from "./BulletObject";

interface GameCanvasProps {
  bugout: React.MutableRefObject<Bugout>
  myAddress: React.MutableRefObject<string>;
}

const vectorLength = (vector: Vector): number => {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

const WIDTH = 1280;
const HEIGHT = 720;

let counter = 0;

const GameCanvas = ({ bugout, myAddress }: GameCanvasProps) => {
  const { state, dispatch } = useContext(GameStateContext);
  const [cameraMode, setCameraMode] = useState(true);
  const keyboard = useRef<Map<string,number>>(new Map<string,number>());
  const mousePosition = useRef<Vector>();

  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 1;
    if (event.key === 'Tab') {
      event.preventDefault();
      setCameraMode(!cameraMode);
    }
  }

  const keyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 0;
  }

  const mouseMove = (event) => {
    var rect = event.target.getBoundingClientRect();
    mousePosition.current =  { x: event.clientX - rect.left, y: event.clientY - rect.top};
  }

  const mouseClick = (event) => {
    if (bugout.current) {
      const bullet: Entity = {
        address: `${myAddress.current}_${counter++}`,
        position: state.player.position,
        rotation: state.player.rotation,
        velocity: { x: -Math.cos(Math.PI/180*state.player.rotation)*25000, y: -Math.sin(Math.PI/180*state.player.rotation)*25000 },
      };
      bugout.current.send({ type: 'bullet_shot', message: bullet });

    }
  }

  const playersList = Object.values(state.otherPlayers);

  let deziredZoom = 1;
  let desiredPos = { x: 0, y: 0 };

  if (playersList.length > 1) {
    const minX = playersList.reduce((min, cur) => cur.position.x < min ? cur.position.x : min, 9999999)
    const maxX = playersList.reduce((max, cur) => cur.position.x > max ? cur.position.x : max, -9999999)
    const minY = playersList.reduce((min, cur) => cur.position.y < min ? cur.position.y : min, 9999999)
    const maxY = playersList.reduce((max, cur) => cur.position.y > max ? cur.position.y : max, -9999999)

    const deziredZoomX = WIDTH * 0.7 / (maxX - minX);
    const deziredZoomY = HEIGHT * 0.7 / (maxY - minY);
    deziredZoom = Math.min(0.8, deziredZoomX, deziredZoomY);

    const averageX = playersList.reduce((acc, cur) => cur.position.x + acc, 0) / playersList.length;
    const averageY = playersList.reduce((acc, cur) => cur.position.y + acc, 0) / playersList.length;
    desiredPos = { x: (WIDTH/2-averageX*deziredZoom), y: (HEIGHT/2-averageY*deziredZoom) };
  }

  const f = 8500;
  
  if (cameraMode) {
    deziredZoom = Math.min(0.8, f/vectorLength(state.player.velocity));
    const cameraOffset = { x: state.player.position.x + state.player.velocity.x / 20, y: state.player.position.y + state.player.velocity.y / 20 };
    desiredPos = { x: (WIDTH/2-cameraOffset.x*deziredZoom), y: (HEIGHT/2-cameraOffset.y*deziredZoom) };
  }

  const draw = useCallback((g) => {
    const colors = [0xffffff, 0xffffff, 0xff8855, 0x8888ff]
    g.clear();
    for (let i = -300; i < 300; i++) {
      for (let j = -300; j < 300; j++) {
        const colorRand = Math.random();
        const spread = 100;
        g.beginFill(colors[Math.floor(colorRand * colorRand * colors.length)], Math.random() * 0.4 + 0.2);
        const sizeRand = Math.random();
        g.drawCircle(i*spread + Math.random() * 100 - 50, j*spread + Math.random() * 100 - 50, sizeRand*sizeRand*sizeRand * 3);
      }
    }
    g.endFill();
  }, []);
  
  return (
    <Stage
      style={{userSelect: "none", outline: "none"}}
      onMouseMove={mouseMove}
      onMouseDown={mouseClick}
      tabIndex={1}
      autoFocus
      onKeyDown={keyDown}
      onKeyUp={keyUp}
      width={WIDTH} height={HEIGHT}
    >
      <ZoomableContainer anchor={0.5} desiredPos={desiredPos} defaultZoom={1} desiredZoom={deziredZoom}>
        <Graphics draw={draw} />
        <PlayerObject bugout={bugout} keyboard={keyboard} player={state.player} dispatch={dispatch}></PlayerObject>
        {Object.values(state.otherPlayers).filter((p) => p.address !== myAddress.current).map((player) => (
          <EntityObject key={player.address} player={player}></EntityObject>
        ))}
        {state.bullets.map((bullet) => (
          <BulletObject key={bullet.address} dispatch={dispatch} bullet={bullet}></BulletObject>
        ))}
      </ZoomableContainer>
    </Stage>
  )
}

export default GameCanvas