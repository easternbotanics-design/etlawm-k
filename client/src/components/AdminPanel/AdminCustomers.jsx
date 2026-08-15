import { useEffect, useState } from "react";
import { colours, fonts } from "../../theme/theme";
import { getAdminCustomers } from "../../services/adminService";
import TableTemplate from "./TableTemplate";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'admin' | 'customer'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [loginFilter, setLoginFilter] = useState("all"); // 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'never'
  const [sortBy, setSortBy] = useState("created_at"); // 'created_at' | 'last_login_at'
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' | 'asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const formatCustomerDate = (dateStr) => {
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

  // Last Login Filter Logic
  const matchesLoginFilter = (loginDateStr, range) => {
    if (range === "all") return true;
    if (range === "never") return !loginDateStr;
    if (!loginDateStr) return false;
    
    const date = new Date(loginDateStr);
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

  // Filtered & Sorted Customers
  const filteredCustomers = customers
    .filter((customer) => {
      const name = `${customer.first_name || ""} ${customer.last_name || ""}`.toLowerCase();
      const email = (customer.email || "").toLowerCase();
      const phone = (customer.phone_number || "").toLowerCase();
      const id = (customer.id || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        id.includes(query);

      const isUserAdmin = !!customer.is_admin;
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && isUserAdmin) ||
        (roleFilter === "customer" && !isUserAdmin);

      const isUserActive = customer.is_active !== false;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isUserActive) ||
        (statusFilter === "inactive" && !isUserActive);

      const matchesLogin = matchesLoginFilter(customer.last_login_at, loginFilter);

      return matchesSearch && matchesRole && matchesStatus && matchesLogin;
    })
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      const timeA = valA ? new Date(valA).getTime() : 0;
      const timeB = valB ? new Date(valB).getTime() : 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  // Paginated Customers
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    {
      key: "name",
      label: "CUSTOMER DETAILS",
      render: (customer) => (
        <div>
          <span className="text-xs md:text-sm font-semibold text-[#171715] block">
            {`${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Guest Customer"}
          </span>
          <span className="font-mono text-[10px] text-[#7C7770] block mt-1 select-all">
            ID: {customer.id}
          </span>
        </div>
      ),
    },
    {
      key: "contact",
      label: "CONTACT DETAILS",
      render: (customer) => (
        <div className="flex flex-col">
          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="text-xs md:text-sm text-[#171715] hover:text-[#A77C6B] underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.email}
            </a>
          ) : (
            <span className="text-xs text-[#7C7770] italic">—</span>
          )}
          {customer.phone_number ? (
            <a
              href={`tel:${customer.phone_number}`}
              className="text-[10px] md:text-xs text-[#7C7770] hover:text-[#A77C6B] underline mt-0.5 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.phone_number}
            </a>
          ) : (
            <span className="text-[10px] text-[#7C7770] italic mt-0.5">—</span>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "REGISTRATION DATE",
      sortable: true,
      render: (customer) => {
        const regDate = formatCustomerDate(customer.created_at);
        return (
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-medium text-[#171715]">
              {regDate.date}
            </span>
            <span className="text-[10px] md:text-xs text-[#7C7770] mt-0.5">
              {regDate.relative}
            </span>
          </div>
        );
      },
    },
    {
      key: "last_login_at",
      label: "LAST LOGIN",
      sortable: true,
      render: (customer) => {
        const lastLogin = formatCustomerDate(customer.last_login_at);
        return customer.last_login_at ? (
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-medium text-[#171715]">
              {lastLogin.date}
            </span>
            <span className="text-[10px] md:text-xs text-[#7C7770] mt-0.5">
              {lastLogin.relative}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[#7C7770] italic">Never</span>
        );
      },
    },
    {
      key: "role_status",
      label: "ROLE / STATUS",
      render: (customer) => (
        <div className="flex flex-col gap-1.5 items-start">
          {customer.is_admin ? (
            <span className="text-[10px] md:text-xs font-semibold px-2.5 py-0.5 rounded-full border text-amber-700 bg-amber-50/80 border-amber-200 inline-block">
              Admin
            </span>
          ) : (
            <span className="text-[10px] md:text-xs font-semibold px-2.5 py-0.5 rounded-full border text-stone-600 bg-stone-50 border-stone-200 inline-block">
              Customer
            </span>
          )}

          {customer.is_active !== false ? (
            <span className="text-[10px] md:text-xs font-semibold px-2.5 py-0.5 rounded-full border text-emerald-700 bg-emerald-50/80 border-emerald-200 inline-block">
              Active
            </span>
          ) : (
            <span className="text-[10px] md:text-xs font-semibold px-2.5 py-0.5 rounded-full border text-red-700 bg-red-50/80 border-red-200 inline-block">
              Inactive
            </span>
          )}
        </div>
      ),
    },
  ];

  const handleSortChange = (key, dir) => {
    if (key === "created_at" || key === "last_login_at") {
      setSortBy(key);
      setSortOrder(dir);
      setCurrentPage(1);
    }
  };

  return (
    <div className="px-6 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
          Customers
        </h1>

        <div className="flex flex-col-reverse md:flex-row md:flex-wrap items-stretch md:items-center gap-3 w-full lg:w-auto shrink">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs md:text-sm rounded-lg border bg-white cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-all duration-200 w-full md:w-auto shrink-0"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
              fontFamily: fonts.secondary,
            }}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs md:text-sm rounded-lg border bg-white cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-all duration-200 w-full md:w-auto shrink-0"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
              fontFamily: fonts.secondary,
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Last Login Filter */}
          <select
            value={loginFilter}
            onChange={(e) => {
              setLoginFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs md:text-sm rounded-lg border bg-white cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-all duration-200 w-full md:w-auto shrink-0"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
              fontFamily: fonts.secondary,
            }}
          >
            <option value="all">All Logins</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="never">Never Logged In</option>
          </select>

          {/* Search Field */}
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-xs md:text-sm rounded-lg border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-[#A77C6B] transition-all duration-200 w-full md:w-48 lg:w-64 min-w-[120px] shrink"
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
          <p className="text-sm text-[#7C7770]">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <TableTemplate
            columns={columns}
            data={paginatedCustomers}
            sortKey={sortBy}
            sortDir={sortOrder}
            onSortChange={handleSortChange}
            emptyLabel="No customers found."
          />

          {/* Pagination Controls */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-xl border bg-white shadow-sm"
            style={{
              borderColor: colours.border,
              fontFamily: fonts.secondary,
            }}
          >
            <span className="text-xs text-[#7C7770]">
              Showing {filteredCustomers.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
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

