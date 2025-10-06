import { useEffect, useState } from 'react';

export default function Invoices({ token, companyId }) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/invoices/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Invoices</h2>
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
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-2 border">{inv.id}</td>
                  <td className="px-4 py-2 border">{inv.property_id}</td>
                  <td className="px-4 py-2 border">{inv.job_id}</td>
                  <td className="px-4 py-2 border">${inv.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border">{inv.status}</td>
                  <td className="px-4 py-2 border">{new Date(inv.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
