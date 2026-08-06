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

const scienceService = {
  getPublicScience: async () => {
    const res = await fetch(`${API}/api/science`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  getAdminScience: async () => {
    const res = await fetch(`${API}/api/admin/science`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  getScienceById: async (id) => {
    const res = await fetch(`${API}/api/admin/science/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  createScience: async (payload) => {
    const res = await fetch(`${API}/api/admin/science`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  updateScience: async (id, payload) => {
    const res = await fetch(`${API}/api/admin/science/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  deleteScience: async (id) => {
    const res = await fetch(`${API}/api/admin/science/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default scienceService;
