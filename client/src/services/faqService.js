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

const faqService = {
  // Public FAQs by product slug
  getPublicFaqs: async (productSlug = null) => {
    const url = productSlug
      ? `${API}/api/faqs/cms?slug=${encodeURIComponent(productSlug)}`
      : `${API}/api/faqs/cms`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  },

  // Get FAQs by product slug for admin or public
  getFaqsByProductSlug: async (slug) => {
    const res = await fetch(`${API}/api/faqs/product/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  // Get single FAQ by ID
  getFaqById: async (id) => {
    const res = await fetch(`${API}/api/faqs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  // Get all admin FAQs
  getAdminFaqs: async () => {
    const res = await fetch(`${API}/api/faqs/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },

  // Create FAQ
  createCmsFaq: async (payload) => {
    const res = await fetch(`${API}/api/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  // Update FAQ
  updateCmsFaq: async (id, payload) => {
    const res = await fetch(`${API}/api/faqs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  // Delete FAQ
  deleteCmsFaq: async (id) => {
    const res = await fetch(`${API}/api/faqs/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return handleResponse(res);
  },
};

export default faqService;
