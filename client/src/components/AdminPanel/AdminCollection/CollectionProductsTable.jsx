import { useState } from "react";
import { colours, fonts } from "../../../theme/theme";
import { deleteProduct } from "../../../services/productService";
import TableTemplate from "../TableTemplate";

const formatCategory = (category = "") => {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

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

const ProductTable = ({ products = [], onEdit, onDelete, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) return;

    try {
      setDeletingId(product.id);

      await deleteProduct(product.id);

      onDelete?.(product);
      onDeleted?.(product);
    } catch (err) {
      alert(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "PRODUCT",
      render: (product) => (
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="h-14 w-14 rounded-xl object-cover"
          />

          <div>
            <h3
              className="text-base font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              {product.name}
            </h3>

            <p
              className="mt-1 text-sm"
              style={{ color: colours.mutedText }}
            >
              Code: {product.code || "N/A"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (product) => (
        <span className="text-sm" style={{ color: colours.text }}>
          {formatCategory(product.category)}
        </span>
      ),
    },
    {
      key: "stockQty",
      label: "STOCK",
      render: (product) => (
        <span className="text-sm" style={{ color: colours.text }}>
          {product.stockQty}
        </span>
      ),
    },
    {
      key: "price",
      label: "PRICE",
      render: (product) => (
        <span className="text-sm font-semibold" style={{ color: colours.text }}>
          ₹{product.price}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (product) => {
        const inStock = Number(product.stockQty) > 0;
        return (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: inStock ? colours.primary : "#F4E3E0",
              color: inStock ? colours.accent : "#A44A3F",
            }}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (product) => {
        const isDeleting = deletingId === product.id;

        return (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: colours.border,
                color: colours.accent,
                backgroundColor: colours.background,
              }}
              aria-label={`Edit ${product.name}`}
            >
              <EditIcon />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(product)}
              disabled={isDeleting}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: colours.border,
                color: "#A44A3F",
                backgroundColor: colours.background,
              }}
              aria-label={`Delete ${product.name}`}
            >
              {isDeleting ? "..." : <DeleteIcon />}
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
        data={products}
        emptyLabel="No products found in this collection."
      />
    </div>
  );
};

export default ProductTable;