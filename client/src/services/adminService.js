const API = import.meta.env.VITE_SERVER_API;

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
      data.message ?? `${fallbackMessage} (${response.status})`,
    );
  }

  return data;
}

// Upload an image file to Supabase through the backend
export async function uploadImage(file) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Admin authentication is required.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API}/api/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response, "Upload failed");
}

// Product management

export async function createProduct(data) {
  const response = await fetch(`${API}/api/admin/products`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const result = await handleResponse(
    response,
    "Failed to create product",
  );

  return result.product;
}

export async function updateProduct(id, data) {
  const response = await fetch(
    `${API}/api/admin/products/${id}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );

  const result = await handleResponse(
    response,
    "Failed to update product",
  );

  return result.product;
}

export async function deleteProduct(id) {
  const response = await fetch(
    `${API}/api/admin/products/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(false),
    },
  );

  return handleResponse(response, "Failed to delete product");
}

// Associate an uploaded image URL with a product
export async function addProductImage(
  productId,
  imageUrl,
  isPrimary = true,
  sortOrder = 0,
) {
  const response = await fetch(
    `${API}/api/admin/products/${productId}/images`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        image_url: imageUrl,
        is_primary: isPrimary,
        sort_order: sortOrder,
      }),
    },
  );

  return handleResponse(
    response,
    "Failed to add product image",
  );
}

export async function setPrimaryProductImage(
  productId,
  imageId,
) {
  const response = await fetch(
    `${API}/api/admin/products/${productId}/images/${imageId}/primary`,
    {
      method: "PATCH",
      headers: getHeaders(),
    },
  );

  return handleResponse(
    response,
    "Failed to set primary product image",
  );
}

export async function deleteProductImage(
  productId,
  imageId,
) {
  const response = await fetch(
    `${API}/api/admin/products/${productId}/images/${imageId}`,
    {
      method: "DELETE",
      headers: getHeaders(false),
    },
  );

  return handleResponse(
    response,
    "Failed to delete product image",
  );
}

// Admin profile

export async function getAdminProfile() {
  const response = await fetch(
    `${API}/api/admin/profile`,
    {
      headers: getHeaders(false),
    },
  );

  return handleResponse(
    response,
    "Failed to fetch profile",
  );
}

export async function updateAdminProfile(data) {
  const response = await fetch(
    `${API}/api/admin/profile`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );

  return handleResponse(
    response,
    "Failed to update profile",
  );
}

// Admin settings

export async function getAdminSettings() {
  const response = await fetch(
    `${API}/api/admin/settings`,
    {
      headers: getHeaders(false),
    },
  );

  return handleResponse(
    response,
    "Failed to fetch settings",
  );
}

export async function updateAdminSettings(data) {
  const response = await fetch(
    `${API}/api/admin/settings`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );

  return handleResponse(
    response,
    "Failed to update settings",
  );
}

// Admin phone management

export async function getAdminPhones() {
  const response = await fetch(
    `${API}/api/admin/admins`,
    {
      headers: getHeaders(false),
    },
  );

  return handleResponse(
    response,
    "Failed to fetch admin phones",
  );
}

export async function addAdminPhone(phoneNumber) {
  const response = await fetch(
    `${API}/api/admin/admins`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        phone_number: phoneNumber,
      }),
    },
  );

  return handleResponse(
    response,
    "Failed to register admin phone",
  );
}

export async function deleteAdminPhone(phoneNumber) {
  const encodedPhoneNumber = encodeURIComponent(phoneNumber);

  const response = await fetch(
    `${API}/api/admin/admins/${encodedPhoneNumber}`,
    {
      method: "DELETE",
      headers: getHeaders(false),
    },
  );

  return handleResponse(
    response,
    "Failed to delete admin phone",
  );
}