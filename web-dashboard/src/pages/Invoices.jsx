import { useEffect, useState } from 'react';
import { getJobs } from '../services/api';

export default function Invoices({ token, role }) {
  const [invoices, setInvoices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    (async () => {
      // load invoices
      const resInv = await fetch('http://localhost:5001/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataInv = await resInv.json();
      setInvoices(Array.isArray(dataInv) ? dataInv : []);

      // load jobs to choose for invoicing
      const dataJobs = await getJobs(token);
      setJobs(Array.isArray(dataJobs) ? dataJobs : []);
    })();
  }, [token]);

  const markPaid = async (id) => {
    const res = await fetch(`http://localhost:5001/api/invoices/${id}/mark-paid`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await res.json();
    if (updated?.status === 'paid') {
      setInvoices(inv => inv.map(i => i.id === id ? { ...i, status: 'paid' } : i));
    } else {
      alert(updated?.error || 'Failed to mark paid');
    }
  };

  const createInvoice = async () => {
    if (!selectedJobId) {
      alert('Pick a job to invoice first.');
      return;
    }
    const amountStr = prompt('Amount (e.g., 120.00)', '120.00');
    if (amountStr == null) return;
    const amount = Number(amountStr);
    if (Number.isNaN(amount)) {
      alert('Invalid amount');
      return;
    }
    const description = prompt('Description', 'Weekly service') ?? 'Service';

    const res = await fetch('http://localhost:5001/api/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: Number(selectedJobId), amount, description })
    });
    const created = await res.json();
    if (created?.id) setInvoices(prev => [created, ...prev]);
    else alert(created?.error || 'Failed to create invoice');
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">Invoices</h2>

        {/* Job picker */}
        <select
          className="ml-auto border rounded px-2 py-1"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          <option value="">Select a job…</option>
          {jobs.map(j => (
            <option key={j.id} value={j.id}>
              #{j.id} • {j.property_name || 'Property'} • {j.status}
            </option>
          ))}
        </select>

        {(role === 'admin' || role === 'manager') && (
          <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={createInvoice}>
            New Invoice
          </button>
        )}
      </div>

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Property</th>
                <th className="px-4 py-2 border">Job</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-2 border">{inv.id}</td>
                  <td className="px-4 py-2 border">{inv.property_name || inv.property_id}</td>
                  <td className="px-4 py-2 border">{inv.job_name || inv.job_id}</td>
                  <td className="px-4 py-2 border">${Number(inv.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 border">{inv.status}</td>
                  <td className="px-4 py-2 border">{new Date(inv.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 border">
                    {(role === 'admin' || role === 'manager') && inv.status !== 'paid' && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => markPaid(inv.id)}>
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
