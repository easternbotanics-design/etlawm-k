import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import ingredientService from "../../../services/ingredientService.js";

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

export default function CMSIngredients() {
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ingredientService.getAdminIngredients();
      setIngredients(data.ingredients || []);
    } catch (err) {
      setError(err.message || "Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ingredient) => {
    const confirmed = window.confirm(
      `Delete ingredient "${ingredient.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(ingredient.id);
      await ingredientService.deleteIngredient(ingredient.id);
      setIngredients((prev) => prev.filter((item) => item.id !== ingredient.id));
    } catch (err) {
      alert(err.message || "Failed to delete ingredient");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (ingredient) => {
    navigate(`/admin/content/ingredients/edit/${ingredient.id}`);
  };

  return (
    <div className="px-10 py-8" style={{ fontFamily: fonts.secondary }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#171715]" style={{ fontFamily: fonts.primary }}>
            Ingredients CMS
          </h1>
          <p className="mt-1 text-sm text-[#7C7770]">
            Manage the list of ingredients shown on the ingredients page.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/content/ingredients/add")}
          className="px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-md hover:-translate-y-0.5 animate-in fade-in zoom-in-95 duration-250"
          style={{ backgroundColor: "#171715", color: "#f8f8f8" }}
        >
          + Add Ingredient
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"></div>
          <p className="text-sm text-[#7C7770]">Loading ingredients...</p>
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : (
        <div
          className="mt-8 overflow-hidden rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            borderColor: colours.border,
            backgroundColor: colours.background,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr
                  className="border-b text-xs uppercase tracking-wide"
                  style={{
                    borderColor: colours.border,
                    color: colours.mutedText,
                  }}
                >
                  <th className="px-6 py-4 font-semibold w-16">Image</th>
                  <th className="px-6 py-4 font-semibold w-40">Name</th>
                  <th className="px-6 py-4 font-semibold">Description Paragraphs</th>
                  <th className="px-6 py-4 font-semibold w-28">Status</th>
                  <th className="px-6 py-4 font-semibold w-32">Date Created</th>
                  <th className="px-6 py-4 text-right font-semibold w-32">Actions</th>
                </tr>
              </thead>

              <tbody>
                {ingredients.length > 0 ? (
                  ingredients.map((ing) => {
                    const isPublished = ing.status === "published";
                    const isDeleting = deletingId === ing.id;

                    return (
                      <tr
                        key={ing.id}
                        className="border-b transition-colors duration-200 hover:bg-black/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* Image */}
                        <td className="px-6 py-4">
                          <div className="h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-white">
                            <img
                              src={ing.image_url}
                              alt={ing.name}
                              className="h-full w-full object-cover"
                            />
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
                            {ing.name}
                          </h3>
                        </td>

                        {/* Paragraphs */}
                        <td className="px-6 py-4 text-xs space-y-1 max-w-sm">
                          <p className="line-clamp-1 text-stone-600">
                            <strong>Para 1 (Left Text):</strong> {ing.para1}
                          </p>
                          <p className="line-clamp-1 text-stone-600">
                            <strong>Para 2 (Right Text 1):</strong> {ing.para2}
                          </p>
                          <p className="line-clamp-1 text-stone-600">
                            <strong>Para 3 (Right Text 2):</strong> {ing.para3}
                          </p>
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
                          {ing.created_at
                            ? new Date(ing.created_at).toLocaleDateString(
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
                              onClick={() => handleEdit(ing)}
                              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                              style={{
                                borderColor: colours.border,
                                color: colours.accent,
                                backgroundColor: colours.background,
                              }}
                              aria-label={`Edit ${ing.name}`}
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(ing)}
                              disabled={isDeleting}
                              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                              style={{
                                borderColor: colours.border,
                                color: "#A44A3F",
                                backgroundColor: colours.background,
                              }}
                              aria-label={`Delete ${ing.name}`}
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
                      No ingredients found. Add a new ingredient to get started.
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
