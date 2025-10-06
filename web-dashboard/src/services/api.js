const API_URL = 'http://localhost:5001/api';

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getProperties = async (token) => {
  const res = await fetch(`${API_URL}/properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const startJob = async (jobId, token) => {
  const res = await fetch(`${API_URL}/jobs/${jobId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const stopJob = async (jobId, token) => {
  const res = await fetch(`${API_URL}/jobs/${jobId}/stop`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
