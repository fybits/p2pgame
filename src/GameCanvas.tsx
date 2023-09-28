import { KeyboardEvent, useCallback, useContext, useRef, useState } from "react"
import { Text, Graphics, _ReactPixi } from '@pixi/react';
import PlayerObject from "./PlayerObject";
import { GameStateContext } from "./GameState";
import EntityObject from "./EntityObject";
import ZoomableContainer from "./ZoomableContainer";
import BulletObject from "./BulletObject";
import { Stage } from "./Stage";
import { Vector, vectorLength } from "./vector";
import { PeerRoom } from './PeerRoom';

interface GameCanvasProps {
  peerRoom: React.MutableRefObject<PeerRoom>
  myAddress: React.MutableRefObject<string>;
  addressToNickname: React.MutableRefObject<Map<string, string>>;
}

const WIDTH = 1280;
const HEIGHT = 720;


const GameCanvas = ({ peerRoom, myAddress, addressToNickname }: GameCanvasProps) => {
  const { state, dispatch } = useContext(GameStateContext);
  const [cameraMode, setCameraMode] = useState(true);
  const keyboard = useRef<Map<string, number>>(new Map<string, number>());
  const mouse = useRef<{ position: Vector, pressed: boolean }>({ position: { x: 0, y: 0 }, pressed: false });

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
    mouse.current.position = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  const mouseDown = (event) => {
    if (event.button === 0) {
      mouse.current.pressed = true;
    }
  }

  const mouseUp = (event) => {
    if (event.button === 0) {
      mouse.current.pressed = false;
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
    desiredPos = { x: (WIDTH / 2 - averageX * deziredZoom), y: (HEIGHT / 2 - averageY * deziredZoom) };
  }

  const f = 8500;

  if (cameraMode) {
    deziredZoom = Math.min(0.8, f / vectorLength(state.player.velocity));
    const cameraOffset = { x: state.player.position.x + state.player.velocity.x / 20, y: state.player.position.y + state.player.velocity.y / 20 };
    desiredPos = { x: (WIDTH / 2 - cameraOffset.x * deziredZoom), y: (HEIGHT / 2 - cameraOffset.y * deziredZoom) };
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
        g.drawCircle(i * spread + Math.random() * 100 - 50, j * spread + Math.random() * 100 - 50, sizeRand * sizeRand * sizeRand * 3);
      }
    }
    g.endFill();
  }, []);
  // const textStyles: _ReactPixi.IText { fill: 'white' }
  return (
    <Stage
      style={{ userSelect: "none", outline: "none" }}
      onMouseMove={mouseMove}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      tabIndex={1}
      autoFocus
      onKeyDown={keyDown}
      onKeyUp={keyUp}
      width={WIDTH} height={HEIGHT}
    >
      <ZoomableContainer mouse={mouse} myAddress={myAddress} peerRoom={peerRoom} anchor={0.5} desiredPos={desiredPos} defaultZoom={1} desiredZoom={deziredZoom}>
        <Graphics draw={draw} />
        <PlayerObject bullets={state.bullets} peerRoom={peerRoom} keyboard={keyboard} player={state.player} dispatch={dispatch}></PlayerObject>
        {Object.values(state.otherPlayers).filter((p) => p.address !== myAddress.current).map((player) => (
          <EntityObject key={player.address} player={player}></EntityObject>
        ))}
        {state.bullets.map((bullet) => (
          <BulletObject key={bullet.address} dispatch={dispatch} bullet={bullet}></BulletObject>
        ))}
      </ZoomableContainer>
      <Text x={10} text={Object.entries(state.scoreBoard).map(([addr, val]) => (
        `${addressToNickname.current.get(addr)}: ${val}`
      )).join('\n')} style={{ fill: 'white' } as any}></Text>
    </Stage>
  )
}

export default GameCanvas