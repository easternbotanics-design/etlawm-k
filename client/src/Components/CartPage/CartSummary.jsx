import { ArrowRight, Tag, X } from "lucide-react";
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
}) {
  const isButtonDisabled =
    selectedItems.length === 0 || checkoutDisabled;

  return (
    <aside className="lg:sticky lg:top-[104px] lg:self-start">
      <div className="space-y-5">
        <section>
          <h2
            className="mb-3 text-lg font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Coupons
          </h2>

          {coupon ? (
            <div
              className="flex items-center justify-between rounded-xl border px-4 py-4"
              style={{
                borderColor: colours.border,
                backgroundColor: colours.background,
              }}
            >
              <div className="flex items-center gap-3">
                <Tag size={17} className="opacity-50" />

                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: colours.text,
                      fontFamily: fonts.primary,
                    }}
                  >
                    {coupon.code}
                  </p>

                  {coupon.description && (
                    <p
                      className="mt-0.5 text-xs opacity-50"
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
                <X size={16} />
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
              <div className="flex flex-1 items-center gap-3 px-4">
                <Tag size={17} className="shrink-0 opacity-45" />

                <input
                  value={couponCode}
                  onChange={(event) =>
                    setCouponCode(event.target.value)
                  }
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none"
                  style={{
                    color: colours.text,
                    fontFamily: fonts.secondary,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!couponCode.trim() || isApplyingCoupon}
                className="cursor-pointer px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35"
                style={{
                  color: colours.accent,
                  fontFamily: fonts.secondary,
                }}
              >
                {isApplyingCoupon ? "Applying" : "Apply"}
              </button>
            </form>
          )}
        </section>

        <section>
          <h2
            className="mb-3 text-lg font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Price details
          </h2>

          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: colours.border,
              backgroundColor: colours.primary,
            }}
          >
            <p
              className="mb-5 text-sm font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "items"}
            </p>

            <div className="space-y-3">
              <PriceRow
                label="Subtotal"
                value={`₹${subtotal.toFixed(2)}`}
              />

              <PriceRow
                label="Coupon discount"
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
              className="my-5 border-t"
              style={{
                borderColor: colours.border,
              }}
            />

            <div className="flex items-center justify-between">
              <span
                className="font-semibold"
                style={{
                  color: colours.text,
                  fontFamily: fonts.primary,
                }}
              >
                Total amount
              </span>

              <span
                className="text-lg font-semibold"
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
            className="text-sm opacity-55"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            {checkoutHelperText}
          </p>
        )}

        <button
          type="button"
          onClick={onCheckout}
          disabled={isButtonDisabled}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm font-semibold transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            backgroundColor: colours.text,
            color: colours.background,
            fontFamily: fonts.secondary,
          }}
        >
          {checkoutButtonLabel}
          <ArrowRight size={17} />
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