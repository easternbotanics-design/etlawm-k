import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Leaf, Sparkles, Loader2 } from 'lucide-react';
import { getProducts } from '../../services/productService.js';
import { getCategories } from '../../services/categoryService.js';
import ingredientService from '../../services/ingredientService.js';
import { colours, fonts } from '../../theme/theme.js';

const IngredientsTemplate = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCard, setSelectedCard] = useState(null);

  const [popupIngredients, setPopupIngredients] = useState([]);
  const [loadingPopupIngredients, setLoadingPopupIngredients] = useState(false);

  // ── Load Products and Categories ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories().catch(() => []),
        ]);

        if (cancelled) return;

        setProducts(productsData || []);
        setCategories(
          (categoriesData || []).filter(
            (c) => c.isActive && c.slug !== 'all-products'
          )
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load products.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch Ingredients for Selected Product ─────────────────────────────────
  useEffect(() => {
    if (!selectedCard) {
      setPopupIngredients([]);
      return;
    }

    let cancelled = false;
    setLoadingPopupIngredients(true);

    async function loadProductIngredients() {
      try {
        const res = await ingredientService.getProductIngredients(selectedCard.id);
        if (!cancelled) {
          setPopupIngredients(res.ingredients || []);
        }
      } catch (err) {
        console.error('Failed to load ingredients for product:', err);
        if (!cancelled) {
          setPopupIngredients([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPopupIngredients(false);
        }
      }
    }

    loadProductIngredients();

    return () => {
      cancelled = true;
    };
  }, [selectedCard]);

  // ── Dynamic Filter Options ──────────────────────────────────────────────────
  const filterOptions = useMemo(() => {
    const catNames = categories.map((c) => c.name);
    return ['All', ...catNames];
  }, [categories]);

  // ── Filtered Products Grid ─────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.subtitle && product.subtitle.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.ingredients && product.ingredients.toLowerCase().includes(query));

      const matchesCategory =
        activeCategory === 'All' ||
        product.subtitle === activeCategory ||
        product.category === activeCategory.toLowerCase().replace(/\s+/g, '-');

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  // Parse text ingredients string if available
  const parsedTextIngredients = useMemo(() => {
    if (!selectedCard || !selectedCard.ingredients) return [];
    if (Array.isArray(selectedCard.ingredients)) return selectedCard.ingredients;
    return String(selectedCard.ingredients)
      .split(/,|\n|•/)
      .map((i) => i.trim())
      .filter(Boolean);
  }, [selectedCard]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colours.background }}>
      {/* Top bar */}
      <div
        className="sticky top-16 md:top-20 z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-md sm:px-6 transition-all"
        style={{
          backgroundColor: `${colours.primary}E6`,
          borderColor: colours.border,
        }}
      >
        {/* Search bar - left */}
        <div className="relative w-full max-w-xs sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: colours.mutedText }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or ingredients..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs md:text-sm outline-none transition-all duration-300 focus:ring-1"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: colours.border,
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          />
        </div>

        {/* Filter buttons - right */}
        <div
          data-lenis-prevent
          className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none"
        >
          {filterOptions.map((filter) => {
            const isActive = activeCategory === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveCategory(filter)}
                className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.12em] font-semibold transition-all duration-300 whitespace-nowrap border"
                style={{
                  backgroundColor: isActive ? colours.secondary : '#FFFFFF',
                  color: isActive ? colours.primary : colours.text,
                  borderColor: isActive ? colours.secondary : colours.border,
                  fontFamily: fonts.secondary,
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] w-full animate-pulse rounded-xl"
              style={{ backgroundColor: colours.surface }}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="py-16 text-center text-sm"
          style={{ color: colours.accent, fontFamily: fonts.secondary }}
        >
          {error}
        </div>
      )}

      {/* Cards grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 md:gap-6">
          {filteredCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left shadow-sm transition-all duration-300 hover:shadow-lg focus:outline-none border"
              style={{
                backgroundColor: colours.primary,
                borderColor: colours.border,
              }}
            >
              <img
                src={card.image || '/products/placeholder.png'}
                alt={card.name}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/products/placeholder.png';
                }}
              />
              {/* Whitish blurred name label, bottom-left */}
              <div
                className="absolute bottom-2 left-2 right-2 rounded-lg px-3 py-2 backdrop-blur-md border shadow-sm sm:right-auto sm:max-w-[85%]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderColor: colours.border,
                }}
              >
                <p
                  className="truncate text-sm font-normal"
                  style={{ color: colours.text, fontFamily: fonts.primary }}
                >
                  {card.name}
                </p>
                {card.subtitle && (
                  <p
                    className="truncate text-[10px] uppercase tracking-wider"
                    style={{ color: colours.accent, fontFamily: fonts.secondary }}
                  >
                    {card.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}

          {filteredCards.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-2">
              <Leaf className="mx-auto h-8 w-8" style={{ color: colours.mutedText }} />
              <p
                className="text-sm font-light"
                style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
              >
                No products match your filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail popup */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:p-8 md:p-12"
          style={{ backgroundColor: 'rgba(8, 8, 8, 0.65)' }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl md:flex-row"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: colours.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute right-3 top-3 z-10 rounded-full p-2.5 shadow-md transition hover:scale-105"
              style={{
                backgroundColor: colours.primary,
                color: colours.text,
                borderColor: colours.border,
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left half - product image + product name */}
            <div
              className="flex w-full flex-col items-center justify-center gap-4 p-6 md:w-1/2 md:p-10 border-b md:border-b-0 md:border-r"
              style={{
                backgroundColor: colours.primary,
                borderColor: colours.border,
              }}
            >
              <img
                src={selectedCard.image || '/products/placeholder.png'}
                alt={selectedCard.name}
                className="max-h-[45vh] w-full rounded-xl object-cover shadow-md md:max-h-[55vh]"
                onError={(e) => {
                  e.currentTarget.src = '/products/placeholder.png';
                }}
              />
              <div className="text-center space-y-1">
                <h2
                  className="text-xl sm:text-2xl font-normal"
                  style={{ color: colours.text, fontFamily: fonts.primary }}
                >
                  {selectedCard.name}
                </h2>
                {selectedCard.subtitle && (
                  <p
                    className="text-xs uppercase tracking-widest font-semibold"
                    style={{ color: colours.accent, fontFamily: fonts.secondary }}
                  >
                    {selectedCard.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right half - scrollable stack of ingredient cards with lenis prevent */}
            <div
              data-lenis-prevent
              className="flex w-full flex-col gap-4 overflow-y-auto p-4 sm:p-6 md:w-1/2 md:p-8"
              style={{ backgroundColor: colours.subBackground }}
            >
              <h3
                className="text-lg font-normal border-b pb-3"
                style={{
                  color: colours.text,
                  fontFamily: fonts.primary,
                  borderColor: colours.border,
                }}
              >
                Formulation & Ingredients
              </h3>

              {loadingPopupIngredients ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: colours.accent }} />
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                  >
                    Loading ingredients breakdown...
                  </p>
                </div>
              ) : popupIngredients.length > 0 ? (
                popupIngredients.map((item, idx) => {
                  const paragraphs = [item.para1, item.para2, item.para3].filter(Boolean);
                  if (paragraphs.length === 0 && item.description) {
                    paragraphs.push(item.description);
                  }
                  if (paragraphs.length === 0) {
                    paragraphs.push('Botanical extract formulation for optimal efficacy.');
                  }

                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-xl border p-5 shadow-sm space-y-3 transition-all duration-300"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: colours.border,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || '/products/placeholder.png'}
                          alt={item.name}
                          className="h-12 w-12 flex-shrink-0 rounded-full object-cover border"
                          style={{ borderColor: colours.border }}
                          onError={(e) => {
                            e.currentTarget.src = '/products/placeholder.png';
                          }}
                        />
                        <div>
                          <p
                            className="font-normal text-base"
                            style={{ color: colours.text, fontFamily: fonts.primary }}
                          >
                            {item.name}
                          </p>
                          {item.scientific_name && (
                            <p
                              className="text-xs italic"
                              style={{ color: colours.accent, fontFamily: fonts.secondary }}
                            >
                              {item.scientific_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {paragraphs.map((p, i) => (
                          <p
                            key={i}
                            className="text-xs md:text-sm leading-relaxed font-light"
                            style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : parsedTextIngredients.length > 0 ? (
                <div className="space-y-3">
                  <p
                    className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: colours.accent, fontFamily: fonts.secondary }}
                  >
                    Botanical Component Extracts:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {parsedTextIngredients.map((ingName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border p-4 shadow-sm"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: colours.border,
                        }}
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                          style={{ backgroundColor: colours.primary, color: colours.accent }}
                        >
                          <Leaf className="h-4 w-4" />
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: colours.text, fontFamily: fonts.secondary }}
                          >
                            {ingName}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: colours.accent, fontFamily: fonts.secondary }}
                          >
                            100% Pure Botanical
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl border p-6 text-center space-y-3"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: colours.border,
                  }}
                >
                  <Sparkles className="mx-auto h-7 w-7" style={{ color: colours.accent }} />
                  <p
                    className="text-base font-normal"
                    style={{ color: colours.text, fontFamily: fonts.primary }}
                  >
                    Natural Ayurvedic Formulation
                  </p>
                  <p
                    className="text-xs leading-relaxed font-light"
                    style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                  >
                    Formulated with wild-harvested herbs, cold-pressed botanical oils, and active natural extracts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsTemplate;