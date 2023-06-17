import { Sprite, useTick } from '@pixi/react';
import { Vector } from './types';
import { useState } from 'react';

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const Entity = ({ player }) => {
  const [interpolatedPos, setInterpolatedPos] = useState<Vector>(player.position);

  useTick(dt => {
    const time = Date.now();
    const t = (time - player?.time!) / (player?.time! - (player?.oldTime || 0));
    const x = lerp(player.oldPosition?.x || 0, player.position.x, t);
    const y = lerp(player.oldPosition?.y || 0, player.position.y, t);
    setInterpolatedPos({ x, y });
  });

  return (
    <Sprite
      image="/p2pgame/logo192.png"
      tint={0xff0000}
      anchor={0.5}
      width={20}
      height={20}
      x={interpolatedPos.x}
      y={interpolatedPos.y}
    />
  );
};

export default Entity