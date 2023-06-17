import { Sprite, useTick } from '@pixi/react';
import { Vector } from './types';
import { ActionKind, updatePlayerVelocity } from './GameStateActions';

const speed = 150;
let i = 0;

const Player = ({ bugout, keyboard, player, dispatch }) => {
  const handleInput = () => {
    const d: Vector = {x: 0, y: 0};
    if (keyboard.current['w'])
      d.y += - 1;
    if (keyboard.current['a'])
      d.x += -1;
    if (keyboard.current['s'])
      d.y += 1;
    if (keyboard.current['d'])
      d.x += 1;
    return d; 
  }

  useTick(dt => {
    const d = handleInput();
    i++;
    if (i % 10 === 0) {
      if (bugout.current) {
        bugout.current.send({ type: 'player_state', message: player });
      }
    } 
    dispatch(updatePlayerVelocity({
      x: player.velocity.x * 0.95 + speed * d.x,
      y: player.velocity.y * 0.95 + speed * d.y,
    }));
    const newPos = {
      x: player.position.x + player.velocity.x * dt / 1000,
      y: player.position.y + player.velocity.y * dt / 1000,
    };
    dispatch({
      type: ActionKind.UpdatePlayer,
      payload: { position: newPos }
    });
  });

  return (
    <Sprite
      image="/p2pgame/logo192.png"
      anchor={0.5}
      width={20}
      height={20}
      x={player.position.x}
      y={player.position.y}
    />
  );
};

export default Player