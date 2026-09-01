import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import concernService from "../../../services/concernService.js";

const DeleteIcon = () => (
  <svg
    width="16"
    height="16"
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

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TagIcon = () => (
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
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export default function CMSConcerns() {
  const navigate = useNavigate();

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadConcerns();
  }, []);

  const loadConcerns = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await concernService.getAdminConcerns();
      setConcerns(data.concerns || []);
    } catch (err) {
      setError(err.message || "Failed to load concern tags");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (concern) => {
    const confirmed = window.confirm(
      `Delete concern tag "${concern.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(concern.id);
      await concernService.deleteConcern(concern.id);
      setConcerns((prev) => prev.filter((item) => item.id !== concern.id));
    } catch (err) {
      alert(err.message || "Failed to delete concern tag");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-6 py-8" style={{ fontFamily: fonts.secondary }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: fonts.primary, color: colours.text }}
          >
            Concerns CMS
          </h1>
          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage concern tags available for filtering and assigning to products.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/content/concerns/add")}
          className="px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-md hover:-translate-y-0.5"
          style={{ backgroundColor: colours.secondary, color: colours.background }}
        >
          + Add Concern
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div
            style={{ borderTopColor: colours.accent }}
            className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"
          ></div>
          <p className="text-sm" style={{ color: colours.mutedText }}>
            Loading concerns...
          </p>
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : concerns.length === 0 ? (
        <div
          className="mt-8 p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center"
          style={{ borderColor: colours.border, backgroundColor: colours.background }}
        >
          <div
            className="p-3 rounded-full mb-3"
            style={{ backgroundColor: `${colours.accent}20`, color: colours.accent }}
          >
            <TagIcon />
          </div>
          <p className="text-sm font-semibold" style={{ color: colours.text }}>
            No concern tags found
          </p>
          <p className="text-xs mt-1" style={{ color: colours.mutedText }}>
            Click "+ Add Concern" above to create your first concern tag.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {concerns.map((item) => {
            const isDeleting = deletingId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: colours.background,
                  borderColor: colours.border,
                }}
                className="group relative rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  {item.image_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: colours.border }}>
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span
                      className="p-2 rounded-lg text-xs"
                      style={{
                        backgroundColor: `${colours.accent}15`,
                        color: colours.accent,
                      }}
                    >
                      <TagIcon />
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/content/concerns/edit/${item.id}`)}
                      disabled={isDeleting}
                      style={{ color: colours.accent }}
                      className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-stone-100 transition-all cursor-pointer border-none bg-transparent"
                      title={`Edit ${item.name}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={isDeleting}
                      style={{ color: "#A44A3F" }}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer border-none bg-transparent"
                      title={`Delete ${item.name}`}
                    >
                      {isDeleting ? (
                        <span className="text-[10px]">...</span>
                      ) : (
                        <DeleteIcon />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h3
                    className="text-sm font-semibold truncate"
                    style={{ color: colours.text, fontFamily: fonts.primary }}
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: colours.mutedText }}
                  >
                    {item.slug}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
