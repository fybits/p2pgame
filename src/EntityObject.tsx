import { Sprite, TilingSprite, useTick } from '@pixi/react';
import { useState } from 'react';
import { Vector } from './vector';

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const EntityObject = ({ player }) => {
  const [interpolatedPos, setInterpolatedPos] = useState<Vector>(player.position);
  const [interpolatedRotation, setInterpolatedRotation] = useState<number>(player.rotation);

  useTick((dt) => {
    const time = Date.now();
    const t = (time - player?.time!) / (player?.time! - (player?.oldTime || 0));
    const x = lerp(player.oldPosition?.x || 0, player.position.x, t);
    const y = lerp(player.oldPosition?.y || 0, player.position.y, t);
    const angle = lerp(player.oldRotation || 0, player.rotation, t);
    setInterpolatedPos({ x, y });
    setInterpolatedRotation(angle);
  });

  return (
    <>
      <TilingSprite
        image={'/p2pgame/long-ray.png'}
        width={100}
        height={5}
        x={interpolatedPos.x - 50}
        y={interpolatedPos.y - 60}
        tilePosition={{ x: 0, y: 0 }}
        tileScale={{ x: 0.15, y: 0.1 }}
        tint={'FF0000'}
      />
      <TilingSprite
        image={'/p2pgame/long-ray.png'}
        width={player.health}
        height={12}
        x={player.position.x - 50}
        y={player.position.y - 64}
        tilePosition={{ x: 0, y: 0 }}
        tileScale={{ x: 0.15, y: 0.1 }}
        tint={'00FF00'}
      />
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
    </>
  );
};

export default EntityObject;
