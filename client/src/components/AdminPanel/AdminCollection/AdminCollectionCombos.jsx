import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme";
import { getAllCombos, deleteCombo, toggleComboStatus } from "../../../services/adminService";
import TableTemplate from "../TableTemplate";

const EditButton = ({ name, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      style={{
        borderColor: colours.border,
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
      className="group flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colours.accent;
        e.currentTarget.style.backgroundColor = colours.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colours.border;
        e.currentTarget.style.backgroundColor = colours.background;
      }}
    >
      <span
        style={{ color: colours.text }}
        className="transition-colors duration-300 group-hover:text-[#A77C6B]"
      >
        {name}
      </span>
    </button>
  );
};

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

const AdminCollectionCombos = () => {
  const navigate = useNavigate();

  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadCombos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllCombos();
      setCombos(data.combos || []);
    } catch (err) {
      setError(err.message || "Failed to load combos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const handleEdit = (combo) => {
    navigate(`/admin/collection/combos/edit/${combo.id}`);
  };

  const handleDelete = async (combo) => {
    const confirmed = window.confirm(`Delete "${combo.name}" combo offer?`);
    if (!confirmed) return;

    try {
      setDeletingId(combo.id);
      await deleteCombo(combo.id);
      setCombos((prev) => prev.filter((item) => item.id !== combo.id));
    } catch (err) {
      alert(err.message || "Failed to delete combo");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (combo) => {
    const newStatus = !combo.is_active;
    try {
      setCombos((prev) =>
        prev.map((c) => (c.id === combo.id ? { ...c, is_active: newStatus } : c))
      );
      await toggleComboStatus(combo.id, newStatus);
    } catch (err) {
      setCombos((prev) =>
        prev.map((c) => (c.id === combo.id ? { ...c, is_active: combo.is_active } : c))
      );
      alert(err.message || "Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "name",
      label: "COMBO",
      render: (combo) => {
        const imageUrl = combo.image_url || combo.images?.[0]?.image_url || combo.products?.[0]?.primary_image;

        return (
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={combo.name}
                className="h-14 w-14 rounded-xl object-cover border border-stone-200"
              />
            ) : (
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: colours.primary, color: colours.accent, borderColor: colours.border }}
              >
                COMBO
              </div>
            )}

            <div>
              <h3
                className="text-base font-semibold"
                style={{
                  color: colours.text,
                  fontFamily: fonts.primary,
                }}
              >
                {combo.name}
              </h3>

              <p
                className="mt-1 text-xs"
                style={{ color: colours.mutedText }}
              >
                Slug: /{combo.slug || "n-a"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "products",
      label: "INCLUDED PRODUCTS",
      render: (combo) => (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {Array.isArray(combo.products) && combo.products.length > 0 ? (
            combo.products.map((p) => (
              <span
                key={p.product_id || p.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 text-stone-700 border border-stone-200 text-xs font-medium"
              >
                {p.primary_image && (
                  <img
                    src={p.primary_image}
                    alt=""
                    className="w-4 h-4 object-cover rounded-md shrink-0"
                  />
                )}
                <span className="truncate max-w-[120px]">{p.name}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-stone-400 italic">No products attached</span>
          )}
        </div>
      ),
    },
    {
      key: "pricing",
      label: "PRICE & DISCOUNT",
      render: (combo) => {
        const discountLabel = combo.discount_type === "percentage"
          ? `${parseFloat(combo.discount_value)}% OFF`
          : `₹${parseFloat(combo.discount_value).toLocaleString("en-IN")} OFF`;

        return (
          <div className="flex flex-col">
            {combo.original_price && Number(combo.original_price) > 0 && (
              <span className="text-xs text-stone-400 line-through">
                ₹{parseFloat(combo.original_price).toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-sm font-semibold" style={{ color: colours.text }}>
              ₹{combo.price ? parseFloat(combo.price).toLocaleString("en-IN") : "N/A"}
            </span>
            <span className="inline-block mt-0.5 text-[11px] font-semibold text-emerald-700">
              {discountLabel}
            </span>
          </div>
        );
      },
    },
    {
      key: "badge",
      label: "BADGE",
      render: (combo) => (
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
          style={{
            backgroundColor: `${colours.accent}15`,
            color: colours.accent,
            border: `1px solid ${colours.accent}30`,
          }}
        >
          {combo.badge || "combo"}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (combo) => {
        const isActive = combo.is_active;
        return (
          <button
            type="button"
            onClick={() => handleToggleStatus(combo)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-200"
            style={{
              backgroundColor: isActive ? colours.primary : "#F4E3E0",
              color: isActive ? colours.accent : "#A44A3F",
              borderColor: isActive ? colours.border : "#E6C9C4",
            }}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
            <span>{isActive ? "Active" : "Disabled"}</span>
          </button>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (combo) => {
        const isDeleting = deletingId === combo.id;

        return (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleEdit(combo)}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: colours.accent,
                backgroundColor: colours.background,
              }}
              aria-label={`Edit ${combo.name}`}
            >
              <EditIcon />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(combo)}
              disabled={isDeleting}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: colours.border,
                color: "#A44A3F",
                backgroundColor: colours.background,
              }}
              aria-label={`Delete ${combo.name}`}
            >
              {isDeleting ? "..." : <DeleteIcon />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className="px-6 py-8"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/admin/collection")}
        className="group mb-4 flex cursor-pointer items-center gap-1 text-sm"
        style={{ color: colours.accent }}
      >
        <ArrowLeft
          size={18}
          className="transition-transform duration-100 group-hover:-translate-x-1"
          style={{ color: colours.accent }}
        />
        <span>Back to Collections</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            Combos
          </h1>

          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage product combo bundles and special package offers.
          </p>
        </div>
        <div>
          <EditButton
            name="Add Combo"
            onClick={() => navigate('/admin/collection/combos/add-combo')}
          />
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading combo offers...
        </p>
      )}

      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8">
          <TableTemplate
            columns={columns}
            data={combos}
            emptyLabel="No combo offers found. Click 'Add Combo' to create one."
          />
        </div>
      )}
    </div>
  );
};

export default AdminCollectionCombos;
