import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import ritualService from "../../../services/ritualService.js";
import TableTemplate from "../TableTemplate";

const EditIcon = () => (
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
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

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

export default function CMSRituals() {
  const navigate = useNavigate();

  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadRituals();
  }, []);

  const loadRituals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ritualService.getAdminRituals();
      setRituals(data.rituals || []);
    } catch (err) {
      setError(err.message || "Failed to load rituals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ritual) => {
    const confirmed = window.confirm(
      `Delete ritual for product "${ritual.product_name || 'Associated Product'}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(ritual.id);
      await ritualService.deleteRitual(ritual.id);
      setRituals((prev) => prev.filter((item) => item.id !== ritual.id));
    } catch (err) {
      alert(err.message || "Failed to delete ritual");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (ritual) => {
    navigate(`/admin/content/rituals/edit/${ritual.id}`);
  };

  const columns = [
    {
      key: "image",
      label: "IMAGE",
      render: (ritual) => (
        <div className="h-12 w-12 overflow-hidden rounded-lg border border-black/10 bg-white">
          {ritual.image_url ? (
            <img
              src={ritual.image_url}
              alt={ritual.title || ritual.product_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400 text-xs">
              No img
            </div>
          )}
        </div>
      ),
    },
    {
      key: "product_name",
      label: "PRODUCT",
      render: (ritual) => (
        <h3
          className="text-sm font-semibold"
          style={{
            color: colours.text,
            fontFamily: fonts.primary,
          }}
        >
          {ritual.product_name || "—"}
        </h3>
      ),
    },
    {
      key: "title",
      label: "RITUAL TITLE",
      render: (ritual) => (
        <div>
          <div className="text-sm text-stone-800 font-medium">
            {ritual.title || "—"}
          </div>
          {ritual.description && (
            <p className="line-clamp-1 text-xs text-stone-500 mt-0.5">
              {ritual.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (ritual) => {
        const isPublished = ritual.status === "published";
        return (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: isPublished ? colours.primary : "#FEF3C7",
              color: isPublished ? colours.accent : "#92400E",
            }}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "DATE CREATED",
      render: (ritual) => (
        <span className="text-sm" style={{ color: colours.mutedText }}>
          {ritual.created_at
            ? new Date(ritual.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (ritual) => {
        const isDeleting = deletingId === ritual.id;
        return (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleEdit(ritual)}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: colours.accent,
                backgroundColor: colours.background,
              }}
              aria-label="Edit Ritual"
            >
              <EditIcon />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(ritual)}
              disabled={isDeleting}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: "#A44A3F",
                backgroundColor: colours.background,
              }}
              aria-label="Delete Ritual"
            >
              {isDeleting ? "..." : <DeleteIcon />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="px-6 py-8" style={{ fontFamily: fonts.secondary }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#171715]" style={{ fontFamily: fonts.primary }}>
            Rituals CMS
          </h1>
          <p className="mt-1 text-sm text-[#7C7770]">
            Manage the list of product rituals shown on the website.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/content/rituals/add")}
          className="px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-md hover:-translate-y-0.5 animate-in fade-in zoom-in-95 duration-250"
          style={{ backgroundColor: "#171715", color: "#f8f8f8" }}
        >
          + Add Ritual
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"></div>
          <p className="text-sm text-[#7C7770]">Loading rituals...</p>
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : (
        <div className="mt-8">
          <TableTemplate
            columns={columns}
            data={rituals}
            emptyLabel="No rituals found. Add a new ritual to get started."
          />
        </div>
      )}
    </div>
  );
}

