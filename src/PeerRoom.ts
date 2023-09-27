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
    console.log(this.peer.id)
    this.peer.on('open', (member) => {
      this.peer.on('connection', this.addDataConnectionEventHandlers)
      console.log(member)})
  }

  private addDataConnectionEventHandlers(dc: DataConnection) {
    console.log('add data connection')
    // dc.on('error', (e) => console.log(e))
    dc.on('open', () => {
      console.log('open')
      this.members.push(dc);
      dc.send({ type: 'members-list', data: this.members.map((m) => m.peer) });
      this.listeners.forEach((l) => l(dc.peer, { type: 'announce', message: dc.peer }));
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
    })

  }

  connectToExisting(userId: string)  {
    console.log('connectToExisting')
    const connection = this.peer.connect(userId);
    console.log(connection);
    // this.addDataConnectionEventHandlers(connection)
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
    // console.log('send')
    // console.log(this.peer)
    this.members.forEach(m => m.send(arg))
  }
}