import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCart } from "../services/cartService";
import { colours, fonts } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

export default function FloatingCart() {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // Show only on Home, Collection, and Product pages
  const isVisible =
    location.pathname === "/" ||
    location.pathname.startsWith("/collection") ||
    location.pathname.startsWith("/product");

  useEffect(() => {
    if (!isVisible) return undefined;

    const loadCartCount = async () => {
      try {
        const cart = await getCart();
        const totalQuantity = (cart?.items ?? []).reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );
        setCartCount(totalQuantity);
      } catch (error) {
        console.error("Unable to load cart count in floating cart:", error);
        setCartCount(0);
      }
    };

    loadCartCount();
    window.addEventListener("cart-updated", loadCartCount);

    return () => {
      window.removeEventListener("cart-updated", loadCartCount);
    };
  }, [isVisible, user]);

  if (!isVisible) return null;

  return (
    <Link
      to="/cart"
      aria-label="Open cart"
      className="fixed bottom-6 right-6 z-[150] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      style={{
        backgroundColor: colours.text,
        color: colours.background,
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        className="h-[22px] w-[22px] fill-current"
      >
        <path d="M126.2 134c-10.7 2.2-20 10.5-24.2 21.7-5.9 15.5 2.2 34.4 17.8 41.6 4.5 2.1 6.1 2.2 45.9 2.5l41.1.3.6 2.2c.3 1.3 21.3 91.2 46.6 199.8 25.3 108.5 47.1 201 48.5 205.4 3.1 10.2 9.1 22.5 16.2 33.4 6.9 10.7 24.9 28.8 35.7 36.1 10.4 6.9 25.9 14.3 37.1 17.5 19.3 5.6 16.4 5.5 166 5.5 83.2-.1 141-.4 145.5-1 55-7.1 98.9-46.6 112.9-101.5.6-2.2 10.7-60.7 22.6-129.9 22.9-134.2 23.1-135.9 20-149.6-4.3-18.3-18.3-36-34.8-44-15.6-7.5 6.4-7-277.4-7-242.1 0-255.2-.1-255.7-1.8-.3-.9-6.1-25.9-13-55.4-8.2-35.2-13.3-55.3-15-58.5-3.3-6.4-8.8-11.6-16.1-15l-6-2.8-55-.2c-30.2 0-56.9.3-59.3.7m667.3 201.2c-.3 1.3-9.5 55.2-20.5 119.8s-20.7 120.9-21.6 125c-4.2 19.9-17.6 37.3-35.7 46.3-14.5 7.1-5.1 6.7-157.3 6.7-133.7 0-137.1-.1-145.3-2-19.1-4.6-34.8-17.5-43.7-35.7-3-6.2-7.9-25.8-33-133.5C320.2 392.4 307 335 307 334.3c0-1.1 44.5-1.3 243.5-1.3H794zM358 733.6c-26.6 4.8-46.7 21.7-54.7 45.8-2.3 7-2.7 9.7-2.7 20.6s.4 13.6 2.7 20.6c5.4 16.2 17.1 30 32.4 38.1 20.1 10.7 45 10.2 64.4-1.4 22.3-13.2 34-35.2 32.6-61.2-.6-11.6-2.6-18.8-8-28.4-11.5-20.6-31.8-33.2-55.1-34.2-5-.2-10.2-.2-11.6.1m364.8.4c-25 4.5-44.3 21.2-52.9 45.7-3 8.4-3.7 24.7-1.5 34.7 6.8 30.5 33.2 51.7 64.6 51.8 12.1.1 21.2-2.1 31.3-7.5 15.3-8.1 27-21.9 32.4-38.1 2.3-7 2.7-9.7 2.7-20.6s-.4-13.6-2.7-20.6c-5.6-16.9-19.4-32.6-34.7-39.6-12.1-5.5-28.1-7.9-39.2-5.8" />
      </svg>

      {cartCount > 0 && (
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
    </Link>
  );
}
