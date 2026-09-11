import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { colours, fonts } from '../../../theme/theme.js';
import faqService from "../../../services/faqService";
import { getProducts } from '../../../services/productService.js';

const SCOPED_CSS = `
  .faq-form-input:focus, .faq-form-textarea:focus, .faq-form-select:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .faq-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .faq-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
`;

const emptyForm = {
  productName: '',
  productLink: '',
  faqs: [
    { question: '', answer: '' }
  ],
};

export default function CMSFaqForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = !!id;
  const returnTo = location.state?.returnTo || '/admin/content/faqs';

  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ── Fetch products list for dropdown ──────────────────────────── */
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await getProducts(true);
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to load products for dropdown:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  /* ── Fetch existing FAQ in edit mode ───────────────────────────── */
  useEffect(() => {
    if (!isEditMode) return;

    const loadFaq = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await faqService.getFaqById(id);
        const faq = data.faq ?? data;

        setForm({
          productName: faq.product_name || '',
          productLink: faq.product_link || '',
          faqs: [
            {
              question: faq.question || '',
              answer: faq.answer || '',
            },
          ],
        });
      } catch (err) {
        setError(err.message ?? 'Failed to load FAQ data.');
      } finally {
        setLoading(false);
      }
    };

    loadFaq();
  }, [id, isEditMode]);

  const handleFaqChange = (index, field, value) => {
    setForm((prev) => {
      const updatedFaqs = [...prev.faqs];
      updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
      return { ...prev, faqs: updatedFaqs };
    });
  };

  const handleAddFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const handleRemoveFaq = (index) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e, mode = 'publish') => {
    e.preventDefault();

    if (!form.productName.trim()) {
      setError('Product name is required.');
      return;
    }

    for (let i = 0; i < form.faqs.length; i++) {
      if (!form.faqs[i].question.trim()) {
        setError(`Question is required for FAQ #${i + 1}.`);
        return;
      }
      if (!form.faqs[i].answer.trim()) {
        setError(`Answer is required for FAQ #${i + 1}.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode) {
        // Editing single FAQ
        const payload = {
          product_name: form.productName.trim(),
          product_link: form.productLink.trim() || null,
          question: form.faqs[0].question.trim(),
          answer: form.faqs[0].answer.trim(),
          status: mode === 'draft' ? 'draft' : 'published',
        };
        await faqService.updateCmsFaq(id, payload);

        // If extra FAQs were added in edit mode, create them as well
        if (form.faqs.length > 1) {
          const extraFaqsPayload = {
            product_name: form.productName.trim(),
            product_link: form.productLink.trim() || null,
            faqs: form.faqs.slice(1).map((f) => ({
              question: f.question.trim(),
              answer: f.answer.trim(),
            })),
            status: mode === 'draft' ? 'draft' : 'published',
          };
          await faqService.createCmsFaq(extraFaqsPayload);
        }

        setSuccess(mode === 'draft' ? 'FAQ saved as draft.' : 'FAQ updated successfully.');
      } else {
        // Multi-FAQ Creation
        const payload = {
          product_name: form.productName.trim(),
          product_link: form.productLink.trim() || null,
          faqs: form.faqs.map((f) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
          status: mode === 'draft' ? 'draft' : 'published',
        };
        await faqService.createCmsFaq(payload);
        setSuccess(
          mode === 'draft'
            ? `${form.faqs.length} FAQ(s) saved to draft.`
            : `${form.faqs.length} FAQ(s) published successfully.`
        );
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
        <div className="mb-8">
          <Link
            to="/admin/content/faqs"
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
            Back to FAQs
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
                {isEditMode ? 'Edit FAQ' : 'Add Product FAQs'}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update FAQ details`
                  : 'Create one or multiple product FAQ entries for the website'}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>FAQs</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>{isEditMode ? 'Edit FAQ' : 'Add FAQs'}</span>
            </div>
          </div>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────── */}
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

        {/* ── Loading state for edit mode ────────────────────────── */}
        {loading ? (
          <div style={cardStyle} className="flex flex-col items-center justify-center py-20 border rounded-2xl">
            <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 mb-4"></div>
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading FAQ data...</p>
          </div>
        ) : (
        /* ── Form ───────────────────────────────────────────────── */
        <form
          onSubmit={(e) => handleSubmit(e, 'publish')}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
          {/* ── Left: fields ─────────────────────────────────────── */}
          <div className="xl:col-span-8 space-y-8">
            {/* Product selection */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2
                  style={{ fontFamily: fonts.primary }}
                  className="text-2xl font-semibold"
                >
                  Product Information
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  Select the product these FAQs apply to.
                </p>
              </div>

              <div>
                <FieldLabel required>Product</FieldLabel>
                <select
                  name="productName"
                  value={form.productName}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const selectedProd = products.find((p) => p.name === selectedName);
                    setForm((prev) => ({
                      ...prev,
                      productName: selectedName,
                      productLink: selectedProd ? `/product/${selectedProd.slug}` : prev.productLink,
                    }));
                  }}
                  required
                  style={inputStyle}
                  className="faq-form-select w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled style={{ backgroundColor: colours.primary, color: colours.mutedText }}>
                    {loadingProducts ? 'Loading products...' : 'Select a Product'}
                  </option>
                  {products.map((prod) => (
                    <option
                      key={prod.id}
                      value={prod.name}
                      style={{ backgroundColor: colours.primary, color: colours.text }}
                    >
                      {prod.name}
                    </option>
                  ))}
                  {form.productName && !products.some((p) => p.name === form.productName) && (
                    <option
                      value={form.productName}
                      style={{ backgroundColor: colours.primary, color: colours.text }}
                    >
                      {form.productName}
                    </option>
                  )}
                </select>
              </div>
            </section>

            {/* Questions & Answers Section */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              {/* Section Header with top + Add FAQ button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/60">
                <div>
                  <h2
                    style={{ fontFamily: fonts.primary }}
                    className="text-2xl font-semibold"
                  >
                    FAQ Details
                  </h2>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-xs mt-1"
                  >
                    Add multiple question and answer pairs for this product.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5"
                  style={{
                    backgroundColor: colours.secondary,
                    color: colours.background,
                    borderColor: colours.secondary,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add FAQ</span>
                </button>
              </div>

              {/* Dynamic FAQ Cards */}
              <div className="space-y-6">
                {form.faqs.map((faqItem, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border relative transition-all duration-200"
                    style={{
                      backgroundColor: `${colours.primary}33`,
                      borderColor: colours.border,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200/40">
                      <span
                        className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${colours.accent}20`,
                          color: colours.accent,
                        }}
                      >
                        FAQ #{index + 1}
                      </span>

                      {form.faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
                          title="Remove this FAQ"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FieldLabel required>Question {form.faqs.length > 1 ? `#${index + 1}` : ''}</FieldLabel>
                        <input
                          value={faqItem.question}
                          onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                          required
                          placeholder="e.g. How often should I use this product?"
                          style={inputStyle}
                          className="faq-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <FieldLabel required>Answer {form.faqs.length > 1 ? `#${index + 1}` : ''}</FieldLabel>
                        <textarea
                          value={faqItem.answer}
                          onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                          required
                          rows="4"
                          placeholder="Provide a clear, helpful answer..."
                          style={inputStyle}
                          className="faq-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Bottom Add Button for Convenience */}
              {form.faqs.length > 1 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="w-full py-3 rounded-xl border border-dashed text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-50"
                    style={{
                      borderColor: colours.accent,
                      color: colours.accent,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>+ Add Another FAQ</span>
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* ── Right: action buttons ─────────────────────────── */}
          <aside className="xl:col-span-4 space-y-8">
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 shadow-sm space-y-3 sticky top-24"
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: colours.secondary,
                  color: colours.background,
                }}
                className="faq-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
              >
                {saving
                  ? 'Saving...'
                  : isEditMode
                  ? 'Save Changes'
                  : form.faqs.length > 1
                  ? `Post ${form.faqs.length} FAQs`
                  : 'Post FAQ'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, 'draft')}
                style={{
                  borderColor: colours.border,
                  color: colours.text,
                }}
                className="faq-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
              >
                Save to Draft
              </button>

              <Link
                to={returnTo}
                style={{
                  borderColor: colours.border,
                  color: colours.mutedText,
                }}
                className="faq-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
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

