import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/orderService";
import { colours, fonts } from "../../theme/theme";
import Loader from "../Loader";

function AdminOrderInfo() {
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

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: colours.subBackground }}>
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <main
        className="min-h-screen px-4 pb-12 pt-28 sm:px-6 lg:px-10 lg:pb-16 lg:pt-16"
        style={{
          backgroundColor: colours.subBackground,
        }}
      >
        <div className="mx-auto max-w-3xl">
          {/* Success Header Card */}
          <div
            className="mb-8 rounded-2xl border p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
            style={{
              borderColor: colours.border,
              backgroundColor: colours.background,
            }}
          >              

            

            <div className="mt-6 flex flex-col items-center gap-2">
              <div
                className="inline-block rounded-xl px-4 py-2 text-sm font-semibold border"
                style={{
                  borderColor: colours.border,
                  backgroundColor: colours.primary,
                  color: colours.secondary,
                  fontFamily: fonts.secondary,
                }}
              >
                Order ID: <span className="font-mono text-xs opacity-75">{orderId}</span>
              </div>

              {order?.razorpay_payment_id && (
                <div
                  className="inline-block rounded-xl px-4 py-2 text-sm font-semibold border animate-in fade-in duration-200"
                  style={{
                    borderColor: colours.border,
                    backgroundColor: colours.primary,
                    color: colours.secondary,
                    fontFamily: fonts.secondary,
                  }}
                >
                  Payment ID: <span className="font-mono text-xs opacity-75">{order.razorpay_payment_id}</span>
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div
              className="rounded-xl border p-4 text-sm"
              style={{
                borderColor: colours.accent,
                color: colours.text,
                backgroundColor: colours.background,
                fontFamily: fonts.secondary,
              }}
            >
              <p className="font-semibold">Note: {error}</p>
              <p className="mt-1 opacity-70">
                Although we couldn't fetch the details right now, your payment was successful and your order is recorded.
              </p>
            </div>
          ) : (
            order && (
              <div
                className="rounded-2xl border divide-y shadow-[0_4px_24px_rgba(0,0,0,0.01)]"
                style={{
                  borderColor: colours.border,
                  backgroundColor: colours.background,
                  divideColor: colours.border,
                }}
              >
                {/* Delivery details */}
                <div className="p-6">
                  <h2
                    className="text-lg font-semibold mb-4"
                    style={{
                      color: colours.text,
                      fontFamily: fonts.secondary,
                    }}
                  >
                    Delivery Address
                  </h2>

                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: colours.primary,
                      fontFamily: fonts.secondary,
                    }}
                  >
                    <p className="font-semibold" style={{ color: colours.text }}>
                      {order.shipping_name}
                    </p>
                    <p className="mt-2 text-sm opacity-75" style={{ color: colours.text }}>
                      {order.shipping_line1}, {order.shipping_city},{" "}
                      {order.shipping_state} - {order.shipping_pincode}
                    </p>
                  </div>
                </div>

                {/* Items summary */}
                <div className="p-6">
                  <h2
                    className="text-lg font-semibold mb-4"
                    style={{
                      color: colours.text,
                      fontFamily: fonts.secondary,
                    }}
                  >
                    Items Ordered
                  </h2>

                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4"
                        style={{ fontFamily: fonts.secondary }}
                      >
                        <div
                          className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border flex items-center justify-center"
                          style={{
                            backgroundColor: colours.primary,
                            borderColor: colours.border,
                          }}
                        >
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
                          <p
                            className="line-clamp-1 text-sm font-semibold"
                            style={{ color: colours.text }}
                          >
                            {item.product_name}
                          </p>
                          <p className="mt-0.5 text-xs opacity-55">
                            Qty {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                          </p>
                        </div>

                        <p
                          className="text-sm font-semibold"
                          style={{ color: colours.text }}
                        >
                          ₹{(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span
                      style={{
                        color: colours.text,
                        fontFamily: fonts.secondary,
                      }}
                    >
                      Total Paid
                    </span>
                    <span
                      style={{
                        color: colours.text,
                        fontFamily: fonts.secondary,
                      }}
                    >
                      ₹{Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap gap-4 justify-center no-print">
            <button
              onClick={() => window.print()}
              className="cursor-pointer px-6 py-3 text-xs font-bold tracking-[2px] rounded-md uppercase transition-all duration-200"
              style={{
                fontFamily: fonts.secondary,
                backgroundColor: colours.accent,
                color: colours.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colours.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colours.accent;
              }}
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

export default AdminOrderInfo;
