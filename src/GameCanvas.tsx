import { KeyboardEvent, useEffect, useRef } from "react"
import { Container, Stage } from '@pixi/react';
import Player from "./Player";

interface GameCanvasProps {
  myAddress: React.MutableRefObject<string>;
}

// function lerp(start, end, t) {
//   return start * (1 - t) + end * t;
// }

const GameCanvas = ({ myAddress }: GameCanvasProps) => {
  // const { state, dispatch } = useGameStateContext();
  const keyboard = useRef<Map<string,number>>(new Map<string,number>());

  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 1;
  }
  const keyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    keyboard.current[event.key] = 0;
  }

  useEffect( () => {

    // if (canvas.current) {
    //   canvas.current.focus();
    //   setInterval(() => {
    //     if (canvas.current) {
    //       const gl = canvas.current.getContext("webgl")!;
    //       handleInput();
    //       const time = Date.now();
    //       player.current.velocity.x *= 0.95;
    //       player.current.velocity.y *= 0.95;
    //       player.current.position.x += player.current.velocity.x * dt / 1000;
    //       player.current.position.y += player.current.velocity.y * dt / 1000;
    //       // ctx.fillStyle = "black";
    //       // ctx.fillRect(0,0, canvas.current.width, canvas.current.height)
    //       // ctx.fillStyle = "white";
    //       // ctx.fillRect(player.current.position.x, player.current.position.y, 10, 10);
    //       // if (players.current) {
    //       //   ctx.fillStyle = "red";
    //       //   for (const [addr, entity] of players.current.entries()) {
    //       //     if (addr !== myAddress.current) {
    //       //       const t = (time - entity?.time!) / (entity?.time! - (entity?.oldTime || 0));
    //       //       const x = lerp(entity.oldPosition?.x || 0, entity.position.x, t);
    //       //       const y = lerp(entity.oldPosition?.y || 0, entity.position.y, t);
    //       //       ctx.fillRect(x, y, 10, 10);
    //       //     }
    //       //   }
    //       // }
    //       if (gl !== null) {
    //         gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //         // Clear the color buffer with specified clear color
    //         gl.clear(gl.COLOR_BUFFER_BIT);
    //       }
    //     }
    //   }, dt);
    // }
  }, [])

  return (
    // <canvas tabIndex={1} autoFocus onKeyDown={keyDown} onKeyUp={keyUp}  width={800} height={600} ref={canvas}>
    // </canvas>
    <Stage width={800} height={600}>
      <Container x={150} y={150}>
        <Player keyboard={keyboard}></Player>

      </Container>
    </Stage>
  )
}

export default GameCanvas