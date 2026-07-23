const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BASE = `${BACKEND_URL}/study-plan`;

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Unexpected server response');
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

export async function generateStudyPlan({ currentLevel, subject }) {
  const res = await fetch(`${BASE}/generate`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentLevel, subject }),
  });
  return handleResponse(res);
}

export async function getStudyPlans() {
  const res = await fetch(`${BASE}/`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getStudyPlan(id) {
  const res = await fetch(`${BASE}/${id}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function deleteStudyPlan(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(res);
}