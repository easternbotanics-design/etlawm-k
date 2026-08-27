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

const homepageReviewService = {
  getPublicHomepageReviews: async () => {
    const res = await fetch(`${API}/api/reviews/homepage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  getAdminReviews: async () => {
    const res = await fetch(`${API}/api/admin/homepage-reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  getReviewById: async (id) => {
    const res = await fetch(`${API}/api/admin/homepage-reviews/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  createReview: async (payload) => {
    const res = await fetch(`${API}/api/admin/homepage-reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  updateReview: async (id, payload) => {
    const res = await fetch(`${API}/api/admin/homepage-reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  deleteReview: async (id) => {
    const res = await fetch(`${API}/api/admin/homepage-reviews/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default homepageReviewService;
