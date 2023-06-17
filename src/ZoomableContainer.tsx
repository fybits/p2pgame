import { Container, useTick } from '@pixi/react'
import React, { useState } from 'react'

const ZoomableContainer = ({ defaultZoom, desiredZoom, desiredPos, children, ...props }) => {
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  useTick((dt) => {
    const dZoom = (desiredZoom - currentZoom);
    setCurrentZoom(currentZoom + dZoom * dt / 15);
    const dPos = { x: desiredPos.x - currentPos.x, y: desiredPos.y - currentPos.y };
    setCurrentPos({ x: currentPos.x + dPos.x * dt / 15, y: currentPos.y + dPos.y * dt / 15 });
  });

  return (
    <Container position={currentPos} scale={currentZoom} {...props}>{children}</Container>
  )
}

export default ZoomableContainer