import { useState, useEffect } from "react";
import {
  getAdminSettings,
  updateAdminSettings,
  getAdminPhones,
  addAdminPhone,
  deleteAdminPhone,
} from "../../services/adminService";
import { colours, fonts } from "../../theme/theme.js";

const SCOPED_CSS = `
  .settings-input:focus {
    border-color: ${colours.accent} !important;
    outline: none !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .settings-btn:hover {
    background-color: ${colours.accent} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .settings-btn {
    border: none !important;
  }
  .revoke-btn:hover {
    background-color: #FEF2F2 !important;
    color: #DC2626 !important;
  }
`;

const AdminSettings = () => {
  // System configurations state
  const [settings, setSettings] = useState({
    store_name: "ETLAWM",
    support_email: "support@etlawm.com",
    low_stock_threshold: "5",
    enable_whatsapp_notifications: "true",
  });

  // Admin phone numbers state
  const [adminPhones, setAdminPhones] = useState([]);
  const [newAdminPhone, setNewAdminPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [addingPhone, setAddingPhone] = useState(false);
  const [deletingPhone, setDeletingPhone] = useState(null);

  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneSuccess, setPhoneSuccess] = useState("");

  // Fetch settings and admin phone list
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [settingsRes, phonesRes] = await Promise.all([
          getAdminSettings(),
          getAdminPhones(),
        ]);

        if (settingsRes.success && settingsRes.settings) {
          setSettings((prev) => ({
            ...prev,
            ...settingsRes.settings,
          }));
        }

        if (phonesRes.success && phonesRes.phones) {
          setAdminPhones(phonesRes.phones);
        }
      } catch (err) {
        console.error("Failed to load settings data", err);
        setSettingsError("Could not fetch configurations from server.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? String(checked) : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    try {
      setSavingSettings(true);
      const data = await updateAdminSettings(settings);
      if (data.success) {
        setSettingsSuccess("System configurations updated successfully.");
      } else {
        setSettingsError(data.message || "Failed to update settings.");
      }
    } catch (err) {
      console.error("Save settings error", err);
      setSettingsError(err.message || "An error occurred while saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddAdminPhone = async (e) => {
    e.preventDefault();
    setPhoneError("");
    setPhoneSuccess("");

    if (!newAdminPhone.trim()) {
      setPhoneError("Phone number is required.");
      return;
    }

    try {
      setAddingPhone(true);
      const data = await addAdminPhone(newAdminPhone);
      if (data.success) {
        setPhoneSuccess("Phone number added to admin roster successfully.");
        setNewAdminPhone("");
        // Reload list
        const phonesRes = await getAdminPhones();
        if (phonesRes.success) setAdminPhones(phonesRes.phones);
      } else {
        setPhoneError(data.message || "Failed to add admin phone.");
      }
    } catch (err) {
      console.error("Add phone error", err);
      setPhoneError(err.message || "An error occurred while adding phone number.");
    } finally {
      setAddingPhone(false);
    }
  };

  const handleDeletePhone = async (phone) => {
    if (!window.confirm(`Are you sure you want to remove +${phone} from the admin roster? If they are currently logged in, their administrative access will be revoked.`)) {
      return;
    }

    setPhoneError("");
    setPhoneSuccess("");

    try {
      setDeletingPhone(phone);
      const data = await deleteAdminPhone(phone);
      if (data.success) {
        setPhoneSuccess(`Admin access revoked for +${phone}.`);
        // Reload list
        const phonesRes = await getAdminPhones();
        if (phonesRes.success) setAdminPhones(phonesRes.phones);
      } else {
        setPhoneError(data.message || "Failed to revoke admin phone.");
      }
    } catch (err) {
      console.error("Delete phone error", err);
      setPhoneError(err.message || "An error occurred while revoking admin phone.");
    } finally {
      setDeletingPhone(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative w-12 h-12">
          <div style={{ borderColor: colours.border }} className="absolute inset-0 rounded-full border-4" />
          <div style={{ borderTopColor: colours.accent }} className="absolute inset-0 rounded-full border-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: fonts.secondary }} className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <style>{SCOPED_CSS}</style>
      <div>
        <div style={{ color: colours.accent }} className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1 font-semibold">
          <span>Admin Portal</span>
          <span>•</span>
          <span>Dashboard Settings</span>
        </div>
        <h1 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-3xl md:text-4xl tracking-wide font-normal">
          Console & System Settings
        </h1>
        <p style={{ color: colours.mutedText }} className="text-sm mt-1.5">
          Manage general store settings and configure administrative account authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Card: System Configs */}
        <div style={{ borderColor: colours.border, backgroundColor: colours.background }} className="border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h2 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg font-semibold mb-1">
                Store Configurations
              </h2>
              <p style={{ color: colours.mutedText }} className="text-xs">
                Set store-wide values used in dashboard alerts and customer communications.
              </p>
            </div>

            {settingsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{settingsSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Store Name */}
              <div className="space-y-2.5">
                {/* <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  Store Name
                </label>*/}
                {/* <input
                  type="text"
                  // name="store_name"
                  value={settings.store_name}
                  onChange={handleSettingChange}
                  style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
                  className="settings-input w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-all duration-200 outline-hidden"
                  required
                />*/}
              </div>

              {/* Support Email */}
              <div className="space-y-2.5">
                <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  Support Contact Email
                </label>
                <input
                  type="email"
                  name="support_email"
                  value={settings.support_email}
                  onChange={handleSettingChange}
                  style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
                  className="settings-input w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-all duration-200 outline-hidden"
                  required
                />
              </div>

              {/* Low Stock Warning Threshold */}
              <div className="space-y-2.5">
                <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  Low Stock Warning Threshold
                </label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={settings.low_stock_threshold}
                  onChange={handleSettingChange}
                  style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
                  className="settings-input w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-all duration-200 outline-hidden"
                  min="0"
                  required
                />
              </div>

              {/* WhatsApp System Notifications */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <span className="relative flex-shrink-0 w-[18px] h-[18px]">
                    <input
                      type="checkbox"
                      name="enable_whatsapp_notifications"
                      checked={settings.enable_whatsapp_notifications === "true"}
                      onChange={handleSettingChange}
                      className="peer absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <span
                      style={{
                        borderColor: settings.enable_whatsapp_notifications === "true" ? colours.accent : colours.border,
                        backgroundColor: settings.enable_whatsapp_notifications === "true" ? colours.accent : colours.primary,
                      }}
                      className="block w-[18px] h-[18px] border rounded-md transition-all duration-200 flex items-center justify-center"
                    >
                      {settings.enable_whatsapp_notifications === "true" && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </span>
                  <span style={{ color: colours.text }} className="text-xs font-semibold tracking-wide uppercase transition-colors">
                    Enable System WhatsApp Updates
                  </span>
                </label>
                <p style={{ color: colours.mutedText }} className="text-[10px] mt-1 ml-[30px]">
                  Fires automatic WhatsApp notifications on order fulfillment and low inventory alerts.
                </p>
              </div>
            </div>

            <div style={{ borderTopColor: colours.border }} className="border-t pt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                style={{ backgroundColor: colours.secondary, color: colours.background }}
                className="settings-btn hover:shadow-md transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-5 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {savingSettings ? "Saving Settings..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Admin Phone Numbers */}
        <div style={{ borderColor: colours.border, backgroundColor: colours.background }} className="border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg font-semibold mb-1">
              Authorized Admins
            </h2>
            <p style={{ color: colours.mutedText }} className="text-xs">
              Register or remove admin numbers. New logs from these numbers bypass OTP customer flow and gain access to the store dashboard.
            </p>
          </div>

          {phoneError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2 mb-4">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{phoneError}</span>
            </div>
          )}

          {phoneSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2 mb-4">
              <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{phoneSuccess}</span>
            </div>
          )}

          {/* Add Phone Form */}
          <form onSubmit={handleAddAdminPhone} className="flex gap-2.5 mb-6">
            <input
              type="text"
              value={newAdminPhone}
              onChange={(e) => setNewAdminPhone(e.target.value)}
              placeholder="e.g. 917030577234"
              style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
              className="settings-input flex-1 px-4 py-2.5 border rounded-xl placeholder-stone-400 focus:bg-white transition-all duration-200 outline-hidden text-sm"
              required
            />
            <button
              type="submit"
              disabled={addingPhone}
              style={{ backgroundColor: colours.secondary, color: colours.background }}
              className="settings-btn hover:shadow-md transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {addingPhone ? "Adding..." : "Add Admin"}
            </button>
          </form>

          {/* Admin Phones List */}
          <div style={{ borderColor: colours.border }} className="flex-1 overflow-y-auto border rounded-xl max-h-[220px]">
            {adminPhones.length === 0 ? (
              <p style={{ color: colours.mutedText }} className="text-xs p-4 text-center">No additional admins listed.</p>
            ) : (
              <ul style={{ dividerColor: colours.border }} className="divide-y divide-stone-100 font-sans">
                {adminPhones.map((ap) => (
                  <li
                    key={ap.phone_number}
                    style={{ borderBottomColor: colours.border }}
                    className="flex justify-between items-center px-4 py-3 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div style={{ backgroundColor: colours.accent }} className="w-2.5 h-2.5 rounded-full animate-pulse" />
                      <span style={{ color: colours.text }} className="text-xs font-semibold">
                        +{ap.phone_number}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePhone(ap.phone_number)}
                      disabled={deletingPhone === ap.phone_number}
                      style={{ color: colours.mutedText }}
                      className="revoke-btn p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent"
                      aria-label={`Revoke access for +${ap.phone_number}`}
                    >
                      {deletingPhone === ap.phone_number ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

