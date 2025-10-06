import { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Properties from './pages/Properties';
import Invoices from './pages/Invoices';

export default function App() {
  const [token, setToken] = useState('');
  const [companyId, setCompanyId] = useState(1); // Replace with real company id after login

  if (!token) {
    return <Login setToken={setToken} setCompanyId={setCompanyId} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex space-x-4">
        <Link to="/properties" className="hover:underline">Properties</Link>
        <Link to="/invoices" className="hover:underline">Invoices</Link>
        <button className="ml-auto bg-red-500 px-3 py-1 rounded" onClick={() => setToken('')}>
          Logout
        </button>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/properties" />} />
          <Route path="/properties" element={<Properties token={token} />} />
          <Route path="/invoices" element={<Invoices token={token} companyId={companyId} />} />
        </Routes>
      </div>
    </div>
  );
}
