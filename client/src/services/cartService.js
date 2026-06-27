const API = import.meta.env.VITE_SERVER_API;
const GUEST_CART_ID_KEY = "guest_cart_id";

function createGuestId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function getGuestCartId() {
  let guestId = localStorage.getItem(GUEST_CART_ID_KEY);

  if (!guestId) {
    guestId = createGuestId();
    localStorage.setItem(GUEST_CART_ID_KEY, guestId);
  }

  return guestId;
}

export function clearGuestCartId() {
  localStorage.removeItem(GUEST_CART_ID_KEY);
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    headers["x-guest-id"] = getGuestCartId();
  }

  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ??
        `Cart request failed (${response.status})`,
    );
  }

  return data;
}

function resolveImage(url) {
  if (!url) {
    return "/products/placeholder.png";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const normalizedPath = url.startsWith("/")
    ? url
    : `/${url}`;

  return `${API}${normalizedPath}`;
}

function normalizeCartItem(raw) {
  const product = raw.product ?? raw;

  const productId =
    raw.product_id ??
    product.product_id ??
    product.id;

  return {
    cartItemId: productId,
    productId,
    itemId:
      raw.cart_item_id ??
      raw.cartItemId ??
      raw.id ??
      null,

    name:
      product.name ??
      raw.product_name ??
      "",

    category:
      product.category_name ??
      raw.category_name ??
      "",

    image: resolveImage(
      product.primary_image ??
        product.image_url ??
        raw.primary_image ??
        raw.image_url,
    ),

    price:
      Number(product.price ?? raw.price) || 0,

    originalPrice:
      product.original_price != null
        ? Number(product.original_price)
        : raw.original_price != null
          ? Number(raw.original_price)
          : null,

    quantity: Number(raw.quantity) || 1,

    stockQty:
      Number(
        product.stock_qty ??
          raw.stock_qty,
      ) || 0,

    selected: raw.selected ?? true,

    sizeValue:
      product.size_value ??
      raw.size_value ??
      null,

    sizeUnit:
      product.size_unit ??
      raw.size_unit ??
      null,
  };
}

function normalizeCart(data) {
  const cart = data.cart ?? data;

  const rawItems = Array.isArray(cart.items)
    ? cart.items
    : [];

  const calculatedItemCount = rawItems.reduce(
    (total, item) =>
      total + Number(item.quantity ?? 0),
    0,
  );

  const calculatedSubtotal = rawItems.reduce(
    (total, item) =>
      total +
      Number(item.price ?? 0) *
        Number(item.quantity ?? 0),
    0,
  );

  return {
    id: cart.id ?? cart.cart_id ?? null,
    type: cart.type ?? null,

    itemCount:
      cart.item_count ??
      calculatedItemCount,

    subtotal: Number(
      cart.subtotal ??
        calculatedSubtotal,
    ),

    items: rawItems.map(normalizeCartItem),
  };
}

export async function getCart() {
  const response = await fetch(
    `${API}/api/cart`,
    {
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeCart(data);
}

export async function addToCart(
  productId,
  quantity = 1,
) {
  const response = await fetch(
    `${API}/api/cart/items`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    },
  );

  const data = await handleResponse(response);

  return normalizeCart(data);
}

export async function updateCartItemQuantity(
  productId,
  quantity,
) {
  const response = await fetch(
    `${API}/api/cart/items/${productId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quantity,
      }),
    },
  );

  const data = await handleResponse(response);

  return normalizeCart(data);
}

export async function removeCartItem(productId) {
  const response = await fetch(
    `${API}/api/cart/items/${productId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeCart(data);
}

export async function removeSelectedCartItems(
  productIds,
) {
  const response = await fetch(
    `${API}/api/cart/items/remove-selected`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_ids: productIds,
      }),
    },
  );

  const data = await handleResponse(response);

  return normalizeCart(data);
}

export async function clearCart() {
  const response = await fetch(
    `${API}/api/cart`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeCart(data);
}

export async function mergeGuestCart() {
  const guestId = localStorage.getItem(
    GUEST_CART_ID_KEY,
  );

  const token = localStorage.getItem("token");

  if (!guestId) {
    return null;
  }

  if (!token) {
    throw new Error(
      "Authentication is required to merge the cart.",
    );
  }

  const response = await fetch(
    `${API}/api/cart/merge`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        guest_id: guestId,
      }),
    },
  );

  const data = await handleResponse(response);

  clearGuestCartId();

  return normalizeCart(data);
}

export async function applyCartCoupon(code) {
  const response = await fetch(
    `${API}/api/cart/coupon`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    },
  );

  const data = await handleResponse(response);
  return normalizeCart(data);
}

export async function removeCartCoupon() {
  const response = await fetch(
    `${API}/api/cart/coupon`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(response);
  return normalizeCart(data);
}