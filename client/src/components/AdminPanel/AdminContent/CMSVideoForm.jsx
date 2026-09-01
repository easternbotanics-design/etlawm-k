import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { colours, fonts } from "../../../theme/theme.js";
import videoService from "../../../services/videoService";
import { getProducts } from "../../../services/productService.js";

const SCOPED_CSS = `
  .video-form-input:focus, .video-form-textarea:focus, .video-form-select:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .video-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .video-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
`;

const emptyForm = {
  title: "",
  video_url: "",
  product_id: "",
  product_name: "",
  description: "",
  status: "published",
  is_active: true,
};

export default function CMSVideoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* Fetch products list for dropdown */
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await getProducts(true);
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products for dropdown:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  /* Fetch existing video details if editing */
  useEffect(() => {
    if (!isEditMode) return;

    const loadVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await videoService.getVideoById(id);
        const video = data.video;

        setForm({
          title: video.title || "",
          video_url: video.video_url || "",
          product_id: video.product_id ? String(video.product_id) : "",
          product_name: video.product_name || "",
          description: video.description || "",
          status: video.status || "published",
          is_active: video.is_active ?? true,
        });
      } catch (err) {
        setError(err.message ?? "Failed to load video details.");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductSelect = (e) => {
    const selectedProdId = e.target.value;
    if (!selectedProdId) {
      setForm((prev) => ({
        ...prev,
        product_id: "",
        product_name: "",
      }));
      return;
    }

    const selectedProd = products.find((p) => String(p.id) === String(selectedProdId));
    setForm((prev) => ({
      ...prev,
      product_id: selectedProdId,
      product_name: selectedProd ? selectedProd.name : prev.product_name,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const uploadRes = await videoService.uploadVideoFile(file);
      if (uploadRes.success && uploadRes.url) {
        setForm((prev) => ({
          ...prev,
          video_url: uploadRes.url,
        }));
        setSuccess("Video file uploaded successfully to Supabase Storage.");
      } else {
        throw new Error(uploadRes.message || "Failed to upload video file.");
      }
    } catch (err) {
      setError(err.message || "Failed to upload video file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e, submitStatus = "published") => {
    e.preventDefault();

    if (!form.video_url.trim()) {
      setError("Please select and upload a video file or provide a video URL.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: form.title.trim() || null,
        video_url: form.video_url.trim(),
        product_id: form.product_id ? form.product_id : null,
        product_name: form.product_name.trim() || null,
        description: form.description.trim() || null,
        status: submitStatus,
        is_active: form.is_active,
      };

      if (isEditMode) {
        await videoService.updateVideo(id, payload);
        setSuccess("Video updated successfully.");
      } else {
        await videoService.createVideo(payload);
        setSuccess("Video uploaded and published successfully.");
      }

      setTimeout(() => navigate("/admin/content/video"), 1200);
    } catch (err) {
      setError(err.message ?? "An error occurred while saving the video.");
    } finally {
      setSaving(false);
    }
  };

  const FieldLabel = ({ children, required }) => (
    <label
      style={{ color: colours.mutedText }}
      className="block text-xs uppercase tracking-widest font-semibold mb-2"
    >
      {children}
      {required ? " *" : ""}
    </label>
  );

  const inputStyle = {
    color: colours.text,
    borderColor: colours.border,
    backgroundColor: `${colours.primary}66`,
  };

  const cardStyle = {
    backgroundColor: colours.background,
    borderColor: colours.border,
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
      <style>{SCOPED_CSS}</style>

      <main className="flex-1 pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full pb-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/content/video"
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
            Back to Videos
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
                {isEditMode ? "Edit Video" : "Upload New Video"}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update video details & product links`
                  : "Upload video content to Supabase storage and associate with a product"}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>Videos</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>
                {isEditMode ? "Edit Video" : "Add Video"}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
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
              className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 mb-4"
            ></div>
            <p
              style={{ fontFamily: fonts.primary, color: colours.text }}
              className="text-lg"
            >
              Loading video information...
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => handleSubmit(e, "published")}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Left: Main Form Inputs */}
            <div className="xl:col-span-8 space-y-8">
              {/* Video File Upload Section */}
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    Video File Upload
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Select a video file to upload directly to your Supabase storage bucket.
                  </p>
                </div>

                {/* Upload Picker & Preview */}
                <div>
                  <FieldLabel required>Video File</FieldLabel>
                  
                  <div
                    className="relative border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer"
                    style={{
                      borderColor: form.video_url ? colours.accent : colours.border,
                      backgroundColor: `${colours.primary}44`,
                    }}
                  >
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/m4v"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                    />

                    {uploading ? (
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div
                          style={{ borderTopColor: colours.accent }}
                          className="animate-spin rounded-full h-8 w-8 border-3 border-stone-300"
                        ></div>
                        <span className="text-sm font-semibold" style={{ color: colours.accent }}>
                          Uploading video to Supabase Storage...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-full bg-stone-100 text-stone-600">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>

                        <div>
                          <p className="text-sm font-semibold" style={{ color: colours.text }}>
                            Click or Drag & Drop to upload video file
                          </p>
                          <p className="text-xs text-stone-400 mt-1">
                            Supports MP4, WebM, MOV, M4V (max 100MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Video Preview Player */}
                {form.video_url && (
                  <div className="space-y-2 mt-4">
                    <FieldLabel>Uploaded Video Preview</FieldLabel>
                    <div className="rounded-xl overflow-hidden border bg-black aspect-video max-h-72 flex items-center justify-center" style={{ borderColor: colours.border }}>
                      <video
                        src={form.video_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        name="video_url"
                        value={form.video_url}
                        onChange={handleChange}
                        placeholder="Direct Video URL"
                        style={inputStyle}
                        className="video-form-input w-full rounded-lg border px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Product & Details Section */}
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    Video Information & Product Link
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Select a product to associate with this video and provide details.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>Video Title / Name</FieldLabel>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. How to apply Hair Growth Serum"
                      style={inputStyle}
                      className="video-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <FieldLabel>Name of Product (Select Product)</FieldLabel>
                    <select
                      name="product_id"
                      value={form.product_id}
                      onChange={handleProductSelect}
                      style={inputStyle}
                      className="video-form-select w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      <option
                        value=""
                        style={{
                          backgroundColor: colours.primary,
                          color: colours.mutedText,
                        }}
                      >
                        {loadingProducts
                          ? "Loading catalog products..."
                          : "Select a Product"}
                      </option>
                      {products.map((prod) => (
                        <option
                          key={prod.id}
                          value={prod.id}
                          style={{
                            backgroundColor: colours.primary,
                            color: colours.text,
                          }}
                        >
                          {prod.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel>Description / Caption</FieldLabel>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Provide a short description or routine notes for this video..."
                    style={inputStyle}
                    className="video-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                  />
                </div>
              </section>
            </div>

            {/* Right: Actions Sidebar */}
            <aside className="xl:col-span-4 space-y-8">
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 shadow-sm space-y-4 sticky top-24"
              >
                <div>
                  <h3
                    style={{ fontFamily: fonts.primary }}
                    className="text-lg font-semibold"
                  >
                    Publish Settings
                  </h3>
                  <p style={{ color: colours.mutedText }} className="text-xs">
                    Control visibility of this video item.
                  </p>
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={inputStyle}
                    className="video-form-select w-full rounded-lg border px-3 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    style={{ color: colours.text }}
                  >
                    Active on Storefront
                  </label>
                </div>

                <hr style={{ borderColor: colours.border }} />

                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    backgroundColor: colours.secondary,
                    color: colours.background,
                  }}
                  className="video-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
                >
                  {saving ? "Saving Video..." : isEditMode ? "Save Changes" : "Publish Video"}
                </button>

                <button
                  type="button"
                  disabled={saving || uploading}
                  onClick={(e) => handleSubmit(e, "draft")}
                  style={{
                    borderColor: colours.border,
                    color: colours.text,
                  }}
                  className="video-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
                >
                  Save to Draft
                </button>

                <Link
                  to="/admin/content/video"
                  style={{
                    borderColor: colours.border,
                    color: colours.mutedText,
                  }}
                  className="video-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
                >
                  Cancel
                </Link>
              </section>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
