import { useEffect, useState } from 'react';
import { getProperties, startJob, stopJob } from '../services/api';

export default function Properties({ token }) {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [jobDurations, setJobDurations] = useState({}); // Track job durations

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, [token]);

  const loadProperties = async () => {
    const data = await getProperties(token);
    setProperties(data);
  };

  // Job start
  const handleStartJob = async (id) => {
    await startJob(id, token);
    alert('Job started');
  };

  // Job stop + duration
  const handleStopJob = async (id) => {
    const result = await stopJob(id, token);
    setJobDurations(prev => ({ ...prev, [id]: result.duration_minutes }));
    alert(`Job stopped! Duration: ${result.duration_minutes.toFixed(1)} min`);
  };

  // Edit notes
  const handleEditNote = (id, currentNote) => {
    setEditingId(id);
    setNoteText(currentNote || '');
  };

  // Save notes (PATCH request)
  const handleSaveNote = async (id) => {
    await fetch(`http://localhost:5001/api/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ notes: noteText })
    });
    setEditingId(null);
    loadProperties(); // Refresh after saving
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Properties</h2>
      <ul className="space-y-4">
        {properties.map(prop => (
          <li key={prop.id} className="p-4 border rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <strong>{prop.name}</strong> - {prop.address}
                <div className="mt-2">
                  Notes: {editingId === prop.id ? (
                    <>
                      <input
                        type="text"
                        className="border p-1 rounded mr-2"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                      />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleSaveNote(prop.id)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {prop.notes || 'No notes'}
                      <button
                        className="ml-2 bg-gray-500 text-white px-2 py-1 rounded"
                        onClick={() => handleEditNote(prop.id, prop.notes)}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>

                {/* Job duration */}
                {jobDurations[prop.id] && (
                  <div className="mt-1 text-sm text-green-700">
                    Duration: {jobDurations[prop.id].toFixed(1)} min
                  </div>
                )}
              </div>

              <div className="space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleStartJob(prop.id)}
                >
                  Start Job
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleStopJob(prop.id)}
                >
                  Stop Job
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => alert('Invoice placeholder')}
                >
                  Invoice
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
