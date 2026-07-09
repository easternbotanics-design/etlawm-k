import { useEffect, useState } from "react";
import { colours, fonts } from "../../theme/theme";
import {
  getAllEarlyBirdCampaigns,
  createEarlyBirdCampaign,
  updateEarlyBirdCampaign,
  deleteEarlyBirdCampaign,
  relaunchEarlyBirdCampaign,
} from "../../services/adminService";

export default function AdminCoupons() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState("percentage");
  const [formValue, setFormValue] = useState("");
  const [formLimit, setFormLimit] = useState("100");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllEarlyBirdCampaigns();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
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
    setFormCode("");
    setFormType("percentage");
    setFormValue("");
    setFormLimit("100");
    // Default starts_at to current time in local timezone
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setFormStartsAt(localISOTime);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (camp) => {
    clearAlerts();
    setIsEditing(true);
    setSelectedId(camp.id);
    setFormCode(camp.coupon_code);
    setFormType(camp.discount_type);
    setFormValue(String(camp.discount_value));
    setFormLimit(String(camp.user_limit));
    
    // Format starts_at for datetime-local
    if (camp.starts_at) {
      const d = new Date(camp.starts_at);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const formatted = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setFormStartsAt(formatted);
    } else {
      setFormStartsAt("");
    }
    
    setFormIsActive(camp.is_active);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (camp) => {
    clearAlerts();
    const newStatus = !camp.is_active;
    try {
      // Optimistic Update
      setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, is_active: newStatus } : c));
      
      const res = await updateEarlyBirdCampaign(camp.id, { is_active: newStatus });
      if (res.success && res.campaign) {
        setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, is_active: res.campaign.is_active } : c));
        setSuccess(`Coupon '${camp.coupon_code}' ${newStatus ? 'activated' : 'deactivated'} successfully.`);
        setTimeout(clearAlerts, 3000);
      }
    } catch (err) {
      // Rollback
      setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, is_active: camp.is_active } : c));
      setError(err.message || "Failed to toggle status");
    }
  };

  const handleRelaunch = async (id, code) => {
    if (!window.confirm(`Are you sure you want to relaunch coupon '${code}'? This will reset the usage count to 0 and make the coupon active again.`)) return;
    clearAlerts();
    try {
      const res = await relaunchEarlyBirdCampaign(id);
      if (res.success) {
        setSuccess(`Coupon '${code}' has been relaunched successfully and usage reset to 0.`);
        loadCampaigns();
      }
    } catch (err) {
      setError(err.message || "Failed to relaunch campaign");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    clearAlerts();
    try {
      await deleteEarlyBirdCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setSuccess(`Coupon '${code}' deleted successfully.`);
      setTimeout(clearAlerts, 3000);
    } catch (err) {
      setError(err.message || "Failed to delete campaign");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!formCode.trim()) {
      setError("Coupon code is required.");
      return;
    }

    const valueNum = Number(formValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setError("Discount value must be a positive number.");
      return;
    }

    const limitNum = Number(formLimit);
    if (isNaN(limitNum) || limitNum <= 0 || !Number.isInteger(limitNum)) {
      setError("Redemption limit must be a positive integer.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        coupon_code: formCode.trim().toUpperCase(),
        discount_type: formType,
        discount_value: valueNum,
        user_limit: limitNum,
        starts_at: formStartsAt ? new Date(formStartsAt).toISOString() : new Date().toISOString(),
        is_active: formIsActive,
      };

      if (isEditing) {
        const res = await updateEarlyBirdCampaign(selectedId, payload);
        if (res.success) {
          setSuccess(`Coupon '${payload.coupon_code}' updated successfully.`);
          setIsModalOpen(false);
          loadCampaigns();
        }
      } else {
        const res = await createEarlyBirdCampaign(payload);
        if (res.success) {
          setSuccess(`Coupon '${payload.coupon_code}' created successfully.`);
          setIsModalOpen(false);
          loadCampaigns();
        }
      }
    } catch (err) {
      setError(err.message || "Failed to save campaign settings.");
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

  return (
    <div className="px-6 md:px-10 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
            Coupons & Launch Discounts
          </h1>
          <p className="text-xs text-[#7C7770] mt-1">
            Configure early bird coupon campaigns with custom redemption limits when the store goes live.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity duration-200 cursor-pointer self-start sm:self-center"
          style={{
            backgroundColor: colours.accent,
            fontFamily: fonts.secondary,
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Coupon
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
          <p className="text-sm text-[#7C7770]">Loading campaign settings...</p>
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
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr
                  className="border-b text-[10px] md:text-xs uppercase tracking-widest"
                  style={{
                    borderColor: colours.border,
                    color: colours.mutedText,
                  }}
                >
                  <th className="px-6 py-4 font-bold w-[20%]">Coupon Code</th>
                  <th className="px-6 py-4 font-bold w-[15%]">Discount</th>
                  <th className="px-6 py-4 font-bold w-[25%]">Effective Date</th>
                  <th className="px-6 py-4 font-bold w-[15%]">Redemptions</th>
                  <th className="px-6 py-4 font-bold w-[12%]">Status</th>
                  <th className="px-6 py-4 font-bold w-[13%] text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {campaigns.length > 0 ? (
                  campaigns.map((camp) => {
                    const isLimitReached = camp.used_count >= camp.user_limit;
                    const isCampActive = camp.is_active && !isLimitReached;

                    return (
                      <tr
                        key={camp.id}
                        className="border-b transition-colors duration-200 hover:bg-[#171715]/5"
                        style={{ borderColor: colours.border }}
                      >
                        {/* Coupon Code */}
                        <td className="px-6 py-5 align-middle">
                          <span className="font-mono text-sm font-bold text-[#171715] tracking-wider block bg-stone-100/80 px-2.5 py-1 rounded w-fit border border-stone-200">
                            {camp.coupon_code}
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="px-6 py-5 align-middle">
                          <span className="text-xs md:text-sm font-semibold text-[#171715]">
                            {camp.discount_type === "percentage"
                              ? `${parseFloat(camp.discount_value)}% OFF`
                              : `₹${parseFloat(camp.discount_value).toLocaleString("en-IN")} OFF`}
                          </span>
                        </td>

                        {/* Effective Date */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex flex-col text-xs md:text-sm">
                            <span className="text-[#171715] font-medium">{formatDate(camp.starts_at)}</span>
                            {new Date() < new Date(camp.starts_at) && (
                              <span className="text-[10px] text-amber-600 font-semibold mt-0.5 uppercase tracking-wider">Scheduled</span>
                            )}
                          </div>
                        </td>

                        {/* Redemptions */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex flex-col">
                            <span className={`text-xs md:text-sm font-semibold ${isLimitReached ? "text-stone-400" : "text-[#171715]"}`}>
                              {camp.used_count} / {camp.user_limit}
                            </span>
                            
                            {/* Simple Visual Progress Bar */}
                            <div className="w-24 bg-stone-100 rounded-full h-1.5 mt-1.5 overflow-hidden border border-stone-200">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min((camp.used_count / camp.user_limit) * 100, 100)}%`,
                                  backgroundColor: isLimitReached ? '#D6D3D1' : colours.accent,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status (Toggle) */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(camp)}
                              disabled={isLimitReached}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                              style={{
                                backgroundColor: camp.is_active ? colours.accent : '#D6D3D1',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  camp.is_active ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                            
                            <span className="text-xs font-semibold">
                              {isLimitReached ? (
                                <span className="text-stone-400">Sold Out</span>
                              ) : camp.is_active ? (
                                <span className="text-emerald-600">Active</span>
                              ) : (
                                <span className="text-stone-500">Disabled</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 align-middle text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleRelaunch(camp.id, camp.coupon_code)}
                              className="text-[#A77C6B] hover:text-[#8C6253] transition-colors p-1 cursor-pointer"
                              title="Relaunch Coupon (Reset Usage)"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(camp)}
                              className="text-stone-600 hover:text-stone-900 transition-colors p-1 cursor-pointer"
                              title="Edit Coupon"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDelete(camp.id, camp.coupon_code)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                              title="Delete Coupon"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm" style={{ color: colours.mutedText }}>
                      No early bird coupons found. Click "Create Coupon" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 relative overflow-hidden animate-in zoom-in-95"
            style={{
              backgroundColor: colours.primary,
              borderColor: colours.border,
            }}
          >
            <h2 className="text-xl font-serif text-[#171715] mb-6" style={{ fontFamily: fonts.primary }}>
              {isEditing ? "Edit Early Bird Coupon" : "Create Early Bird Coupon"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAUNCH100"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 font-mono text-sm"
                  style={{ borderColor: colours.border }}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-2">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder={formType === "percentage" ? "10" : "100"}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                    style={{ borderColor: colours.border }}
                  />
                </div>
              </div>

              {/* Redemption Limit & Starts At */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-2">
                    Redemption Limit
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    placeholder="100"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                    style={{ borderColor: colours.border }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C7770] mb-2">
                    Starts From
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none bg-white focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                    style={{ borderColor: colours.border }}
                  />
                </div>
              </div>

              {/* Status Checkbox/Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent accent-stone-800"
                />
                <label htmlFor="formIsActive" className="text-xs font-semibold uppercase tracking-wider text-[#7C7770] select-none cursor-pointer">
                  Activate this Coupon campaign
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colours.border }}>
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
                  {submitting ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
