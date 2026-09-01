import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import concernService from "../../../services/concernService.js";
import { uploadImage } from "../../../services/adminService.js";
import {
  FormStyles,
  FormCard,
  TextInput,
  ActionButtonsCard,
  cardStyle,
} from "../FormComponents.jsx";

export default function CMSConcernForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;

    const loadConcern = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await concernService.getConcernById(id);
        const concern = data.concern || data;
        setName(concern.name || "");
        setImageUrl(concern.image_url || "");
      } catch (err) {
        setError(err.message || "Failed to load concern details.");
      } finally {
        setLoading(false);
      }
    };

    loadConcern();
  }, [id, isEditMode]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = await uploadImage(file, "product-images");
      if (data && data.url) {
        setImageUrl(data.url);
        setSuccess("Image uploaded successfully.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error("Upload succeeded but no URL was returned.");
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

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
      const payload = {
        name: name.trim(),
        image_url: imageUrl || null,
      };

      if (isEditMode) {
        await concernService.updateConcern(id, payload);
        setSuccess("Concern tag updated successfully.");
      } else {
        await concernService.createConcern(payload);
        setSuccess("Concern tag created successfully.");
      }

      setTimeout(() => {
        navigate("/admin/content/concerns");
      }, 1000);
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? "update" : "create"} concern tag.`);
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
                {isEditMode ? "Edit Concern Tag" : "Add Concern Tag"}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update concern details`
                  : "Create a new concern tag for filtering store items"}
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
              <span style={{ color: colours.accent }}>
                {isEditMode ? "Edit" : "Add"}
              </span>
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

        {loading ? (
          <div
            style={cardStyle}
            className="flex flex-col items-center justify-center py-20 border rounded-2xl"
          >
            <div
              style={{ borderTopColor: colours.accent }}
              className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"
            ></div>
            <p className="text-sm" style={{ color: colours.mutedText }}>
              Loading concern details...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
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

              <FormCard
                title="Concern Image"
                description="Upload an image for this concern tag. Image will be stored in product images bucket."
              >
                <div className="space-y-4">
                  <label
                    style={{
                      backgroundColor: colours.secondary,
                      color: colours.background,
                    }}
                    className="cursor-pointer transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-4 py-3 rounded-lg text-center block w-full relative hover:opacity-95"
                  >
                    {uploading ? "Uploading Image..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  {imageUrl ? (
                    <div
                      style={{
                        borderColor: colours.border,
                        backgroundColor: `${colours.primary}66`,
                      }}
                      className="rounded-xl border p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden border shrink-0"
                          style={{ borderColor: colours.border }}
                        >
                          <img
                            src={imageUrl}
                            alt="Concern Tag"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: colours.text }}>
                            Uploaded Image
                          </p>
                          <p
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: colours.mutedText }}
                          >
                            {imageUrl.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-xs border rounded px-3 py-1.5 cursor-pointer text-red-700 border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: colours.background,
                        borderColor: colours.border,
                      }}
                      className="py-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center p-4"
                    >
                      <svg
                        className="w-8 h-8 mb-2"
                        style={{ color: colours.mutedText }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                        />
                      </svg>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: colours.mutedText }}
                      >
                        No Image Uploaded
                      </p>
                    </div>
                  )}
                </div>
              </FormCard>
            </div>

            <aside className="md:col-span-4 space-y-8">
              <ActionButtonsCard
                isEditMode={isEditMode}
                saving={saving || uploading}
                submitLabel={
                  saving
                    ? "Saving..."
                    : isEditMode
                    ? "Update Concern"
                    : "Add Concern"
                }
                showDraft={false}
                cancelHref="/admin/content/concerns"
                LinkComponent={Link}
              />
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
