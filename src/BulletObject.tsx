import { Sprite, useTick } from '@pixi/react';
import { Action, ActionKind } from './GameStateActions';
import { Entity } from './types';


interface BulletObjectProps {
  bullet: Entity;
  dispatch: React.Dispatch<Action>;
};

const BulletObject = ({ bullet, dispatch }: BulletObjectProps) => {
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
  if (!bullet.deleted) {
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
  } else return null;
};

export default BulletObject