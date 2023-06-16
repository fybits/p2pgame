import React, { useEffect, useRef, useState } from 'react';
import Bugout from 'bugout';
import './App.css';

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
  const [myAddress, setMyAddress] = useState('');
  const [message, setMessage] = useState('');
  const b = useRef<Bugout | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);

  const connectToLobby = () => {
    if (b.current) {
      b.current.close();
    }
    b.current = new Bugout(lobbyKey,{
      announce: trackers,
      seed: JSON.parse(localStorage.getItem("bugout-seed") || '""'),
    });
    console.log('Connecting to', lobbyKey);
    setMessages([]);
    if (b.current) {
      setMyAddress(b.current.address());
      b.current.on("message", function(address, message) {
        setMessages((messages) => [...messages, { body: message, sender: address }]);
      })
      b.current.on("seen", function(address) {
        setMessages((messages) => [...messages, { body: "Connected!", sender: address }]);
      });
      localStorage["bugout-seed"] = JSON.stringify(b.current.seed);
    }
  };

  const sendMessage = () => {
    if (b.current) {
      b.current.send(message);
      setMessage('');
    }
  }

  useEffect(() => {
    return () => {
      if (b.current) {
        b.current.close();
      }
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <input onChange={(e) => setLobbyKey(e.target.value)} value={lobbyKey}></input>
        <button onClick={connectToLobby}>Join</button>
        <span>{myAddress}</span>
      </header>
      <div>
        {messages.map((message, index) => <div key={index}><b>{message.sender}:</b> {message.body}</div>)}
      </div>
      <div>
        <input onChange={(e) => setMessage(e.target.value)} value={message}></input>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
