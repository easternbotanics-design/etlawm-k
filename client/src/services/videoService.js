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
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const videoService = {
  getAdminVideos: async () => {
    const res = await fetch(`${API}/api/videos/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });
    return handleResponse(res);
  },

  getPublishedVideos: async () => {
    const res = await fetch(`${API}/api/videos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse(res);
  },

  getVideoById: async (id) => {
    const res = await fetch(`${API}/api/videos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });
    return handleResponse(res);
  },

  uploadVideoFile: async (file) => {
    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch(`${API}/api/videos/upload`, {
      method: "POST",
      headers: {
        ...authHeaders(),
      },
      body: formData,
    });

    return handleResponse(res);
  },

  createVideo: async (payload) => {
    const res = await fetch(`${API}/api/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  updateVideo: async (id, payload) => {
    const res = await fetch(`${API}/api/videos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  deleteVideo: async (id) => {
    const res = await fetch(`${API}/api/videos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default videoService;
