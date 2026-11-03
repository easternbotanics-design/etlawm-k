import { useEffect, useState, useMemo } from "react";
import { colours, fonts } from "../../../theme/theme";
import { getAdminInventory, addAdminInventoryStock } from "../../../services/adminService";
import TableTemplate from "../TableTemplate";

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [absoluteUpdates, setAbsoluteUpdates] = useState({}); // { [productId]: currentStockValue }
  const [updates, setUpdates] = useState({}); // { [productId]: quantityToAdd }
  const [popupSearchQuery, setPopupSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminInventory();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Products for the Main Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Paginated Products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Filtered Products for the Popup
  const filteredPopupProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(popupSearchQuery.toLowerCase())
    );
  }, [products, popupSearchQuery]);

  const handleOpenPopup = () => {
    setUpdates({});
    
    // Prefill absolute stock values with original stock
    const initialAbsolute = {};
    products.forEach((p) => {
      initialAbsolute[p.id] = p.stock_qty;
    });
    setAbsoluteUpdates(initialAbsolute);
    
    setPopupSearchQuery("");
    setPopupError("");
    setSuccessMessage("");
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    if (!submitting) {
      setIsPopupOpen(false);
    }
  };

  const handleAbsoluteChange = (productId, val) => {
    setAbsoluteUpdates((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleUpdateChange = (productId, val) => {
    setUpdates((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleStockUp = async (e) => {
    e.preventDefault();
    setPopupError("");
    setSuccessMessage("");

    const finalAbsolute = {};
    const finalAdditions = {};
    let hasValidUpdate = false;

    // Filter absolute updates that have actually changed
    Object.entries(absoluteUpdates).forEach(([prodId, val]) => {
      const parsedVal = parseInt(val, 10);
      const originalProduct = products.find((p) => p.id === prodId);
      
      if (originalProduct && !isNaN(parsedVal) && parsedVal >= 0) {
        if (parsedVal !== originalProduct.stock_qty) {
          finalAbsolute[prodId] = parsedVal;
          hasValidUpdate = true;
        }
      }
    });

    // Filter addition updates
    Object.entries(updates).forEach(([prodId, val]) => {
      const parsedVal = parseInt(val, 10);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        finalAdditions[prodId] = parsedVal;
        hasValidUpdate = true;
      }
    });

    if (!hasValidUpdate) {
      setPopupError("No changes detected to stock levels.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await addAdminInventoryStock(finalAbsolute, finalAdditions);
      if (res.success) {
        setSuccessMessage("Stock updated successfully!");
        // Reload inventory data
        const freshData = await getAdminInventory();
        setProducts(freshData.products || []);
        
        // Auto close popup after 1.5 seconds
        setTimeout(() => {
          setIsPopupOpen(false);
          setSuccessMessage("");
          setUpdates({});
          setAbsoluteUpdates({});
        }, 1500);
      } else {
        setPopupError(res.message || "Failed to update stock");
      }
    } catch (err) {
      setPopupError(err.message || "An error occurred while updating stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "NAME AND PIC",
      render: (product) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#D8D2C8] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
            {product.primary_image ? (
              <img
                src={product.primary_image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-semibold text-[#171715] leading-tight">
              {product.name}
            </span>
            {!product.is_active && (
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider mt-1 w-fit bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                Inactive
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "CURRENT PRICE",
      render: (product) => (
        <span className="font-medium text-stone-700 text-xs md:text-sm">
          ₹
          {parseFloat(product.price || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "items_sold",
      label: "ITEMS SOLD",
      render: (product) => (
        <span
          className="font-bold px-2.5 py-1 rounded-md shrink-0 border text-xs md:text-sm"
          style={{
            backgroundColor: product.items_sold > 0 ? `${colours.accent}15` : "#FAF9F6",
            borderColor: product.items_sold > 0 ? `${colours.accent}30` : colours.border,
            color: product.items_sold > 0 ? colours.accent : "#8c8c8c",
          }}
        >
          {product.items_sold}
        </span>
      ),
    },
    {
      key: "stock",
      label: "STOCK",
      render: (product) => (
        <span
          className={`font-semibold px-2.5 py-1 rounded-md shrink-0 border text-xs md:text-sm ${
            product.stock_qty <= 0
              ? "text-red-700 bg-red-50 border-red-200"
              : product.stock_qty <= 5
              ? "text-amber-700 bg-amber-50 border-amber-200 animate-pulse"
              : "text-emerald-700 bg-emerald-50 border-emerald-200"
          }`}
        >
          {product.stock_qty <= 0 ? "Out of Stock" : `${product.stock_qty} available`}
        </span>
      ),
    },
  ];

  return (
    <div className="px-6 py-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#171715] tracking-wide" style={{ fontFamily: fonts.primary }}>
            Product Inventory
          </h1>
          <p className="text-xs text-[#7C7770] mt-1 font-medium">Manage product availability and stock levels</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink">
          {/* Main Table Search */}
          <input
            type="text"
            placeholder="Search product name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-xs md:text-sm rounded-lg border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-[#A77C6B] transition-all duration-200 w-full sm:w-64 shrink"
            style={{
              borderColor: colours.border,
              color: colours.secondary,
              fontFamily: fonts.secondary,
            }}
          />
        </div>
      </div>

      {/* Button above the table (top-left) */}
      <div className="mb-4">
        <button
          onClick={handleOpenPopup}
          className="px-4 py-2.5 bg-[#A77C6B] hover:bg-[#A77C6B]/90 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer border-none flex items-center gap-2"
          style={{ fontFamily: fonts.secondary }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Stock
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 mb-3"></div>
          <p className="text-sm text-[#7C7770]">Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <TableTemplate
            columns={columns}
            data={paginatedProducts}
            emptyLabel="No products found."
          />

          {/* Pagination Controls */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-xl border bg-white shadow-sm"
            style={{
              borderColor: colours.border,
              fontFamily: fonts.secondary,
            }}
          >
            <span className="text-xs text-[#7C7770]">
              Showing {filteredProducts.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer border-solid"
                style={{ borderColor: colours.border, color: colours.secondary }}
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer border-solid"
                style={{ borderColor: colours.border, color: colours.secondary }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Popup Window Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200"
            style={{ fontFamily: fonts.secondary }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-[#FCFBF9]">
              <div>
                <h3 className="text-lg font-semibold text-[#171715]" style={{ fontFamily: fonts.primary }}>
                  Add Product Stock
                </h3>
                <p className="text-[11px] text-[#7C7770]">Edit current stock directly or enter additions to stock levels</p>
              </div>
              <button
                type="button"
                onClick={handleClosePopup}
                disabled={submitting}
                className="p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer text-stone-400 hover:text-stone-700 border-none bg-transparent flex items-center justify-center disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sub-Header Popup Search Bar */}
            <div className="px-6 py-3 border-b border-stone-100 bg-stone-50/50">
              <input
                type="text"
                placeholder="Search products in popup..."
                value={popupSearchQuery}
                onChange={(e) => setPopupSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none bg-white placeholder-stone-400 focus:ring-1 focus:ring-[#A77C6B] transition-all"
                style={{ borderColor: colours.border }}
              />
            </div>

            {/* Modal Body (Scrollable Container with data-lenis-prevent) */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col" data-lenis-prevent>
              {popupError && (
                <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded font-medium">
                  {popupError}
                </div>
              )}
              {successMessage && (
                <div className="p-3 mb-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-xs rounded font-medium">
                  {successMessage}
                </div>
              )}

              {filteredPopupProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 italic">No matching products found.</div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Column Headers */}
                  <div className="hidden md:grid md:grid-cols-[1fr_96px_96px] items-center text-[10px] uppercase font-bold text-stone-400 px-3 mb-2 gap-4">
                    <div>Product</div>
                    <div className="text-center">Current Stock</div>
                    <div className="text-center">Add Stock</div>
                  </div>

                  {/* Scrollable list */}
                  <div className="space-y-3">
                    {filteredPopupProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col md:grid md:grid-cols-[1fr_96px_96px] md:items-center p-3 rounded-xl border border-stone-100 hover:bg-stone-50/30 transition-colors gap-3 md:gap-4"
                      >
                        {/* Column 1: Product Thumbnail & Name */}
                        <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                          <div className="w-10 h-10 rounded-lg bg-white border border-[#D8D2C8] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                            {product.primary_image ? (
                              <img
                                src={product.primary_image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-stone-750 md:truncate leading-normal">
                            {product.name}
                          </span>
                        </div>

                        {/* Inputs Container - on mobile side-by-side, on desktop direct grid columns */}
                        <div className="grid grid-cols-2 gap-3 w-full md:contents">
                          {/* Column 2: Current Stock (can be edited directly) */}
                          <div className="flex flex-col md:block">
                            <label className="text-[9px] uppercase font-bold text-stone-400 mb-1 md:hidden">Current Stock</label>
                            <input
                              type="number"
                              min="0"
                              value={absoluteUpdates[product.id] ?? ""}
                              onChange={(e) => handleAbsoluteChange(product.id, e.target.value)}
                              disabled={submitting}
                              className="w-full text-center px-2 py-1.5 text-xs rounded-lg border outline-none bg-stone-50 hover:bg-stone-100/50 focus:bg-white focus:ring-1 focus:ring-[#A77C6B] transition-all font-semibold md:w-24"
                              style={{ borderColor: colours.border }}
                            />
                          </div>

                          {/* Column 3: Add Stock (defaults to empty/0) */}
                          <div className="flex flex-col md:block">
                            <label className="text-[9px] uppercase font-bold text-stone-400 mb-1 md:hidden">Add Stock</label>
                            <input
                              type="number"
                              placeholder="0"
                              min="0"
                              value={updates[product.id] || ""}
                              onChange={(e) => handleUpdateChange(product.id, e.target.value)}
                              disabled={submitting}
                              className="w-full text-center px-2 py-1.5 text-xs rounded-lg border outline-none bg-white focus:ring-1 focus:ring-[#A77C6B] transition-all font-semibold md:w-24"
                              style={{ borderColor: colours.border }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-[#FCFBF9] flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleClosePopup}
                disabled={submitting}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStockUp}
                disabled={submitting}
                className="px-5 py-2 bg-[#A77C6B] hover:bg-[#A77C6B]/90 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer border-none flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white"></div>
                    Updating...
                  </>
                ) : (
                  "Stock Up"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
