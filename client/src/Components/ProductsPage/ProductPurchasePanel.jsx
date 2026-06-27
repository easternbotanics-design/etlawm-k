import { useState } from "react";
import AddToCartNumbers from "../AddToCartNumbers.jsx";
import { addToCart } from "../../services/cartService.js";
import { colours, fonts } from "../../theme/theme.js";

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function getProductId(product) {
  return product?.id ?? product?.product_id ?? product?.productId;
}

export default function ProductPurchasePanel({
  product,
  category,
  description,
  price,
  originalPrice,
  discountLabel,
  productSize,
  quantity,
  increase,
  decrease,
  onAddToCart,
  added,
  isUnavailable,
}) {
  const rating = Number(product.rating || 0);
  const productId = getProductId(product);
  const [isAdding, setIsAdding] = useState(false);
  const [localAdded, setLocalAdded] = useState(false);
  const [cartError, setCartError] = useState("");

  async function handleAddToCart() {
    if (isUnavailable || isAdding) return;

    if (!productId) {
      setCartError("Product ID is missing, so this item cannot be added to cart.");
      return;
    }

    try {
      setIsAdding(true);
      setCartError("");

      const cart = await addToCart(productId, Math.max(Number(quantity) || 1, 1));
      
      setLocalAdded(true);
      
      window.dispatchEvent(new Event("cart-updated"));
      
      if (typeof onAddToCart === "function") {
        onAddToCart(cart);
      }
    } catch (error) {
      setCartError(error.message || "Could not add this item to cart.");
    } finally {
      setIsAdding(false);
    }
  }

  const buttonAdded = added || localAdded;

  const handleIncrease = () => {
    setLocalAdded(false);
    if (typeof increase === "function") increase();
  };

  const handleDecrease = () => {
    setLocalAdded(false);
    if (typeof decrease === "function") decrease();
  };

  return (
    <aside className="lg:sticky lg:bottom-6 lg:self-end">
      <div
        className="p-7 lg:p-8"
        style={{
          backgroundColor: colours.background,
          borderColor: colours.border,
        }}
      >
        <p
          className="mb-3 text-[0.72rem] uppercase tracking-[0.2em]"
          style={{ color: colours.accent, fontFamily: fonts.secondary }}
        >
          {category}
        </p>

        <h1
          className="mb-4 text-[clamp(2.2rem,4vw,3.4rem)] font-normal leading-[1.05]"
          style={{ color: colours.text, fontFamily: fonts.primary }}
        >
          {product.name}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={star <= Math.round(rating) ? "#c8a96a" : "none"}
                stroke="#c8a96a"
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>

          <span
            className="text-xs"
            style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
          >
            {rating > 0
              ? `${rating} (${product.reviews || 0} reviews)`
              : "No reviews yet"}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span
            className="text-4xl"
            style={{ color: colours.text, fontFamily: fonts.primary }}
          >
            ₹{money(price)}
          </span>

          {originalPrice > price && (
            <span
              className="text-sm line-through"
              style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
            >
              ₹{money(originalPrice)}
            </span>
          )}

          {discountLabel && (
            <span
              className="rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: colours.primary,
                color: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              {discountLabel}
            </span>
          )}
        </div>

        {productSize && (
          <div className="mb-6">
            <p
              className="mb-2 text-xs"
              style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
            >
              Size
            </p>
            <span
              className="inline-flex rounded-full border px-5 py-2.5 text-sm font-semibold"
              style={{
                borderColor: colours.text,
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              {productSize}
            </span>
          </div>
        )}

        <p
          className="mb-7 text-sm leading-7"
          style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
        >
          {description}
        </p>

        <p
          className="mb-3 text-xs"
          style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
        >
          Quantity
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AddToCartNumbers
            count={quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
          />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={true}
            className="w-full rounded-md px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] transition-colors"
            style={{
              backgroundColor: colours.border,
              color: colours.mutedText,
              cursor: "not-allowed",
              fontFamily: fonts.secondary,
            }}
          >
            Add to Cart
          </button>
        </div>

        <div className="mt-4 text-center">
          <span
            className="text-xs uppercase tracking-[0.1em]"
            style={{
              color: colours.mutedText,
              fontFamily: fonts.secondary,
            }}
          >
            <div>For Product enquiries or ordering service</div>
            <div>Contact us at +91 7708234137 or +91 8429121121</div>
          </span>
        </div>

        {cartError && (
          <p
            className="mt-4 text-sm"
            style={{ color: colours.accent, fontFamily: fonts.secondary }}
          >
            {cartError}
          </p>
        )}
      </div>
    </aside>
  );
}
