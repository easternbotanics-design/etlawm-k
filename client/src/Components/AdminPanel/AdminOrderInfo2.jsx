import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/orderService";
import { colours, fonts } from "../../theme/theme";
import Loader from "../Loader"

function AdminOrderInfo2() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  async function loadOrderDetails() {
    try {
      setLoading(true);
      setError("");
      const result = await getOrderById(orderId);
      const fetchedOrder = result.order ?? result.data?.order ?? result;
      setOrder(fetchedOrder);
    } catch (err) {
      setError(err.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }

  const formatPurchaseDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: colours.subBackground }}>
        <Loader />
      </div>
    );
  }

  const customerName = order?.shipping_name || `${order?.first_name || ""} ${order?.last_name || ""}`.trim() || "Customer";
  const firstName = customerName.split(" ")[0];

  const subtotal = order?.items?.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0) || Number(order?.total || 0);
  const discount = Number(order?.early_bird_discount_amount || 0);
  const deliveryCharge = 0; // Default or calculate from order
  const total = Number(order?.total || 0);

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>

      <main className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center no-print">
          

          <h1
            className="text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight"
            style={{ fontFamily: fonts.primary }}
          >
            Here's your receipt, {firstName}!
          </h1>
        </div>

        {/* Receipt Content Box */}
        <div className="mx-auto max-w-xl mt-12 pt-8 border-t border-stone-100">
          <h2
            className="text-lg font-bold text-stone-900 mb-6"
            style={{ fontFamily: fonts.primary }}
          >
            Your purchase from {formatPurchaseDate(order?.created_at)}
          </h2>

          <div className="space-y-6 text-xs sm:text-sm mb-8" style={{ fontFamily: fonts.secondary }}>
            <div>
              <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] opacity-60">Order number</p>
              <p className="mt-1 font-mono text-stone-800 break-all">#{order?.id?.toUpperCase()}</p>
            </div>
            <div>
              <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] opacity-60">Payment option</p>
              <p className="mt-1 text-stone-800 font-medium">Razorpay (Paid)</p>
            </div>
            {order?.razorpay_payment_id && (
              <div>
                <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] opacity-60">Payment ID</p>
                <p className="mt-1 font-mono text-stone-800 break-all">{order.razorpay_payment_id}</p>
              </div>
            )}
            {order?.coupon_code && (
              <div>
                <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] opacity-60">Coupon Used</p>
                <p className="mt-1 font-mono text-stone-800 uppercase tracking-wider font-semibold">{order.coupon_code}</p>
              </div>
            )}
            <div>
              <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] opacity-60">Delivery address</p>
              <div className="mt-1 text-stone-700 leading-relaxed">
                <p className="font-semibold text-stone-900">{customerName}</p>
                <p>{order?.shipping_line1}</p>
                <p>{order?.shipping_city}, {order?.shipping_state} - {order?.shipping_pincode}</p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-6 py-6 border-t border-stone-100">
            {order?.items?.map((item) => (
              <div key={item.id} className="flex gap-4 items-start py-2">
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-[#FAF9F6] flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs opacity-40">Item</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold text-stone-900" style={{ fontFamily: fonts.primary }}>
                    {item.product_name}
                  </p>
                  <div className="mt-1 text-xs text-stone-500 space-y-0.5" style={{ fontFamily: fonts.secondary }}>
                    <p>Qty: {item.quantity}</p>
                    {item.size_value && (
                      <p>Size: {item.size_value} {item.size_unit}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base font-semibold text-stone-900" style={{ fontFamily: fonts.secondary }}>
                  ₹{(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Breakdowns */}
          <div className="border-t border-stone-100 pt-6">
            <div className="w-full space-y-3 text-xs sm:text-sm text-stone-600" style={{ fontFamily: fonts.secondary }}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-900 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span className="flex items-center gap-1.5">
                    {order?.coupon_code ? `Discount (${order.coupon_code})` : "Launch discount"}
                  </span>
                  <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated shipping</span>
                <span className="text-stone-900 font-medium">
                  {deliveryCharge === 0 ? "Free delivery" : `₹${deliveryCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-100">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="mt-16 pt-8 border-t border-stone-100 no-print" style={{ fontFamily: fonts.secondary }}>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-2">Questions?</h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Don't hesitate to reach out if you need anything at all! Contact us at 8429-121-121 or 7708-234-137. We're always here to help.
            </p>
          </div>


          {/* Action Buttons */}
          <div className="mt-12 flex justify-center no-print" style={{ fontFamily: fonts.secondary }}>
            <button
              onClick={() => window.print()}
              className="cursor-pointer px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-xs font-bold uppercase tracking-widest text-white transition-colors duration-200 border-none"
            >
              Download Receipt
            </button>
          </div>

          <style>{`
            @media print {
              header, nav, .no-print {
                display: none !important;
              }
              main {
                padding-top: 2rem !important;
                padding-bottom: 2rem !important;
                background-color: white !important;
              }
              .mx-auto {
                max-width: 100% !important;
              }
            }
          `}</style>
        </div>
      </main>
    </div>
  );
}

export default AdminOrderInfo2;
