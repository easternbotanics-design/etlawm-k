import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { colours, fonts } from '../../../theme/theme.js';
import ritualService from "../../../services/ritualService.js";
import { getProducts } from "../../../services/productService.js";
import { uploadImage } from "../../../services/adminService.js";

const SCOPED_CSS = `
  .ritual-form-input:focus, .ritual-form-textarea:focus, .ritual-form-select:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .ritual-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .ritual-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
`;

const emptyForm = {
  product_id: '',
  image_url: '',
  title: '',
  description: '',
  whys: [''],
  hows: [''],
  tips: [''],
};

export default function CMSRitualForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = !!id;
  const returnTo = location.state?.returnTo || '/admin/content/rituals';

  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ── Fetch products for dropdown ───────────────────────────────────── */
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts(true);
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products list", err);
      }
    }
    loadProducts();
  }, []);

  /* ── Fetch existing ritual in edit mode ────────────────────────────── */
  useEffect(() => {
    if (!isEditMode) return;

    const loadRitual = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ritualService.getRitualById(id);
        const ritual = data.ritual ?? data;

        setForm({
          product_id: ritual.product_id || '',
          image_url: ritual.image_url || '',
          title: ritual.title || '',
          description: ritual.description || '',
          whys: Array.isArray(ritual.whys) && ritual.whys.length > 0 ? ritual.whys : [''],
          hows: Array.isArray(ritual.hows) && ritual.hows.length > 0 ? ritual.hows : [''],
          tips: Array.isArray(ritual.tips) && ritual.tips.length > 0 ? ritual.tips : [''],
        });
      } catch (err) {
        setError(err.message ?? 'Failed to load ritual data.');
      } finally {
        setLoading(false);
      }
    };

    loadRitual();
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

  /* ── Dynamic inputs handlers ───────────────────────────────────────── */
  const handleAddInput = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleRemoveInput = (field, index) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list.splice(index, 1);
      return {
        ...prev,
        [field]: list.length === 0 ? [''] : list,
      };
    });
  };

  const handleInputChange = (field, index, value) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = value;
      return {
        ...prev,
        [field]: list,
      };
    });
  };

  const handleSubmit = async (e, mode = 'publish') => {
    e.preventDefault();

    if (!form.product_id) {
      setError('Please select a product.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        product_id: form.product_id,
        image_url: form.image_url || null,
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        whys: form.whys.filter(item => item.trim() !== ''),
        hows: form.hows.filter(item => item.trim() !== ''),
        tips: form.tips.filter(item => item.trim() !== ''),
        status: mode === 'draft' ? 'draft' : 'published',
      };

      if (isEditMode) {
        await ritualService.updateRitual(id, payload);
        setSuccess(mode === 'draft' ? 'Ritual saved as draft.' : 'Ritual updated successfully.');
      } else {
        await ritualService.createRitual(payload);
        setSuccess(mode === 'draft' ? 'Ritual saved as draft.' : 'Ritual published successfully.');
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
            to="/admin/content/rituals"
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
            Back to Rituals
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
                {isEditMode ? 'Edit Ritual' : 'Add Ritual'}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update product ritual details`
                  : 'Create a new step-by-step ritual routine for an available product'}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>Rituals</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>{isEditMode ? 'Edit Ritual' : 'Add Ritual'}</span>
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
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading ritual data...</p>
          </div>
        ) : (
        /* ── Form ───────────────────────────────────────────────── */
        <form
          onSubmit={(e) => handleSubmit(e, 'publish')}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* ── Left: fields ─────────────────────────────────────── */}
          <div className="xl:col-span-8 space-y-8">
            {/* General Info */}
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
                  Link this ritual to a product and enter optional display details.
                </p>
              </div>

              <div>
                <FieldLabel required>Select Product</FieldLabel>
                <select
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  className="ritual-form-select w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Ritual Title</FieldLabel>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Morning Scalp Stimulation"
                  style={inputStyle}
                  className="ritual-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <FieldLabel>Short Description</FieldLabel>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Introduce the ritual and its purpose..."
                  style={inputStyle}
                  className="ritual-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                />
              </div>
            </section>

            {/* Why Section */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    Why Ritual
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Reasons why this ritual is beneficial.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddInput('whys')}
                  className="px-3.5 py-2 bg-stone-900 text-stone-50 hover:bg-stone-850 hover:text-white rounded-lg text-xs uppercase tracking-wider font-semibold transition cursor-pointer border-none"
                >
                  + Add Why
                </button>
              </div>

              <div className="space-y-4">
                {form.whys.map((why, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={why}
                      onChange={(e) => handleInputChange('whys', idx, e.target.value)}
                      placeholder={`Why reason #${idx + 1}`}
                      style={inputStyle}
                      className="ritual-form-input flex-1 rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInput('whys', idx)}
                      className="p-3 text-red-600 border border-stone-200 hover:bg-red-50 rounded-lg transition cursor-pointer bg-white"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* How Section */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    How to Perform
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Step-by-step instructions on performing this ritual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddInput('hows')}
                  className="px-3.5 py-2 bg-stone-900 text-stone-50 hover:bg-stone-850 hover:text-white rounded-lg text-xs uppercase tracking-wider font-semibold transition cursor-pointer border-none"
                >
                  + Add How
                </button>
              </div>

              <div className="space-y-4">
                {form.hows.map((how, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={how}
                      onChange={(e) => handleInputChange('hows', idx, e.target.value)}
                      placeholder={`Step #${idx + 1}`}
                      style={inputStyle}
                      className="ritual-form-input flex-1 rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInput('hows', idx)}
                      className="p-3 text-red-600 border border-stone-200 hover:bg-red-50 rounded-lg transition cursor-pointer bg-white"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips Section */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    Tips & Precautions
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Additional tips, hints, or precautions for this ritual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddInput('tips')}
                  className="px-3.5 py-2 bg-stone-900 text-stone-50 hover:bg-stone-850 hover:text-white rounded-lg text-xs uppercase tracking-wider font-semibold transition cursor-pointer border-none"
                >
                  + Add Tip
                </button>
              </div>

              <div className="space-y-4">
                {form.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={tip}
                      onChange={(e) => handleInputChange('tips', idx, e.target.value)}
                      placeholder={`Tip #${idx + 1}`}
                      style={inputStyle}
                      className="ritual-form-input flex-1 rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInput('tips', idx)}
                      className="p-3 text-red-600 border border-stone-200 hover:bg-red-50 rounded-lg transition cursor-pointer bg-white"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
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
                  Ritual Image
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  Upload an image showcasing the product ritual.
                </p>
              </div>

              <label
                style={{
                  backgroundColor: colours.secondary,
                  color: colours.background,
                }}
                className="ritual-btn-primary cursor-pointer transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-4 py-3.5 rounded-lg text-center block w-full relative"
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
                        alt="Ritual Preview"
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
                className="ritual-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
              >
                {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Post Ritual'}
              </button>

              <button
                type="button"
                disabled={saving || uploading}
                onClick={(e) => handleSubmit(e, 'draft')}
                style={{
                  borderColor: colours.border,
                  color: colours.text,
                }}
                className="ritual-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
              >
                Save to Draft
              </button>

              <Link
                to={returnTo}
                style={{
                  borderColor: colours.border,
                  color: colours.mutedText,
                }}
                className="ritual-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
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
