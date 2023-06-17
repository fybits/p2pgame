import { useEffect, useRef, useState } from 'react';
import Bugout from 'bugout';
import './App.css';
import GameCanvas from './GameCanvas';
import { useGameStateContext } from './GameState';
import { updateOtherPlayerAction } from './GameStateActions';

const trackers = [
  'ws://tracker.files.fm:7072',
  'wss://tracker.files.fm:7073',
  'ws://tracker.btsync.cf:233',
  'ws://tracker.btsync.cf:2710',
  'ws://tracker.btsync.cf:6969',
  'ws://hub.bugout.link',
  'wss://hub.bugout.link',
  'ws://tracker.lab.vvc.niif.hu',
  'wss://tracker.lab.vvc.niif.hu',
]

interface Message {
  body: string,
  sender: string,
}


function App() {
  const [lobbyKey, setLobbyKey] = useState('lobby');
  const [nickname, setNickname] = useState('Jone');
  const [myAddress, setMyAddress] = useState('');
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);

  const {state, dispatch} = useGameStateContext();

  const b = useRef<Bugout | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);

  const myAddressRef = useRef<string>(myAddress);
  const addressToNickname = useRef<Map<string, string>>(new Map<string, string>());

  const leaveLobby = () => {
    if (b.current) {
      // b.current.close();
      b.current.destroy((...rest) => console.log(rest))
    }
    setConnected(false);
  }

  const connectToLobby = () => {
    b.current = new Bugout(lobbyKey,{
      announce: trackers,
      seed: JSON.parse(localStorage.getItem("bugout-seed") || '""'),
    });
    console.log('Connecting to', lobbyKey);
    setConnected(true);
    setMessages([]);
    if (b.current) {
      const addr = b.current.address();
      setMyAddress(addr);
      myAddressRef.current = addr;
      
      b.current.on("message", function(address, { type, message }) {
        switch (type) {
          case 'chat':
            setMessages((messages) => [...messages, { body: message, sender: addressToNickname.current.get(address)! }]);
            break;
          case 'player_state':
            if (state.otherPlayers.has(address)) {
              const p = state.otherPlayers.get(address);
              message.oldPosition = p?.position;
              message.oldTime = p?.time;
              message.address = address;
            }
            message.time = Date.now();
            dispatch(updateOtherPlayerAction(address, message));
            break;
          case 'announce':
            addressToNickname.current.set(address, message);
            setMessages((messages) => [...messages, { body: "Connected!", sender: addressToNickname.current.get(address)! }]);
            break;
        }
      })
      b.current.on("seen", function(address) {
        console.log(address, 'connected');
        if (b.current) {
          b.current.send({ type: 'announce', message: nickname });
        }
      });
      localStorage["bugout-seed"] = JSON.stringify(b.current.seed);
    }
  };

  const sendMessage = () => {
    if (b.current && message.trim().length > 0) {
      b.current.send({ type: 'chat', message });
      setMessage('');
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (b.current) {
        b.current.send({ type: 'player_state', message: state.player });
      }
    }, 1000/10);
    return () => {
      if (b.current) {
        b.current.close();
      }
      clearInterval(id);
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

      <div className="row">
        {connected && <GameCanvas myAddress={myAddressRef}></GameCanvas>}
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
