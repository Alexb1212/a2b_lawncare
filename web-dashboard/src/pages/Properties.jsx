import { useEffect, useState } from 'react';
import { getProperties, startJob, stopJob } from '../services/api';

export default function Properties({ token }) {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadProperties();
  }, [token]);

  const loadProperties = async () => {
    const data = await getProperties(token);
    setProperties(data);
  };

  const handleStartJob = async (id) => {
    await startJob(id, token);
    alert('Job started');
  };

  const handleStopJob = async (id) => {
    await stopJob(id, token);
    alert('Job stopped');
  };

  const handleEditNote = (id, currentNote) => {
    setEditingId(id);
    setNoteText(currentNote);
  };

  const handleSaveNote = async (id) => {
    // Call API to save notes (you’ll need to add route backend /properties/:id)
    await fetch(`http://localhost:5001/api/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ notes: noteText })
    });
    setEditingId(null);
    loadProperties();
  };

  return (
    <div>
      <h2>Properties</h2>
      <ul>
        {properties.map(prop => (
          <li key={prop.id}>
            <strong>{prop.name}</strong> - {prop.address} <br />
            Notes: {editingId === prop.id ? (
              <>
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <button onClick={() => handleSaveNote(prop.id)}>Save</button>
              </>
            ) : (
              <>
                {prop.notes || 'No notes'}
                <button onClick={() => handleEditNote(prop.id, prop.notes)}>Edit</button>
              </>
            )}
            <br />
            <button onClick={() => handleStartJob(prop.id)}>Start Job</button>
            <button onClick={() => handleStopJob(prop.id)}>Stop Job</button>
            <button onClick={() => alert('Invoice placeholder')}>Invoice</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

