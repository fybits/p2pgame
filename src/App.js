import { useRef, useState } from 'react';
import Bugout from 'bugout';
import './App.css';

function App() {
  const [lobbyKey, setLobbyKey] = useState('lobby');
  const b = useRef(null);

  const connectToLobby = () => {

  }

  return (
    <div className="App">
      <header className="App-header">
        <input onChange={(e) => setLobbyKey(e.target.value)} value={lobbyKey}></input>
        <button onClick={connectToLobby}>Connect</button>
      </header>
    </div>
  );
}

export default App;
