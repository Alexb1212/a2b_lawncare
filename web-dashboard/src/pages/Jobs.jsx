import { useEffect, useState } from 'react';
import { getJobs, createJob, startJobById, stopJobById, getProperties } from '../services/api';

export default function Jobs({ token, role }) {
  const [jobs, setJobs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ property_id: '', name: '' });
  const canCreate = role === 'admin' || role === 'manager';
  const canAct = role !== 'viewer';

  const load = async () => {
    const [j, p] = await Promise.all([getJobs(token), getProperties(token)]);
    setJobs(Array.isArray(j) ? j : []);
    setProperties(Array.isArray(p) ? p : []);
  };

  useEffect(() => { load(); }, [token]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.property_id) return alert('Pick a property');
    const res = await createJob({ property_id: Number(form.property_id), name: form.name || undefined }, token);
    if (res?.id) { setForm({ property_id: '', name: '' }); await load(); }
    else alert(res?.error || 'Failed to create job');
  };

  const start = async (id) => {
    const res = await startJobById(id, token);
    if (res?.id) await load();
    else alert(res?.error || 'Failed to start job');
  };

  const stop = async (id) => {
    const res = await stopJobById(id, token);
    if (res?.id) {
      alert(`Job #${res.id} completed in ${Number(res.duration_minutes || 0).toFixed(1)} min`);
      await load();
    } else alert(res?.error || 'Failed to stop job');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Jobs</h2>

      {canCreate && (
        <form onSubmit={onCreate} className="bg-white border rounded p-3 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium">Property</label>
            <select
              className="border rounded w-full p-2"
              value={form.property_id}
              onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
              required
            >
              <option value="">Select property…</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Job name (optional)</label>
            <input
              className="border rounded w-full p-2"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Mowing / Weekly visit"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Job</button>
        </form>
      )}

      <div className="bg-white border rounded overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Property</th>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Status</th>
              <th className="px-3 py-2 border">Started</th>
              <th className="px-3 py-2 border">Ended</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-t">
                <td className="px-3 py-2 border">#{j.id}</td>
                <td className="px-3 py-2 border">{j.property_name || j.property_id}</td>
                <td className="px-3 py-2 border">{j.name || '—'}</td>
                <td className="px-3 py-2 border">{j.status}</td>
                <td className="px-3 py-2 border">{j.start_time ? new Date(j.start_time).toLocaleString() : '—'}</td>
                <td className="px-3 py-2 border">{j.end_time ? new Date(j.end_time).toLocaleString() : '—'}</td>
                <td className="px-3 py-2 border">
                  {canAct && j.status === 'pending' && (
                    <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => start(j.id)}>
                      Start
                    </button>
                  )}
                  {canAct && j.status === 'running' && (
                    <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => stop(j.id)}>
                      Stop
                    </button>
                  )}
                  {!canAct && <span className="text-gray-500">No actions</span>}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td className="px-3 py-4 text-center text-gray-500" colSpan="7">No jobs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
