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

const ritualService = {
  // Public rituals
  getPublicRituals: async () => {
    const res = await fetch(`${API}/api/rituals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  // Admin CMS rituals
  getAdminRituals: async () => {
    const res = await fetch(`${API}/api/admin/rituals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  getRitualById: async (id) => {
    const res = await fetch(`${API}/api/admin/rituals/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  createRitual: async (payload) => {
    const res = await fetch(`${API}/api/admin/rituals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  updateRitual: async (id, payload) => {
    const res = await fetch(`${API}/api/admin/rituals/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  deleteRitual: async (id) => {
    const res = await fetch(`${API}/api/admin/rituals/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default ritualService;
