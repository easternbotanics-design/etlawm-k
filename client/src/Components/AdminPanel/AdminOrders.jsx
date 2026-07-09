import { useEffect, useState } from "react";
import { colours, fonts } from "../../theme/theme";
import { getAllOrders } from "../../services/orderService";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' | 'asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };




  const formatOrderDate = (dateStr) => {
    if (!dateStr) return { date: "—", relative: "" };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: "—", relative: "" };

    // Format: DD.MM.YYYY HH:mm
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const dateFormatted = `${day}.${month}.${year} ${hours}:${minutes}`;

    // Relative time
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = "";
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      const remainingMins = diffMins % 60;
      relative = `${diffDays}d ${String(remainingHours).padStart(2, "0")}:${String(remainingMins).padStart(2, "0")}h ago`;
    } else if (diffHours > 0) {
      const remainingMins = diffMins % 60;
      relative = `${diffHours}:${String(remainingMins).padStart(2, "0")}h ago`;
    } else {
      relative = `${diffMins}m ago`;
    }

    return { date: dateFormatted, relative };
  };

  // Date Filter Logic
  const matchesDateFilter = (createdDateStr, range) => {
    if (range === "all") return true;
    const date = new Date(createdDateStr);
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (range === "today") {
      return date >= todayStart;
    }
    if (range === "yesterday") {
      return date >= yesterdayStart && date < todayStart;
    }

    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (range === "last7") {
      return diffDays <= 7;
    }
    if (range === "last30") {
      return diffDays <= 30;
    }
    return true;
  };

  // Filtered & Sorted Orders
  const filteredOrders = orders
    .filter((order) => {
      const shortId = order.id.slice(0, 8).toLowerCase();
      const query = searchQuery.toLowerCase();
      const name = (order.shipping_name || `${order.first_name || ""} ${order.last_name || ""}`).toLowerCase();
      const phone = (order.phone_number || "").toLowerCase();
      const address = `${order.shipping_line1} ${order.shipping_city}`.toLowerCase();

      const matchesSearch =
        shortId.includes(query) ||
        name.includes(query) ||
        phone.includes(query) ||
        address.includes(query);

      const matchesDate = matchesDateFilter(order.created_at, dateRange);

      const isPaid = ["paid", "shipped", "delivered"].includes(order.status) ||
        (order.razorpay_payment_id &&
          order.razorpay_payment_id !== "payment failed" &&
          order.razorpay_payment_id !== "cart abandoned");
      const isFailed = order.status === "failed" || order.razorpay_payment_id === "payment failed";

      const matchesPaymentFilter = isPaid || isFailed;

      return matchesSearch && matchesDate && matchesPaymentFilter;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  // Paginated Orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="px-6 md:px-10 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Header and Search Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
          Orders
        </h1>

        <div className="flex items-center gap-3">
          {/* Date Filter Dropdown */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs md:text-sm rounded-lg border bg-white cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
              fontFamily: fonts.secondary,
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
          </select>

          {/* Search Field */}
          <input
            type="text"
            placeholder="Search ID, name, phone number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-xs md:text-sm rounded-lg border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-[#A77C6B] transition-all duration-200 w-56 md:w-64"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
              fontFamily: fonts.secondary,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"></div>
          <p className="text-sm text-[#7C7770]">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            borderColor: colours.border,
            backgroundColor: colours.primary, // using primary color palette (#F7F3EC) for warm aesthetic
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
                  <th className="px-6 py-4 font-bold w-[12%]">ID</th>
                  <th
                    className="px-6 py-4 font-bold w-[18%] cursor-pointer select-none group"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    title="Click to sort by date"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <span className="text-[#7C7770] group-hover:text-[#171715] transition-colors font-mono">
                        {sortOrder === "desc" ? "↓" : "↑"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-bold w-[25%]">Personal Details</th>
                  <th className="px-6 py-4 font-bold w-[30%]">Shipping Details</th>
                  <th className="px-6 py-4 font-bold w-[15%]">Payment ID</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const dateInfo = formatOrderDate(order.created_at);

                    return (
                      <tr
                        key={order.id}
                        className="border-b transition-colors duration-200 hover:bg-[#171715]/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* ID */}
                        <td className="px-6 py-5 align-top">
                          <a
                            href={`/orders/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={order.id.toUpperCase()}
                            className="font-mono text-xs md:text-sm font-semibold text-[#171715] block select-all hover:text-[#A77C6B] hover:underline"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}...
                          </a>
                          {/* Price Tag underneath ID */}
                          <span className="text-xs text-[#171715] font-semibold block mt-1">
                            ₹{parseFloat(order.total).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          {order.coupon_code && (
                            <span className="flex items-center gap-1 mt-2 w-fit font-mono text-[10px] font-bold text-[#A77C6B] bg-[#FAF6F0] border border-[#EBE3D5] rounded-md px-2 py-0.5 uppercase tracking-wide" title="Applied Promo Code">
                              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 10.75h.75V9A4.756 4.756 0 0 0 17 4.25H7A4.756 4.756 0 0 0 2.25 9v1.75H3a1.25 1.25 0 0 1 0 2.5h-.75V15A4.756 4.756 0 0 0 7 19.75h10A4.756 4.756 0 0 0 21.75 15v-1.75H21a1.25 1.25 0 0 1 0-2.5Zm-.75 3.9V15A3.254 3.254 0 0 1 17 18.25h-1.25V16a.75.75 0 0 0-1.5 0v2.25H7A3.254 3.254 0 0 1 3.75 15v-.354a2.75 2.75 0 0 0 0-5.292V9A3.254 3.254 0 0 1 7 5.75h7.25V8a.75.75 0 0 0 1.5 0V5.75H17A3.254 3.254 0 0 1 20.25 9v.354a2.75 2.75 0 0 0 0 5.292ZM15.75 11v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Z" />
                              </svg>
                              {order.coupon_code}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-medium text-[#171715]">
                              {dateInfo.date}
                            </span>
                            <span className="text-[10px] md:text-xs text-[#7C7770] mt-0.5">
                              {dateInfo.relative}
                            </span>
                          </div>
                        </td>

                        {/* Personal Details */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-medium text-[#171715]">
                              {order.shipping_name ||
                                `${order.first_name || ""} ${order.last_name || ""}`.trim() ||
                                "Guest Customer"}
                            </span>
                            {order.email && (
                              <a
                                href={`mailto:${order.email}`}
                                className="text-[10px] md:text-xs text-[#7C7770] hover:text-[#A77C6B] underline mt-0.5 tracking-tight transition-colors"
                              >
                                {order.email}
                              </a>
                            )}
                            {order.phone_number && (
                              <a
                                href={`tel:${order.phone_number}`}
                                className="text-[10px] md:text-xs text-[#7C7770] hover:text-[#A77C6B] underline mt-0.5 tracking-tight transition-colors"
                              >
                                {order.phone_number}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Shipping Details */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col text-xs md:text-sm text-[#171715]/90 max-w-[280px]">
                            <span>{order.shipping_line1}</span>
                            <span className="text-[#7C7770] text-xs mt-0.5">
                              {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
                            </span>
                          </div>
                        </td>

                        {/* Razorpay Payment ID Column */}
                        <td className="px-6 py-5 align-top">
                          {order.razorpay_payment_id ? (
                            order.razorpay_payment_id === "payment failed" ? (
                              <span className="text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full border text-red-700 bg-red-50/80 border-red-200 inline-block">
                                Payment Failed
                              </span>
                            ) : order.razorpay_payment_id === "cart abandoned" ? (
                              <span className="text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full border text-amber-700 bg-amber-50/80 border-amber-200 inline-block">
                                Cart Abandoned
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs md:text-sm font-semibold text-[#171715] select-all bg-[#FAF9F6]/85 border border-[#D8D2C8] px-2 py-1 rounded">
                                  {order.razorpay_payment_id}
                                </span>
                                <button
                                  onClick={() => handleCopy(order.razorpay_payment_id)}
                                  className="p-1 rounded hover:bg-stone-200/60 transition-colors border-none cursor-pointer text-[#7C7770] flex items-center justify-center"
                                  title="Copy Payment ID"
                                >
                                  {copiedId === order.razorpay_payment_id ? (
                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-[#7C7770] italic">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-sm"
                      style={{ color: colours.mutedText }}
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t"
            style={{
              borderColor: colours.border,
              fontFamily: fonts.secondary,
            }}
          >
            <span className="text-xs text-[#7C7770]">
              Showing {filteredOrders.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer border-solid"
                style={{ borderColor: colours.border, color: colours.secondary }}
              >
                Previous 50
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer border-solid"
                style={{ borderColor: colours.border, color: colours.secondary }}
              >
                Next 50
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
