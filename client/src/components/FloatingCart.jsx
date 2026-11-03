import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { getCart, updateCartItemQuantity, removeCartItem } from "../services/cartService";
import { colours, fonts } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

export default function FloatingCart() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasStickyBar, setHasStickyBar] = useState(false);

  const syncedItemsRef = useRef(new Map());
  const syncedItemIdsRef = useRef(new Set());

  // Show only on Home, Collection, and Product pages
  const isVisible =
    location.pathname === "/" ||
    location.pathname.startsWith("/collection") ||
    location.pathname.startsWith("/product");

  const fetchCartData = useCallback(async () => {
    try {
      setIsLoading(true);
      const cart = await getCart();
      const items = cart?.items ?? [];
      setCartItems(items);
      setSubtotal(Number(cart?.subtotal ?? 0));

      const initialMap = new Map();
      const initialIds = new Set();
      items.forEach((item) => {
        initialMap.set(item.cartItemId, item.quantity);
        initialIds.add(item.cartItemId);
      });
      syncedItemsRef.current = initialMap;
      syncedItemIdsRef.current = initialIds;

      const totalQuantity = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );
      setCartCount(totalQuantity);
    } catch (error) {
      console.error("Unable to load cart data in floating cart:", error);
      setCartItems([]);
      setSubtotal(0);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setIsOpen(false);
      return undefined;
    }

    fetchCartData();

    const handleCartUpdate = () => {
      fetchCartData();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [isVisible, user, fetchCartData]);

  useEffect(() => {
    if (isOpen) {
      fetchCartData();
    }
  }, [isOpen, fetchCartData]);

  useEffect(() => {
    const handleStickyBarChange = (e) => {
      setHasStickyBar(Boolean(e.detail?.visible));
    };

    window.addEventListener("sticky-bar-change", handleStickyBarChange);

    return () => {
      window.removeEventListener("sticky-bar-change", handleStickyBarChange);
    };
  }, []);

  useEffect(() => {
    setHasStickyBar(false);
    setIsOpen(false);
  }, [location.pathname]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const updateLocalQuantity = (cartItemId, newQuantity) => {
    setCartItems((prevItems) => {
      const updated = prevItems
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean);

      const newSubtotal = updated.reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      const newCount = updated.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

      setSubtotal(newSubtotal);
      setCartCount(newCount);

      return updated;
    });
  };

  const handleIncrease = (item) => {
    updateLocalQuantity(item.cartItemId, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    updateLocalQuantity(item.cartItemId, item.quantity - 1);
  };

  const handleRemove = (cartItemId) => {
    updateLocalQuantity(cartItemId, 0);
  };

  const syncCartWithDatabase = async () => {
    const promises = [];
    const currentItemsMap = new Map();

    cartItems.forEach((item) => {
      currentItemsMap.set(item.cartItemId, item.quantity);
      const originalQty = syncedItemsRef.current.get(item.cartItemId);
      if (originalQty === undefined || originalQty !== item.quantity) {
        promises.push(updateCartItemQuantity(item.cartItemId, item.quantity));
      }
    });

    syncedItemIdsRef.current.forEach((originalId) => {
      if (!currentItemsMap.has(originalId)) {
        promises.push(removeCartItem(originalId));
      }
    });

    if (promises.length > 0) {
      await Promise.all(promises);

      const updatedMap = new Map();
      const updatedIds = new Set();
      cartItems.forEach((item) => {
        updatedMap.set(item.cartItemId, item.quantity);
        updatedIds.add(item.cartItemId);
      });
      syncedItemsRef.current = updatedMap;
      syncedItemIdsRef.current = updatedIds;

      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const handleCheckoutClick = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      await syncCartWithDatabase();
      setIsOpen(false);
      navigate("/cart");
    } catch (error) {
      console.error("Failed to sync cart database before checkout:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClose = async () => {
    if (isSyncing) return;
    setIsOpen(false);
    try {
      await syncCartWithDatabase();
    } catch (error) {
      console.error("Failed to sync cart database on close:", error);
    }
  };

  const toggleOpenState = async () => {
    if (isOpen) {
      await handleClose();
    } else {
      setIsOpen(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Expanded Floating Cart Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Items in your cart"
          className={`fixed right-4 sm:right-6 z-[200] flex w-[calc(100vw-2rem)] sm:w-[410px] flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            hasStickyBar ? "bottom-24 md:bottom-24" : "bottom-24"
          }`}
          style={{
            backgroundColor: colours.primary || "#F7F3EC",
            border: `1px solid ${colours.border || "#D8D2C8"}`,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            maxHeight: "min(580px, 82vh)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-5 py-4"
            style={{ borderColor: colours.border || "#D8D2C8" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} style={{ color: colours.text }} />
              <h3
                className="text-lg font-semibold tracking-wide"
                style={{ color: colours.text, fontFamily: fonts.primary }}
              >
                Your Cart
              </h3>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{
                  backgroundColor: colours.accent,
                  fontFamily: fonts.secondary,
                }}
              >
                {cartCount}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close cart preview"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10"
              style={{ color: colours.text }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body / Item list */}
          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
            {isLoading && cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={28} className="animate-spin text-black/50" />
                <p
                  className="text-sm opacity-60"
                  style={{ fontFamily: fonts.secondary, color: colours.text }}
                >
                  Loading cart items...
                </p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div
                  className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/5"
                  style={{ color: colours.text }}
                >
                  <ShoppingBag size={26} className="opacity-40" />
                </div>
                <h4
                  className="text-base font-medium"
                  style={{ color: colours.text, fontFamily: fonts.primary }}
                >
                  Your cart is empty
                </h4>
                <p
                  className="mt-1 text-xs opacity-60"
                  style={{ color: colours.text, fontFamily: fonts.secondary }}
                >
                  Explore our collection and add your favorite items.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await handleClose();
                    navigate("/collection");
                  }}
                  className="mt-4 rounded-full px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: colours.text,
                    fontFamily: fonts.secondary,
                  }}
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cartItems.map((item) => {
                  return (
                    <div
                      key={item.cartItemId}
                      className="flex items-center gap-3.5 rounded-xl border p-3 transition-colors"
                      style={{
                        backgroundColor: colours.background || "#FFFFFF",
                        borderColor: colours.border || "#E2DCD2",
                      }}
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.image || "/products/placeholder.png"}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover border border-black/10 shrink-0"
                      />

                      {/* Item Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <h4
                          className="truncate text-sm font-semibold leading-tight"
                          style={{
                            color: colours.text,
                            fontFamily: fonts.primary,
                          }}
                        >
                          {item.name}
                        </h4>
                        {(item.sizeValue || item.category) && (
                          <span
                            className="mt-0.5 text-[11px] opacity-60"
                            style={{
                              color: colours.text,
                              fontFamily: fonts.secondary,
                            }}
                          >
                            {item.sizeValue
                              ? `${item.sizeValue} ${item.sizeUnit || ""}`
                              : item.category}
                          </span>
                        )}
                        <span
                          className="mt-1 text-xs font-bold"
                          style={{
                            color: colours.text,
                            fontFamily: fonts.secondary,
                          }}
                        >
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.cartItemId)}
                          aria-label={`Remove ${item.name}`}
                          className="text-black/40 transition-colors hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div
                          className="flex items-center rounded-lg border px-1.5 py-0.5"
                          style={{
                            borderColor: colours.border || "#D8D2C8",
                            backgroundColor: colours.subBackground || "#FBFBFB",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            aria-label="Decrease quantity"
                            className="flex h-5 w-5 items-center justify-center rounded text-black/70 hover:bg-black/10"
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className="w-6 text-center text-xs font-semibold"
                            style={{
                              color: colours.text,
                              fontFamily: fonts.secondary,
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            aria-label="Increase quantity"
                            className="flex h-5 w-5 items-center justify-center rounded text-black/70 hover:bg-black/10"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cartItems.length > 0 && (
            <div
              className="border-t px-5 py-4 space-y-3"
              style={{ borderColor: colours.border || "#D8D2C8" }}
            >
              <div className="flex items-center justify-between text-sm">
                <span
                  className="opacity-70 font-medium"
                  style={{ color: colours.text, fontFamily: fonts.secondary }}
                >
                  Subtotal
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: colours.text, fontFamily: fonts.secondary }}
                >
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={isSyncing}
                className="group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-md disabled:opacity-75"
                style={{
                  backgroundColor: colours.text,
                  fontFamily: fonts.secondary,
                }}
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating cart...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={toggleOpenState}
        aria-label={isOpen ? "Close cart window" : "Open cart window"}
        className={`fixed right-6 z-[200] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
          hasStickyBar ? "bottom-20 md:bottom-6" : "bottom-6"
        }`}
        style={{
          backgroundColor: colours.text,
          color: colours.background,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        {isOpen ? (
          <X className="h-6 w-6 stroke-[1.75]" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
            className="h-[22px] w-[22px] fill-current"
          >
            <path d="M126.2 134c-10.7 2.2-20 10.5-24.2 21.7-5.9 15.5 2.2 34.4 17.8 41.6 4.5 2.1 6.1 2.2 45.9 2.5l41.1.3.6 2.2c.3 1.3 21.3 91.2 46.6 199.8 25.3 108.5 47.1 201 48.5 205.4 3.1 10.2 9.1 22.5 16.2 33.4 6.9 10.7 24.9 28.8 35.7 36.1 10.4 6.9 25.9 14.3 37.1 17.5 19.3 5.6 16.4 5.5 166 5.5 83.2-.1 141-.4 145.5-1 55-7.1 98.9-46.6 112.9-101.5.6-2.2 10.7-60.7 22.6-129.9 22.9-134.2 23.1-135.9 20-149.6-4.3-18.3-18.3-36-34.8-44-15.6-7.5 6.4-7-277.4-7-242.1 0-255.2-.1-255.7-1.8-.3-.9-6.1-25.9-13-55.4-8.2-35.2-13.3-55.3-15-58.5-3.3-6.4-8.8-11.6-16.1-15l-6-2.8-55-.2c-30.2 0-56.9.3-59.3.7m667.3 201.2c-.3 1.3-9.5 55.2-20.5 119.8s-20.7 120.9-21.6 125c-4.2 19.9-17.6 37.3-35.7 46.3-14.5 7.1-5.1 6.7-157.3 6.7-133.7 0-137.1-.1-145.3-2-19.1-4.6-34.8-17.5-43.7-35.7-3-6.2-7.9-25.8-33-133.5C320.2 392.4 307 335 307 334.3c0-1.1 44.5-1.3 243.5-1.3H794zM358 733.6c-26.6 4.8-46.7 21.7-54.7 45.8-2.3 7-2.7 9.7-2.7 20.6s.4 13.6 2.7 20.6c5.4 16.2 17.1 30 32.4 38.1 20.1 10.7 45 10.2 64.4-1.4 22.3-13.2 34-35.2 32.6-61.2-.6-11.6-2.6-18.8-8-28.4-11.5-20.6-31.8-33.2-55.1-34.2-5-.2-10.2-.2-11.6.1m364.8.4c-25 4.5-44.3 21.2-52.9 45.7-3 8.4-3.7 24.7-1.5 34.7 6.8 30.5 33.2 51.7 64.6 51.8 12.1.1 21.2-2.1 31.3-7.5 15.3-8.1 27-21.9 32.4-38.1 2.3-7 2.7-9.7 2.7-20.6s-.4-13.6-2.7-20.6c-5.6-16.9-19.4-32.6-34.7-39.6-12.1-5.5-28.1-7.9-39.2-5.8" />
          </svg>
        )}

        {!isOpen && cartCount > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white shadow-md transition-all duration-300"
            style={{
              backgroundColor: colours.accent,
              fontFamily: fonts.secondary,
              border: `1.5px solid ${colours.text}`,
            }}
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>
    </>
  );
}
