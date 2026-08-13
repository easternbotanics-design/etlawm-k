import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { colours, fonts } from '../../../theme/theme.js';
import ingredientService from "../../../services/ingredientService.js";
import { uploadImage } from "../../../services/adminService.js";

const SCOPED_CSS = `
  .ingredient-form-input:focus, .ingredient-form-textarea:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .ingredient-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .ingredient-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
`;

const emptyForm = {
  name: '',
  scientific_name: '',
  image_url: '',
  para1: '',
  para2: '',
  para3: '',
};

export default function CMSIngredientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = !!id;
  const returnTo = location.state?.returnTo || '/admin/content/ingredients';

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ── Fetch existing ingredient in edit mode ────────────────────────── */
  useEffect(() => {
    if (!isEditMode) return;

    const loadIngredient = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ingredientService.getIngredientById(id);
        const ingredient = data.ingredient ?? data;

        setForm({
          name: ingredient.name || '',
          scientific_name: ingredient.scientific_name || '',
          image_url: ingredient.image_url || '',
          para1: ingredient.para1 || '',
          para2: ingredient.para2 || '',
          para3: ingredient.para3 || '',
        });
      } catch (err) {
        setError(err.message ?? 'Failed to load ingredient data.');
      } finally {
        setLoading(false);
      }
    };

    loadIngredient();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = await uploadImage(file);
      if (data && data.url) {
        setForm((prev) => ({ ...prev, image_url: data.url }));
        setSuccess('Image uploaded successfully.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Upload succeeded but no URL was returned.');
      }
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e, mode = 'publish') => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Ingredient name is required.');
      return;
    }
    if (!form.image_url) {
      setError('An ingredient image is required.');
      return;
    }
    if (!form.para1.trim()) {
      setError('Paragraph 1 (Left Text) is required.');
      return;
    }
    if (!form.para2.trim()) {
      setError('Paragraph 2 (Right Text 1) is required.');
      return;
    }
    if (!form.para3.trim()) {
      setError('Paragraph 3 (Right Text 2) is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: form.name.trim(),
        scientific_name: form.scientific_name.trim(),
        image_url: form.image_url,
        para1: form.para1.trim(),
        para2: form.para2.trim(),
        para3: form.para3.trim(),
        status: mode === 'draft' ? 'draft' : 'published',
      };

      if (isEditMode) {
        await ingredientService.updateIngredient(id, payload);
        setSuccess(mode === 'draft' ? 'Ingredient saved as draft.' : 'Ingredient updated successfully.');
      } else {
        await ingredientService.createIngredient(payload);
        setSuccess(mode === 'draft' ? 'Ingredient saved as draft.' : 'Ingredient published successfully.');
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
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-8 animate-in fade-in duration-300">
          <Link
            to="/admin/content/ingredients"
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
            Back to Ingredients
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
                {isEditMode ? 'Edit Ingredient' : 'Add Ingredient'}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update ingredient details`
                  : 'Create a new ingredient showcase for the website scroll'}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>Ingredients</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>{isEditMode ? 'Edit Ingredient' : 'Add Ingredient'}</span>
            </div>
          </div>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-3 rounded shadow-sm animate-in fade-in duration-200">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-start gap-3 rounded shadow-sm animate-in fade-in duration-200">
            <span>{success}</span>
          </div>
        )}

        {/* ── Loading state for edit mode ────────────────────────── */}
        {loading ? (
          <div style={cardStyle} className="flex flex-col items-center justify-center py-20 border rounded-2xl">
            <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 mb-4"></div>
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading ingredient data...</p>
          </div>
        ) : (
        /* ── Form ───────────────────────────────────────────────── */
        <form
          onSubmit={(e) => handleSubmit(e, 'publish')}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* ── Left: fields ─────────────────────────────────────── */}
          <div className="xl:col-span-8 space-y-8">
            {/* Info & Image Upload */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2
                  style={{ fontFamily: fonts.primary }}
                  className="text-2xl font-semibold"
                >
                  General Details
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  Enter the ingredient's name and upload a primary image.
                </p>
              </div>

              <div>
                <FieldLabel required>Ingredient Name</FieldLabel>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Aloe Vera"
                  style={inputStyle}
                  className="ingredient-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <FieldLabel>Scientific Name</FieldLabel>
                <input
                  name="scientific_name"
                  value={form.scientific_name}
                  onChange={handleChange}
                  placeholder="e.g. Aloe barbadensis miller"
                  style={inputStyle}
                  className="ingredient-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>

            </section>

            {/* Paragraphs */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2
                  style={{ fontFamily: fonts.primary }}
                  className="text-2xl font-semibold"
                >
                  Showcase Paragraphs
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  These paragraphs appear when scrolling through the ingredient scene.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <FieldLabel required>Paragraph 1 (Left Column Text)</FieldLabel>
                  <textarea
                    name="para1"
                    value={form.para1}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="The main introduction for this ingredient, displayed on the left side of the screen..."
                    style={inputStyle}
                    className="ingredient-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                  />
                </div>

                <div>
                  <FieldLabel required>Paragraph 2 (Right Column Top)</FieldLabel>
                  <textarea
                    name="para2"
                    value={form.para2}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="First supporting detail, displayed on the right side of the screen..."
                    style={inputStyle}
                    className="ingredient-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                  />
                </div>

                <div>
                  <FieldLabel required>Paragraph 3 (Right Column Bottom)</FieldLabel>
                  <textarea
                    name="para3"
                    value={form.para3}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Second supporting detail, displayed below Paragraph 2 on the right side..."
                    style={inputStyle}
                    className="ingredient-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ── Right: preview + actions ─────────────────────────── */}
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
                  Image
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  Upload an image for this ingredient.
                </p>
              </div>

              <label
                style={{
                  backgroundColor: colours.secondary,
                  color: colours.background,
                }}
                className="ingredient-btn-primary cursor-pointer transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-4 py-3.5 rounded-lg text-center block w-full relative"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
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
                      className="w-20 h-24 rounded-lg overflow-hidden border shrink-0"
                      style={{ borderColor: colours.border }}
                    >
                      <img
                        src={form.image_url}
                        alt="Ingredient"
                        className="w-full h-full object-cover"
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
                          className="text-[11px] border rounded px-2.5 py-1.5 cursor-pointer text-red-700 border-red-200 hover:bg-red-50 transition-colors"
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


            {/* Actions */}
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
                className="ingredient-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
              >
                {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Post Ingredient'}
              </button>

              <button
                type="button"
                disabled={saving || uploading}
                onClick={(e) => handleSubmit(e, 'draft')}
                style={{
                  borderColor: colours.border,
                  color: colours.text,
                }}
                className="ingredient-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
              >
                Save to Draft
              </button>

              <Link
                to={returnTo}
                style={{
                  borderColor: colours.border,
                  color: colours.mutedText,
                }}
                className="ingredient-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
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
