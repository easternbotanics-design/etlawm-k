import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { colours, fonts } from "../../theme/theme";
import WhatsappOptInCard from "./WhatsappOptInCard";

const API = import.meta.env.VITE_SERVER_API;

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || ""
  });
  
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      setStatusMsg({ type: "error", text: "First name is required." });
      return;
    }
    
    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        updateUser(data.user);
        setStatusMsg({ type: "success", text: "Profile details updated successfully." });
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white border rounded-xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-300" style={{ borderColor: colours.border }}>
        <div className="mb-6">
          <h2 className="text-xl font-medium tracking-wide text-neutral-800" style={{ fontFamily: fonts.primary }}>
            Profile Settings
          </h2>
          <p className="text-xs text-stone-400 mt-1">Manage your names and contact information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {statusMsg.text && (
            <div 
              className={`p-3 rounded-lg text-xs font-semibold ${
                statusMsg.type === "success" 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-250" 
                  : "bg-red-50 text-red-800 border border-red-250"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Jean"
                className="w-full px-3 py-2 border rounded-md text-xs focus:outline-hidden focus:border-stone-850 bg-neutral-50 transition-colors"
                style={{ borderColor: colours.border }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Dupont"
                className="w-full px-3 py-2 border rounded-md text-xs focus:outline-hidden focus:border-stone-850 bg-neutral-50 transition-colors"
                style={{ borderColor: colours.border }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border rounded-md text-xs focus:outline-hidden focus:border-stone-850 bg-neutral-50 transition-colors"
              style={{ borderColor: colours.border }}
            />
            <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
              We send purchase confirmations and shipping alerts to this email.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Phone Number (Registered)
            </label>
            <input
              type="text"
              disabled
              value={user?.phone_number || ""}
              className="w-full px-3 py-2 border rounded-md text-xs bg-stone-100 text-stone-400 cursor-not-allowed"
              style={{ borderColor: colours.border }}
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t" style={{ borderColor: colours.border }}>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-[10px] font-bold tracking-widest uppercase text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
              style={{ backgroundColor: colours.secondary }}
            >
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>

      {user && !user.whatsapp_opt_in && (
        <WhatsappOptInCard showAskLater={false} />
      )}
    </div>
  );
};

export default UserProfile;
