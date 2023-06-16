import React, { useEffect, useRef, useState } from 'react';
import Bugout from 'bugout';
import './App.css';
import GameCanvas from './GameCanvas.tsx';
import { Entity, Vector } from './types';

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

  const b = useRef<Bugout | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const player = useRef<Entity>({
    address: '',
    velocity: { x: 0, y: 0 },
    position: { x: 400, y: 300 },
  });
  const myAddressRef = useRef<string>(myAddress);
  const players = useRef<Map<string, Entity>>(new Map<string, Entity>());
  const addressToNickname = useRef<Map<string, string>>(new Map<string, string>());

  const leaveLobby = () => {
    if (b.current) {
      b.current.close();
    }
    setConnected(false);
  }

  const connectToLobby = () => {
    if (b.current) {
      b.current.close();
    }
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
            if (players.current.has(address)) {
              const p = players.current.get(address);
              message.oldPosition = p?.position;
              message.oldTime = p?.time;
              message.address = address;
            }
            message.time = Date.now();
            players.current.set(address, message);
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
        b.current.send({ type: 'player_state', message: player.current });
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
      {!connected && <div className="join-form col">
        <label>
          Nickname
          <input onChange={(e) => setNickname(e.target.value)} value={nickname}></input>
        </label>
        <label>
          Lobby Name
          <input onChange={(e) => setLobbyKey(e.target.value)} value={lobbyKey}></input>
        </label>
        <button onClick={connectToLobby}>Join</button>
      </div>}
      <button hidden={!connected} onClick={leaveLobby}>Leave</button>

      <div className="row">
        {connected && <GameCanvas myAddress={myAddressRef} player={player} players={players}></GameCanvas>}
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
