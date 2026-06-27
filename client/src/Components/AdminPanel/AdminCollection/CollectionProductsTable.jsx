import { useState } from "react";
import { colours, fonts } from "../../../theme/theme";
import { deleteProduct } from "../../../services/productService";

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
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead>
            <tr
              className="border-b text-xs uppercase tracking-wide"
              style={{
                borderColor: colours.border,
                color: colours.mutedText,
              }}
            >
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((product) => {
                const inStock = Number(product.stockQty) > 0;
                const isDeleting = deletingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className="border-b transition-colors duration-200 hover:bg-black/5"
                    style={{ borderColor: colours.border }}
                  >
                    <td className="px-6 py-4">
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
                    </td>

                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colours.text }}
                    >
                      {formatCategory(product.category)}
                    </td>

                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colours.text }}
                    >
                      {product.stockQty}
                    </td>

                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colours.text }}
                    >
                      ₹{product.price}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: inStock ? colours.primary : "#F4E3E0",
                          color: inStock ? colours.accent : "#A44A3F",
                        }}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
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
                  No products found in this collection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;