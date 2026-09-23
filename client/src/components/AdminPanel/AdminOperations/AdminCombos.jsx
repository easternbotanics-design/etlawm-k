import { useEffect, useState } from "react";
import { colours, fonts } from "../../../theme/theme";
import {
  getAllCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  toggleComboStatus,
} from "../../../services/adminService";
import { getProducts } from "../../../services/productService";
import TableTemplate from "../TableTemplate";

export default function AdminCombos() {
  const [combos, setCombos] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSelectedProductIds, setFormSelectedProductIds] = useState([]);
  const [formType, setFormType] = useState("percentage");
  const [formValue, setFormValue] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formActiveDays, setFormActiveDays] = useState("-1");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCombos();
    loadCatalogProducts();
  }, []);

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

  const loadCatalogProducts = async () => {
    try {
      const data = await getProducts();
      if (Array.isArray(data)) {
        setAvailableProducts(data);
      }
    } catch (err) {
      console.error("Failed to load catalog products:", err);
    }
  };

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  const handleOpenCreateModal = () => {
    clearAlerts();
    setIsEditing(false);
    setSelectedId(null);
    setFormName("");
    setFormSelectedProductIds([]);
    setFormType("percentage");
    setFormValue("");
    setFormStartsAt("");
    setFormActiveDays("-1");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comb) => {
    clearAlerts();
    setIsEditing(true);
    setSelectedId(comb.id);
    setFormName(comb.name || "");
    const prodIds = Array.isArray(comb.products)
      ? comb.products.map((p) => p.product_id || p.id)
      : [];
    setFormSelectedProductIds(prodIds);
    setFormType(comb.discount_type || "percentage");
    setFormValue(String(comb.discount_value || ""));
    
    // Format starts_at for datetime-local
    if (comb.starts_at) {
      const d = new Date(comb.starts_at);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const formatted = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setFormStartsAt(formatted);
    } else {
      setFormStartsAt("");
    }

    setFormActiveDays(String(comb.active_days ?? "-1"));
    setFormIsActive(comb.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleToggleProductSelection = (productId) => {
    setFormSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleStatus = async (comb) => {
    clearAlerts();
    const newStatus = !comb.is_active;
    try {
      setCombos((prev) =>
        prev.map((c) => (c.id === comb.id ? { ...c, is_active: newStatus } : c))
      );
      
      const res = await toggleComboStatus(comb.id, newStatus);
      if (res.success && res.combo) {
        setCombos((prev) =>
          prev.map((c) => (c.id === comb.id ? { ...c, is_active: res.combo.is_active } : c))
        );
        setSuccess(`Combo '${comb.name}' ${newStatus ? "activated" : "deactivated"} successfully.`);
        setTimeout(clearAlerts, 3000);
      }
    } catch (err) {
      setCombos((prev) =>
        prev.map((c) => (c.id === comb.id ? { ...c, is_active: comb.is_active } : c))
      );
      setError(err.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete combo '${name}'?`)) return;
    clearAlerts();
    try {
      await deleteCombo(id);
      setCombos((prev) => prev.filter((c) => c.id !== id));
      setSuccess(`Combo '${name}' deleted successfully.`);
      setTimeout(clearAlerts, 3000);
    } catch (err) {
      setError(err.message || "Failed to delete combo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!formName.trim()) {
      setError("Combo name is required.");
      return;
    }

    if (formSelectedProductIds.length === 0) {
      setError("Please select at least one product for the combo.");
      return;
    }

    const valueNum = Number(formValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setError("Discount value must be a positive number.");
      return;
    }

    const daysNum = Number(formActiveDays);
    if (isNaN(daysNum) || (daysNum <= 0 && daysNum !== -1) || !Number.isInteger(daysNum)) {
      setError("Active days must be a positive integer, or -1 for indefinite.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        product_ids: formSelectedProductIds,
        discount_type: formType,
        discount_value: valueNum,
        starts_at: formStartsAt ? new Date(formStartsAt).toISOString() : new Date().toISOString(),
        active_days: daysNum,
        is_active: formIsActive,
      };

      if (isEditing) {
        const res = await updateCombo(selectedId, payload);
        if (res.success) {
          setSuccess(`Combo '${payload.name}' updated successfully.`);
          setIsModalOpen(false);
          loadCombos();
        }
      } else {
        const res = await createCombo(payload);
        if (res.success) {
          setSuccess(`Combo '${payload.name}' created successfully.`);
          setIsModalOpen(false);
          loadCombos();
        }
      }
    } catch (err) {
      setError(err.message || "Failed to save combo.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "name",
      label: "COMBO NAME",
      render: (comb) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-[#171715]">
            {comb.name}
          </span>
          <span className="text-[11px] text-stone-400">
            {comb.active_days === -1
              ? "Indefinite Duration"
              : `Active for ${comb.active_days} days`}
          </span>
        </div>
      ),
    },
    {
      key: "products",
      label: "COMBO PRODUCTS",
      render: (comb) => (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {Array.isArray(comb.products) && comb.products.length > 0 ? (
            comb.products.map((p) => (
              <span
                key={p.product_id || p.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium"
              >
                {p.primary_image && (
                  <img
                    src={p.primary_image}
                    alt=""
                    className="w-3.5 h-3.5 object-cover rounded-full"
                  />
                )}
                {p.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-stone-400 italic">No products</span>
          )}
        </div>
      ),
    },
    {
      key: "discount",
      label: "DISCOUNT",
      render: (comb) => (
        <span className="text-xs md:text-sm font-semibold text-[#171715]">
          {comb.discount_type === "percentage"
            ? `${parseFloat(comb.discount_value)}% OFF`
            : `₹${parseFloat(comb.discount_value).toLocaleString("en-IN")} OFF`}
        </span>
      ),
    },
    {
      key: "starts_at",
      label: "EFFECTIVE / END DATE",
      render: (comb) => (
        <div className="flex flex-col text-xs md:text-sm">
          <span className="text-[#171715] font-medium">Starts: {formatDate(comb.starts_at)}</span>
          {comb.expires_at ? (
            <span className="text-[11px] text-stone-500">Ends: {formatDate(comb.expires_at)}</span>
          ) : (
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">No Expiry</span>
          )}
        </div>
      ),
    },
    {
      key: "redemptions",
      label: "REDEMPTIONS",
      render: (comb) => (
        <span className="text-xs md:text-sm font-semibold text-[#171715]">
          {comb.redemptions_count || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (comb) => {
        const isExpired = comb.expires_at && new Date() > new Date(comb.expires_at);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleStatus(comb)}
              disabled={isExpired}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: comb.is_active && !isExpired ? colours.accent : "#D6D3D1",
              }}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  comb.is_active && !isExpired ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            
            <span className="text-xs font-semibold">
              {isExpired ? (
                <span className="text-amber-600">Expired</span>
              ) : comb.is_active ? (
                <span className="text-emerald-600">Active</span>
              ) : (
                <span className="text-stone-500">Disabled</span>
              )}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (comb) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleOpenEditModal(comb)}
            className="text-stone-600 hover:text-stone-900 transition-colors p-1 cursor-pointer"
            title="Edit Combo"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>

          <button
            onClick={() => handleDelete(comb.id, comb.name)}
            className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
            title="Delete Combo"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-6 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
            Combos & Bundle Discounts
          </h1>
          <p className="text-xs text-[#7C7770] mt-1">
            Create multi-product bundle offers with automated discounts and flexible validity durations.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity duration-200 cursor-pointer w-full lg:w-auto justify-center lg:justify-start"
          style={{
            backgroundColor: colours.accent,
            fontFamily: fonts.secondary,
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Combo
        </button>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r-lg transition-all duration-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg transition-all duration-200">
          {error}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"></div>
          <p className="text-sm text-[#7C7770]">Loading combo offers...</p>
        </div>
      ) : (
        <TableTemplate
          columns={columns}
          data={combos}
          emptyLabel='No combos found. Click "Create Combo" to add one.'
        />
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="w-full max-w-lg my-8 rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 relative overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: colours.primary,
              borderColor: colours.border,
            }}
          >
            <h2 className="text-xl font-serif text-[#171715] mb-4 shrink-0" style={{ fontFamily: fonts.primary }}>
              {isEditing ? "Edit Combo Offer" : "Create Combo Offer"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1" data-lenis-prevent>
              {/* Combo Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-1.5">
                  Combo Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Ritual 2-Product Bundle"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                  style={{ borderColor: colours.border }}
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-1.5">
                  Select Combo Products ({formSelectedProductIds.length} selected)
                </label>
                <div
                  className="max-h-48 overflow-y-auto border rounded-xl p-3 bg-white space-y-2"
                  style={{ borderColor: colours.border }}
                >
                  {availableProducts.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No products available in catalog.</p>
                  ) : (
                    availableProducts.map((p) => {
                      const isSelected = formSelectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleProductSelection(p.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? "bg-amber-50/80 border-amber-300" : "bg-stone-50/50 border-stone-200 hover:bg-stone-100/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {p.primary_image ? (
                              <img src={p.primary_image} alt="" className="w-8 h-8 object-cover rounded-md shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-stone-200 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="text-xs font-semibold text-stone-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-stone-500">₹{parseFloat(p.price).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent accent-stone-800 shrink-0"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-white outline-none focus:ring-1 focus:ring-accent transition-all duration-200 text-sm cursor-pointer"
                    style={{ borderColor: colours.border }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-1.5">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder={formType === "percentage" ? "15" : "200"}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                    style={{ borderColor: colours.border }}
                  />
                </div>
              </div>

              {/* Starts At & Active Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none bg-white focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                    style={{ borderColor: colours.border }}
                  />
                  <p className="text-[10px] text-stone-400 mt-1">If left empty, effective immediately.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-1.5">
                    Days Active
                  </label>
                  <input
                    type="number"
                    required
                    min="-1"
                    step="1"
                    placeholder="-1 for indefinite"
                    value={formActiveDays}
                    onChange={(e) => setFormActiveDays(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                    style={{ borderColor: colours.border }}
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Enter -1 for indefinite days.</p>
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="formIsActiveCombo"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent accent-stone-800"
                />
                <label htmlFor="formIsActiveCombo" className="text-xs font-semibold uppercase tracking-wider text-[#7C7770] select-none cursor-pointer">
                  Activate this Combo offer
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t shrink-0" style={{ borderColor: colours.border }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border bg-white hover:bg-stone-50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-solid"
                  style={{ borderColor: colours.border, color: colours.secondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: colours.accent }}
                >
                  {submitting ? "Saving..." : "Save Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
