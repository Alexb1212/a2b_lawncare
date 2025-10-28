
import { useEffect, useRef, useState } from 'react';
import { getProperties, startJobForProperty, stopJob, savePropertyNotes } from '../services/api';

export default function Properties({ token, role = 'crew' }) {
  const [properties, setProperties] = useState([]);
  const [jobDurations, setJobDurations] = useState({});
  const intervalsRef = useRef({});

  useEffect(() => {
    load();
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, [token]);

  const load = async () => {
    const data = await getProperties(token);
    setProperties(Array.isArray(data) ? data : []);
    const newDurations = {};
    (data || []).forEach(p => {
      if (p.current_job?.id) {
        newDurations[p.current_job.id] = p.current_job.duration_minutes || 0;
      }
    });
    setJobDurations(newDurations);
    (data || []).forEach(p => {
      if (p.current_job?.id) {
        const jobId = p.current_job.id;
        if (!intervalsRef.current[jobId]) {
          intervalsRef.current[jobId] = setInterval(() => {
            setJobDurations(prev => ({ ...prev, [jobId]: (prev[jobId] || 0) + 1 }));
          }, 60000);
        }
      }
    });
  };

  const onStart = async (propertyId) => {
    const res = await startJobForProperty(propertyId, token);
    if (res?.id) {
      const jobId = res.id;
      setJobDurations(prev => ({ ...prev, [jobId]: 0 }));
      if (!intervalsRef.current[jobId]) {
        intervalsRef.current[jobId] = setInterval(() => {
          setJobDurations(prev => ({ ...prev, [jobId]: (prev[jobId] || 0) + 1 }));
        }, 60000);
      }
      alert('Job started');
      await load();
    } else {
      alert(res?.error || 'Failed to start job');
    }
  };

  const onStop = async (jobId) => {
    const res = await stopJob(jobId, token);
    if (intervalsRef.current[jobId]) {
      clearInterval(intervalsRef.current[jobId]);
      delete intervalsRef.current[jobId];
    }
    if (res?.duration_minutes != null) {
      setJobDurations(prev => ({ ...prev, [jobId]: res.duration_minutes }));
      alert(`Job stopped. Duration: ${res.duration_minutes.toFixed(1)} min`);
    } else if (res?.error) {
      alert(res.error);
    }
    await load();
  };

  const onSaveNotes = async (propertyId, currentNotes) => {
    const notes = prompt('Update notes', currentNotes || '') ?? currentNotes;
    const saved = await savePropertyNotes(propertyId, notes, token);
    if (saved?.id) await load(); else alert(saved?.error || 'Failed to save notes');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Properties</h2>
      <ul className="space-y-3">
        {properties.map(p => {
          const jobId = p.current_job?.id;
          const running = Boolean(jobId);
          const duration = running ? (jobDurations[jobId] || 0) : null;
          return (
            <li key={p.id} className="p-3 bg-white rounded border">
              <div className="font-semibold">{p.name}</div>
              <div className="text-gray-600">{p.address}</div>
              {p.notes && <div className="text-gray-500 mt-1">Notes: {p.notes}</div>}
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {running ? (
                  <>
                    <span className="text-sm text-green-700">
                      Running • {p.current_job?.name || 'Job'} • {typeof duration === 'number' ? duration.toFixed(1) : duration} min
                    </span>
                    {role !== 'viewer' && (
                      <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => onStop(jobId)}>Stop</button>
                    )}
                  </>
                ) : (
                  role !== 'viewer' && (
                    <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => onStart(p.id)}>Start</button>
                  )
                )}
                {(role === 'admin' || role === 'manager') && (
                  <button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={() => onSaveNotes(p.id, p.notes)}>Edit Notes</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
