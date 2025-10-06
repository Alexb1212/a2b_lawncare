import { useState } from 'react';
import Login from './pages/Login';
import Properties from './pages/Properties';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div>
      {!token ? (
        <Login onLogin={setToken} />
      ) : (
        <Properties token={token} />
      )}
    </div>
  );
}

export default App;
