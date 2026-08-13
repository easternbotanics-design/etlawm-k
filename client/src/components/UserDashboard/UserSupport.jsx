import { useState } from "react";
import { colours, fonts } from "../../theme/theme";
import { submitComplaint } from "../../services/complaintService";
import { MessageSquare, CheckCircle } from "lucide-react";

const UserSupport = () => {
  const [complaintText, setComplaintText] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setMsg({ type: "error", text: "Please enter your complaint text." });
      return;
    }
    
    try {
      setSubmitting(true);
      setMsg({ type: "", text: "" });
      const res = await submitComplaint(complaintText);
      if (res.success) {
        setComplaintText("");
        setMsg({
          type: "success",
          text: "Your support ticket has been submitted. Our team will review it and get back to you shortly."
        });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: err.message || "Failed to submit ticket. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl bg-white border rounded-xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-300" style={{ borderColor: colours.border }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${colours.primary}AA`, color: colours.accent }}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium tracking-wide text-neutral-800" style={{ fontFamily: fonts.primary }}>
            Customer Support
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Submit feedback or raise support issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {msg.text && (
          <div 
            className={`p-3.5 rounded-lg text-xs font-semibold ${
              msg.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
            Write your query or complaint below *
          </label>
          <textarea
            required
            rows={6}
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Please write details of the issue you are facing..."
            className="w-full resize-none rounded-xl border bg-neutral-50 px-4 py-3 text-xs outline-none focus:border-stone-850 transition-colors"
            style={{
              borderColor: colours.border,
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t" style={{ borderColor: colours.border }}>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-[10px] font-bold tracking-widest uppercase text-white rounded-md cursor-pointer disabled:opacity-50 border-none"
            style={{ backgroundColor: colours.secondary }}
          >
            {submitting ? "Submitting Ticket..." : "Submit Complaint"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSupport;
