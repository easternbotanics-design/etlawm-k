import { useEffect, useState } from "react";
import { colours, fonts } from "../../theme/theme";
import { getAllOrders, updateOrderShipment } from "../../services/orderService";

export default function AdminShipments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Track status updates per row
  const [updatingRow, setUpdatingRow] = useState(null);
  
  // Track locally typed tracking IDs and statuses
  const [trackingInputs, setTrackingInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});
  const [savedTracking, setSavedTracking] = useState({});

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("unpacked"); // "unpacked" | "packed"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      const fetchedOrders = (data.orders || []).filter(
        (o) => o.razorpay_payment_id != null
      );
      setOrders(fetchedOrders);
      
      // Initialize tracking and status inputs state
      const initialInputs = {};
      const initialStatus = {};
      fetchedOrders.forEach(o => {
        initialInputs[o.id] = o.tracking_id || "";
        initialStatus[o.id] = o.shipment_status || "unpacked";
      });
      setTrackingInputs(initialInputs);
      setStatusInputs(initialStatus);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShipment = async (orderId) => {
    const trackingId = (trackingInputs[orderId] || "").trim();
    const shipmentStatus = statusInputs[orderId] || "unpacked";
    
    setUpdatingRow(orderId);
    setError("");
    setSuccess("");
    try {
      await updateOrderShipment(orderId, {
        shipment_status: shipmentStatus,
        tracking_id: trackingId || null
      });
      
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        shipment_status: shipmentStatus, 
        tracking_id: trackingId || null 
      } : o));
      
      setSavedTracking(prev => ({ ...prev, [orderId]: true }));
      setSuccess(`Shipment details for order #${orderId.slice(0, 8).toUpperCase()} saved.`);
      setTimeout(() => {
        setSavedTracking(prev => ({ ...prev, [orderId]: false }));
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to save shipment details");
    } finally {
      setUpdatingRow(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    // Standardize default status to unpacked if null/empty
    const currentStatus = o.shipment_status || "unpacked";
    if (currentStatus !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const shortId = o.id.slice(0, 8).toLowerCase();
      const name = (o.shipping_name || `${o.first_name || ""} ${o.last_name || ""}`).toLowerCase();
      const phone = (o.phone_number || "").toLowerCase();
      const address = `${o.shipping_line1} ${o.shipping_city}`.toLowerCase();
      
      return shortId.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q);
    }

    return true;
  });

  return (
    <div className="px-6 md:px-10 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
            Shipments & Dispatch
          </h1>
          <p className="text-xs text-[#7C7770] mt-1">
            Track customer shipments, manage packing states, and record carrier tracking codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Unpacked / Packed Toggle Filters */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setStatusFilter("unpacked")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                statusFilter === "unpacked"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-[#7C7770] hover:text-stone-900"
              }`}
            >
              Unpacked
            </button>
            <button
              onClick={() => setStatusFilter("packed")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                statusFilter === "packed"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-[#7C7770] hover:text-stone-900"
              }`}
            >
              Packed
            </button>
          </div>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search order ID, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 text-xs md:text-sm rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-[#A77C6B] transition-all duration-200 w-48 sm:w-56"
            style={{ borderColor: colours.border }}
          />
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r-lg transition-all duration-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg transition-all duration-200">
          {error}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"></div>
          <p className="text-sm text-[#7C7770]">Loading shipments info...</p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border shadow-sm animate-in fade-in duration-300"
          style={{
            borderColor: colours.border,
            backgroundColor: colours.primary,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr
                  className="border-b text-[10px] md:text-xs uppercase tracking-widest"
                  style={{
                    borderColor: colours.border,
                    color: colours.mutedText,
                  }}
                >
                  <th className="px-6 py-4 font-bold w-[15%]">Order ID</th>
                  <th className="px-6 py-4 font-bold w-[20%]">Customer Name</th>
                  <th className="px-6 py-4 font-bold w-[20%]">Contact Details</th>
                  <th className="px-6 py-4 font-bold w-[25%]">Delivery Address</th>
                  <th className="px-6 py-4 font-bold w-[10%]">Status</th>
                  <th className="px-6 py-4 font-bold w-[10%] text-right">Tracking ID</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const customerName = order.shipping_name || `${order.first_name || ""} ${order.last_name || ""}`.trim() || "Guest Customer";
                    const isSaving = updatingRow === order.id;

                    return (
                      <tr
                        key={order.id}
                        className="border-b transition-colors duration-200 hover:bg-[#171715]/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* Order ID */}
                        <td className="px-6 py-5 align-middle">
                          <a
                            href={`/orders/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs md:text-sm font-semibold text-[#171715] hover:text-[#A77C6B] hover:underline"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}...
                          </a>
                        </td>

                        {/* Customer Name */}
                        <td className="px-6 py-5 align-middle">
                          <span className="text-xs md:text-sm font-semibold text-[#171715]">
                            {customerName}
                          </span>
                        </td>

                        {/* Contact Details */}
                        <td className="px-6 py-5 align-middle text-xs md:text-sm">
                          <div className="flex flex-col">
                            {order.email ? (
                              <a href={`mailto:${order.email}`} className="text-stone-600 hover:text-accent underline">
                                {order.email}
                              </a>
                            ) : (
                              <span className="text-stone-400 italic">No email</span>
                            )}
                            {order.phone_number && (
                              <a href={`tel:${order.phone_number}`} className="text-stone-600 hover:text-accent underline mt-0.5">
                                {order.phone_number}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Delivery Address */}
                        <td className="px-6 py-5 align-middle text-xs md:text-sm">
                          <div className="flex flex-col text-stone-600 max-w-[280px]">
                            <span>{order.shipping_line1}</span>
                            <span className="text-[11px] text-[#7C7770]">
                              {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
                            </span>
                          </div>
                        </td>

                        {/* Status (Dropdown) */}
                        <td className="px-6 py-5 align-middle">
                          <select
                            value={statusInputs[order.id] || "unpacked"}
                            onChange={(e) => setStatusInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                            disabled={isSaving}
                            className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-white cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50"
                            style={{ borderColor: colours.border }}
                          >
                            <option value="unpacked">Unpacked</option>
                            <option value="packed">Packed</option>
                          </select>
                        </td>

                        {/* Tracking ID (Input & Save button) */}
                        <td className="px-6 py-5 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              value={trackingInputs[order.id] || ""}
                              placeholder="e.g. TRK123456"
                              disabled={isSaving}
                              onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveShipment(order.id);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg border text-xs bg-white placeholder-stone-300 focus:ring-1 focus:ring-accent outline-none w-28 sm:w-36 text-left font-mono"
                              style={{ borderColor: colours.border }}
                            />
                            
                            <button
                              onClick={() => handleSaveShipment(order.id)}
                              disabled={isSaving}
                              className={`p-1.5 rounded-lg border border-solid transition-all cursor-pointer flex items-center justify-center ${
                                savedTracking[order.id]
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                  : "bg-white hover:bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-700"
                              }`}
                              title="Save Shipment details"
                            >
                              {savedTracking[order.id] ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm" style={{ color: colours.mutedText }}>
                      No {statusFilter} shipments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
