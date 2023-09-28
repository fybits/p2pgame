import { useContext, useEffect, useRef, useState } from 'react';
import Bugout from 'bugout';
import './App.css';
import GameCanvas from './GameCanvas';
import { GameStateContext } from './GameState';
import { ActionKind, updateOtherPlayerAction } from './GameStateActions';
import { PeerRoom } from './PeerRoom';

const trackers = [
  'ws://tracker.files.fm:7072',
  'wss://tracker.files.fm:7073',
  // 'ws://tracker.btsync.cf:233',
  // 'ws://tracker.btsync.cf:2710',
  // 'ws://tracker.btsync.cf:6969',
  // 'ws://hub.bugout.link',
  // 'wss://hub.bugout.link',
  // 'ws://tracker.lab.vvc.niif.hu',
  // 'wss://tracker.lab.vvc.niif.hu',
]

interface Message {
  body: string,
  sender: string,
}


function App() {
  const [lobbyKey, setLobbyKey] = useState('lobby');
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || 'Jone');
  const [myAddress, setMyAddress] = useState('');
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);

  const {state, dispatch} = useContext(GameStateContext);

  const b = useRef<PeerRoom | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);

  const myAddressRef = useRef<string>(myAddress);
  const addressToNickname = useRef<Map<string, string>>(new Map<string, string>());

  const leaveLobby = () => {
    if (b.current) {
      b.current.destroy()
      b.current = undefined;
    }
    setConnected(false);
  }

  const connectToLobby = () => {
    b.current = new PeerRoom(nickname);

    if (!nickname.startsWith('init')) {
      console.log(nickname, 'Connecting to', lobbyKey);
      setTimeout(() => b.current.connectToMember(lobbyKey), 3000);
    }

    setConnected(true);
    setMessages([]);

    const addr = b.current.address();
    setMyAddress(addr);
    myAddressRef.current = addr;
    dispatch({
      type: ActionKind.UpdatePlayer,
      payload: { address: addr },
    })
    b.current.on("message", (address, { type, message }) => {
      switch (type) {
        case 'chat':
          setMessages((messages) => [...messages, { body: message, sender: addressToNickname.current.get(address)! }]);
          break;
        case 'player_state':
          if (state.otherPlayers[address]) {
            const p = state.otherPlayers[address];
            message.oldPosition = p?.position;
            message.oldRotation = p?.rotation;
            message.oldTime = p?.time;
            message.address = address;
          }
          message.address = address;
          message.time = Date.now();
          dispatch(updateOtherPlayerAction(address, message));
          break;
        case 'bullet_shot':
          dispatch({
            type: ActionKind.ShootBullet,
            payload: message,
          });
          break;
        case 'bullet_collided':
          dispatch({
            type: ActionKind.UpdateBullet,
            payload: { address: message.address, deleted: true },
          })
          break;
        case 'kill':
          setMessages((messages) => [...messages, { body: `killed ${addressToNickname.current.get(message.target)}`, sender: addressToNickname.current.get(message.killer)! }]);
          dispatch({
            type: ActionKind.UpdateScoreBoard,
            payload: { killer: message.killer }
          })
          break;
        case 'announce':
          addressToNickname.current.set(address, message);
          setMessages((messages) => [...messages, { body: "Connected!", sender: addressToNickname.current.get(address)! }]);
          break;
      }
    });

    localStorage["nickname"] = nickname;
  };

  const sendMessage = () => {
    if (b.current && message.trim().length > 0) {
      b.current.send({ type: 'chat', message });
      setMessage('');
    }
  }

  useEffect(() => {
    return () => {
      if (b.current) {
        b.current.destroy();
      }
    }
  }, [])

  return (
    <div className="App">
      {!connected ? (
        <div className="join-form col">
          <label>
            Nickname
            <input onChange={(e) => setNickname(e.target.value)} value={nickname}></input>
          </label>
          <label>
            Lobby Name
            <input onChange={(e) => setLobbyKey(e.target.value)} value={lobbyKey}></input>
          </label>
          <button disabled={nickname.trim().length === 0 || lobbyKey.length === 0} onClick={connectToLobby}>Join</button>
        </div>
      ) :
        <div className="row">
          <div>{lobbyKey}</div>
          <button onClick={leaveLobby}>Leave</button>
        </div>
      }

      <div className="row game-window">
        {connected && <div>
            <GameCanvas bugout={b} myAddress={myAddressRef} addressToNickname={addressToNickname}></GameCanvas>
            <div><kbd>A</kbd>/<kbd>D</kbd> - turn, <kbd>W</kbd>/<kbd>S</kbd> - move, <kbd>Tab</kbd> - switch camera</div>
          </div>
        }
        {connected &&(
          <div className="chat col flex-end">
            <div>
              {messages.map((message, index) => <div key={index}><b>{message.sender}:</b> {message.body}</div>).reverse()}
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
                <input onSubmit={sendMessage} onChange={(e) => setMessage(e.target.value)} value={message}></input>
              <button onClick={sendMessage}>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
