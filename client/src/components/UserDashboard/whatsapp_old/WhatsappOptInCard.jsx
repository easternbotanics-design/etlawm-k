import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { colours, fonts } from "../../theme/theme";
import { updateWhatsappOptIn } from "../../services/whatsappService";

const WhatsappIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-3.565c1.6.953 3.56 1.456 5.566 1.458 5.564 0 10.093-4.52 10.096-10.082.001-2.695-1.047-5.228-2.951-7.136C17.396 2.766 14.867 1.716 12 1.716 6.437 1.716 1.908 6.245 1.906 11.81c-.001 2.012.504 3.978 1.465 5.582L2.27 21.09l3.876-1.017zm11.272-5.405c-.272-.136-1.614-.797-1.863-.888-.25-.09-.432-.136-.614.137-.182.273-.705.888-.864 1.07-.159.182-.318.204-.59.068-.272-.136-1.15-.424-2.19-1.353-.809-.722-1.355-1.614-1.514-1.886-.159-.272-.017-.419.119-.554.123-.122.272-.318.409-.477.137-.159.182-.273.273-.455.09-.182.046-.34-.023-.477-.068-.136-.614-1.477-.84-2.023-.22-.53-.443-.458-.614-.467-.16-.008-.341-.01-.523-.01s-.477.067-.727.34c-.25.273-.954.932-.954 2.273s.977 2.636 1.114 2.818c.137.182 1.922 2.934 4.659 4.116.65.281 1.157.449 1.554.576.653.208 1.248.179 1.719.108.524-.078 1.614-.659 1.841-1.295.227-.636.227-1.182.159-1.295-.068-.113-.25-.182-.523-.318z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const WhatsappOptInCard = ({ showAskLater = true, onAskLater }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSubscribed = user?.whatsapp_opt_in === true;

  const handleOptIn = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await updateWhatsappOptIn(true);
      if (data.success) {
        updateUser({ ...user, whatsapp_opt_in: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update WhatsApp preferences.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div 
        className="rounded-2xl border p-6 bg-[#F0FAF4] flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 animate-in fade-in"
        style={{ 
          borderColor: "#C2F0D5",
          fontFamily: fonts.secondary 
        }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <CheckIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-neutral-850" style={{ fontFamily: fonts.primary }}>
            Subscribed to WhatsApp Updates
          </h4>
          <p className="text-xs text-neutral-600 mt-0.5">
            You will receive order confirmations, shipping alerts, and customer support directly on <span className="font-semibold">{user?.phone_number}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl border p-6 bg-white shadow-xs transition-all duration-300 animate-in fade-in"
      style={{ 
        borderColor: colours.border,
        fontFamily: fonts.secondary 
      }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F8F0] text-[#128C7E]">
          <WhatsappIcon className="w-5.5 h-5.5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-medium tracking-wide text-stone-850" style={{ fontFamily: fonts.primary }}>
            Receive updates on WhatsApp?
          </h4>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            Get instant tracking alerts, dispatch notifications, and dedicated customer support chats directly sent to your phone.
          </p>

          {error && (
            <p className="text-xs text-red-650 mt-2 font-medium">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleOptIn}
              className="px-4 py-2 text-xs font-bold tracking-wider uppercase text-white rounded-lg transition-transform duration-200 hover:scale-102 cursor-pointer border-none flex items-center gap-2"
              style={{ backgroundColor: "#128C7E" }}
            >
              {loading ? "Activating..." : "Yes, Subscribe"}
            </button>

            {showAskLater && (
              <button
                type="button"
                disabled={loading}
                onClick={onAskLater}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200/80 transition-colors text-stone-600 cursor-pointer border-none"
              >
                Ask me later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsappOptInCard;
