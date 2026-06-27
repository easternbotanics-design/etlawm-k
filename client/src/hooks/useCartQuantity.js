import { useCallback, useEffect, useState } from "react";

const CART_STORAGE_KEY = "cartQuantities";

function getStoredQuantities() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : {};
  } catch (error) {
    console.error("Failed to read cart quantities:", error);
    return {};
  }
}

function saveStoredQuantities(quantities) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(quantities));

    // Notifies other mounted components in the same browser tab.
    window.dispatchEvent(
      new CustomEvent("cartQuantityChanged", {
        detail: quantities,
      }),
    );
  } catch (error) {
    console.error("Failed to save cart quantities:", error);
  }
}

export default function useCartQuantity(productId) {
  const getProductQuantity = useCallback(() => {
    if (productId === null || productId === undefined) {
      return 0;
    }

    const quantities = getStoredQuantities();
    return Number(quantities[String(productId)] || 0);
  }, [productId]);

  const [quantity, setQuantityState] = useState(getProductQuantity);

  useEffect(() => {
    setQuantityState(getProductQuantity());
  }, [getProductQuantity]);

  useEffect(() => {
    const updateQuantity = () => {
      setQuantityState(getProductQuantity());
    };

    // Fires for changes made in another browser tab.
    window.addEventListener("storage", updateQuantity);

    // Fires for changes made elsewhere in the current tab.
    window.addEventListener("cartQuantityChanged", updateQuantity);

    return () => {
      window.removeEventListener("storage", updateQuantity);
      window.removeEventListener("cartQuantityChanged", updateQuantity);
    };
  }, [getProductQuantity]);

  const setQuantity = useCallback(
    (valueOrUpdater) => {
      if (productId === null || productId === undefined) {
        return;
      }

      const quantities = getStoredQuantities();
      const currentQuantity = Number(
        quantities[String(productId)] || 0,
      );

      const requestedQuantity =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(currentQuantity)
          : valueOrUpdater;

      const nextQuantity = Math.max(
        0,
        Math.min(99, Number(requestedQuantity) || 0),
      );

      if (nextQuantity === 0) {
        delete quantities[String(productId)];
      } else {
        quantities[String(productId)] = nextQuantity;
      }

      saveStoredQuantities(quantities);
      setQuantityState(nextQuantity);
    },
    [productId],
  );

  const increase = useCallback(() => {
    setQuantity((currentQuantity) => currentQuantity + 1);
  }, [setQuantity]);

  const decrease = useCallback(() => {
    setQuantity((currentQuantity) => currentQuantity - 1);
  }, [setQuantity]);

  return {
    quantity,
    setQuantity,
    increase,
    decrease,
  };
}