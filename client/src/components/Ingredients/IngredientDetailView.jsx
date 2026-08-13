import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProductBySlug } from "../../services/productService.js";
import ingredientService from "../../services/ingredientService.js";
import IngredientCard from "./IngredientCard.jsx";
import { colours, fonts } from "../../theme/theme.js";
import { ArrowLeft, Leaf, Sparkles, Check, ShoppingBag, ExternalLink, RefreshCw } from "lucide-react";

export default function IngredientDetailView({ productSlug }) {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [cmsIngredients, setCmsIngredients] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProductData() {
      setLoadingProduct(true);
      setError(null);
      setProduct(null);
      setCmsIngredients([]);

      try {
        const foundProduct = await getProductBySlug(productSlug);
        if (cancelled) return;

        if (!foundProduct) {
          setError("Product not found.");
          setLoadingProduct(false);
          return;
        }

        setProduct(foundProduct);
        setLoadingProduct(false);

        // Fetch linked CMS ingredients for this product ID
        if (foundProduct.id) {
          setLoadingIngredients(true);
          try {
            const res = await ingredientService.getProductIngredients(foundProduct.id);
            if (!cancelled) {
              setCmsIngredients(res.ingredients || []);
            }
          } catch (ingErr) {
            console.error("Failed to load CMS ingredients for product:", ingErr);
          } finally {
            if (!cancelled) setLoadingIngredients(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load product details.");
          setLoadingProduct(false);
        }
      }
    }

    loadProductData();

    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Parse text ingredients string if available (e.g. "Aloe Vera, Hibiscus, Bhringraj, Coconut Oil")
  const parsedTextIngredients = React.useMemo(() => {
    if (!product || !product.ingredients) return [];
    if (Array.isArray(product.ingredients)) return product.ingredients;
    return String(product.ingredients)
      .split(/,|\n|•/)
      .map((i) => i.trim())
      .filter(Boolean);
  }, [product]);

  if (loadingProduct) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 h-[600px] rounded-2xl animate-pulse" style={{ backgroundColor: colours.primary }} />
          <div className="lg:col-span-7 space-y-6">
            <div className="h-12 w-3/4 rounded-lg animate-pulse" style={{ backgroundColor: colours.primary }} />
            <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: colours.primary }} />
            <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: colours.primary }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-3xl font-normal" style={{ color: colours.text, fontFamily: fonts.primary }}>
          {error || "Formulation not found"}
        </h2>
        <p className="text-sm" style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
          The requested product could not be found or may have been updated.
        </p>
        <button
          type="button"
          onClick={() => navigate("/ingredients")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold"
          style={{
            backgroundColor: colours.secondary,
            color: colours.background,
            fontFamily: fonts.secondary,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Ingredients</span>
        </button>
      </div>
    );
  }

  const categoryName = product.subtitle || product.categoryName || product.category || "Formulation";

  return (
    <div className="w-full">
      {/* ── Top Bar & Breadcrumb ────────────────────────────────────── */}
      <section>
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs" style={{ fontFamily: fonts.secondary }}>
          <button
            type="button"
            onClick={() => navigate("/ingredients")}
            className="group inline-flex items-center gap-2 uppercase tracking-[0.2em] font-semibold transition-colors duration-300 hover:text-black"
            style={{ color: colours.accent }}
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to All Formulations</span>
          </button>

          <nav className="flex items-center gap-2 text-[11px]" style={{ color: colours.mutedText }}>
            <Link to="/" className="hover:underline no-underline" style={{ color: colours.mutedText }}>
              Home
            </Link>
            <span>/</span>
            <Link to="/ingredients" className="hover:underline no-underline" style={{ color: colours.mutedText }}>
              Ingredients
            </Link>
            <span>/</span>
            <span className="font-semibold" style={{ color: colours.text }}>
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      {/* ── Main Split View ────────────────────────────────────────── */}
      <main className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ── LEFT COLUMN: Product Card / Showcase ───────────────── */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div
              // className="rounded-3xl border p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden"
              style={{
                // backgroundColor: "#FFFFFF",
                borderColor: colours.border,
              }}
            >
              {/* Product Badge */}
              {product.badge && (
                <div
                  className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold border"
                  style={{
                    backgroundColor: `${colours.accent}1F`,
                    color: colours.accent,
                    borderColor: `${colours.accent}40`,
                    fontFamily: fonts.secondary,
                  }}
                >
                  {product.badge}
                </div>
              )}

              {/* Product Image */}
              <div className="relative aspect-[1] w-[100%] mx-auto mb-4 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src={product.image || "/products/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/products/placeholder.png";
                  }}
                />
              </div>

              {/* Product Details Header */}
              <div className="space-y-2">
                <span
                  className="text-xs uppercase tracking-[0.2em] font-semibold block"
                  style={{ color: colours.accent, fontFamily: fonts.secondary }}
                >
                  {categoryName}
                </span>

                <Link
                  to={`/product/${product.slug}`}
                  target='_blank'
                  className="text-3xl md:text-2xl font-normal leading-tight"
                  style={{ color: colours.text, fontFamily: fonts.primary }}
                >
                  {product.name}
                </Link>


              </div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: Ingredients Showcase ────────────────── */}
          <section className="lg:col-span-7 space-y-8">
            <div className="space-y-2 border-b pb-6" style={{ borderColor: `${colours.border}80` }}>
              

              <p
                className="text-xs md:text-sm font-light leading-relaxed"
                style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
              >
                Every ingredient in {product.name} is carefully selected for its bio-active properties, traditional Ayurvedic wisdom, and botanical purity.
              </p>
            </div>

            {/* Loading state for CMS ingredients */}
            {loadingIngredients && (
              <div className="space-y-6">
                {[1, 2].map((n) => (
                  <div key={n} className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: colours.primary }} />
                ))}
              </div>
            )}

            {/* List CMS Ingredients if attached */}
            {!loadingIngredients && cmsIngredients.length > 0 && (
              <div className="space-y-6">
                {cmsIngredients.map((ingredient, idx) => (
                  <IngredientCard
                    key={ingredient.id || idx}
                    ingredient={ingredient}
                    index={idx}
                  />
                ))}
              </div>
            )}

            {/* If no CMS ingredients linked, render Parsed Text Ingredients or Fallback botanical card */}
            {!loadingIngredients && cmsIngredients.length === 0 && (
              <div className="space-y-6">
                {parsedTextIngredients.length > 0 ? (
                  <div
                    className="p-8 rounded-2xl border space-y-6 shadow-sm"
                    style={{ backgroundColor: "#FFFFFF", borderColor: colours.border }}
                  >
                    <div className="space-y-1">
                      <h3
                        className="text-xl font-normal"
                        style={{ color: colours.text, fontFamily: fonts.primary }}
                      >
                        Formulation Ingredients List
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                      >
                        Pure extracts and natural components in {product.name}:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {parsedTextIngredients.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:border-stone-400"
                          style={{
                            backgroundColor: colours.primary,
                            borderColor: colours.border,
                            fontFamily: fonts.secondary,
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: "#FFFFFF", color: colours.accent }}
                          >
                            <Leaf size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: colours.text }}>
                              {item}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: colours.accent }}>
                              100% Pure Botanical
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-10 rounded-2xl border text-center space-y-4 shadow-sm"
                    style={{ backgroundColor: "#FFFFFF", borderColor: colours.border }}
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ backgroundColor: `${colours.accent}1F`, color: colours.accent }}
                    >
                      <Sparkles size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3
                        className="text-xl font-normal"
                        style={{ color: colours.text, fontFamily: fonts.primary }}
                      >
                        Pure Ayurvedic Formulation
                      </h3>
                      <p
                        className="text-xs max-w-md mx-auto leading-relaxed"
                        style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                      >
                        Formulated with wild-harvested herbs, cold-pressed oils, and essential botanical extracts.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
