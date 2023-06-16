import React, { KeyboardEvent, useEffect, useRef } from "react"
import { Entity, Vector } from "./types";

interface GameCanvasProps {
  myAddress: React.MutableRefObject<string>;
  player: React.MutableRefObject<Entity>;
  players: React.MutableRefObject<Map<string, Entity>>;
}

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const GameCanvas = ({ myAddress, player, players }: GameCanvasProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const keyboard = useRef<Map<string,number>>(new Map<string,number>());

  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 1;
  }
  const keyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 0;
  }

  const dt = 1000/30;
  const speed = 10;

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
    player.current.velocity.x += speed * d.x;
    player.current.velocity.y += speed * d.y;
  }


  useEffect( () => {
    console.log('game effect')

    if (canvas.current) {
      setInterval(() => {
        if (canvas.current) {
          const ctx = canvas.current.getContext("2d")!;
          handleInput();
          const time = Date.now();
          player.current.velocity.x *= 0.95;
          player.current.velocity.y *= 0.95;
          player.current.position.x += player.current.velocity.x * dt / 1000;
          player.current.position.y += player.current.velocity.y * dt / 1000;
          ctx.fillStyle = "black";
          ctx.fillRect(0,0, canvas.current.width, canvas.current.height)
          ctx.fillStyle = "white";
          ctx.fillRect(player.current.position.x, player.current.position.y, 10, 10);
          if (players.current) {
            ctx.fillStyle = "red";
            for (const [addr, entity] of players.current.entries()) {
              if (addr !== myAddress.current) {
                const t = (time - entity?.time!) / (entity?.time! - (entity?.oldTime || 0));
                console.log(t)
                // entity.position.x += entity.velocity.x * dt / 1000;
                // entity.position.y += entity.velocity.y * dt / 1000;
                const x = lerp(entity.oldPosition?.x || 0, entity.position.x, t);
                const y = lerp(entity.oldPosition?.y || 0, entity.position.y, t);
                // const x = entity.position.x;
                // const y = entity.position.y;
                ctx.fillRect(x, y, 10, 10);
              }
            }
          }
        }
      }, dt);
    }
  }, [])

  return (
    <canvas tabIndex={1} onKeyDown={keyDown} onKeyUp={keyUp}  width={800} height={600} ref={canvas}>

    </canvas>
  )
}

export default GameCanvas