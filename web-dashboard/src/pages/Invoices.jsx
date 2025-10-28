
import { useEffect, useState } from 'react';

export default function Invoices({ token, role }) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:5001/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
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
    const res = await fetch('http://localhost:5001/api/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: 1, amount: 120, description: 'Weekly service' })
    });
    const created = await res.json();
    if (created?.id) setInvoices(prev => [created, ...prev]); else alert(created?.error || 'Failed to create invoice');
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold">Invoices</h2>
        {(role === 'admin' || role === 'manager') && (
          <button className="ml-auto bg-yellow-500 text-white px-3 py-1 rounded" onClick={createInvoice}>New Invoice</button>
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
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => markPaid(inv.id)}>Mark Paid</button>
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
