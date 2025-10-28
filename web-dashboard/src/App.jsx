
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Properties from './pages/Properties';
import Invoices from './pages/Invoices';
import { me } from './services/api';
import Jobs from './pages/Jobs';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'viewer');
  const [companyId, setCompanyId] = useState(localStorage.getItem('companyId') || null);

  useEffect(() => {
    if (token && (!role || !companyId)) {
      (async () => {
        const info = await me(token);
        if (info?.role) { setRole(info.role); localStorage.setItem('role', info.role); }
        if (info?.companyId) { setCompanyId(info.companyId); localStorage.setItem('companyId', info.companyId); }
      })();
    }
  }, [token]);

  if (!token) return <Login setToken={setToken} setCompanyId={setCompanyId} setRole={setRole} />;

  const logout = () => {
    setToken(''); setRole('viewer'); setCompanyId(null);
    localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('companyId');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex gap-4">
        <Link to="/properties" className="hover:underline">Properties</Link>
        <Link to="/invoices" className="hover:underline">Invoices</Link>
        <Link to="/jobs" className="hover:underline">Jobs</Link>
        <span className="ml-auto italic">Role: {role}</span>
        <button className="bg-red-500 px-3 py-1 rounded" onClick={logout}>Logout</button>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/properties" />} />
          <Route path="/properties" element={<Properties token={token} role={role} />} />
          <Route path="/invoices" element={<Invoices token={token} role={role} />} />
          <Route path="/jobs" element={<Jobs token={token} role={role} />} />
        </Routes>
      </div>
    </div>
  );
}
