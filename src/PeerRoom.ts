import { DataConnection, Peer } from 'peerjs'

type DataEventData =
  | { type: 'members-list', message: string[] }
  | { type: 'chat' | 'announce', message: string }
  | { type: 'player_state' | 'bullet_shot' | 'bullet_collided' | 'kill', message: any }

export class PeerRoom {
  private members: DataConnection[] = [];
  private peer: Peer;

  private listeners: ((address: string, data: DataEventData) => void)[] = []

  constructor(private userId: string) {
    this.peer = new Peer(userId);
    this.peer.on('connection', (member) => this.addDataConnectionEventHandlers(member))
  }

  private addDataConnectionEventHandlers(dc: DataConnection) {
    dc.on('open', () => {
      console.log('open')
      this.members.push(dc);
      dc.send({ type: 'members-list', data: this.members.map((m) => m.peer) });
      this.listeners.forEach((l) => l(dc.peer, { type: 'announce', message: dc.peer }));
    })

    dc.on('close', () => {
      console.log('close')
      this.members = this.members.filter((m) => m !== dc);
    });

    dc.on('data', (data: DataEventData) => {
      console.log('data')
      if (data.type === 'members-list') {
        data.message.forEach((peer) => {
          if (this.members.some(m => m.peer === peer)) {
            return
          };

          this.addDataConnectionEventHandlers(dc);
          this.members.push(this.peer.connect(peer));
        })
      }
    })
  }

  connectToExisting(userId: string)  {
    console.log('connectToExisting')
    this.peer.connect(userId);
  }

  destroy() {
    console.log('destroy')
    this.peer.destroy();
  }

  address() {
    return this.userId;
  }

  on(event: 'message', listener: (address: string, data: DataEventData) => void) {
    console.log('message')
    this.listeners.push(listener);
  }

  send(...arg: any) {
    console.log('send')
    this.members.forEach(m => m.send(arg))
  }
}