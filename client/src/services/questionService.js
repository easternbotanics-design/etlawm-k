const API = import.meta.env.VITE_SERVER_API;

export async function submitQuestion(formData) {
  const res = await fetch(`${API}/api/user/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to submit message");
  }

  return res.json();
}
