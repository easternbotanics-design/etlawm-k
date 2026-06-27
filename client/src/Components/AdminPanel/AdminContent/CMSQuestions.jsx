import { useEffect, useState } from "react";
import { colours, fonts } from "../../../theme/theme";
import { getAdminQuestions, deleteAdminQuestion } from "../../../services/questionService";

/* ── SVG Icons ── */
const DeleteIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-stone-400"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CMSQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminQuestions();
        setQuestions(data.questions ?? []);
      } catch (err) {
        setError(err.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleDelete = async (question) => {
    const confirmed = window.confirm(
      `Delete question from "${question.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(question.id);
      await deleteAdminQuestion(question.id);
      setQuestions((prev) => prev.filter((q) => q.id !== question.id));
    } catch (err) {
      alert(err.message || "Failed to delete question");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter questions based on search query
  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.name?.toLowerCase().includes(query) ||
      q.email?.toLowerCase().includes(query) ||
      q.phone_number?.toLowerCase().includes(query) ||
      q.subject?.toLowerCase().includes(query) ||
      q.message?.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="px-10 py-8"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      {/* Header row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            User Questions
          </h1>

          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            View and manage messages submitted via the Homepage Questions form.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-transparent outline-none focus:border-stone-400 transition-colors"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
            }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading questions...
        </p>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Table Container */}
      {!loading && !error && (
        <div
          className="mt-8 overflow-hidden rounded-2xl border shadow-sm"
          style={{
            borderColor: colours.border,
            backgroundColor: colours.background,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr
                  className="border-b text-xs uppercase tracking-wide"
                  style={{
                    borderColor: colours.border,
                    color: colours.mutedText,
                  }}
                >
                  <th className="px-6 py-4 font-semibold">User Info</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold" style={{ maxWidth: 360 }}>Message</th>
                  <th className="px-6 py-4 font-semibold">Submitted On</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q) => {
                    const initials = (q.name || "?")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    const isDeleting = deletingId === q.id;

                    return (
                      <tr
                        key={q.id}
                        className="border-b transition-colors duration-200 hover:bg-black/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* Name and Initials */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: colours.accent,
                                color: colours.background,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <h3
                                className="text-sm font-semibold"
                                style={{
                                  color: colours.text,
                                  fontFamily: fonts.primary,
                                }}
                              >
                                {q.name}
                              </h3>
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="px-6 py-4 text-xs space-y-1">
                          <div style={{ color: colours.text }}>
                            <strong>Email:</strong> {q.email}
                          </div>
                          <div style={{ color: colours.mutedText }}>
                            <strong>Phone:</strong> {q.phone_number}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4 text-sm" style={{ color: colours.text }}>
                          {q.subject}
                        </td>

                        {/* Message body */}
                        <td
                          className="px-6 py-4 cursor-pointer group"
                          style={{ maxWidth: 360 }}
                          onClick={() => setSelectedQuestion(q)}
                        >
                          <p
                            className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-3 group-hover:underline"
                            style={{ color: colours.text }}
                          >
                            {q.message}
                          </p>
                        </td>

                        {/* Submitted On */}
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colours.mutedText }}
                        >
                          {q.created_at
                            ? new Date(q.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => handleDelete(q)}
                              disabled={isDeleting}
                              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                              style={{
                                borderColor: colours.border,
                                color: "#A44A3F",
                                backgroundColor: colours.background,
                              }}
                              aria-label={`Delete question by ${q.name}`}
                            >
                              {isDeleting ? "..." : <DeleteIcon />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
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
        </div>
      )}

      {/* Modal Popup for Message */}
      {selectedQuestion && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl border border-stone-200/80 animate-in zoom-in-95 duration-200 flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colours.background,
              borderColor: colours.border,
              fontFamily: fonts.secondary
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedQuestion(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-transparent border-none text-xl font-bold cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              &times;
            </button>

            {/* Modal Title (Subject) */}
            <div>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: colours.accent }}
              >
                Subject
              </span>
              <h2
                className="text-xl font-semibold mt-1"
                style={{ color: colours.secondary, fontFamily: fonts.primary }}
              >
                {selectedQuestion.subject}
              </h2>
            </div>

            {/* Message Box */}
            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: colours.accent }}
              >
                Message
              </span>
              <div
                className="max-h-[240px] overflow-y-auto rounded-xl p-4 border text-sm leading-relaxed whitespace-pre-wrap break-words"
                style={{
                  backgroundColor: `${colours.primary}33`,
                  borderColor: colours.border,
                  color: colours.text
                }}
              >
                {selectedQuestion.message}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: colours.accent }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSQuestions;
