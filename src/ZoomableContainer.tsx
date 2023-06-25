import { Container, useTick } from '@pixi/react';
import React, { useContext, useState } from 'react';
import { Entity } from './types';
import { GameStateContext } from './GameState';
import { normalizedVector } from './vector';

let counter = 0;
const fireRate = 5;
let time = fireRate;

const sortedClamp = (num, a, b) => {
  if (a > b) {
    return Math.min(Math.max(num, b), a)
  }
  return Math.min(Math.max(num, a), b)
};

const ZoomableContainer = ({
  mouse, myAddress, defaultZoom, desiredZoom, desiredPos, children, bugout, ...props
}) => {
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);
  const [currentPos, setCurrentPos] = useState({x: 0, y: 0 });
  
  const { state } = useContext(GameStateContext);

  useTick((dt) => {
    const dZoom = (desiredZoom - currentZoom);
    setCurrentZoom(currentZoom + dZoom * dt / 15);
    const dPos = { x: desiredPos.x - currentPos.x, y: desiredPos.y - currentPos.y };
    setCurrentPos({ x: currentPos.x + dPos.x * dt / 15, y: currentPos.y + dPos.y * dt / 15 });

    time -= dt;
    if (bugout.current && mouse.current.pressed && time < 0) {
      time = fireRate;
      const angleRads = Math.PI/180*state.player.rotation;
      const angleRange = Math.PI/12;
      const playerDir = { x: -Math.cos(angleRads), y: -Math.sin(angleRads) };
      const playerDirLeft = { x: -Math.cos(angleRads - angleRange), y: -Math.sin(angleRads - angleRange) };
      const playerDirRight = { x: -Math.cos(angleRads + angleRange), y: -Math.sin(angleRads + angleRange) };
      const mousePos = { x: ( -currentPos.x + mouse.current.position.x) / currentZoom, y: ( -currentPos.y + mouse.current.position.y) / currentZoom }
      const perpOffset = { x: playerDir.y, y: -playerDir.x };
      const bulletOffset = counter % 2 === 0 ? { x: perpOffset.x , y: perpOffset.y } : { x: -perpOffset.x, y: -perpOffset.y };
      const bulletPos = { x: state.player.position.x + bulletOffset.x * 10 + playerDir.x * 50, y: state.player.position.y + bulletOffset.y * 10 + playerDir.y * 50 };
      const dir = { x: mousePos.x - bulletPos.x, y: mousePos.y - bulletPos.y };
      const dirNomalized = normalizedVector(dir);
      const dirClamped = {
        x: sortedClamp(dirNomalized.x, playerDirLeft.x, playerDirRight.x),
        y: sortedClamp(dirNomalized.y, playerDirLeft.y, playerDirRight.y),
      }
      const bullet: Entity = {
        address: `${myAddress.current}_${counter++}`,
        position: bulletPos,
        rotation: Math.atan2(dirClamped.y, dirClamped.x)*180/Math.PI,
        velocity: { x: dirClamped.x*25000, y: dirClamped.y*25000 },
        deleted: false,
      };
      bugout.current.send({ type: 'bullet_shot', message: bullet });
    }
  });
  

  return (
    <Container position={currentPos} scale={currentZoom} {...props}>
      {children}
    </Container>
  )
}

export default ZoomableContainer