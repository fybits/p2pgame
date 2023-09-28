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
    this.peer.on('open', (id) => console.log('local open', id))
    this.peer.on('connection', (member) => this.addDataConnectionEventHandlers(member))
  }

  private addDataConnectionEventHandlers(dc: DataConnection) {
    console.log('addDataConnectionEventHandlers')

    dc.on('open', () => {
      console.log('open');
      this.members.push(dc);
      dc.send({ type: 'members-list', message: this.members.map((m) => m.peer).filter(p => p !== dc.peer) });
      this.listeners.forEach((l) => l(dc.peer, { type: 'announce', message: dc.peer }));
    });

    dc.on('close', () => {
      console.log('close')
      this.members = this.members.filter((m) => m !== dc);
    });

    dc.on('data', (data: DataEventData) => {
      if (data.type === 'members-list') {
        console.log('members-list', data);

        data.message.forEach((peer) => {
          if (!this.members.some(m => m.peer === peer)) {
            this.connectToMember(peer)
          };
        })

        return
      }

      this.listeners.forEach((l) => {
        l(dc.peer, data);
      })
    })
  }

  connectToMember(userId: string)  {
    console.log('connectToMember')
    const dc = this.peer.connect(userId);
    this.addDataConnectionEventHandlers(dc);
  }

  destroy() {
    console.log('destroy')
    this.peer.destroy();
  }

  address() {
    return this.userId;
  }

  on(event: 'message', listener: (address: string, data: DataEventData) => void) {
    this.listeners.push(listener);
  }

  send(arg: any) {
    console.log('send')
    this.listeners.forEach(l => l(this.userId, arg))
    this.members.forEach(m => m.send(arg))
  }
}