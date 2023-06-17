import { Address, Entity, Vector } from "./types"

export enum ActionKind {
  UpdateOtherPlayer = 'UpdateOtherPlayer',
  UpdatePlayer = 'UpdatePlayer',
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