import { useEffect, useState } from "react";
import { colours, fonts } from "../../theme/theme";
import { getAllOrders } from "../../services/orderService";

export default function AdminCarts() {
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
      setError(err.message || "Failed to load cart entries");
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

  // Filtered & Sorted Orders (All Rows, No Payment Filter)
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

      const hasNullPaymentId = !order.razorpay_payment_id;

      return matchesSearch && matchesDate && hasNullPaymentId;
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
          Abandoned Carts
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
          <p className="text-sm text-[#7C7770]">Loading carts...</p>
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
                  <th className="px-6 py-4 font-bold w-[15%]">ID</th>
                  <th
                    className="px-6 py-4 font-bold w-[20%] cursor-pointer select-none group"
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
                  <th className="px-6 py-4 font-bold w-[30%]">Personal Details</th>
                  <th className="px-6 py-4 font-bold w-[35%]">Shipping Details</th>
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
                          <span
                            title={order.id.toUpperCase()}
                            className="font-mono text-xs md:text-sm font-semibold text-[#171715] block select-all cursor-pointer"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}...
                          </span>
                          {/* Price Tag underneath ID */}
                          <span className="text-xs text-[#171715] font-semibold block mt-1">
                            ₹{parseFloat(order.total).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
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
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-sm"
                      style={{ color: colours.mutedText }}
                    >
                      No cart entries found.
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
