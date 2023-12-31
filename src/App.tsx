import { useContext, useEffect, useRef, useState } from 'react';
import './App.css';
import GameCanvas from './GameCanvas';
import { GameStateContext } from './GameState';
import { ActionKind, updateOtherPlayerAction } from './GameStateActions';
import { PeerRoom } from './PeerRoom';

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

  const peerRoom = useRef<PeerRoom | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);

  const myAddressRef = useRef<string>(myAddress);

  const leaveLobby = () => {
    if (peerRoom.current) {
      peerRoom.current.destroy()
      peerRoom.current = undefined;
    }
    setConnected(false);
  }

  const connectToLobby = (isHosting: boolean) => {
    peerRoom.current = new PeerRoom(nickname);

    if (!isHosting) {
      peerRoom.current.connectToMember(lobbyKey);
    }

    setConnected(true);
    setMessages([]);

    const addr = peerRoom.current.address();
    setMyAddress(addr);
    myAddressRef.current = addr;
    dispatch({
      type: ActionKind.UpdatePlayer,
      payload: { address: addr },
    })
    peerRoom.current.on("message", (address, { type, message }) => {
      switch (type) {
        case 'chat':
          setMessages((messages) => [...messages, { body: message, sender: address }]);
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
          setMessages((messages) => [...messages, { body: `killed ${message.target}`, sender: message.killer }]);
          dispatch({
            type: ActionKind.UpdateScoreBoard,
            payload: { killer: message.killer }
          })
          break;
        case 'announce':
          setMessages((messages) => [...messages, { body: "Connected!", sender: address }]);
          break;
        case 'player-disconnected':
          dispatch({
            type: ActionKind.RemovePlayer,
            payload: { address }
          });
          break;
      }
    });

    localStorage["nickname"] = nickname;
  };

  const sendMessage = () => {
    if (peerRoom.current && message.trim().length > 0) {
      peerRoom.current.send({ type: 'chat', message });
      setMessage('');
    }
  }

  useEffect(() => {
    return () => {
      if (peerRoom.current) {
        peerRoom.current.destroy();
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
          <button disabled={nickname.trim().length === 0} onClick={() => connectToLobby(true)}>Host</button>
          <br />
          or join the game
          <br />
          <br />
          <label>
            Lobby Name
            <input onChange={(e) => setLobbyKey(e.target.value)} value={lobbyKey}></input>
          </label>
          <button disabled={nickname.trim().length === 0 || lobbyKey.length === 0} onClick={() => connectToLobby(false)}>Join</button>
        </div>
      ) :
        <div className="row">
          <div>{lobbyKey}</div>
          <button onClick={leaveLobby}>Leave</button>
        </div>
      }

      <div className="row game-window">
        {connected && <div>
            <GameCanvas peerRoom={peerRoom} myAddress={myAddressRef}/>
            <div><kbd>A</kbd>/<kbd>D</kbd> - turn, <kbd>W</kbd>/<kbd>S</kbd> - move, <kbd>Tab</kbd> - switch camera, <kbd>F</kbd> - toggle fullscreen</div>
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
