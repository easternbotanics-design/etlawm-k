import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService.js";
import { getCategories } from "../../services/categoryService.js";
import { colours, fonts } from "../../theme/theme.js";
import { Search, Sparkles, ArrowRight, Leaf, Filter } from "lucide-react";

export default function IngredientsProductGrid() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      <section 
        className="relative py-6 md:py-4 px-6 overflow-hidden"
        
      >
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
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
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

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/ingredient/${productSlug}`)}
                  className="group cursor-pointer rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1.5"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: colours.border,
                  }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F3EC] flex items-center justify-center">
                    <img
                      src={product.image || "/products/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
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
                      <h2
                        className="text-2xl font-normal leading-snug transition-colors duration-300 group-hover:text-[#A77C6B]"
                        style={{ color: colours.text, fontFamily: fonts.primary }}
                      >
                        {product.name}
                      </h2>

                      {product.price > 0 && (
                        <p
                          className="text-xs uppercase tracking-widest font-semibold"
                          style={{ color: colours.accent, fontFamily: fonts.secondary }}
                        >
                          ₹{product.price}
                        </p>
                      )}

                      {product.ingredients && (
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
                        className="text-xs mt-4 uppercase tracking-[0.2em] font-semibold flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300"
                        style={{ color: colours.text, fontFamily: fonts.secondary }}
                      >
                        <span>View Ingredients</span>
                        <ArrowRight size={14} style={{ color: colours.accent }} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
