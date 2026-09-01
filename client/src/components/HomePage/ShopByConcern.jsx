import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";
import concernService from "../../services/concernService.js";

// Helper to provide fallback image based on concern name if image_url is missing
const getFallbackImage = (concernName = "") => {
  const nameLower = concernName.toLowerCase().trim();
  if (nameLower.includes("hair fall") || nameLower.includes("hair")) {
    return "/Herbal Hair Oil.webp";
  }
  if (nameLower.includes("dandruff") || nameLower.includes("scalp")) {
    return "/products/hair-category.png";
  }
  if (nameLower.includes("acne") || nameLower.includes("pigmentation")) {
    return "/De - Pigmentation Cream.webp";
  }
  if (nameLower.includes("glow") || nameLower.includes("radiance")) {
    return "/products/skin-category.png";
  }
  if (nameLower.includes("dryness") || nameLower.includes("moisture")) {
    return "/products/face-serum.png";
  }
  return "/Herbal Hair Oil.webp";
};

const ShopByConcern = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const isHovered = useRef(false);

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        const data = await concernService.getPublicConcerns();
        if (data && data.success && Array.isArray(data.concerns) && data.concerns.length > 0) {
          setConcerns(data.concerns);
        } else {
          setConcerns([
            { id: 1, name: "Hair Fall", slug: "hair-fall" },
            { id: 2, name: "Dandruff", slug: "dandruff" },
            { id: 3, name: "Acne", slug: "acne" },
            { id: 4, name: "Glow", slug: "glow" },
            { id: 5, name: "Dryness", slug: "dryness" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load concerns:", err);
        setConcerns([
          { id: 1, name: "Hair Fall", slug: "hair-fall" },
          { id: 2, name: "Dandruff", slug: "dandruff" },
          { id: 3, name: "Acne", slug: "acne" },
          { id: 4, name: "Glow", slug: "glow" },
          { id: 5, name: "Dryness", slug: "dryness" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, []);

  // Triple items list for seamless infinite carousel wrapping
  const displayConcerns = React.useMemo(() => {
    if (!concerns || concerns.length === 0) return [];
    return [...concerns, ...concerns, ...concerns, ...concerns];
  }, [concerns]);

  // Auto-scroll loop advancing by 1 card step at a time
  useEffect(() => {
    if (concerns.length === 0) return;

    const interval = setInterval(() => {
      if (isHovered.current || !scrollRef.current) return;

      const container = scrollRef.current;
      const firstCard = container.querySelector(".concern-card");
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth;
      const gap = 16; // gap-4 (16px)
      const step = cardWidth + gap;

      const setWidth = concerns.length * step;

      // When reaching near the end set, wrap back silently
      if (container.scrollLeft >= setWidth * 2) {
        container.style.scrollBehavior = "auto";
        container.scrollLeft = container.scrollLeft - setWidth;
        container.style.scrollBehavior = "smooth";
      }

      container.scrollBy({ left: step, behavior: "smooth" });
    }, 2800);

    return () => clearInterval(interval);
  }, [concerns]);

  const handleScrollStep = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const firstCard = container.querySelector(".concern-card");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 16;
    const step = cardWidth + gap;

    const setWidth = concerns.length * step;

    if (direction === "left" && container.scrollLeft <= step) {
      container.style.scrollBehavior = "auto";
      container.scrollLeft = container.scrollLeft + setWidth;
      container.style.scrollBehavior = "smooth";
    } else if (direction === "right" && container.scrollLeft >= setWidth * 2) {
      container.style.scrollBehavior = "auto";
      container.scrollLeft = container.scrollLeft - setWidth;
      container.style.scrollBehavior = "smooth";
    }

    container.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const handleCardClick = (concern) => {
    const concernParam = concern.name || concern.slug;
    navigate(`/collection/all-product?concern=${encodeURIComponent(concernParam)}`);
  };

  return (
    <section
      className="py-10 md:pb-24 px-4 md:px-12 w-full relative overflow-hidden"
      style={{
        fontFamily: fonts.secondary,
      }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Container */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span
            className="text-xs uppercase tracking-widest font-semibold block mb-1.5"
            style={{ color: colours.accent }}
          >
            Targeted Care Solutions
          </span>
          <h2
            className="text-2xl md:text-4xl font-normal tracking-wide"
            style={{
              fontFamily: fonts.primary,
              color: colours.text,
            }}
          >
            Shop By Concern
          </h2>
        </div>

        {/* Carousel Nav Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={() => handleScrollStep("left")}
            aria-label="Previous Concern"
            style={{
              borderColor: colours.border,
              color: colours.text,
              backgroundColor: colours.background,
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-stone-100 active:scale-95 shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleScrollStep("right")}
            aria-label="Next Concern"
            style={{
              backgroundColor: colours.secondary,
              color: colours.background,
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95 shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex gap-4 overflow-hidden py-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="w-44 sm:w-52 md:w-56 h-64 sm:h-72 md:h-80 rounded-xl bg-stone-200 shrink-0"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onMouseEnter={() => { isHovered.current = true; }}
            onMouseLeave={() => { isHovered.current = false; }}
            onTouchStart={() => { isHovered.current = true; }}
            onTouchEnd={() => { isHovered.current = false; }}
            className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-3"
          >
            {displayConcerns.map((concern, idx) => {
              const imgSrc = concern.image_url || getFallbackImage(concern.name);

              return (
                <div
                  key={`${concern.id}-${idx}`}
                  onClick={() => handleCardClick(concern)}
                  style={{ borderColor: colours.border }}
                  className="concern-card group relative w-44 sm:w-52 md:w-56 h-64 sm:h-72 md:h-80 rounded-xl border overflow-hidden shrink-0 snap-start cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image Background */}
                  <img
                    src={imgSrc}
                    alt={concern.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                    <h3
                      className="text-lg sm:text-xl font-semibold tracking-wide leading-tight group-hover:text-amber-200 transition-colors"
                      style={{ fontFamily: fonts.primary }}
                    >
                      {concern.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-wider font-medium opacity-85 group-hover:opacity-100">
                      <span>Explore</span>
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByConcern;
