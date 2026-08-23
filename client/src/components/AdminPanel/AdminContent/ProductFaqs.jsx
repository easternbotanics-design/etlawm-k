import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FaqsTable from './FaqsTable';
import { colours, fonts } from '../../../theme/theme';
import faqService from "../../../services/faqService";

/* ── Action button ────────────────────────────────────────────── */
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

/* ── Back arrow icon ───────────────────────────────────────────── */
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

const ProductFaqs = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await faqService.getFaqsByProductSlug(slug);
        
        setFaqs(data.faqs ?? []);
        setProductName(
          data.product_name ??
            slug
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
        );
      } catch (err) {
        setError(err.message || 'Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [slug]);

  const handleEdit = (faq) => {
    navigate(`/admin/content/faqs/edit/${faq.id}`, {
      state: {
        returnTo: `/admin/content/faqs/${slug}`,
      },
    });
  };

  const handleDeleted = (deletedFaq) => {
    setFaqs((prev) => prev.filter((f) => f.id !== deletedFaq.id));
  };

  return (
    <div
      className="px-6 py-8"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/content/faqs')}
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
            {productName || 'Product FAQs'}
          </h1>

          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage FAQs for this product.
          </p>
        </div>

        <ActionButton
          name="+ Add FAQ"
          onClick={() =>
            navigate('/admin/content/faqs/add-faq', {
              state: {
                returnTo: `/admin/content/faqs/${slug}`,
              },
            })
          }
        />
      </div>

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading FAQs...
        </p>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* FAQs table */}
      {!loading && !error && (
        <FaqsTable
          faqs={faqs}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default ProductFaqs;
