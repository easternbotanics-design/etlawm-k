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

const reviewService = {
  // Public CMS reviews for homepage/review panel
  getPublicReviews: async () => {
    const res = await fetch(`${API}/api/reviews/cms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  // Normal product reviews
  getProductReviews: async (productId) => {
    const res = await fetch(`${API}/api/reviews/product/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  upsertReview: async ({ product_id, rating, comment = "" }) => {
    const res = await fetch(`${API}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        product_id,
        rating,
        comment,
      }),
    });

    return handleResponse(res);
  },

  deleteProductReview: async (productId) => {
    const res = await fetch(`${API}/api/reviews/product/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  // Admin CMS reviews
  getAdminReviews: async () => {
    const res = await fetch(`${API}/api/admin/reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  getReviewsByProductSlug: async (slug) => {
    const res = await fetch(`${API}/api/admin/reviews/product/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  getReviewById: async (id) => {
    const res = await fetch(`${API}/api/admin/reviews/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  createCmsReview: async (payload) => {
    const res = await fetch(`${API}/api/admin/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  updateCmsReview: async (id, payload) => {
    const res = await fetch(`${API}/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  deleteCmsReview: async (id) => {
    const res = await fetch(`${API}/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default reviewService;