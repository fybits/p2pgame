import { Address, Entity } from "./types"
import { Vector } from "./vector"

export enum ActionKind {
  UpdateOtherPlayer = 'UpdateOtherPlayer',
  UpdatePlayer = 'UpdatePlayer',
  ShootBullet = 'ShootBullet',
  UpdateBullet = 'UpdateBullet',
  UpdateScoreBoard = 'UpdateScoreBoard',
  RemovePlayer = 'RemovePlayer'
}

export type Action = {
  type: ActionKind,
  payload: any,
}


export const updateOtherPlayerAction = (address: Address, player: Entity): Action => {
  return {
    type: ActionKind.UpdateOtherPlayer,
    payload: { address, player }
  }
}

export const updatePlayerVelocity = (velocity: Vector): Action => {
  return {
    type: ActionKind.UpdatePlayer,
    payload: { velocity },
  }
}