import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService.js";
import { getCategories } from "../../services/categoryService.js";
import ingredientService from "../../services/ingredientService.js";
import { colours, fonts } from "../../theme/theme.js";
import { Search, Sparkles, ArrowRight, Leaf, ChevronDown, ChevronUp, Table } from "lucide-react";

export default function IngredientsProductGrid() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Onclick card state to toggle table
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [productIngredientsMap, setProductIngredientsMap] = useState({});
  const [loadingIngsMap, setLoadingIngsMap] = useState({});

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
            (c) => c.isActive && c.slug !== "all-products"
          )
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load products.");
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

  const handleCardClick = async (product) => {
    if (expandedProductId === product.id) {
      setExpandedProductId(null);
      return;
    }

    setExpandedProductId(product.id);

    if (!productIngredientsMap[product.id]) {
      setLoadingIngsMap((prev) => ({ ...prev, [product.id]: true }));
      try {
        const res = await ingredientService.getProductIngredients(product.id);
        setProductIngredientsMap((prev) => ({
          ...prev,
          [product.id]: res.ingredients || [],
        }));
      } catch (err) {
        console.error("Failed to load ingredients for product:", err);
        setProductIngredientsMap((prev) => ({ ...prev, [product.id]: [] }));
      } finally {
        setLoadingIngsMap((prev) => ({ ...prev, [product.id]: false }));
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.ingredients &&
          product.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="w-full">
      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <section className="relative py-6 md:py-4 px-6 overflow-hidden">
        <div className="relative max-w-4xl ml-[10%] space-y-4">
          <h1
            className="text-4xl md:text-4xl font-normal tracking-wide leading-tight"
            style={{ color: colours.text, fontFamily: fonts.primary }}
          >
            Formulations & Ingredients
          </h1>
        </div>
      </section>

      {/* ── Filters & Search Section ──────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b pb-8" style={{ borderColor: `${colours.border}80` }}>
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              style={{ color: colours.mutedText }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product or ingredient..."
              className="w-full pl-11 pr-4 py-3 text-xs md:text-sm rounded-full border outline-none transition-all duration-300 focus:ring-1"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: colours.border,
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            />
          </div>

          {/* Category Tabs */}
          <div data-lenis-prevent className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300 whitespace-nowrap border ${
                selectedCategory === "all"
                  ? "shadow-sm"
                  : "hover:border-stone-400"
              }`}
              style={{
                backgroundColor: selectedCategory === "all" ? colours.secondary : "#FFFFFF",
                color: selectedCategory === "all" ? colours.background : colours.text,
                borderColor: selectedCategory === "all" ? colours.secondary : colours.border,
                fontFamily: fonts.secondary,
              }}
            >
              All Formulations
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300 whitespace-nowrap border ${
                  selectedCategory === cat.slug
                    ? "shadow-sm"
                    : "hover:border-stone-400"
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.slug ? colours.secondary : "#FFFFFF",
                  color: selectedCategory === cat.slug ? colours.background : colours.text,
                  borderColor: selectedCategory === cat.slug ? colours.secondary : colours.border,
                  fontFamily: fonts.secondary,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Grid ──────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 pb-24">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl animate-pulse"
                style={{ backgroundColor: colours.primary }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="py-16 text-center space-y-3">
            <p className="text-base text-red-700" style={{ fontFamily: fonts.secondary }}>
              {error}
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <Leaf size={32} className="mx-auto" style={{ color: colours.mutedText }} />
            <h3 className="text-xl font-normal" style={{ color: colours.text, fontFamily: fonts.primary }}>
              No formulations found
            </h3>
            <p className="text-xs uppercase tracking-wider" style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
              Try searching with another keyword or resetting filters.
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
            {filteredProducts.map((product) => {
              const productSlug = product.slug;
              const productCategory = product.subtitle || product.categoryName || product.category || "Formulation";
              const isExpanded = expandedProductId === product.id;
              const ingredientsList = productIngredientsMap[product.id] || [];
              const isLoadingIngredients = loadingIngsMap[product.id];

              return (
                <div
                  key={product.id}
                  className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                    isExpanded ? "ring-2 shadow-2xl col-span-1 sm:col-span-2 lg:col-span-3" : "hover:shadow-xl hover:-translate-y-1"
                  }`}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: isExpanded ? colours.accent : colours.border,
                  }}
                  onClick={() => handleCardClick(product)}
                >
                  <div className={`flex flex-col ${isExpanded ? "md:flex-row" : ""}`}>
                    {/* Image Container */}
                    <div className={`relative ${isExpanded ? "md:w-1/3 aspect-[4/3]" : "aspect-[4/3] w-full"} overflow-hidden bg-[#F7F3EC] flex items-center justify-center`}>
                      <img
                        src={product.image || "/products/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/products/placeholder.png";
                        }}
                      />

                      {/* Category / Badge Tag */}
                      <div 
                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold backdrop-blur-md shadow-sm border"
                        style={{ 
                          backgroundColor: "rgba(255, 255, 255, 0.9)", 
                          color: colours.text,
                          borderColor: colours.border,
                          fontFamily: fonts.secondary 
                        }}
                      >
                        {product.badge || productCategory}
                      </div>
                    </div>

                    {/* Body Container */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h2
                            className="text-2xl font-normal leading-snug transition-colors duration-300 group-hover:text-[#A77C6B]"
                            style={{ color: colours.text, fontFamily: fonts.primary }}
                          >
                            {product.name}
                          </h2>
                          <div className="p-1.5 rounded-full border bg-stone-50 shrink-0" style={{ borderColor: colours.border }}>
                            {isExpanded ? <ChevronUp size={18} style={{ color: colours.accent }} /> : <ChevronDown size={18} style={{ color: colours.mutedText }} />}
                          </div>
                        </div>

                        {product.price > 0 && (
                          <p
                            className="text-xs uppercase tracking-widest font-semibold"
                            style={{ color: colours.accent, fontFamily: fonts.secondary }}
                          >
                            ₹{product.price}
                          </p>
                        )}

                        {product.ingredients && !isExpanded && (
                          <p
                            className="text-xs line-clamp-2 pt-1 font-light leading-relaxed"
                            style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                          >
                            <span className="font-semibold text-stone-700">Contains: </span>
                            {product.ingredients}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: `${colours.border}60` }}>
                        <span
                          className="text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2"
                          style={{ color: isExpanded ? colours.accent : colours.text, fontFamily: fonts.secondary }}
                        >
                          <span>{isExpanded ? "Hide Ingredients Table" : "View Ingredients Table"}</span>
                          {isExpanded ? <ChevronUp size={14} style={{ color: colours.accent }} /> : <ArrowRight size={14} style={{ color: colours.accent }} />}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── EXPANDED TABLE OF INGREDIENTS ── */}
                  {isExpanded && (
                    <div 
                      className="p-6 border-t bg-[#FAF7F2] animate-in fade-in slide-in-from-top-2 duration-300"
                      onClick={(e) => e.stopPropagation()}
                      style={{ borderColor: colours.border }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Table size={18} style={{ color: colours.accent }} />
                          <h3 className="text-lg font-semibold" style={{ color: colours.text, fontFamily: fonts.primary }}>
                            Ingredients List for {product.name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/ingredient/${productSlug}`)}
                          className="text-xs uppercase tracking-wider font-semibold underline flex items-center gap-1 hover:opacity-80"
                          style={{ color: colours.accent, fontFamily: fonts.secondary }}
                        >
                          <span>Full View Page</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {isLoadingIngredients ? (
                        <div className="py-8 text-center text-xs animate-pulse" style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
                          Loading ingredients table...
                        </div>
                      ) : ingredientsList.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm" style={{ borderColor: colours.border }}>
                          <table className="w-full text-left text-xs border-collapse" style={{ fontFamily: fonts.secondary }}>
                            <thead>
                              <tr className="border-b bg-[#F4EFE6]" style={{ borderColor: colours.border, color: colours.text }}>
                                <th className="p-3.5 font-semibold uppercase tracking-wider w-20">Image</th>
                                <th className="p-3.5 font-semibold uppercase tracking-wider w-1/4">Ingredient Name</th>
                                <th className="p-3.5 font-semibold uppercase tracking-wider w-1/4">Scientific Name</th>
                                <th className="p-3.5 font-semibold uppercase tracking-wider">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: colours.border }}>
                              {ingredientsList.map((ing, idx) => (
                                <tr key={ing.id || idx} className="hover:bg-amber-50/40 transition-colors">
                                  <td className="p-3">
                                    <div className="h-12 w-12 rounded-lg overflow-hidden border bg-stone-100 shrink-0" style={{ borderColor: colours.border }}>
                                      <img
                                        src={ing.image_url || "/products/placeholder.png"}
                                        alt={ing.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.currentTarget.src = "/products/placeholder.png"; }}
                                      />
                                    </div>
                                  </td>
                                  <td className="p-3 font-semibold text-stone-900 text-sm">
                                    {ing.name}
                                  </td>
                                  <td className="p-3 italic text-stone-600">
                                    {ing.scientific_name || "—"}
                                  </td>
                                  <td className="p-3 text-stone-700 leading-relaxed max-w-md">
                                    {ing.para1 || ing.para2 || ing.description || "Botanical extract formulation."}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Fallback text if no CMS ingredients attached */
                        <div className="p-6 rounded-xl border bg-white text-center space-y-2" style={{ borderColor: colours.border }}>
                          <Leaf size={24} className="mx-auto" style={{ color: colours.accent }} />
                          <p className="text-xs font-semibold" style={{ color: colours.text, fontFamily: fonts.secondary }}>
                            Natural Botanical Formulation
                          </p>
                          <p className="text-xs max-w-lg mx-auto" style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
                            {product.ingredients || "Ingredients for this product are 100% natural and wild-harvested. Assign specific CMS ingredients in Admin panel to list detailed breakdown."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
