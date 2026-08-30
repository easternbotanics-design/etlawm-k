const API = import.meta.env.VITE_SERVER_API;

const getToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );
};

const authHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const concernService = {
  getPublicConcerns: async () => {
    const res = await fetch(`${API}/api/concerns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  getAdminConcerns: async () => {
    const res = await fetch(`${API}/api/admin/concerns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  createConcern: async (payload) => {
    const res = await fetch(`${API}/api/admin/concerns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  deleteConcern: async (id) => {
    const res = await fetch(`${API}/api/admin/concerns/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default concernService;
