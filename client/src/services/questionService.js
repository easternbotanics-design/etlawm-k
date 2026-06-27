const API = import.meta.env.VITE_SERVER_API;

export async function submitQuestion(questionData) {
  const res = await fetch(`${API}/api/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit question');
  }

  return res.json();
}

export async function getAdminQuestions() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/admin/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin questions');
  }

  return res.json();
}

export async function deleteAdminQuestion(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/admin/questions/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete question');
  }

  return res.json();
}
