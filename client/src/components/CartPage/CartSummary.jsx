import { useState, useEffect, useMemo } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Tag, X } from "lucide-react";
import { colours, fonts } from "../../theme/theme";

function CartSummary({
  selectedItems,
  coupon,
  couponCode,
  setCouponCode,
  subtotal,
  discount,
  deliveryCharge,
  total,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  checkoutButtonLabel = "Proceed to checkout",
  checkoutDisabled = false,
  checkoutHelperText = "",
  checkoutStep = "",
}) {
  const [activeCampaign, setActiveCampaign] = useState(null);

  useEffect(() => {
    const fetchActiveCampaign = async () => {
      try {
        const API = import.meta.env.VITE_SERVER_API?.replace(/\/$/, "") || "http://localhost:5000";
        const res = await fetch(`${API}/api/early-bird-discount/active`);
        const data = await res.json();
        if (data.success && data.campaign) {
          setActiveCampaign(data.campaign);
        }
      } catch (err) {
        console.error("Failed to fetch active coupon campaign:", err);
      }
    };
    fetchActiveCampaign();
  }, []);

  const totalOriginalPrice = useMemo(() => {
    if (!selectedItems || selectedItems.length === 0) return 0;
    return selectedItems.reduce((sum, item) => {
      const orig = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
      return sum + orig * item.quantity;
    }, 0);
  }, [selectedItems]);

  const totalSavings = useMemo(() => {
    const discountedProductTotal = Math.max(0, subtotal - discount);
    return Math.max(0, totalOriginalPrice - discountedProductTotal);
  }, [totalOriginalPrice, subtotal, discount]);

  const isButtonDisabled =
    selectedItems.length === 0 || checkoutDisabled;

  return (
    <aside className="lg:sticky lg:top-[104px] lg:self-start">
      <div className="space-y-3.5">
        <section>
          <h2
            className="mb-2 text-base font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Coupons
          </h2>

          {coupon ? (
            <div
              className="flex items-center justify-between rounded-xl border px-3.5 py-3"
              style={{
                borderColor: colours.border,
                backgroundColor: colours.background,
              }}
            >
              <div className="flex items-center gap-2.5">
                <Tag size={15} className="opacity-50" />

                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{
                      color: colours.text,
                      fontFamily: fonts.primary,
                    }}
                  >
                    {coupon.code}
                  </p>

                  {coupon.description && (
                    <p
                      className="mt-0.5 text-[11px] opacity-50"
                      style={{
                        color: colours.text,
                        fontFamily: fonts.secondary,
                      }}
                    >
                      {coupon.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveCoupon}
                className="cursor-pointer opacity-45 transition-opacity hover:opacity-100"
                aria-label="Remove coupon"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <form
              onSubmit={onApplyCoupon}
              className="flex overflow-hidden rounded-xl border"
              style={{
                borderColor: colours.border,
                backgroundColor: colours.background,
              }}
            >
              <div className="flex flex-1 items-center gap-2.5 px-3">
                <Tag size={15} className="shrink-0 opacity-45" />

                <input
                  value={couponCode}
                  onChange={(event) =>
                    setCouponCode(event.target.value)
                  }
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none"
                  style={{
                    color: colours.text,
                    fontFamily: fonts.secondary,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!couponCode.trim() || isApplyingCoupon}
                className="cursor-pointer px-3.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-35"
                style={{
                  color: colours.accent,
                  fontFamily: fonts.secondary,
                }}
              >
                {isApplyingCoupon ? "Applying" : "Apply"}
              </button>
            </form>
          )}

          {activeCampaign && !coupon && (
            <p
              className="mt-1.5 text-[11px] tracking-wide flex items-center gap-1 flex-wrap"
              style={{
                color: colours.mutedText || '#7C7770',
                fontFamily: fonts.secondary,
              }}
            >
              <Tag size={11} className="text-stone-400" />
              <span>Use coupon code </span>
              <span className="font-mono font-bold text-[#171715] bg-stone-100 px-1 py-0.5 rounded border border-stone-200 select-all uppercase">
                {activeCampaign.coupon_code}
              </span>
              <span> to avail </span>
              <span className="font-bold text-[#171715]">
                {activeCampaign.discount_type === "percentage" 
                  ? `${parseFloat(activeCampaign.discount_value)}%` 
                  : `₹${parseFloat(activeCampaign.discount_value)}`}
              </span>
              <span> discount.</span>
            </p>
          )}
        </section>

        <section>
          <h2
            className="mb-2 text-base font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Price details
          </h2>

          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: colours.border,
              backgroundColor: colours.primary,
            }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "items"}
            </p>

            <div className="space-y-2.5">
              {totalOriginalPrice > subtotal && (
                <PriceRow
                  label="Total MRP"
                  value={`₹${totalOriginalPrice.toFixed(2)}`}
                />
              )}

              {totalOriginalPrice > subtotal && (
                <PriceRow
                  label="Product discount"
                  value={`-₹${(totalOriginalPrice - subtotal).toFixed(2)}`}
                  highlight
                />
              )}

              <PriceRow
                label="Subtotal"
                value={`₹${subtotal.toFixed(2)}`}
              />

              <PriceRow
                label={coupon?.isEarlyBird ? "Launch discount" : "Coupon discount"}
                value={
                  discount > 0
                    ? `-₹${discount.toFixed(2)}`
                    : "₹0.00"
                }
                highlight={discount > 0}
              />

              <PriceRow
                label="Delivery charges"
                value={
                  deliveryCharge === 0
                    ? "Free delivery"
                    : `₹${deliveryCharge.toFixed(2)}`
                }
              />
            </div>

            <div
              className="my-3.5 border-t"
              style={{
                borderColor: colours.border,
              }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-sm font-semibold"
                style={{
                  color: colours.text,
                  fontFamily: fonts.primary,
                }}
              >
                Total amount
              </span>

              <span
                className="text-base font-semibold"
                style={{
                  color: colours.text,
                  fontFamily: fonts.primary,
                }}
              >
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {checkoutHelperText && (
          <p
            className="text-xs opacity-55"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            {checkoutHelperText}
          </p>
        )}

        {checkoutStep !== "checkout" && !checkoutButtonLabel.toLowerCase().includes("place") && totalSavings > 0 && (
          <div
            className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide"
            style={{ fontFamily: fonts.secondary }}
          >
            <span>You are saving ₹{totalSavings.toFixed(2)} on this order</span>
          </div>
        )}

        {(checkoutStep === "checkout" || checkoutButtonLabel.toLowerCase().includes("place")) && (
          <div
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide"
            style={{ fontFamily: fonts.secondary }}
          >
            <ShieldCheck size={15} className="text-black-600 shrink-0" />
            <span>Secured Payment</span>
          </div>
        )}

        <button
          type="button"
          onClick={onCheckout}
          disabled={isButtonDisabled}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            backgroundColor: colours.text,
            color: colours.background,
            fontFamily: fonts.secondary,
          }}
        >
          {checkoutButtonLabel}
          <ArrowRight size={15} />
        </button>
      </div>
    </aside>
  );
}

function PriceRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className="text-sm opacity-55"
        style={{
          color: colours.text,
          fontFamily: fonts.secondary,
        }}
      >
        {label}
      </span>

      <span
        className="text-sm font-medium"
        style={{
          color: highlight ? colours.accent : colours.text,
          fontFamily: fonts.secondary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default CartSummary;