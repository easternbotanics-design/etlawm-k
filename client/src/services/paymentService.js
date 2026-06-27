const API = import.meta.env.VITE_SERVER_API?.replace(/\/$/, "");

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function getPaymentBase() {
  if (!API) {
    throw new Error("VITE_SERVER_API is missing.");
  }

  return `${API}/api/payment`;
}

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

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay checkout.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout."));

    document.body.appendChild(script);
  });
}

export async function createRazorpayOrder(orderId) {
  if (!orderId) {
    throw new Error("orderId is required.");
  }

  const response = await fetch(`${getPaymentBase()}/create-order`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      order_id: orderId,
    }),
  });

  return handleResponse(response, "Failed to create Razorpay order");
}

export async function verifyRazorpayPayment({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (
    !orderId ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error("Payment verification details are required.");
  }

  const response = await fetch(`${getPaymentBase()}/validate-order`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }),
  });

  return handleResponse(response, "Failed to verify Razorpay payment");
}

function getRazorpayOrderFromResponse(paymentOrder) {
  return (
    paymentOrder?.razorpay_order ||
    paymentOrder?.order ||
    paymentOrder?.data?.razorpay_order ||
    paymentOrder?.data?.order
  );
}

function getRazorpayKeyFromResponse(paymentOrder) {
  return (
    paymentOrder?.key ||
    paymentOrder?.key_id ||
    paymentOrder?.razorpay_key_id ||
    paymentOrder?.data?.key ||
    paymentOrder?.data?.key_id ||
    import.meta.env.VITE_RAZORPAY_KEY_ID
  );
}

export async function startRazorpayPayment({
  orderId,
  name = "ETLAWM",
  description = "Order payment",
  image,
  prefill = {},
  notes = {},
  theme = {},
  onFailure,
} = {}) {
  if (!orderId) {
    throw new Error("orderId is required.");
  }

  await loadRazorpayScript();

  const paymentOrder = await createRazorpayOrder(orderId);

  const razorpayOrder = getRazorpayOrderFromResponse(paymentOrder);
  const razorpayKey = getRazorpayKeyFromResponse(paymentOrder);

  if (!razorpayKey) {
    throw new Error("Razorpay key was not returned by the server.");
  }

  if (!razorpayOrder?.id) {
    throw new Error("Invalid Razorpay order response.");
  }

  if (!razorpayOrder?.amount) {
    throw new Error("Razorpay order amount is missing.");
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name,
      description,
      image,
      order_id: razorpayOrder.id,

      handler: async function (response) {
        try {
          const verifiedPayment = await verifyRazorpayPayment({
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          resolve(verifiedPayment);
        } catch (error) {
          reject(error);
        }
      },

      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.contact || "",
      },

      notes: {
        database_order_id: String(orderId),
        ...notes,
      },

      theme: {
        color: theme.color || "#111111",
      },

      modal: {
        ondismiss: function () {
          reject(new Error("Payment cancelled by user."));
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      const error = new Error(
        response?.error?.description || "Razorpay payment failed.",
      );

      error.details = response?.error;

      if (typeof onFailure === "function") {
        onFailure(response?.error);
      }

      reject(error);
    });

    razorpay.open();
  });
}