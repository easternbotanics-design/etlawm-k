const API = import.meta.env.VITE_SERVER_API;

function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAddresses() {
  const res = await fetch(`${API}/api/user/address`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch addresses");
  }

  return res.json();
}

export async function addAddress(addressData) {
  const res = await fetch(`${API}/api/user/address`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(addressData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to save address");
  }

  return res.json();
}

export async function setDefaultAddress(addressId) {
  const res = await fetch(`${API}/api/user/address/${addressId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update address");
  }

  return res.json();
}

export async function deleteAddress(addressId) {
  const res = await fetch(`${API}/api/user/address/${addressId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete address");
  }

  return res.json();
}

export async function getPincodeDetails(pincode) {
  const res = await fetch(`${API}/api/user/address/${pincode}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Invalid PIN code.");
  }

  return data;
}