const API = import.meta.env.VITE_SERVER_API?.replace(/\/$/, "");

function getHeaders(json = true) {
  const token = localStorage.getItem("token");
  const headers = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `${fallbackMessage} (${response.status})`,
    );
  }

  return data;
}

export async function createOrder(orderData) {
  if (!API) {
    throw new Error("VITE_SERVER_API is missing.");
  }

  const response = await fetch(`${API}/api/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(orderData),
  });

  return handleResponse(response, "Failed to create order");
}

export async function getOrderById(orderId) {
  if (!API) {
    throw new Error("VITE_SERVER_API is missing.");
  }

  if (!orderId) {
    throw new Error("orderId is required.");
  }

  const response = await fetch(`${API}/api/orders/${orderId}`, {
    method: "GET",
    headers: getHeaders(false),
  });

  return handleResponse(response, "Failed to fetch order");
}