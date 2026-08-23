import { useState } from 'react';
import { colours, fonts } from '../../../theme/theme';
import faqService from "../../../services/faqService";
import TableTemplate from "../TableTemplate";

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
const FaqsTable = ({ faqs = [], onEdit, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (faq) => {
    const confirmed = window.confirm(
      `Delete FAQ: "${faq.question}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(faq.id);
      await faqService.deleteCmsFaq(faq.id);
      onDeleted?.(faq);
    } catch (err) {
      alert(err.message || 'Failed to delete FAQ');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "question",
      label: "QUESTION",
      render: (faq) => (
        <div>
          <h3
            className="text-sm font-semibold max-w-md"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            {faq.question}
          </h3>
          <p
            className="mt-0.5 text-xs font-medium"
            style={{ color: colours.accent }}
          >
            {faq.product_name}
          </p>
        </div>
      ),
    },
    {
      key: "answer",
      label: "ANSWER",
      render: (faq) => (
        <p
          className="text-sm leading-relaxed line-clamp-3 max-w-lg"
          style={{ color: colours.text }}
        >
          {faq.answer}
        </p>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (faq) => {
        const isPublished =
          faq.status === 'published' || faq.status === 'active';
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
      render: (faq) => (
        <span className="text-sm" style={{ color: colours.mutedText }}>
          {faq.created_at
            ? new Date(faq.created_at).toLocaleDateString('en-IN', {
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
      render: (faq) => {
        const isDeleting = deletingId === faq.id;
        return (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(faq)}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: colours.accent,
                backgroundColor: colours.background,
              }}
              aria-label={`Edit FAQ`}
            >
              <EditIcon />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(faq)}
              disabled={isDeleting}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: '#A44A3F',
                backgroundColor: colours.background,
              }}
              aria-label={`Delete FAQ`}
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
        data={faqs}
        emptyLabel="No FAQs found for this product."
      />
    </div>
  );
};

export default FaqsTable;
