import { useState } from 'react';
import { colours, fonts } from '../../../theme/theme';
import reviewService from "../../../services/reviewService";
import TableTemplate from "../TableTemplate";

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

  const columns = [
    {
      key: "customer",
      label: "CUSTOMER",
      render: (review) => {
        const initials = (review.customer_name || '?')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
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
                  onClick={(e) => e.stopPropagation()}
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
        );
      },
    },
    {
      key: "rating",
      label: "RATING",
      render: (review) => (
        <div className="flex items-center gap-2">
          <StarDisplay rating={review.rating} />
          <span
            className="text-xs font-semibold"
            style={{ color: colours.text }}
          >
            {Number(review.rating).toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      key: "review",
      label: "REVIEW",
      render: (review) => (
        <div>
          {review.heading && (
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: colours.accent, fontFamily: fonts.primary }}
            >
              {review.heading}
            </h4>
          )}
          <p
            className="text-sm leading-relaxed line-clamp-2 max-w-sm"
            style={{ color: colours.text }}
          >
            {review.review}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (review) => {
        const isPublished =
          review.status === 'published' || review.status === 'active';
        return (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: isPublished ? colours.primary : '#FEF3C7',
              color: isPublished ? colours.accent : '#92400E',
            }}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "DATE",
      render: (review) => (
        <span className="text-sm" style={{ color: colours.mutedText }}>
          {review.created_at
            ? new Date(review.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (review) => {
        const isDeleting = deletingId === review.id;
        return (
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
        );
      },
    },
  ];

  return (
    <div className="mt-8">
      <TableTemplate
        columns={columns}
        data={reviews}
        emptyLabel="No reviews found."
      />
    </div>
  );
};

export default ReviewsTable;

