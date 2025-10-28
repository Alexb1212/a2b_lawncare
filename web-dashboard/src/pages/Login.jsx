
import { useState } from 'react';
import { login } from '../services/api';

export default function Login({ setToken, setCompanyId, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    if (data?.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('companyId', data.companyId);
      localStorage.setItem('role', data.role);
      setToken(data.token);
      setCompanyId(data.companyId);
      setRole(data.role);
    } else {
      alert(data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input type="email" placeholder="Email" className="border p-2 w-full mb-4 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="border p-2 w-full mb-4 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">Sign in</button>
      </form>
    </div>
  );
}
