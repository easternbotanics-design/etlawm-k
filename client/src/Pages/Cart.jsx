import { useEffect, useMemo, useState, useCallback } from "react";
import CartItemsSection from "../Components/CartPage/CartItemsSection";
import CartSummary from "../Components/CartPage/CartSummary";
import CheckoutSteps from "../Components/CartPage/CheckoutSteps";
import AddressAndDetails from "../Components/CartPage/AddressAndDetails";
import {
  applyCartCoupon,
  getCart,
  removeCartCoupon,
  removeCartItem,
  removeSelectedCartItems,
  updateCartItemQuantity,
} from "../services/cartService";
import Navbar from "../Components/NavBar2";
import { colours, fonts } from "../theme/theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import { startRazorpayPayment } from "../services/paymentService";

const CHECKOUT_STEPS = [
  {
    key: "cart",
    label: "Your cart",
  },
  {
    key: "address",
    label: "Address and details",
  },
  {
    key: "checkout",
    label: "Checkout",
  },
];

const DEFAULT_ADDRESS_DETAILS = {
  fullName: "",
  phoneNumber: "",
  pincode: "",
  addressLine: "",
  locality: "",
  city: "",
  state: "",
  landmark: "",
  deliveryType: "standard",
  orderNotes: "",
  pincodeVerified: false,
};


function getSavedAddressDetails() {
  try {
    const saved = sessionStorage.getItem("checkoutAddressDetails");

    if (!saved) {
      return DEFAULT_ADDRESS_DETAILS;
    }

    return {
      ...DEFAULT_ADDRESS_DETAILS,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_ADDRESS_DETAILS;
  }
}

function Cart() {
  const { user } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState("cart");

  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [addressDetails, setAddressDetails] = useState(
    getSavedAddressDetails,
  );

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Pre-fill name and phone from logged-in user if those fields are still empty
  useEffect(() => {
    if (!user) return;

    setAddressDetails((current) => {
      const updates = {};
      if (!current.fullName) {
        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        if (name) updates.fullName = name;
      }
      if (!current.phoneNumber) {
        if (user.phone_number) updates.phoneNumber = user.phone_number;
      }
      if (Object.keys(updates).length === 0) return current;
      return { ...current, ...updates };
    });
  }, [user]);

  useEffect(() => {
    loadCart();
  }, []);

  const navigate = useNavigate();

  const [checkoutOrder, setCheckoutOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem("checkoutOrder");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  async function handleCreateOrderAndContinue() {
    if (selectedItems.length === 0) {
      setPageError("Select at least one item before checkout.");
      setCheckoutStep("cart");
      return;
    }

    if (!isAddressComplete) {
      setPageError("Complete the address details before checkout.");
      return;
    }

    if (checkoutOrder?.id) {
      setCheckoutStep("checkout");
      return;
    }

    try {
      setIsCreatingOrder(true);
      setPageError("");

      const orderPayload = {
        shipping: {
          name: addressDetails.fullName,
          line1: [
            addressDetails.addressLine,
              addressDetails.locality,
              addressDetails.landmark,
          ]
            .filter(Boolean)
            .join(", "),
          city: addressDetails.city,
          state: addressDetails.state,
          pincode: addressDetails.pincode,
        },

        items: selectedItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };

      const result = await createOrder(orderPayload);

      const order =
        result.order ??
        result.data?.order ??
        result;

      if (!order?.id) {
        throw new Error("Order created, but order ID was not returned.");
      }

      setCheckoutOrder(order);

      sessionStorage.setItem(
        "checkoutOrder",
        JSON.stringify(order),
      );

      saveSelectedItemsForCheckout();
      saveAddressForCheckout();

      setCheckoutStep("checkout");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  async function handlePlaceOrder() {
    const orderId = checkoutOrder?.id;

    if (!orderId) {
      setPageError("Create the order before payment.");
      setCheckoutStep("address");
      return;
    }

    try {
      setIsPlacingOrder(true);
      setPageError("");

      const paymentResult = await startRazorpayPayment({
        orderId,
        name: "ETLAWM",
        description: "Order payment",
        prefill: {
          name: addressDetails.fullName,
          contact: addressDetails.phoneNumber,
        },
        notes: {
          city: addressDetails.city,
          state: addressDetails.state,
        },
      });

      sessionStorage.removeItem("checkoutCartItemIds");
      sessionStorage.removeItem("checkoutAddressDetails");
      sessionStorage.removeItem("checkoutOrder");

      window.dispatchEvent(new Event("cart-updated"));

      navigate(`/orders/${paymentResult.payment?.order_id ?? paymentResult.order?.id ?? orderId}/success`);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  }

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  async function loadCart() {
    try {
      setLoading(true);
      setPageError("");

      const cart = await getCart();

      setItems(
        cart.items.map((item) => ({
          ...item,
          selected: item.selected ?? true,
        })),
      );

      setCoupon(cart.coupon);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected),
    [items],
  );

  const selectedCount = selectedItems.length;

  const allSelected =
    items.length > 0 && selectedCount === items.length;

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [selectedItems],
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;

    if (coupon.discountType === "percentage") {
      const calculated =
        subtotal * (Number(coupon.discountValue) / 100);

      return coupon.maxDiscount
        ? Math.min(calculated, Number(coupon.maxDiscount))
        : calculated;
    }

    return Math.min(
      Number(coupon.discountValue ?? coupon.discount ?? 0),
      subtotal,
    );
  }, [coupon, subtotal]);

  const deliveryCharge =
    selectedItems.length === 0 || subtotal >= 500 ? 0 : 50;

  const total = Math.max(
    subtotal - discount + deliveryCharge,
    0,
  );

  const isAddressComplete = useMemo(() => {
    const requiredFields = [
      "fullName",
      "phoneNumber",
      "pincode",
      "addressLine",
      "city",
      "state",
    ];
  
    const hasRequiredFields = requiredFields.every((field) =>
      String(addressDetails[field] ?? "").trim(),
    );
  
    return (
      hasRequiredFields &&
      String(addressDetails.pincode || "").length === 6 &&
      addressDetails.pincodeVerified === true
    );
  }, [addressDetails]);

  const visibleSteps = useMemo(
    () =>
      CHECKOUT_STEPS.map((step) => {
        if (step.key === "address") {
          return {
            ...step,
            disabled: selectedItems.length === 0,
          };
        }

        if (step.key === "checkout") {
          return {
            ...step,
            disabled:
              selectedItems.length === 0 || !isAddressComplete,
          };
        }

        return step;
      }),
    [selectedItems.length, isAddressComplete],
  );

  const checkoutButtonLabel =
    checkoutStep === "cart"
      ? "Pick address"
      : checkoutStep === "address"
        ? isCreatingOrder
          ? "Creating order"
          : "Continue to checkout"
        : isPlacingOrder
          ? "Processing payment"
          : "Place order";

  const checkoutButtonDisabled =
    isCreatingOrder ||
    isPlacingOrder ||
    selectedItems.length === 0 ||
    (checkoutStep === "address" && !isAddressComplete) ||
    (checkoutStep === "checkout" && !checkoutOrder?.id);

  const checkoutHelperText =
    checkoutStep === "address" && !isAddressComplete
      ? "Complete the required address fields before checkout."
      : "";

  function toggleAllItems() {
    const nextSelected = !allSelected;

    setItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        selected: nextSelected,
      })),
    );
  }

  function toggleItemSelected(cartItemId) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
            ...item,
            selected: !item.selected,
          }
          : item,
      ),
    );
  }

  async function changeQuantity(item, nextQuantity) {
    if (nextQuantity < 1) {
      await handleRemoveItem(item.cartItemId);
      return;
    }

    if (item.stockQty > 0 && nextQuantity > item.stockQty) {
      return;
    }

    const previousItems = items;

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.cartItemId === item.cartItemId
          ? {
            ...currentItem,
            quantity: nextQuantity,
          }
          : currentItem,
      ),
    );

    try {
      setUpdatingItemId(item.cartItemId);

      await updateCartItemQuantity(
        item.cartItemId,
        nextQuantity,
      );

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      setItems(previousItems);
      setPageError(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  function handleIncrease(item) {
    changeQuantity(item, item.quantity + 1);
  }

  function handleDecrease(item) {
    changeQuantity(item, item.quantity - 1);
  }

  async function handleRemoveItem(cartItemId) {
    const previousItems = items;

    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.cartItemId !== cartItemId,
      ),
    );

    try {
      setUpdatingItemId(cartItemId);

      await removeCartItem(cartItemId);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      setItems(previousItems);
      setPageError(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemoveSelected() {
    const selectedIds = selectedItems.map(
      (item) => item.cartItemId,
    );

    if (selectedIds.length === 0) return;

    const previousItems = items;

    setItems((currentItems) =>
      currentItems.filter((item) => !item.selected),
    );

    try {
      await removeSelectedCartItems(selectedIds);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      setItems(previousItems);
      setPageError(error.message);
    }
  }

  async function handleApplyCoupon(event) {
    event.preventDefault();

    const code = couponCode.trim();

    if (!code) return;

    try {
      setIsApplyingCoupon(true);
      setPageError("");

      const data = await applyCartCoupon(code);

      setCoupon({
        code: data.coupon?.code ?? code.toUpperCase(),
        description: data.coupon?.description ?? "",
        discountType:
          data.coupon?.discount_type ??
          data.coupon?.discountType ??
          "fixed",
        discountValue:
          data.coupon?.discount_value ??
          data.coupon?.discountValue ??
          data.discount ??
          0,
        maxDiscount:
          data.coupon?.max_discount ??
          data.coupon?.maxDiscount ??
          null,
      });

      setCouponCode("");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  async function handleRemoveCoupon() {
    try {
      await removeCartCoupon();
      setCoupon(null);
    } catch (error) {
      setPageError(error.message);
    }
  }

  function saveSelectedItemsForCheckout() {
    sessionStorage.setItem(
      "checkoutCartItemIds",
      JSON.stringify(
        selectedItems.map((item) => item.cartItemId),
      ),
    );
  }

  function saveAddressForCheckout() {
    sessionStorage.setItem(
      "checkoutAddressDetails",
      JSON.stringify(addressDetails),
    );
  }

  function handleStepChange(nextStep) {
    if (nextStep === "address" && selectedItems.length === 0) {
      setPageError("Select at least one item before picking an address.");
      return;
    }

    if (nextStep === "checkout" && !isAddressComplete) {
      setPageError("Complete the address details before checkout.");
      return;
    }

    setPageError("");
    setCheckoutStep(nextStep);
  }

  async function handlePrimaryCheckoutAction() {
    if (checkoutStep === "cart") {
      if (selectedItems.length === 0) {
        setPageError("Select at least one item before picking an address.");
        return;
      }

      saveSelectedItemsForCheckout();
      setPageError("");
      setCheckoutStep("address");
      return;
    }

    if (checkoutStep === "address") {
      await handleCreateOrderAndContinue();
      return;
    }

    if (checkoutStep === "checkout") {
      await handlePlaceOrder();
    }
  }

  async function handleAddressContinue() {
    await handleCreateOrderAndContinue();
    if (!isAddressComplete) {
      setPageError("Complete the address details before checkout.");
      return;
    }

    saveAddressForCheckout();
    setPageError("");
    setCheckoutStep("checkout");
  }

  if (loading) {
    return <CartSkeleton />;
  }

  function handleAddressDetailsChange(updater) {
    setCheckoutOrder(null);
    sessionStorage.removeItem("checkoutOrder");
  
    setAddressDetails((current) => {
      if (typeof updater === "function") {
        return updater(current);
      }
  
      return updater;
    });
  }

  return (
    <div>
      <Navbar />

      <main
        className="min-h-screen px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pb-12 lg:pt-32"
        style={{
          backgroundColor: colours.subBackground,
        }}
      >
        <div className="mx-auto max-w-7xl">

          <CheckoutSteps
            steps={visibleSteps}
            activeStep={checkoutStep}
            onStepChange={handleStepChange}
          />

          {pageError && (
            <div
              className="mb-5 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: colours.accent,
                color: colours.text,
                backgroundColor: colours.background,
                fontFamily: fonts.secondary,
              }}
            >
              {pageError}
            </div>
          )}

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] xl:gap-12">
            {checkoutStep === "cart" && (
              <CartItemsSection
                items={items}
                selectedCount={selectedCount}
                allSelected={allSelected}
                updatingItemId={updatingItemId}
                onToggleAll={toggleAllItems}
                onToggleSelected={toggleItemSelected}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemoveItem}
                onRemoveSelected={handleRemoveSelected}
              />
            )}

            {checkoutStep === "address" && (
              <AddressAndDetails
                addressDetails={addressDetails}
                setAddressDetails={handleAddressDetailsChange}
                isComplete={isAddressComplete}
                onBack={() => setCheckoutStep("cart")}
                onContinue={handleAddressContinue}
              />
            )}

            {checkoutStep === "checkout" && (
              <CheckoutReview
                selectedItems={selectedItems}
                addressDetails={addressDetails}
                subtotal={subtotal}
                discount={discount}
                deliveryCharge={deliveryCharge}
                total={total}
                onBack={() => setCheckoutStep("address")}
              />
            )}

            <CartSummary
              selectedItems={selectedItems}
              coupon={coupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              subtotal={subtotal}
              discount={discount}
              deliveryCharge={deliveryCharge}
              total={total}
              isApplyingCoupon={isApplyingCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onCheckout={handlePrimaryCheckoutAction}
              checkoutButtonLabel={checkoutButtonLabel}
              checkoutDisabled={checkoutButtonDisabled}
              checkoutHelperText={checkoutHelperText}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckoutReview({
  selectedItems,
  addressDetails,
  subtotal,
  discount,
  deliveryCharge,
  total,
  onBack,
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Checkout
          </h2>

          <p
            className="mt-1 text-sm opacity-55"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            Confirm your order before payment.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-sm font-semibold opacity-60 transition-opacity hover:opacity-100"
          style={{
            color: colours.text,
            fontFamily: fonts.secondary,
          }}
        >
          Edit address
        </button>
      </div>

      <div
        className="rounded-2xl border"
        style={{
          borderColor: colours.border,
          backgroundColor: colours.background,
        }}
      >
        <div
          className="border-b p-5"
          style={{
            borderColor: colours.border,
          }}
        >
          <h3
            className="mb-3 text-base font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Delivery address
          </h3>

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: colours.primary,
            }}
          >
            <p
              className="font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              {addressDetails.fullName}
            </p>

            <p
              className="mt-1 text-sm opacity-70"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              {addressDetails.phoneNumber}
            </p>

            <p
              className="mt-2 text-sm opacity-70"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              {addressDetails.addressLine}
              {addressDetails.locality ? `, ${addressDetails.locality}` : ""}
              {addressDetails.landmark ? `, ${addressDetails.landmark}` : ""}
              , {addressDetails.city}, {addressDetails.state} -{" "}
              {addressDetails.pincode}
            </p>

            <p
              className="mt-2 text-sm capitalize opacity-70"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              Delivery type: {addressDetails.deliveryType}
            </p>
          </div>
        </div>

        <div
          className="border-b p-5"
          style={{
            borderColor: colours.border,
          }}
        >
          <h3
            className="mb-4 text-base font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Selected items
          </h3>

          <div className="space-y-4">
            {selectedItems.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-4"
              >
                <div
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: colours.primary,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="line-clamp-1 text-sm font-semibold"
                    style={{
                      color: colours.text,
                      fontFamily: fonts.primary,
                    }}
                  >
                    {item.name}
                  </p>

                  <p
                    className="mt-1 text-sm opacity-55"
                    style={{
                      color: colours.text,
                      fontFamily: fonts.secondary,
                    }}
                  >
                    Qty {item.quantity}
                  </p>
                </div>

                <p
                  className="text-sm font-semibold"
                  style={{
                    color: colours.text,
                    fontFamily: fonts.primary,
                  }}
                >
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <h3
            className="mb-4 text-base font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Payment summary
          </h3>

          <div className="space-y-3">
            <ReviewRow
              label="Subtotal"
              value={`₹${subtotal.toFixed(2)}`}
            />

            <ReviewRow
              label="Discount"
              value={
                discount > 0
                  ? `-₹${discount.toFixed(2)}`
                  : "₹0.00"
              }
            />

            <ReviewRow
              label="Delivery"
              value={
                deliveryCharge === 0
                  ? "Free delivery"
                  : `₹${deliveryCharge.toFixed(2)}`
              }
            />

            <div
              className="border-t pt-3"
              style={{
                borderColor: colours.border,
              }}
            >
              <ReviewRow
                label="Total"
                value={`₹${total.toFixed(2)}`}
                strong
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={strong ? "font-semibold" : "text-sm opacity-60"}
        style={{
          color: colours.text,
          fontFamily: strong ? fonts.primary : fonts.secondary,
        }}
      >
        {label}
      </span>

      <span
        className={strong ? "font-semibold" : "text-sm font-medium"}
        style={{
          color: colours.text,
          fontFamily: strong ? fonts.primary : fonts.secondary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CartSkeleton() {
  return (
    <main
      className="min-h-screen animate-pulse px-4 py-10 sm:px-6 lg:px-10"
      style={{
        backgroundColor: colours.primary,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="mb-3 h-4 w-28 rounded"
          style={{ backgroundColor: colours.border }}
        />

        <div
          className="mb-10 h-10 w-52 rounded"
          style={{ backgroundColor: colours.border }}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <div
            className="h-[560px] rounded-2xl"
            style={{ backgroundColor: colours.border }}
          />

          <div
            className="h-[420px] rounded-2xl"
            style={{ backgroundColor: colours.border }}
          />
        </div>
      </div>
    </main>
  );
}

export default Cart;