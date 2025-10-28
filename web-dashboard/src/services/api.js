
const API_URL = 'http://localhost:5001/api';

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const me = async (token) => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getProperties = async (token) => {
  const res = await fetch(`${API_URL}/properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const startJobForProperty = async (propertyId, token) => {
  const res = await fetch(`${API_URL}/jobs/property/${propertyId}/start`, {
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

export const savePropertyNotes = async (id, notes, token) => {
  const res = await fetch(`${API_URL}/properties/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ notes })
  });
  return res.json();
};
