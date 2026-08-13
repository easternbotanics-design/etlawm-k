import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Heart, ChevronRight, ChevronLeft, ChevronDown, Check } from "lucide-react";
import { colours, fonts } from "../../theme/theme";
import { getProducts, getProductBySlug, getProductById } from "../../services/productService";
import ritualService from "../../services/ritualService";

const API = import.meta.env.VITE_SERVER_API || "";

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] text-[#1B1B18] font-[Inter,sans-serif]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-32">
        {/* Mobile top breadcrumb skeleton */}
        <div className="mb-4 h-4 w-48 animate-pulse rounded bg-[#EAE6DB]" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[88px_1fr_1fr] md:gap-8">
          {/* Thumbnail rail skeleton */}
          <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:gap-4 md:overflow-visible">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-16 shrink-0 animate-pulse rounded-md bg-[#EAE6DB] md:h-20 md:w-20"
              />
            ))}
          </div>

          {/* Hero image skeleton */}
          <div className="order-1 md:order-2">
            <div className="aspect-[4/5] sm:aspect-[5/6] w-full animate-pulse rounded-xl bg-[#EAE6DB]" />
          </div>

          {/* Product info skeleton */}
          <div className="order-3 flex flex-col gap-4">
            <div className="h-3 w-28 animate-pulse rounded bg-[#EAE6DB]" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-[#EAE6DB]" />
            <div className="h-4 w-36 animate-pulse rounded bg-[#EAE6DB]" />
            <div className="h-8 w-24 animate-pulse rounded bg-[#EAE6DB]" />
            <div className="mt-2 flex flex-col gap-2">
              <div className="h-4 w-full animate-pulse rounded bg-[#EAE6DB]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#EAE6DB]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#EAE6DB]" />
            </div>
            <div className="mt-4 flex h-12 gap-3">
              <div className="h-12 w-28 animate-pulse rounded-md bg-[#EAE6DB]" />
              <div className="h-12 flex-1 animate-pulse rounded-md bg-[#EAE6DB]" />
            </div>
            <div className="mt-8 flex flex-col gap-4 border-t border-[#DAD3C3] pt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-full animate-pulse rounded bg-[#EAE6DB]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProductPage = ({ product: initialProduct, slug: propSlug, productId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const currentSlug = propSlug || params.slug;

  const [product, setProduct] = useState(initialProduct || null);
  const [ritual, setRitual] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openDetail, setOpenDetail] = useState(0);
  const [added, setAdded] = useState(false);

  // Sticky bottom bar visibility state
  const ctaRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Touch gesture support for mobile gallery swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!initialProduct) {
        setLoading(true);
      }
      setError(null);

      try {
        let fetchedProduct = initialProduct;

        if (!fetchedProduct) {
          if (currentSlug) {
            fetchedProduct = await getProductBySlug(currentSlug);
          } else if (productId) {
            fetchedProduct = await getProductById(productId);
          } else {
            const allProducts = await getProducts();
            if (allProducts && allProducts.length > 0) {
              fetchedProduct = allProducts[0];
            }
          }
        }

        if (cancelled) return;

        if (!fetchedProduct) {
          setError("Product not found.");
          setLoading(false);
          return;
        }

        setProduct(fetchedProduct);

        // Fetch gallery images for the product
        try {
          const imgRes = await fetch(`${API}/api/product/${fetchedProduct.id}/images`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData.images && imgData.images.length > 0) {
              const sorted = imgData.images
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((img) => img.image_url);
              if (!cancelled) setImages(sorted);
            } else if (fetchedProduct.image) {
              if (!cancelled) setImages([fetchedProduct.image]);
            }
          } else if (fetchedProduct.image) {
            if (!cancelled) setImages([fetchedProduct.image]);
          }
        } catch (imgErr) {
          console.error("Error loading images:", imgErr);
          if (fetchedProduct.image) setImages([fetchedProduct.image]);
        }

        // Fetch ritual data for the product from database
        try {
          const ritualData = await ritualService.getPublicRituals();
          if (ritualData && Array.isArray(ritualData.rituals)) {
            const matchedRitual = ritualData.rituals.find(
              (r) => r.product_id === fetchedProduct.id || (r.product_slug && r.product_slug === fetchedProduct.slug)
            );
            if (!cancelled && matchedRitual) {
              setRitual(matchedRitual);
            }
          }
        } catch (ritualErr) {
          console.error("Error loading ritual data:", ritualErr);
        }
      } catch (err) {
        console.error("Error in loadData:", err);
        if (!cancelled) setError(err.message || "Failed to load product details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentSlug, productId, initialProduct]);

  // Observer for sticky bottom bar on mobile
  useEffect(() => {
    if (!ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = !entry.isIntersecting;
        setShowStickyBar(isVisible);
        window.dispatchEvent(
          new CustomEvent("sticky-bar-change", { detail: { visible: isVisible } })
        );
      },
      { threshold: 0.1 }
    );
    observer.observe(ctaRef.current);
    return () => {
      observer.disconnect();
      window.dispatchEvent(
        new CustomEvent("sticky-bar-change", { detail: { visible: false } })
      );
    };
  }, [loading]);

  const handleAddToCart = () => {
    setAdded(true);
    window.clearTimeout(handleAddToCart._t);
    handleAddToCart._t = window.setTimeout(() => setAdded(false), 1800);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (displayImages) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance && activeImage < displayImages.length - 1) {
      setActiveImage((prev) => prev + 1);
    }
    if (distance < -minSwipeDistance && activeImage > 0) {
      setActiveImage((prev) => prev - 1);
    }
  };

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#F7F5F0] px-6 text-center">
        <h2 className="text-2xl font-semibold text-[#1B1B18]">Product Not Found</h2>
        <p className="max-w-md text-sm text-[#6B6656]">
          {error || "We couldn't find the product you were looking for."}
        </p>
        <button
          onClick={() => navigate("/collection")}
          className="mt-2 rounded-md bg-[#1F5C52] px-6 py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#194A42]"
        >
          Browse Collection
        </button>
      </div>
    );
  }

  const categoryLabel = product.subtitle || product.category || "";
  const displayImages = images.length > 0 ? images : (product.image ? [product.image] : []);

  // Format "Why" section from ritual database data
  let whyBody = "";
  if (ritual?.whys && Array.isArray(ritual.whys) && ritual.whys.length > 0) {
    whyBody = ritual.whys.join("\n\n");
  } else if (ritual?.description) {
    whyBody = ritual.description;
  }

  // Format "How" section from ritual database data
  let howBody = "";
  if (ritual?.hows && Array.isArray(ritual.hows) && ritual.hows.length > 0) {
    howBody = ritual.hows.join("\n\n");
  } else if (product.usageInstructions) {
    howBody = product.usageInstructions;
  }

  // Format Benefits
  let benefitsBody = "";
  if (Array.isArray(product.benefits) && product.benefits.length > 0) {
    benefitsBody = product.benefits.join("\n\n");
  } else if (typeof product.benefits === "string" && product.benefits.trim()) {
    benefitsBody = product.benefits;
  } else if (ritual?.tips && Array.isArray(ritual.tips) && ritual.tips.length > 0) {
    benefitsBody = ritual.tips.join("\n\n");
  }

  // Format Ingredients
  let ingredientsBody = "";
  if (product.ingredients) {
    ingredientsBody = Array.isArray(product.ingredients)
      ? product.ingredients.join(", ")
      : product.ingredients;
  }

  // Construct details items dynamically without hardcoded placeholders
  const details = [];

  if (ingredientsBody) {
    details.push({ title: "Complete Ingredients", body: ingredientsBody });
  }
  if (whyBody) {
    details.push({ title: 'The "Why"', body: whyBody });
  }
  if (howBody) {
    details.push({ title: 'The "How"', body: howBody });
  }
  if (benefitsBody) {
    details.push({ title: "Benefits", body: benefitsBody });
  }

  details.push({
    title: "Additional Information",
    body: product.sizeValue && product.sizeUnit
      ? `Size: ${product.sizeValue} ${product.sizeUnit}\nShips in 2–4 business days. Free returns within 30 days.`
      : "Ships in 2–4 business days. Free returns within 30 days.",
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/collection" },
    { label: product.name, href: "#" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] text-[#1B1B18] font-[Inter,sans-serif] pb-16 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-32">
        {/* Top breadcrumb bar for immediate context on mobile and desktop */}
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-[#6B6656]">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <a
                    href={crumb.href}
                    aria-current={isLast ? "page" : undefined}
                    className={
                      "transition hover:text-[#1F5C52] hover:underline underline-offset-2 " +
                      (isLast ? "font-medium text-[#1B1B18]" : "")
                    }
                  >
                    {crumb.label}
                  </a>
                  {!isLast && <ChevronRight size={14} className="text-[#A39C86]" />}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[88px_1fr_1fr] md:gap-8">
          {/* ---------------- Thumbnail rail ---------------- */}
          <div className="order-2 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none md:order-1 md:flex-col md:gap-4 md:overflow-visible md:pb-0">
            {displayImages.map((src, i) => {
              const isActive = i === activeImage;
              return (
                <button
                  key={`${src}-${i}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={isActive}
                  className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border md:h-20 md:w-20 md:rounded-md transition-all duration-200"
                  style={{
                    borderColor: isActive ? "#1F5C52" : "#DAD3C3",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover transition duration-300"
                  />
                  <span
                    className="absolute inset-0 bg-black transition-opacity duration-200"
                    style={{ opacity: isActive ? 0 : 0.35 }}
                  />
                  {isActive && (
                    <motion.span
                      layoutId="thumb-indicator-1"
                      className="absolute inset-x-0 bottom-0 h-[3px] bg-[#1F5C52] md:inset-y-0 md:inset-x-auto md:left-0 md:h-full md:w-[3px]"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ---------------- Hero image ---------------- */}
          <div className="order-1 md:order-2">
            <div
              className="relative aspect-[4/5] sm:aspect-[5/6] w-full overflow-hidden rounded-2xl md:rounded-xl bg-[#EAE6DB] touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(displayImages)}
            >
              {displayImages.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={displayImages[activeImage] || displayImages[0]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="h-full w-full animate-pulse bg-[#EAE6DB]" />
              )}

              {/* Gallery Arrow Controls for easy mobile/desktop tap navigation */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-[#F7F5F0]/80 text-[#1B1B18] shadow-sm backdrop-blur-sm transition hover:scale-105 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-[#F7F5F0]/80 text-[#1B1B18] shadow-sm backdrop-blur-sm transition hover:scale-105 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Image Counter Badge for Mobile */}
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#1B1B18]/75 px-2.5 py-0.5 text-[11px] font-medium tracking-wider text-[#F7F5F0] backdrop-blur-md">
                    {activeImage + 1} / {displayImages.length}
                  </span>
                </>
              )}

              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-[#1B1B18] px-3 py-1 text-xs font-medium tracking-wide text-[#F7F5F0]">
                  {product.badge}
                </span>
              )}

              <button
                aria-label="Save to wishlist"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F7F5F0]/90 text-[#1B1B18] shadow-sm transition hover:scale-105 active:scale-95"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>

          {/* ---------------- Product info ---------------- */}
          <div
            className="order-3 flex flex-col"
            style={{
              fontFamily: fonts.secondary,
            }}
          >
            {categoryLabel && (
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B6656]">
                {categoryLabel}
              </p>
            )}

            <h1
              className="mt-1.5 font-[Fraunces,serif] text-2xl leading-tight text-[#1B1B18] sm:text-3xl md:text-4xl"
              style={{
                fontFamily: fonts.title,
              }}
            >
              {product.name}
            </h1>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[#C98A3E]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(product.rating || 5) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-[#6B6656]">
                {product.rating || 5.0} ({product.reviews || 0} reviews)
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <div
                className="flex items-baseline gap-2.5"
                style={{
                  fontFamily: fonts.number,
                }}
              >
                <span className="text-2xl sm:text-3xl font-medium text-[#1B1B18]">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-[#A39C86] line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <span
                className="text-xs sm:text-sm text-[#6B6656]"
                style={{
                  fontFamily: fonts.secondary,
                }}
              >
                (Inclusive of all Taxes)
              </span>
            </div>

            {product.description && (
              <p className="mt-4 max-w-md text-sm sm:text-[15px] leading-relaxed text-[#454138]">
                {product.description}
              </p>
            )}

            {/* Quantity + CTA Section */}
            <div ref={ctaRef} className="mt-6 flex flex-row items-center gap-3">
              <div className="flex h-12 shrink-0 items-center rounded-lg border border-[#DAD3C3] bg-[#F7F5F0]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-full w-10 place-items-center text-[#1B1B18] transition hover:bg-[#EFEBE0] active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid h-full w-10 place-items-center text-[#1B1B18] transition hover:bg-[#EFEBE0] active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#1F5C52] px-4 sm:px-6 text-sm font-semibold text-[#F7F5F0] shadow-sm transition hover:bg-[#194A42] active:scale-[0.98]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} /> Added to bag
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                      >Add to bag
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Details accordion */}
            {details.length > 0 && (
              <div className="mt-8 sm:mt-10 divide-y divide-[#DAD3C3] border-t border-[#DAD3C3]">
                {details.map((d, i) => {
                  const isOpen = openDetail === i;
                  return (
                    <div key={d.title}>
                      <button
                        onClick={() => setOpenDetail(isOpen ? -1 : i)}
                        className="flex w-full items-center justify-between py-4 text-left text-sm sm:text-md font-medium text-[#1B1B18] tracking-wide"
                        style={{
                          fontFamily: fonts.primary,
                        }}
                      >
                        {d.title}
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="pb-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-[#6B6656]">
                              {d.body}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-[#DAD3C3] bg-[#F7F5F0]/95 px-4 py-3 shadow-lg backdrop-blur-md md:hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden pr-2">
              {displayImages[0] && (
                <img
                  src={displayImages[0]}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-md object-cover border border-[#DAD3C3]"
                />
              )}
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-[#1B1B18]">
                  {product.name}
                </span>
                <span
                  className="text-xs text-[#6B6656] font-medium"
                  style={{ fontFamily: fonts.number }}
                >
                  ₹{product.price}
                </span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1F5C52] px-4 text-xs font-semibold text-[#F7F5F0] transition active:scale-95 shadow-sm"
            >
              {added ? <Check size={14} /> : <ShoppingBag size={14} />}
              <span>{added ? "Added" : "Add to Bag"}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
