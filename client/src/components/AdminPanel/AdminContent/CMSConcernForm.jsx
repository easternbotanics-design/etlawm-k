import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import concernService from "../../../services/concernService.js";
import {
  FormStyles,
  FormCard,
  TextInput,
  ActionButtonsCard,
  cardStyle,
} from "../FormComponents.jsx";

export default function CMSConcernForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Concern Name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await concernService.createConcern({ name: name.trim() });
      setSuccess("Concern tag created successfully.");
      setTimeout(() => {
        navigate("/admin/content/concerns");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to create concern tag.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: colours.primary,
        fontFamily: fonts.secondary,
        color: colours.text,
      }}
      className="min-h-screen flex flex-col"
    >
      <FormStyles />

      <main className="flex-1 pt-8 px-4 md:px-8 max-w-4xl mx-auto w-full pb-16">
        <div className="mb-8">
          <Link
            to="/admin/content/concerns"
            style={{ color: colours.accent }}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-colors font-semibold mb-4 no-underline"
          >
            <svg
              className="w-4 h-4 duration-100 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Concerns
          </Link>

          <div
            style={cardStyle}
            className="border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <h1
                style={{ fontFamily: fonts.primary, color: colours.text }}
                className="text-3xl md:text-4xl tracking-wide font-normal"
              >
                Add Concern Tag
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                Create a new concern tag for filtering store items
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>Concerns</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>Add</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-3 rounded shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-start gap-3 rounded shadow-sm">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            <FormCard
              title="Concern Tag Details"
              description="Specify the concern name (e.g. Dandruff, Hair Fall, Acne, Glow)."
            >
              <TextInput
                label="Concern Name"
                required
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hair Fall, Scalp Care, Acne"
              />
            </FormCard>
          </div>

          <aside className="md:col-span-4 space-y-8">
            <ActionButtonsCard
              isEditMode={false}
              saving={saving}
              submitLabel={saving ? "Saving..." : "Add Concern"}
              showDraft={false}
              cancelHref="/admin/content/concerns"
              LinkComponent={Link}
            />
          </aside>
        </form>
      </main>
    </div>
  );
}
