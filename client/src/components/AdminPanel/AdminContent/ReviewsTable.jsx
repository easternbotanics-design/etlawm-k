import { useState } from 'react';
import { colours, fonts } from '../../../theme/theme';
import reviewService from "../../../services/reviewService";

/* ── Star icons ──────────────────────────────────────────────────── */
const StarDisplay = ({ rating }) => {
  const num = Number(rating) || 0;
  const full = Math.floor(num);
  const hasHalf = num - full >= 0.3 && num - full < 0.8;

  return (
    <div className="inline-flex items-center gap-[2px]">
      {[...Array(5)].map((_, i) => {
        const isFull = i < full;
        const isHalf = i === full && hasHalf;
        const filled = isFull || isHalf;

        return (
          <svg
            key={i}
            className="w-[14px] h-[14px]"
            viewBox="0 0 24 24"
            fill={filled ? '#E8A838' : 'none'}
            stroke={filled ? '#E8A838' : colours.border}
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

/* ── SVG icons ───────────────────────────────────────────────────── */
const EditIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

/* ── Table component ─────────────────────────────────────────────── */
const ReviewsTable = ({ reviews = [], onEdit, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      `Delete review by "${review.customer_name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(review.id);

      await reviewService.deleteCmsReview(review.id);

      onDeleted?.(review);
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="mt-8 overflow-hidden rounded-2xl border shadow-sm"
      style={{
        borderColor: colours.border,
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr
              className="border-b text-xs uppercase tracking-wide"
              style={{
                borderColor: colours.border,
                color: colours.mutedText,
              }}
            >
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Rating</th>
              <th className="px-6 py-4 font-semibold" style={{ maxWidth: 360 }}>Review</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {reviews.length > 0 ? (
              reviews.map((review) => {
                const isPublished =
                  review.status === 'published' || review.status === 'active';
                const isDeleting = deletingId === review.id;
                const initials = (review.customer_name || '?')
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr
                    key={review.id}
                    className="border-b transition-colors duration-200 hover:bg-black/5"
                    style={{ borderColor: colours.border }}
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: colours.accent,
                            color: colours.background,
                          }}
                        >
                          {initials}
                        </div>

                        <div>
                          <h3
                            className="text-sm font-semibold"
                            style={{
                              color: colours.text,
                              fontFamily: fonts.primary,
                            }}
                          >
                            {review.customer_name}
                          </h3>

                          {review.product_link ? (
                            <a
                              href={review.product_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 block text-xs no-underline transition-colors hover:underline"
                              style={{ color: colours.accent }}
                            >
                              {review.product_name}
                            </a>
                          ) : (
                            <p
                              className="mt-0.5 text-xs"
                              style={{ color: colours.mutedText }}
                            >
                              {review.product_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={review.rating} />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: colours.text }}
                        >
                          {Number(review.rating).toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Review text */}
                    <td className="px-6 py-4" style={{ maxWidth: 360 }}>
                      <p
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{ color: colours.text }}
                      >
                        {review.review}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: isPublished
                            ? colours.primary
                            : '#FEF3C7',
                          color: isPublished ? colours.accent : '#92400E',
                        }}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    {/* Date */}
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colours.mutedText }}
                    >
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit?.(review)}
                          className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                          style={{
                            borderColor: colours.border,
                            color: colours.accent,
                            backgroundColor: colours.background,
                          }}
                          aria-label={`Edit review by ${review.customer_name}`}
                        >
                          <EditIcon />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(review)}
                          disabled={isDeleting}
                          className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          style={{
                            borderColor: colours.border,
                            color: '#A44A3F',
                            backgroundColor: colours.background,
                          }}
                          aria-label={`Delete review by ${review.customer_name}`}
                        >
                          {isDeleting ? '...' : <DeleteIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-10 text-center text-sm"
                  style={{ color: colours.mutedText }}
                >
                  No reviews found for this product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewsTable;
