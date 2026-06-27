import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdminProfile, updateAdminProfile } from "../../services/adminService.js";
import { colours, fonts } from "../../theme/theme.js";

const SCOPED_CSS = `
  .profile-input:focus {
    border-color: ${colours.accent} !important;
    outline: none !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .save-btn:hover {
    background-color: ${colours.accent} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
`;

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile details from database to ensure fresh data
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getAdminProfile();
        if (data.success && data.user) {
          setFormData({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            email: data.user.email || "",
            phone_number: data.user.phone_number || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        // Fallback to context user details
        if (user) {
          setFormData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone_number: user.phone_number || "",
          });
        }
        setError("Could not sync profile details with database. Displaying local cache.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.first_name.trim()) {
      setError("First name is required.");
      return;
    }

    try {
      setSaving(true);
      const data = await updateAdminProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });

      if (data.success) {
        setSuccess("Profile updated successfully.");
        // Sync local auth context state
        updateUser(data.user);
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile save error", err);
      setError(err.message || "An unexpected error occurred while saving profile.");
    } finally {
      setSaving(false);
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

  const initials = `${formData.first_name.charAt(0)}${formData.last_name ? formData.last_name.charAt(0) : ""}`.toUpperCase();

  return (
    <div style={{ fontFamily: fonts.secondary }} className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <style>{SCOPED_CSS}</style>
      <div>
        <div style={{ color: colours.accent }} className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1 font-semibold">
          <span>Admin Portal</span>
          <span>•</span>
          <span>Profile Settings</span>
        </div>
        <h1 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-3xl md:text-4xl tracking-wide font-normal">
          Profile Details
        </h1>
        <p style={{ color: colours.mutedText }} className="text-sm mt-1.5">
          Configure your console account details and contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div style={{ borderColor: colours.border, backgroundColor: colours.background }} className="border rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center">
          <div style={{ background: `linear-gradient(135deg, ${colours.secondary}, ${colours.accent})`, color: colours.background }} className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-md mb-4">
            {initials}
          </div>
          <h3 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg font-semibold">
            {formData.first_name} {formData.last_name}
          </h3>
          <p style={{ color: colours.mutedText }} className="text-xs mt-0.5 uppercase tracking-wider font-semibold">
            Store Owner
          </p>
          <span style={{ backgroundColor: colours.border }} className="block w-8 h-px my-4" />
          <p style={{ color: colours.mutedText }} className="text-xs flex items-center gap-1.5 justify-center">
            <svg style={{ color: colours.mutedText }} className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.443-5.132-3.75-6.577-6.577l1.293-.97c.362-.271.528-.733.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            +{formData.phone_number}
          </p>
        </div>

        {/* Right Column: Edit Form */}
        <div style={{ borderColor: colours.border, backgroundColor: colours.background }} className="lg:col-span-2 border rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
                  className="profile-input w-full px-4 py-3 border rounded-xl placeholder-stone-400 focus:bg-white transition-all duration-200 outline-hidden"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
                  className="profile-input w-full px-4 py-3 border rounded-xl placeholder-stone-400 focus:bg-white transition-all duration-200 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email Address */}
              <div className="space-y-2">
                <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@etlawm.com"
                  style={{ color: colours.text, borderColor: colours.border, backgroundColor: colours.primary + "20" }}
                  className="profile-input w-full px-4 py-3 border rounded-xl placeholder-stone-400 focus:bg-white transition-all duration-200 outline-hidden"
                />
              </div>

              {/* Phone Number (Read-only) */}
              <div className="space-y-2">
                <label style={{ color: colours.mutedText }} className="text-xs font-bold uppercase tracking-wider">
                  Phone Number (Read-only)
                </label>
                <div style={{ color: colours.mutedText, backgroundColor: colours.primary, borderColor: colours.border }} className="w-full px-4 py-3 border rounded-xl flex items-center gap-2 select-none">
                  <svg style={{ color: colours.mutedText }} className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>+{formData.phone_number}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTopColor: colours.border }} className="border-t pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                style={{ backgroundColor: colours.secondary, color: colours.background }}
                className="save-btn hover:shadow-md transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-6 py-3.5 rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {saving ? "Saving Details..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

