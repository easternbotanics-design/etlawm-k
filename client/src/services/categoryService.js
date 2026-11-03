const API = import.meta.env.VITE_SERVER_API;

function slugify(name = "") {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function normalizeCategory(raw) {
  if (!raw) return null;

  return {
    id: raw.id,
    name: raw.name ?? "",
    slug: raw.slug ?? slugify(raw.name),
    subtitle:
      raw.subtitle ??
      raw.description ??
      `Products in ${raw.name}`,
    description:
      raw.description ??
      raw.subtitle ??
      `Products in ${raw.name}`,
    image: raw.image_url ?? "",
    imageUrl: raw.image_url ?? "",
    isActive: raw.is_active ?? true,
    createdAt: raw.created_at ?? null,
  };
}

function getAuthHeaders(json = false) {
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

export async function uploadCategoryImage(file) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Admin authentication is required.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `${API}/api/admin/upload?bucket=category-images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    throw new Error(
      err.message ??
        `Failed to upload image (${response.status})`,
    );
  }

  const data = await response.json();

  return data.url;
}

export async function getCategories() {
  const response = await fetch(
    `${API}/api/categories`,
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    throw new Error(
      err.message ??
        `Failed to fetch categories (${response.status})`,
    );
  }

  const data = await response.json();

  const raw = Array.isArray(data.categories)
    ? data.categories
    : [];

  return raw.map(normalizeCategory);
}

export async function createCategory(fields) {
  const response = await fetch(
    `${API}/api/admin/categories`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(fields),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    throw new Error(
      err.message ??
        `Failed to create category (${response.status})`,
    );
  }

  const data = await response.json();

  return normalizeCategory(data.category);
}

export async function updateCategory(id, fields) {
  const response = await fetch(
    `${API}/api/admin/categories/${id}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(fields),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    throw new Error(
      err.message ??
        `Failed to update category (${response.status})`,
    );
  }

  const data = await response.json();

  return normalizeCategory(data.category);
}

export async function deleteCategory(id) {
  const response = await fetch(
    `${API}/api/admin/categories/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    throw new Error(
      err.message ??
        `Failed to delete category (${response.status})`,
    );
  }

  return response.json();
}

export { slugify };