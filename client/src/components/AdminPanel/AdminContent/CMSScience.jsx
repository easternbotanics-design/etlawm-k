import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import scienceService from "../../../services/scienceService.js";

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

export default function CMSScience() {
  const navigate = useNavigate();

  const [scienceList, setScienceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadScience();
  }, []);

  const loadScience = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await scienceService.getAdminScience();
      setScienceList(data.science || []);
    } catch (err) {
      setError(err.message || "Failed to load science entries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete science entry "${item.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await scienceService.deleteScience(item.id);
      setScienceList((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      alert(err.message || "Failed to delete science entry");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item) => {
    navigate(`/admin/content/science/edit/${item.id}`);
  };

  return (
    <div className="px-6 py-8" style={{ fontFamily: fonts.secondary }}>
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-serif text-2xl font-semibold text-[#171715]"
            style={{ fontFamily: fonts.primary }}
          >
            Science Section CMS
          </h1>
          <p className="mt-1 text-sm text-[#7C7770]">
            Manage science section entries, box contents, colors, and SVG images shown on the website.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/content/science/add")}
          className="px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-md hover:-translate-y-0.5"
          style={{ backgroundColor: "#171715", color: "#f8f8f8" }}
        >
          + Add Entry
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div
            style={{ borderTopColor: colours.accent }}
            className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"
          ></div>
          <p className="text-sm text-[#7C7770]">Loading science entries...</p>
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : (
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
                  <th className="px-6 py-4 font-semibold w-16">Image</th>
                  <th className="px-6 py-4 font-semibold w-48">Name</th>
                  <th className="px-6 py-4 font-semibold">Descriptions</th>
                  <th className="px-6 py-4 font-semibold w-28">Status</th>
                  <th className="px-6 py-4 font-semibold w-32">Date Created</th>
                  <th className="px-6 py-4 text-right font-semibold w-32">Actions</th>
                </tr>
              </thead>

              <tbody>
                {scienceList.length > 0 ? (
                  scienceList.map((item) => {
                    const isPublished = item.status === "published";
                    const isDeleting = deletingId === item.id;

                    const descList = Array.isArray(item.descriptions) && item.descriptions.length > 0
                      ? item.descriptions
                      : [item.box_1, item.box_2, item.box_3].filter(Boolean);

                    return (
                      <tr
                        key={item.id}
                        className="border-b transition-colors duration-200 hover:bg-black/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* Image Preview */}
                        <td className="px-6 py-4">
                          <div className="h-12 w-12 overflow-hidden rounded-lg border border-black/10 bg-stone-50 flex items-center justify-center p-1">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] text-stone-400 italic">No Image</span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4">
                          <h3
                            className="text-sm font-semibold"
                            style={{
                              color: colours.text,
                              fontFamily: fonts.primary,
                            }}
                          >
                            {item.name || "—"}
                          </h3>
                        </td>

                        {/* Descriptions */}
                        <td className="px-6 py-4">
                          {descList.length > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                                {descList.length} {descList.length === 1 ? 'Paragraph' : 'Paragraphs'}
                              </span>
                              <p className="line-clamp-2 text-xs text-stone-700 max-w-[320px]">
                                {descList[0]}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: isPublished
                                ? colours.primary
                                : "#FEF3C7",
                              color: isPublished ? colours.accent : "#92400E",
                            }}
                          >
                            {isPublished ? "Published" : "Draft"}
                          </span>
                        </td>

                        {/* Date */}
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colours.mutedText }}
                        >
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                              style={{
                                borderColor: colours.border,
                                color: colours.accent,
                                backgroundColor: colours.background,
                              }}
                              aria-label="Edit Science Entry"
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={isDeleting}
                              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                              style={{
                                borderColor: colours.border,
                                color: "#A44A3F",
                                backgroundColor: colours.background,
                              }}
                              aria-label="Delete Science Entry"
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
                      colSpan="9"
                      className="px-6 py-10 text-center text-sm"
                      style={{ color: colours.mutedText }}
                    >
                      No science entries found. Click <strong>+ Add Entry</strong> to create your first entry.
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
