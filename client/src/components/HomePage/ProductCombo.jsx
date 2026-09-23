import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShoppingCart, Check } from "lucide-react";
import { colours, fonts } from "../../theme/theme.js";

import carousel1 from "../../assets/carousel1.webp";
import carousel2 from "../../assets/carousel2.webp";
import carousel3 from "../../assets/carousel3.webp";
import hairOilImg from "../../assets/hairOil.webp";
import hairElixirImg from "../../assets/hairElixir.webp";

import AddToCartNumbers from "../AddToCartNumbers.jsx";
import { addToCart } from "../../services/cartService.js";
import { getProducts } from "../../services/productService.js";

const slides = [
  {
    image: carousel2,
    title: "Nourishing Essentials",
    subtitle: "Plant-derived formulations",
  },
  {
    image: carousel3,
    title: "Pure Botanical Actives",
    subtitle: "Sourced for efficacy",
  },
  {
    image: carousel1,
    title: "Daily Radiance Ritual",
    subtitle: "Gentle yet powerful",
  },
];

// Single reusable component for product squares in Box 3
function ProductSquareCard({ name, slug, image }) {
  return (
    <Link
      to={`/product/${slug}`}
      target="_blank"
      className="relative aspect-square flex-1 h-full max-h-full rounded-xl sm:rounded-2xl overflow-hidden group block"
      title={name}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1 sm:p-2 text-center">
        <span
          className="text-[8px] sm:text-xs font-medium text-white truncate block"
          style={{
            fontFamily: fonts.secondary
          }}
        >
          {name}
        </span>
      </div>
    </Link>
  );
}

const ProductCombo = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Box 3 & Combo state
  const [combo, setCombo] = useState(null);
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Load active combo from DB
  useEffect(() => {
    let active = true;
    const API = import.meta.env.VITE_SERVER_API;
    fetch(`${API}/api/combos/public`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.combos) && data.combos.length > 0) {
          setCombo(data.combos[0]);
        }
      })
      .catch((err) => console.error("Failed to load active combo:", err));

    getProducts()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleAddToCartBoth = async () => {
    setIsAdding(true);
    try {
      if (combo && combo.id) {
        // Add combo itself as a single product to cart
        await addToCart(combo.id, quantity);
      } else {
        // Fallback if no active combo in DB
        const elixirProd = products.find(
          (p) =>
            /elixir/i.test(p.name || "") ||
            /elixir/i.test(p.slug || "") ||
            /serum/i.test(p.name || "")
        );
        const oilProd = products.find(
          (p) =>
            /herbal.*hair.*oil/i.test(p.name || "") ||
            /herbal.*oil/i.test(p.name || "") ||
            (/hair/i.test(p.name || "") && /oil/i.test(p.name || "") && !/argan/i.test(p.name || "")) ||
            /oil/i.test(p.name || "")
        );

        const elixirId = elixirProd?.id || 1;
        const oilId = oilProd?.id || 2;

        await Promise.all([
          addToCart(elixirId, quantity),
          addToCart(oilId, quantity),
        ]);
      }

      window.dispatchEvent(new Event("cart-updated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error("Failed to add combo to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="relative w-full mt-[8px] h-auto md:h-[calc(100dvh-80px)] md:max-h-[calc(100dvh-80px)] px-0 sm:px-6 md:px-10 lg:px-16 py-4 md:py-8 flex flex-col justify-center items-center overflow-hidden box-border">
      

      <div className="relative z-10 w-full h-auto px-4 md:h-full max-w-7xl mx-auto flex items-center justify-center min-h-0 overflow-hidden">
        <div className="flex flex-row gap-2 sm:gap-5 md:gap-6 items-stretch justify-center w-full h-auto md:h-full md:max-h-full min-h-0">
          {/* Box 1: Image Carousel (Strict aspect ratio 3:4, left side) */}
          <div
            className="aspect-[3/4] flex-1 min-w-0 md:w-auto h-auto md:h-full md:max-h-full relative overflow-hidden rounded-2xl sm:rounded-3xl group shadow-lg"
            style={{ aspectRatio: "3 / 4" }}
          >
            {/* Images */}
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            ))}
          </div>

          {/* Right Side Column (Box 2 + Box 3) */}
          <div className="flex flex-col gap-2 sm:gap-5 md:gap-6 flex-1 min-w-0 md:w-auto h-auto md:h-full md:max-h-full justify-between">
            {/* Box 2: Text Description (Height matching Box 1) */}
            <div
              className="h-[calc(50%-0.25rem)] sm:h-[calc(50%-0.625rem)] md:h-[calc(50%-0.75rem)] w-full flex flex-col justify-between p-2 sm:p-5 md:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border transition duration-300 hover:shadow-md overflow-hidden"
              style={{
                backgroundColor: colours.surface || "#F7F3EC",
                borderColor: `${colours.border || "#D8D2C8"}`,
                color: colours.secondary || "#171715",
              }}
            >
              <div className="overflow-hidden flex flex-col justify-center h-full">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
                  <Sparkles
                    className="w-1.5 h-1.5 sm:w-3.5 sm:h-3.5 shrink-0"
                    style={{ color: colours.accent || "#A77C6B" }}
                  />
                  <span
                    className="text-[6px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.2em] font-semibold"
                    style={{
                      color: colours.accent || "#A77C6B",
                      fontFamily: fonts.secondary,
                    }}
                  >
                    Botanical Combo
                  </span>
                </div>

                <h2
                  className="text-[8px] sm:text-lg md:text-xl lg:text-2xl font-normal leading-tight sm:leading-snug tracking-tight mb-0.5 sm:mb-2 line-clamp-2 sm:line-clamp-none"
                  style={{ fontFamily: fonts.primary || "serif" }}
                >
                  {combo?.name || "Thoughtfully refined for your skin."}
                </h2>

                <p
                  className="text-[6px] sm:text-xs leading-tight sm:leading-relaxed opacity-95 line-clamp-4 sm:line-clamp-8"
                  style={{
                    color: colours.mutedText || "#7C7770",
                    fontFamily: fonts.secondary,
                  }}
                >
                  {combo?.description || "ETLAWM Root-to-Length Hair Ritual is a simple 2-step routine for complete hair care. Nourish your roots with Herbal Hair Oil and add shine to your lengths with Hair Elixir."}
                </p>
              </div>
            </div>

            {/* Box 3: 2 Product Squares + Quantity & Add to Cart */}
            <div
              className="h-[calc(50%-0.25rem)] sm:h-[calc(50%-0.625rem)] md:h-[calc(50%-0.75rem)] w-full flex flex-col justify-center sm:justify-between p-2 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl transition duration-300 hover:shadow-md overflow-hidden box-border"
              style={{
                backgroundColor: colours.surface ? `${colours.surface}80` : "rgba(232, 226, 216, 0.5)",
                
                color: colours.secondary || "#171715",
              }}
            >
              {/* Product Squares (Desktop/Tablet only) */}
              <div className="hidden sm:flex flex-row gap-2 sm:gap-4 items-center justify-center flex-1 min-h-0 overflow-hidden mb-1 sm:mb-2">
                <ProductSquareCard
                  name={combo?.products?.[1]?.name || "5-in-1 Botanical Hair Elixir"}
                  slug={combo?.products?.[1]?.slug || "botanical-hair-elixir"}
                  image={hairElixirImg}
                />
                <ProductSquareCard
                  name={combo?.products?.[0]?.name || "Herbal Hair Oil"}
                  slug={combo?.products?.[0]?.slug || "herbal-hair-oil"}
                  image={hairOilImg}
                />
              </div>

              {/* Quantity selector & Add to Cart button */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1.5 sm:gap-3 h-full sm:h-auto pt-0 sm:pt-2 border-t-0 sm:border-t border-black/10 shrink-0 w-full">
                <AddToCartNumbers
                  count={quantity}
                  onIncrease={() => setQuantity((q) => q + 1)}
                  onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  compact={true}
                  buttonColor={colours.df || "#171715"}
                  color={colours.green || "#171715"}
                />

                <button
                  type="button"
                  onClick={handleAddToCartBoth}
                  disabled={isAdding}
                  className="w-full sm:w-auto sm:flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl text-[9px] sm:text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-60"
                  style={{
                    backgroundColor: colours.green || "#A77C6B",
                    color: "#FFFFFF",
                    fontFamily: fonts.secondary,
                  }}
                >
                  {isAdding ? (
                    "Adding..."
                  ) : added ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /> Add Combo to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCombo;