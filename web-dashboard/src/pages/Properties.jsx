import { useEffect, useState } from 'react';
import { getProperties, startJob, stopJob } from '../services/api';

export default function Properties({ token }) {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    getProperties(token).then(setProperties);
  }, [token]);

  const handleStartJob = (id) => startJob(id, token).then(console.log);
  const handleStopJob = (id) => stopJob(id, token).then(console.log);

  return (
    <div>
      <h2>Properties</h2>
      <ul>
        {properties.map(prop => (
          <li key={prop.id}>
            {prop.name} - {prop.address}
            <button onClick={() => handleStartJob(prop.id)}>Start Job</button>
            <button onClick={() => handleStopJob(prop.id)}>Stop Job</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
