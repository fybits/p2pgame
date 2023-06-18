import { Sprite, useTick } from '@pixi/react';
import { ActionKind } from './GameStateActions';


const BulletObject = ({ bullet, dispatch }) => {
  useTick(dt => {
    const newPos = {
      x: bullet.position.x + bullet.velocity.x * dt / 1000,
      y: bullet.position.y + bullet.velocity.y * dt / 1000,
    };
    dispatch({
      type: ActionKind.UpdateBullet,
      payload: {
        address: bullet.address,
        position: newPos,
      }
    });
  });
  return (
    <Sprite
      image="/p2pgame/long-ray.png"
      anchor={0.5}
      width={8}
      height={64}
      x={bullet.position.x}
      y={bullet.position.y}
      angle={bullet.rotation - 90}
    />
  );
};

export default BulletObject