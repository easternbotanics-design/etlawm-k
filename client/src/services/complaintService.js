const API = import.meta.env.VITE_SERVER_API;

export async function submitComplaint(complaintText) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/user/complaint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ complaint: complaintText })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit complaint');
  }
  return res.json();
}
