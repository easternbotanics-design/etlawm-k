import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { colours, fonts } from "../../theme/theme.js";
import { getProducts } from "../../services/productService.js";

export default function SuggestedProducts({ currentSlug, currentProductId, category }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSuggested() {
      try {
        setLoading(true);
        const allProducts = await getProducts();
        
        if (!isMounted) return;

        // Filter out current product by slug or id
        const filtered = (allProducts || []).filter((p) => {
          if (currentSlug && p.slug === currentSlug) return false;
          if (currentProductId && String(p.id) === String(currentProductId)) return false;
          return p.isActive !== false;
        });

        // Optionally prioritize products from the same category
        let sorted = [...filtered];
        if (category) {
          sorted.sort((a, b) => {
            const aCatMatch = a.category === category || a.subtitle === category;
            const bCatMatch = b.category === category || b.subtitle === category;
            if (aCatMatch && !bCatMatch) return -1;
            if (!aCatMatch && bCatMatch) return 1;
            return 0;
          });
        }

        // Take 3 products (or 2 if only 2 available)
        setProducts(sorted.slice(0, 3));
      } catch (err) {
        console.error("Failed to load suggested products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSuggested();

    return () => {
      isMounted = false;
    };
  }, [currentSlug, currentProductId, category]);

  const handleProductClick = (slug) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/product/${slug}`);
  };

  if (loading) {
    return (
      <section className="w-full px-4 sm:px-8 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="h-5 w-40 bg-[#EAE6DB] animate-pulse rounded mb-6 mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 w-full max-w-[200px] sm:max-w-[220px] mx-auto">
                <div className="aspect-[4/5] w-full bg-[#EAE6DB] animate-pulse rounded-xl" />
                <div className="h-3 w-3/4 bg-[#EAE6DB] animate-pulse rounded mx-auto" />
                <div className="h-3 w-1/2 bg-[#EAE6DB] animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section 
      className="w-full px-4 sm:px-8 py-10 sm:py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2
            className="text-xl sm:text-2xl font-normal tracking-tight"
            style={{
              color: colours.text || "#1B1B18",
              fontFamily: fonts.primary || "serif",
            }}
          >
            Suggested Products
          </h2>
          <div 
            className="w-10 h-[2px] mx-auto mt-2.5 rounded-full"
            style={{ backgroundColor: colours.accent || "#A77C6B" }}
          />
        </div>

        {/* Product Cards Row (Compact sizing) */}
        <div 
          className={`grid gap-3 sm:gap-6 justify-center items-start ${
            products.length === 2 
              ? 'grid-cols-2 max-w-lg mx-auto' 
              : 'grid-cols-2 md:grid-cols-3 max-w-2xl sm:max-w-3xl mx-auto'
          }`}
        >
          {products.map((product) => {
            const price = Number(product.price || 0);
            const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
            const rating = Number(product.rating || 5);
            const reviewsCount = Number(product.reviews || 0);

            return (
              <div
                key={product.id || product.slug}
                onClick={() => handleProductClick(product.slug)}
                className="group cursor-pointer flex flex-col items-center text-center transition-all duration-300 w-full max-w-[200px] sm:max-w-[220px] mx-auto"
              >
                {/* Product Image Box */}
                <div 
                  className="relative w-full aspect-[4/5] overflow-hidden rounded-xl mb-2.5 transition-all duration-500 shadow-sm group-hover:shadow-md"
                  style={{
                    backgroundColor: colours.surface || "#F4F0E8",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <span 
                      className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-full shadow-sm"
                      style={{
                        backgroundColor: colours.text || "#1B1B18",
                        color: colours.background || "#FCFBF9",
                        fontFamily: fonts.secondary,
                      }}
                    >
                      {product.badge}
                    </span>
                  )}

                  {/* Hover Overlay CTA */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                    <span 
                      className="w-full py-1.5 px-2 text-[10px] uppercase tracking-widest font-medium rounded-lg shadow-md transition-transform duration-300 translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-1"
                      style={{
                        backgroundColor: colours.text || "#1B1B18",
                        color: colours.background || "#FCFBF9",
                        fontFamily: fonts.secondary,
                      }}
                    >
                      View Product
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col items-center gap-0.5 px-1">
                  {/* Category / Subtitle */}
                  {product.subtitle && (
                    <span
                      className="text-[10px] uppercase tracking-widest"
                      style={{
                        color: colours.mutedText || "#6B6656",
                        fontFamily: fonts.secondary,
                      }}
                    >
                      {product.subtitle}
                    </span>
                  )}

                  {/* Product Title */}
                  <h3
                    className="text-xs sm:text-sm font-medium transition-colors duration-200 line-clamp-1 group-hover:opacity-80"
                    style={{
                      color: colours.text || "#1B1B18",
                      fontFamily: fonts.primary || "serif",
                    }}
                  >
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span
                      className="text-xs sm:text-sm font-medium"
                      style={{
                        color: colours.text || "#1B1B18",
                        fontFamily: fonts.secondary,
                      }}
                    >
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span
                        className="text-[10px] sm:text-xs line-through"
                        style={{
                          color: colours.mutedText || "#A39C86",
                          fontFamily: fonts.secondary,
                        }}
                      >
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}