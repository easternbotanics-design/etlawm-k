import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { colours, fonts } from '../../../theme/theme.js';
import scienceService from '../../../services/scienceService.js';
import { uploadImage } from '../../../services/adminService.js';

const SCOPED_CSS = `
  .science-form-input:focus, .science-form-textarea:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .science-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .science-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
`;

const emptyForm = {
  name: '',
  image_url: '',
};

export default function CMSScienceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = !!id;
  const returnTo = location.state?.returnTo || '/admin/content/science';

  const [form, setForm] = useState(emptyForm);
  const [descriptions, setDescriptions] = useState([]);
  const [currentDescText, setCurrentDescText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ── Fetch existing entry in edit mode ────────────────────────── */
  useEffect(() => {
    if (!isEditMode) return;

    const loadScienceEntry = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await scienceService.getScienceById(id);
        const science = data.science ?? data;

        setForm({
          name: science.name || '',
          image_url: science.image_url || '',
        });

        // Initialize descriptions from descriptions array or fallback to box_1/2/3
        let descList = [];
        if (Array.isArray(science.descriptions) && science.descriptions.length > 0) {
          descList = science.descriptions;
        } else {
          descList = [science.box_1, science.box_2, science.box_3].filter(Boolean);
        }
        setDescriptions(descList);
      } catch (err) {
        setError(err.message ?? 'Failed to load science entry.');
      } finally {
        setLoading(false);
      }
    };

    loadScienceEntry();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDescription = () => {
    if (!currentDescText.trim()) return;
    setDescriptions((prev) => [...prev, currentDescText.trim()]);
    setCurrentDescText('');
  };

  const handleRemoveDescription = (index) => {
    setDescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Allow multiple image formats (PNG, JPG, JPEG, WEBP, SVG, GIF, etc.)
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, SVG, etc.).');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Supabase product-images bucket
      const data = await uploadImage(file, 'product-images');
      if (data && data.url) {
        setForm((prev) => ({ ...prev, image_url: data.url }));
        setSuccess('Image uploaded successfully to product-images bucket.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Upload succeeded but no URL was returned.');
      }
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e, mode = 'publish') => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: form.name.trim(),
        descriptions: descriptions,
        box_1: descriptions[0] || null,
        box_2: descriptions[1] || null,
        box_3: descriptions[2] || null,
        image_url: form.image_url,
        status: mode === 'draft' ? 'draft' : 'published',
      };

      if (isEditMode) {
        await scienceService.updateScience(id, payload);
        setSuccess(mode === 'draft' ? 'Science entry saved as draft.' : 'Science entry updated successfully.');
      } else {
        await scienceService.createScience(payload);
        setSuccess(mode === 'draft' ? 'Science entry saved as draft.' : 'Science entry created successfully.');
      }

      setTimeout(() => navigate(returnTo), 1200);
    } catch (err) {
      setError(err.message ?? 'An unexpected error occurred.');
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
      {required ? ' *' : ''}
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
            to="/admin/content/science"
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
            Back to Science Section
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
                {isEditMode ? 'Edit Science Entry' : 'Add Science Entry'}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update science entry details`
                  : 'Create a new science entry with description paragraphs and compound image'}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>Science</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>
                {isEditMode ? 'Edit Entry' : 'Add Entry'}
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
          <div style={cardStyle} className="flex flex-col items-center justify-center py-20 border rounded-2xl">
            <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 mb-4"></div>
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading science data...</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => handleSubmit(e, 'publish')}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Left: General & Descriptions */}
            <div className="xl:col-span-8 space-y-8">
              {/* General Details */}
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    General Info
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Enter the compound name for this science entry.
                  </p>
                </div>

                <div>
                  <FieldLabel required>Compound Name</FieldLabel>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Barrier Defense or Lipid Science"
                    style={inputStyle}
                    className="science-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>
              </section>

              {/* Dynamic Descriptions Section */}
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    Descriptions
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Add description paragraphs for this compound. Type a paragraph and click <span className="font-semibold text-stone-700">+ Add</span>.
                  </p>
                </div>

                {/* Single Input Box + Add Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <textarea
                    value={currentDescText}
                    onChange={(e) => setCurrentDescText(e.target.value)}
                    placeholder="Type a description paragraph here..."
                    rows="3"
                    style={inputStyle}
                    className="science-form-textarea flex-1 rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                  />
                  <button
                    type="button"
                    onClick={handleAddDescription}
                    style={{
                      backgroundColor: colours.secondary,
                      color: colours.background,
                    }}
                    className="science-btn-primary px-6 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all shadow-sm border-none cursor-pointer self-end sm:self-auto shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* List of Added Descriptions */}
                <div className="space-y-3 pt-2">
                  <FieldLabel>Added Description Paragraphs ({descriptions.length})</FieldLabel>

                  {descriptions.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs text-stone-400">
                      No descriptions added yet. Type in the box above and click + Add.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {descriptions.map((desc, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderColor: colours.border,
                            backgroundColor: `${colours.primary}66`,
                          }}
                          className="rounded-xl border p-4 flex items-start justify-between gap-4"
                        >
                          <div className="flex gap-3 items-start flex-1 min-w-0">
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold shrink-0"
                              style={{
                                backgroundColor: colours.surface,
                                color: colours.secondary,
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-secondary whitespace-pre-wrap">
                              {desc}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveDescription(idx)}
                            className="text-xs border rounded px-3 py-1.5 cursor-pointer text-red-700 border-red-200 hover:bg-red-50 transition-colors shrink-0 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Multi-Format Image Upload + Actions */}
            <aside className="xl:col-span-4 space-y-8">
              {/* Image Upload section */}
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    Compound Image Upload
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Upload any image format (PNG, JPG, WEBP, SVG, etc.), stored in Supabase's <span className="font-semibold text-stone-700">product-images</span> bucket.
                  </p>
                </div>

                <label
                  style={{
                    backgroundColor: colours.secondary,
                    color: colours.background,
                  }}
                  className="science-btn-primary cursor-pointer transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-4 py-3.5 rounded-lg text-center block w-full relative"
                >
                  {uploading ? 'Uploading Image...' : 'Upload Image File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {form.image_url ? (
                  <div className="space-y-3 pt-2">
                    <div
                      style={{
                        borderColor: colours.border,
                        backgroundColor: `${colours.primary}66`,
                      }}
                      className="rounded-xl border p-3 flex gap-3"
                    >
                      <div
                        className="w-20 h-24 rounded-lg overflow-hidden border shrink-0 bg-stone-50 flex items-center justify-center p-2"
                        style={{ borderColor: colours.border }}
                      >
                        <img
                          src={form.image_url}
                          alt="Science Image Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-sm font-semibold truncate">Uploaded Image</p>
                          <p
                            style={{ color: colours.mutedText }}
                            className="text-[11px] truncate"
                          >
                            {form.image_url.split('/').pop()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                            className="text-[11px] border rounded px-2.5 py-1.5 cursor-pointer text-red-700 border-red-200 hover:bg-red-50 transition-colors font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: colours.background,
                      borderColor: colours.border,
                    }}
                    className="aspect-[4/3] w-full rounded-xl border border-dashed flex flex-col items-center justify-center p-4"
                  >
                    <svg
                      className="w-12 h-12 mb-3"
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
                      style={{ color: colours.accent }}
                      className="text-xs uppercase tracking-wider font-semibold text-center"
                    >
                      No Image Uploaded
                    </p>
                  </div>
                )}
              </section>

              {/* Action Buttons */}
              <section
                style={cardStyle}
                className="border rounded-2xl p-6 shadow-sm space-y-3 sticky top-24"
              >
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    backgroundColor: colours.secondary,
                    color: colours.background,
                  }}
                  className="science-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
                >
                  {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Science Entry'}
                </button>

                <button
                  type="button"
                  disabled={saving || uploading}
                  onClick={(e) => handleSubmit(e, 'draft')}
                  style={{
                    borderColor: colours.border,
                    color: colours.text,
                  }}
                  className="science-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
                >
                  Save to Draft
                </button>

                <Link
                  to={returnTo}
                  style={{
                    borderColor: colours.border,
                    color: colours.mutedText,
                  }}
                  className="science-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
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
