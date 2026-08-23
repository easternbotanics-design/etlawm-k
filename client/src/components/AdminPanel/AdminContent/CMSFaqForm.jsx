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
  question: '',
  answer: '',
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
          question: faq.question || '',
          answer: faq.answer || '',
        });
      } catch (err) {
        setError(err.message ?? 'Failed to load FAQ data.');
      } finally {
        setLoading(false);
      }
    };

    loadFaq();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, mode = 'publish') => {
    e.preventDefault();

    if (!form.productName.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!form.question.trim()) {
      setError('Question is required.');
      return;
    }
    if (!form.answer.trim()) {
      setError('Answer is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        product_name: form.productName.trim(),
        product_link: form.productLink.trim() || null,
        question: form.question.trim(),
        answer: form.answer.trim(),
        status: mode === 'draft' ? 'draft' : 'published',
      };

      if (isEditMode) {
        await faqService.updateCmsFaq(id, payload);
        setSuccess(mode === 'draft' ? 'FAQ saved as draft.' : 'FAQ updated successfully.');
      } else {
        await faqService.createCmsFaq(payload);
        setSuccess(mode === 'draft' ? 'FAQ saved as draft.' : 'FAQ published successfully.');
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
                {isEditMode ? 'Edit FAQ' : 'Add FAQ'}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update FAQ details`
                  : 'Create a product FAQ entry for the website'}
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
              <span style={{ color: colours.accent }}>{isEditMode ? 'Edit FAQ' : 'Add FAQ'}</span>
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
                  Select the product this FAQ applies to.
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

            {/* Question & Answer */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
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
                  Enter the question and detailed answer.
                </p>
              </div>

              <div>
                <FieldLabel required>Question</FieldLabel>
                <input
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  required
                  placeholder="e.g. How often should I use this product?"
                  style={inputStyle}
                  className="faq-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <FieldLabel required>Answer</FieldLabel>
                <textarea
                  name="answer"
                  value={form.answer}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Provide a clear, helpful answer..."
                  style={inputStyle}
                  className="faq-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                />
              </div>
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
                {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Post FAQ'}
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
