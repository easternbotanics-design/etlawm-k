import { useEffect, useState } from "react";
import { colours, fonts } from "../../theme/theme";
import { getAdminQuestions } from "../../services/adminService";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' | 'asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const formatQuestionDate = (dateStr) => {
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

  // Filtered & Sorted Questions
  const filteredQuestions = questions
    .filter((q) => {
      const name = (q.name || "").toLowerCase();
      const email = (q.email || "").toLowerCase();
      const phone = (q.phone_number || "").toLowerCase();
      const subject = (q.subject || "").toLowerCase();
      const message = (q.message || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        subject.includes(query) ||
        message.includes(query);

      const matchesDate = matchesDateFilter(q.created_at, dateRange);

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  // Paginated Questions
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="px-6 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
          Homepage Questions
        </h1>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto shrink">
          {/* Date Filter Dropdown */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs md:text-sm rounded-lg border bg-white cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-all duration-200 w-full md:w-auto shrink-0"
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
            placeholder="Search name, email, subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-xs md:text-sm rounded-lg border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 w-full md:w-48 lg:w-64 min-w-[120px] shrink"
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
          <p className="text-sm text-[#7C7770]">Loading questions...</p>
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
                  <th className="px-6 py-4 font-bold w-[25%]">Submitter Details</th>
                  <th className="px-6 py-4 font-bold w-[20%]">Subject</th>
                  <th className="px-6 py-4 font-bold w-[35%]">Message</th>
                  <th
                    className="px-6 py-4 font-bold w-[20%] cursor-pointer select-none group"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    title="Click to sort by date"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date Submitted</span>
                      <span className="text-[#7C7770] group-hover:text-[#171715] transition-colors font-mono">
                        {sortOrder === "desc" ? "↓" : "↑"}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedQuestions.length > 0 ? (
                  paginatedQuestions.map((q) => {
                    const dateInfo = formatQuestionDate(q.created_at);

                    return (
                      <tr
                        key={q.id}
                        className="border-b transition-colors duration-200 hover:bg-[#171715]/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* Submitter Details */}
                        <td className="px-6 py-5 align-top">
                          <span className="text-xs md:text-sm font-semibold text-[#171715] block">
                            {q.name || "Anonymous Submitter"}
                          </span>
                          <div className="flex flex-col mt-1">
                            {q.email && (
                              <a
                                href={`mailto:${q.email}`}
                                className="text-[10px] md:text-xs text-[#7C7770] hover:text-[#A77C6B] underline transition-colors"
                              >
                                {q.email}
                              </a>
                            )}
                            {q.phone_number && (
                              <a
                                href={`tel:${q.phone_number}`}
                                className="text-[10px] md:text-xs text-[#7C7770] hover:text-[#A77C6B] underline mt-0.5 transition-colors"
                              >
                                {q.phone_number}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-5 align-top">
                          <span className="text-xs md:text-sm font-medium text-[#171715]">
                            {q.subject || "—"}
                          </span>
                        </td>

                        {/* Message */}
                        <td className="px-6 py-5 align-top max-w-sm">
                          <span 
                            title={q.message}
                            className="text-xs md:text-sm text-[#171715]/90 block line-clamp-3 select-all cursor-pointer"
                          >
                            {q.message || "—"}
                          </span>
                        </td>

                        {/* Date Submitted */}
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
                      No questions found.
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
              Showing {filteredQuestions.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
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
