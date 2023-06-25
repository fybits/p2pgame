import { Sprite, useTick } from '@pixi/react';
import Bugout from 'bugout';
import { Action, ActionKind } from './GameStateActions';
import { Vector, distance } from './vector';
import { Entity } from './types';
import { initialState } from './GameState';

const speed = 150;
let i = 0;

interface PlayerObjectProps {
  bugout: React.MutableRefObject<Bugout>;
  keyboard: React.MutableRefObject<Map<string,number>>;
  player: Entity;
  bullets: Entity[];
  dispatch: React.Dispatch<Action>;
}

const PlayerObject = ({ bugout, keyboard, player, bullets, dispatch }: PlayerObjectProps) => {
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
    const rotation = (player.rotation + d.x * dt * 2) % 360;
    const newPos = {
      x: player.position.x + player.velocity.x * dt / 1000,
      y: player.position.y + player.velocity.y * dt / 1000,
    };
    dispatch({
      type: ActionKind.UpdatePlayer,
      payload: {
        position: newPos,
        velocity: {
          x: player.velocity.x * 0.99 + speed * d.y * Math.cos(Math.PI/180*rotation),
          y: player.velocity.y * 0.99 + speed * d.y * Math.sin(Math.PI/180*rotation),
        },
        rotation: rotation,
      }
    });
    for (const b of bullets) {
      if (!b.address.startsWith(player.address) && !b.deleted){
        if (distance(player.position, b.position) < 40) {
          bugout.current.send({ type: 'bullet_collided', message: b });
          const newPlayer: Entity = { ...player }
          newPlayer.health -= 5;
          if (newPlayer.health < 0) {
            newPlayer.position = {...initialState.player.position};
            newPlayer.velocity = {...initialState.player.velocity};
            newPlayer.health = initialState.player.health;
            newPlayer.rotation = initialState.player.rotation;
            bugout.current.send({ type: 'kill', message: { killer: b.address.split('_')[0], target: player.address } });
          }
          dispatch({ 
            type: ActionKind.UpdatePlayer,
            payload: newPlayer,
          });
        }
      }
    }
  });

  return (
    <Sprite
      image="/p2pgame/spaceship_sprite.png"
      anchor={0.5}
      width={48}
      height={48}
      x={player.position.x}
      y={player.position.y}
      angle={player.rotation - 90}
    />
  );
};

export default PlayerObject