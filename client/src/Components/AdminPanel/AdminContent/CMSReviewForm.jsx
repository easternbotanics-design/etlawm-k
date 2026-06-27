import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { colours, fonts } from '../../../theme/theme.js';
import reviewService from "../../../services/reviewService";

const SCOPED_CSS = `
  .review-form-input:focus, .review-form-textarea:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .review-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .review-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
  .star-display {
    position: relative;
    display: inline-flex;
    gap: 2px;
  }
  .star-display .star-icon {
    width: 18px;
    height: 18px;
    color: ${colours.border};
    transition: color 0.15s ease;
  }
  .star-display .star-icon.filled {
    color: #E8A838;
  }
  .star-display .star-icon.half {
    color: #E8A838;
  }
`;

const emptyForm = {
  customerName: '',
  productName: '',
  productLink: '',
  rating: '',
  review: '',
};

/* ── Star visual helper ─────────────────────────────────────────────── */
const StarDisplay = ({ rating }) => {
  const numRating = Number(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = numRating - fullStars >= 0.3 && numRating - fullStars < 0.8;
  const filledCount = hasHalf ? fullStars + 1 : fullStars;

  return (
    <div className="star-display">
      {[...Array(5)].map((_, i) => {
        const isFull = i < fullStars;
        const isHalf = i === fullStars && hasHalf;
        const isFilledOrHalf = i < filledCount;

        return (
          <svg
            key={i}
            className={`star-icon ${isFull ? 'filled' : ''} ${isHalf ? 'half' : ''}`}
            viewBox="0 0 24 24"
            fill={isFilledOrHalf ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        );
      })}
    </div>
  );
};

/* ── Main component ──────────────────────────────────────────────── */
export default function CMSReviewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = !!id;
  
  const returnTo = location.state?.returnTo || '/admin/content/reviews';

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ── Fetch existing review in edit mode ────────────────────────── */
  useEffect(() => {
    if (!isEditMode) return;

    const loadReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reviewService.getReviewById(id);
        const review = data.review ?? data;

        setForm({
          customerName: review.customer_name || '',
          productName: review.product_name || '',
          productLink: review.product_link || '',
          rating: review.rating != null ? String(review.rating) : '',
          review: review.review || review.comment || '',
        });
      } catch (err) {
        setError(err.message ?? 'Failed to load review data.');
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "rating") {
      if (value === "") {
        setForm((prev) => ({ ...prev, rating: "" }));
        return;
      }
  
      if (!/^[1-5]$/.test(value)) {
        return;
      }
  
      setForm((prev) => ({ ...prev, rating: value }));
      return;
    }
  
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingKeyDown = (e) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
  
    if (allowedControlKeys.includes(e.key)) {
      return;
    }
  
    if (!/^[1-5]$/.test(e.key)) {
      e.preventDefault();
    }
  };
  
  const handleRatingPaste = (e) => {
    const pastedValue = e.clipboardData.getData("text");
  
    if (!/^[1-5]$/.test(pastedValue)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e, mode = 'publish') => {
    e.preventDefault();

    if (!form.customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!form.productName.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!form.rating || Number(form.rating) <= 0) {
      setError('Rating is required and must be greater than 0.');
      return;
    }
    if (!form.review.trim()) {
      setError('Review text is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        customer_name: form.customerName.trim(),
        product_name: form.productName.trim(),
        product_link: form.productLink.trim() || null,
        rating: Number(Number(form.rating).toFixed(1)),
        review: form.review.trim(),
        status: mode === 'draft' ? 'draft' : 'published',
      };

      if (isEditMode) {
        await reviewService.updateCmsReview(id, payload);
        setSuccess(mode === 'draft' ? 'Review saved as draft.' : 'Review updated successfully.');
      } else {
        await reviewService.createCmsReview(payload);
        setSuccess(mode === 'draft' ? 'Review saved as draft.' : 'Review published successfully.');
      }

      setTimeout(() => navigate(returnTo), 1200);
    } catch (err) {
      setError(err.message ?? 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Shared styles (mirrors CMSProductForm) ───────────────────── */
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
            to="/admin/content/reviews"
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
            Back to Reviews
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
                {isEditMode ? 'Edit Review' : 'Add Review'}
              </h1>
              <p
                style={{ color: colours.mutedText }}
                className="text-xs tracking-wider uppercase font-semibold mt-1"
              >
                {isEditMode
                  ? `ID: ${id} • Update review details`
                  : 'Create a customer review for the homepage reviews section'}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: colours.mutedText }}
            >
              <span>Content</span>
              <span>/</span>
              <span>Reviews</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>{isEditMode ? 'Edit Review' : 'Add Review'}</span>
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
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading review data...</p>
          </div>
        ) : (
        /* ── Form ───────────────────────────────────────────────── */
        <form
          onSubmit={(e) => handleSubmit(e, 'publish')}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
          {/* ── Left: fields ─────────────────────────────────────── */}
          <div className="xl:col-span-8 space-y-8">
            {/* Customer & Product Info */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2
                  style={{ fontFamily: fonts.primary }}
                  className="text-2xl font-semibold"
                >
                  Customer & Product
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  Enter the reviewer's details and the product being reviewed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel required>Name of Customer</FieldLabel>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Priya Sharma"
                    style={inputStyle}
                    className="review-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <FieldLabel required>Product for Review</FieldLabel>
                  <input
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Hydrating Face Serum"
                    style={inputStyle}
                    className="review-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>Link of the Product</FieldLabel>
                  <input
                    name="productLink"
                    value={form.productLink}
                    onChange={handleChange}
                    placeholder="e.g. /products/hydrating-face-serum"
                    style={inputStyle}
                    className="review-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <FieldLabel required>Rating</FieldLabel>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="rating"
                      value={form.rating}
                      onChange={handleChange}
                      onKeyDown={handleRatingKeyDown}
                      onPaste={handleRatingPaste}
                      required
                      maxLength="1"
                      placeholder="5"
                      style={inputStyle}
                      className="review-form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                    />
                    <div className="shrink-0 flex items-center gap-2">
                      <StarDisplay rating={form.rating} />
                      {form.rating && (
                        <span
                          style={{ color: colours.mutedText }}
                          className="text-xs font-semibold"
                        >
                          {Number(form.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    style={{ color: colours.mutedText }}
                    className="text-[11px] mt-2"
                  >
                    Enter a value between 1 and 5
                  </p>
                </div>
              </div>
            </section>

            {/* Review Text */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2
                  style={{ fontFamily: fonts.primary }}
                  className="text-2xl font-semibold"
                >
                  Review
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  The customer review text that will appear on the website.
                </p>
              </div>

              <div>
                <FieldLabel required>Review</FieldLabel>
                <textarea
                  name="review"
                  value={form.review}
                  onChange={handleChange}
                  required
                  rows="8"
                  placeholder="Write the customer's review here..."
                  style={inputStyle}
                  className="review-form-textarea w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all resize-y"
                />
                <p
                  style={{ color: colours.mutedText }}
                  className="text-[11px] mt-2"
                >
                  {form.review.length} characters
                </p>
              </div>
            </section>
          </div>

          {/* ── Right: sidebar with preview + actions ─────────── */}
          <aside className="xl:col-span-4 space-y-8">
            {/* Live Preview */}
            <section
              style={cardStyle}
              className="border rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div>
                <h2
                  style={{ fontFamily: fonts.primary }}
                  className="text-2xl font-semibold"
                >
                  Preview
                </h2>
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs mt-1"
                >
                  Live preview of how the review card will look.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: `${colours.primary}`,
                  borderColor: colours.border,
                }}
                className="rounded-xl border p-5 space-y-3"
              >
                {/* Customer Name */}
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: colours.accent,
                      color: colours.background,
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  >
                    {form.customerName
                      ? form.customerName
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {form.customerName || 'Customer Name'}
                    </p>
                    <p
                      style={{ color: colours.mutedText }}
                      className="text-[11px]"
                    >
                      {form.productName || 'Product Name'}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <StarDisplay rating={form.rating} />

                {/* Review text */}
                <p
                  style={{ color: colours.mutedText }}
                  className="text-xs leading-relaxed line-clamp-4"
                >
                  {form.review || 'Review text will appear here...'}
                </p>
              </div>
            </section>

            {/* Action Buttons */}
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
                className="review-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
              >
                {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Post Review'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, 'draft')}
                style={{
                  borderColor: colours.border,
                  color: colours.text,
                }}
                className="review-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
              >
                Save to Draft
              </button>

              <Link
                to={returnTo}
                style={{
                  borderColor: colours.border,
                  color: colours.mutedText,
                }}
                className="review-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
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
