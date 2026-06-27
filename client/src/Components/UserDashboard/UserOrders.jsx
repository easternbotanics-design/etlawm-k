import { useState, useEffect } from "react";
import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { colours, fonts } from "../../theme/theme";

const API = import.meta.env.VITE_SERVER_API;

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingOrderDetails, setLoadingOrderDetails] = useState({});

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleOrderExpand = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);

    if (!orderDetails[orderId]) {
      try {
        setLoadingOrderDetails(prev => ({ ...prev, [orderId]: true }));
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrderDetails(prev => ({ ...prev, [orderId]: data.order }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrderDetails(prev => ({ ...prev, [orderId]: false }));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
        <p className="text-xs text-stone-400 mt-2">Retrieving orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-medium tracking-wide text-neutral-800" style={{ fontFamily: fonts.primary }}>
          Order History
        </h2>
        <p className="text-xs text-stone-400 mt-1">Logs of your previous purchases and order status</p>
      </div>

      {orders.length === 0 ? (
        <div className="border rounded-xl p-8 text-center bg-white shadow-xs" style={{ borderColor: colours.border }}>
          <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 mb-3" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">No orders logged</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">You haven't placed any purchases under this account yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedOrder === order.id;
            const details = orderDetails[order.id];
            const isLoadingDetails = loadingOrderDetails[order.id];

            const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const getStatusStyles = (status) => {
              const normalized = String(status).toLowerCase();
              if (normalized === 'paid' || normalized === 'delivered') {
                return { text: 'Paid', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
              } else if (normalized === 'shipped') {
                return { text: 'Shipped', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
              } else if (normalized === 'cancelled') {
                return { text: 'Cancelled', bg: 'bg-red-50 text-red-800 border-red-200' };
              }
              return { text: status, bg: 'bg-amber-50 text-amber-800 border-amber-200' };
            };

            const badge = getStatusStyles(order.status);

            return (
              <div 
                key={order.id} 
                className="bg-white border rounded-xl overflow-hidden shadow-xs hover:border-neutral-300 transition-colors"
                style={{ borderColor: colours.border }}
              >
                {/* Header click bar */}
                <div 
                  onClick={() => toggleOrderExpand(order.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400">Order ID</span>
                      <span className="text-xs font-semibold text-neutral-850 block truncate max-w-[120px] sm:max-w-none mt-0.5">
                        #{String(order.id).split('-')[0].toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400">Purchased On</span>
                      <span className="text-xs text-neutral-850 font-semibold block mt-0.5">{orderDate}</span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400">Fulfillment</span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mt-1 ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400">Grand Total</span>
                      <span className="text-xs text-neutral-850 font-bold block mt-0.5">₹{parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 pl-4 border-t pt-3 sm:border-t-0 sm:pt-0" style={{ borderTopColor: colours.border }}>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details list */}
                {isExpanded && (
                  <div className="border-t p-5 bg-neutral-50/50" style={{ borderTopColor: colours.border }}>
                    {isLoadingDetails ? (
                      <div className="flex items-center gap-2 py-4">
                        <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
                        <span className="text-xs text-stone-400">Loading purchase details...</span>
                      </div>
                    ) : details ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b" style={{ borderBottomColor: colours.border }}>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Shipping Details</span>
                            <p className="text-xs font-semibold text-neutral-850">{details.shipping_name}</p>
                            <p className="text-[11px] text-neutral-600 leading-normal mt-0.5">
                              {details.shipping_line1}, {details.shipping_city}, {details.shipping_state} - {details.shipping_pincode}
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Billing Summary</span>
                            <div className="text-xs text-neutral-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-neutral-800">₹{parseFloat(details.total).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery charge</span>
                                <span className="text-emerald-700 font-bold uppercase text-[9px] tracking-wider mt-0.5">Free</span>
                              </div>
                              <div className="flex justify-between border-t pt-1 font-bold text-neutral-850" style={{ borderColor: colours.border }}>
                                <span>Paid Total</span>
                                <span>₹{parseFloat(details.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-3">Purchased Items</span>
                          <div className="space-y-3">
                            {details.items && details.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3.5">
                                <div className="w-12 h-12 bg-white border rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.image_url ? (
                                    <img 
                                      src={`${API}${item.image_url}`} 
                                      alt={item.product_name} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ShoppingBag className="w-5 h-5 text-stone-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-neutral-850 truncate">{item.product_name}</h5>
                                  <p className="text-[10px] text-stone-400 mt-0.5">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-xs font-semibold text-neutral-850">
                                  ₹{parseFloat(item.unit_price).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-red-750">Failed to load details.</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
