import { Sprite, useTick } from '@pixi/react';
import { Vector } from './types';
import { useState } from 'react';

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const Entity = ({ player }) => {
  const [interpolatedPos, setInterpolatedPos] = useState<Vector>(player.position);
  const [interpolatedRotation, setInterpolatedRotation] = useState<number>(player.rotation);

  useTick(dt => {
    const time = Date.now();
    const t = (time - player?.time!) / (player?.time! - (player?.oldTime || 0));
    const x = lerp(player.oldPosition?.x || 0, player.position.x, t);
    const y = lerp(player.oldPosition?.y || 0, player.position.y, t);
    const angle = lerp(player.oldRotation || 0, player.rotation, t);
    setInterpolatedPos({ x, y });
    setInterpolatedRotation(angle)
  });

  return (
    <Sprite
      image="/p2pgame/spaceship_sprite.png"
      tint={0xff0000}
      anchor={0.5}
      width={48}
      height={48}
      x={interpolatedPos.x}
      y={interpolatedPos.y}
      angle={interpolatedRotation - 90}
    />
  );
};

export default Entity