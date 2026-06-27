import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewsTable from './ReviewsTable';
import { colours, fonts } from '../../../theme/theme';
import reviewService from "../../../services/reviewService";

/* ── Small reusable button (mirrors AdminCollectionProducts) ─────── */
const ActionButton = ({ name, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={name}
    style={{
      borderColor: colours.border,
      backgroundColor: colours.background,
      fontFamily: fonts.secondary,
    }}
    className="group flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium duration-300"
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = colours.accent;
      e.currentTarget.style.backgroundColor = colours.primary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = colours.border;
      e.currentTarget.style.backgroundColor = colours.background;
    }}
  >
    <span
      style={{ color: colours.text }}
      className="transition-colors duration-300 group-hover:text-[#A77C6B]"
    >
      {name}
    </span>
  </button>
);

/* ── Back arrow (inline SVG to avoid lucide‑react dependency issue) ─ */
const ArrowLeftIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const CMSHomepageReviews = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await reviewService.getAdminReviews();
        
        setReviews(data.reviews ?? []);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const handleEdit = (review) => {
    navigate(`/admin/content/reviews/edit/${review.id}`, {
      state: {
        returnTo: '/admin/content/homepage/reviews',
      },
    });
  };

  const handleDeleted = (deletedReview) => {
    setReviews((prev) => prev.filter((r) => r.id !== deletedReview.id));
  };

  return (
    <div
      className="px-10 py-8"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/content/homepage')}
        className="group mb-4 flex cursor-pointer items-center gap-1 text-sm bg-transparent border-none"
        style={{ color: colours.accent }}
      >
        <span className="transition-transform duration-100 group-hover:-translate-x-1 inline-flex">
          <ArrowLeftIcon />
        </span>
        <span>Back</span>
      </button>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            Homepage CMS Reviews
          </h1>

          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage reviews displayed on the homepage.
          </p>
        </div>

        <ActionButton
          name="Add Review"
          onClick={() =>
            navigate('/admin/content/reviews/add-review', {
              state: {
                returnTo: '/admin/content/homepage/reviews',
              },
            })
          }
        />
      </div>

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading reviews...
        </p>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Reviews table */}
      {!loading && !error && (
        <ReviewsTable
          reviews={reviews}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default CMSHomepageReviews;
