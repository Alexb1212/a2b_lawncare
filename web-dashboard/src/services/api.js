const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api';

// ---------- AUTH ----------
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

// ---------- PROPERTIES ----------
export const getProperties = async (token) => {
  const res = await fetch(`${API_URL}/properties`, {
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

// ---------- JOBS ----------
export const getJobs = async (token) => {
  const res = await fetch(`${API_URL}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createJob = async (payload, token) => {
  const res = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

export const startJobById = async (jobId, token) => {
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

export { stopJob as stopJobById };


// ---------- INVOICES ----------
export const getInvoices = async (token) => {
  const res = await fetch(`${API_URL}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createInvoice = async (payload, token) => {
  const res = await fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const markInvoicePaid = async (id, token) => {
  const res = await fetch(`${API_URL}/invoices/${id}/mark-paid`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

