import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";
import homepageReviewService from "../../services/homepageReviewService.js";

// Helper to resolve product image from /public folder based on product name
const getProductImage = (productName = '') => {
  if (!productName) return '/Herbal Hair Oil.webp';
  const nameLower = productName.toLowerCase().trim();

  if (nameLower.includes('pigmentation')) {
    return '/De - Pigmentation Cream.webp';
  }
  if (nameLower.includes('herbal hair oil') || nameLower.includes('hair oil')) {
    return '/Herbal Hair Oil.webp';
  }
  if (nameLower.includes('face serum')) {
    return '/products/face-serum.png';
  }
  if (nameLower.includes('face wash')) {
    return '/products/face-wash.png';
  }
  if (nameLower.includes('hair mask')) {
    return '/products/hair-mask.png';
  }
  if (nameLower.includes('hair serum')) {
    return '/products/hair-serum.png';
  }
  if (nameLower.includes('skin cream') || nameLower.includes('cream')) {
    return '/products/skin-cream.png';
  }
  if (nameLower.includes('skin')) {
    return '/products/skin-category.png';
  }
  if (nameLower.includes('hair')) {
    return '/products/hair-category.png';
  }

  return '/Herbal Hair Oil.webp';
};

const slugify = (text = '') => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// ── Card — product name above card bubble, chat bubble review, verified buyer tag below right ──
const ReviewCard = ({
  name,
  productName,
  productLink,
  heading,
  subtitle = "",
  bgColor = colours.green,
  className = "",
  style = {},
}) => {
  const cardColor = bgColor || colours.green;

  // Determine dynamic max width based on content length
  const contentLength = (subtitle || "").length + (heading || "").length;
  let widthClass = "max-w-[92%] sm:max-w-md";
  if (contentLength > 250) {
    widthClass = "max-w-[95%] sm:max-w-2xl";
  } else if (contentLength > 130) {
    widthClass = "max-w-[95%] sm:max-w-xl";
  }

  const targetLink = productLink || (productName ? `/collection/product/${slugify(productName)}` : null);

  return (
    <div className={`flex flex-col gap-1 w-full ${widthClass} ${className}`} style={style}>
      {/* Product Name placed above the card bubble (clickable link) */}
      {productName && (
        <div className="pl-0.5 text-[#fafafa] drop-shadow-sm">
          {/* Customer name is commented out as requested */}
          {/* {name && (
            <p
              className="text-base sm:text-lg font-semibold tracking-wide"
              style={{ fontFamily: fonts?.title || fonts?.primary || "serif" }}
            >
              {name}
            </p>
          )} */}
          {targetLink ? (
            <Link
              to={targetLink}
              className="text-[11px] sm:text-xs md:text-sm font-medium opacity-90 hover:opacity-100 hover:underline text-[#fafafa] no-underline inline-flex items-center gap-1 transition-all"
              style={{ fontFamily: fonts?.secondary || "sans-serif" }}
            >
              <span>{productName}</span>
              
            </Link>
          ) : (
            <p
              className="text-[11px] sm:text-xs md:text-sm opacity-90 text-[#fafafa]"
              style={{ fontFamily: fonts?.secondary || "sans-serif" }}
            >
              {productName}
            </p>
          )}
        </div>
      )}

      {/* Main Review Card Bubble */}
      <div
        className={`relative p-3.5 sm:p-5 md:p-6 rounded-t-xl sm:rounded-t-2xl rounded-br-xl sm:rounded-br-2xl shadow-xl text h-auto w-full ${widthClass}`}
        style={{ backgroundColor: cardColor }}
      >
        {heading && (
          <h4
            className="text-[11px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-[#fafafa] mb-1 opacity-90"
            style={{ fontFamily: fonts?.primary || "serif" }}
          >
            {heading}
          </h4>
        )}
        <p
          className="text-[11px] sm:text-xs md:text-base text-[#fafafa] leading-relaxed whitespace-pre-line"
          style={{ fontFamily: fonts?.secondary || "sans-serif" }}
        >
          {subtitle}
        </p>

        {/* Inverted right-angled triangle chat box tail at bottom left corner */}
        <div
          className="absolute left-0 top-full w-0 h-0 border-t-[12px] sm:border-t-[16px] md:border-t-[20px] border-r-[12px] sm:border-r-[16px] md:border-r-[20px] border-r-transparent"
          style={{ borderTopColor: cardColor }}
        />
      </div>

      {/* Verified buyer tag placed below the card on the right side */}
      <div className="flex justify-end pr-0.5 pt-0.5">
        <span
          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] md:text-xs text-[#fafafa]/85 font-medium tracking-wide drop-shadow-sm"
          style={{ fontFamily: fonts?.secondary || "sans-serif" }}
        >
          Verified buyer
        </span>
      </div>
    </div>
  );
};

const EXIT_MS = 250;
const ENTER_DELAY_MS = 20;
const ENTER_MS = 500;
const SETTLE_MS = EXIT_MS + ENTER_DELAY_MS + ENTER_MS;
const SWIPE_THRESHOLD = 50;

const ReviewSection = () => {
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | exit | enter-start | enter
  const [direction, setDirection] = useState("right"); // side the incoming card slides in from
  const [bgVisible, setBgVisible] = useState(true);

  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  // Fetch published homepage reviews from backend API
  useEffect(() => {
    const fetchHomepageReviews = async () => {
      setLoading(true);
      try {
        const data = await homepageReviewService.getPublicHomepageReviews();
        if (data?.success && Array.isArray(data.reviews)) {
          const formatted = data.reviews.map((r) => ({
            id: r.id,
            name: r.customer_name,
            productName: r.product_name,
            productLink: r.product_link,
            heading: r.heading,
            subtitle: r.review,
            bgColor: colours.green,
            image: getProductImage(r.product_name),
          }));
          setReviewsList(formatted);
        }
      } catch (err) {
        console.error("Failed to load public homepage reviews for carousel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageReviews();
  }, []);

  const goTo = (nextIndex, dir) => {
    if (phase !== "idle" || nextIndex === index) return;

    setDirection(dir);
    setPhase("exit"); // card fades out in place
    setBgVisible(false); // background starts cross-fading out

    timers.current.push(
      setTimeout(() => {
        setIndex(nextIndex);
        setBgIndex(nextIndex);
        setPhase("enter-start"); // new card placed off to the `dir` side, invisible

        timers.current.push(
          setTimeout(() => {
            setPhase("enter"); // slide + fade the new card into place
            setBgVisible(true); // new background image fades in
          }, ENTER_DELAY_MS)
        );
      }, EXIT_MS)
    );

    timers.current.push(setTimeout(() => setPhase("idle"), SETTLE_MS));
  };

  const handleNext = () => goTo((index + 1) % reviewsList.length, "right");
  const handlePrev = () => goTo((index - 1 + reviewsList.length) % reviewsList.length, "left");

  // Autoscroll timer - automatically advances card by card
  useEffect(() => {
    if (reviewsList.length <= 1 || isPaused || phase !== "idle") return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [index, reviewsList.length, isPaused, phase]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) handlePrev();
    else if (delta < -SWIPE_THRESHOLD) handleNext();
    touchStartX.current = null;
    setIsPaused(false);
  };

  // Skeleton loading state
  if (loading) {
    return (
      <section className="relative w-full min-h-[480px] sm:min-h-[560px] overflow-hidden select-none bg-stone-900/40 animate-pulse">
        <div className="absolute inset-0 bg-stone-800/60" />
        <div className="relative z-10 flex h-full min-h-[480px] sm:min-h-[560px] items-center px-4 sm:px-10 md:px-14">
          <div className="w-full max-w-md pl-1 sm:pl-4 md:pl-12 lg:pl-20 space-y-3 pt-12 sm:pt-0">
            <div className="h-4 w-32 bg-white/20 rounded-md" />
            <div className="h-36 sm:h-44 w-full bg-white/15 rounded-t-xl sm:rounded-t-2xl rounded-br-xl sm:rounded-br-2xl p-4 sm:p-6 space-y-2.5">
              <div className="h-3.5 w-3/4 bg-white/20 rounded" />
              <div className="h-3.5 w-full bg-white/20 rounded" />
              <div className="h-3.5 w-5/6 bg-white/20 rounded" />
            </div>
            <div className="flex justify-end pr-1 pt-1">
              <div className="h-3.5 w-24 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no reviews found in DB, do not render empty space
  if (!reviewsList.length) {
    return null;
  }

  const current = reviewsList[index] || reviewsList[0];
  const bgReview = reviewsList[bgIndex] || reviewsList[0];

  // Dynamic max-width based on character count
  const contentLength = (current?.subtitle || "").length + (current?.heading || "").length;
  let containerWidthClass = "max-w-md";
  if (contentLength > 250) {
    containerWidthClass = "max-w-2xl";
  } else if (contentLength > 130) {
    containerWidthClass = "max-w-xl";
  }

  // Exit is a quick, snappy fade in place; entry is a longer, eased slide + fade
  let cardOpacity = "opacity-100";
  let cardTranslate = "translate-x-0";
  let cardTransition = "transition-all duration-500 ease-out";

  if (phase === "exit") {
    cardOpacity = "opacity-0";
    cardTransition = "transition-opacity duration-200 ease-in";
  } else if (phase === "enter-start") {
    cardOpacity = "opacity-0";
    cardTranslate = direction === "right" ? "translate-x-[110%]" : "-translate-x-[110%]";
    cardTransition = "transition-none"; // snap to the start position with no animation
  }

  return (
    <section
      className="relative w-full min-h-[480px] sm:min-h-[560px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background image — cross-fades only, never slides */}
      <img
        key={bgReview.id || bgIndex}
        src={bgReview.image}
        alt={bgReview.productName || "Product Review"}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
          bgVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-black/35" />

      {/* Prev / Next controls (hidden on mobile, visible on sm and up) */}
      {reviewsList.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous review"
            className="absolute left-3 top-1/2 z-20 hidden sm:flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-semibold shadow-md transition hover:bg-white active:scale-95 sm:left-5 sm:h-11 sm:w-11"
            style={{ color: colours.green }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next review"
            className="absolute right-3 top-1/2 z-20 hidden sm:flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-semibold shadow-md transition hover:bg-white active:scale-95 sm:right-5 sm:h-11 sm:w-11"
            style={{ color: colours.green }}
          >
            ›
          </button>
        </>
      )}

      {/* Card, anchored to the left and shifted lower on mobile */}
      <div className="relative z-10 flex h-full min-h-[480px] sm:min-h-[560px] items-center px-3 sm:px-10 md:px-14 pt-28 sm:pt-0">
        <div className={`w-full ${containerWidthClass} pl-1 sm:pl-4 md:pl-12 lg:pl-20 ${cardTransition} ${cardOpacity} ${cardTranslate}`}>
          <ReviewCard
            name={current.name}
            productName={current.productName}
            productLink={current.productLink}
            heading={current.heading}
            subtitle={current.subtitle}
            bgColor={current.bgColor || colours.green}
          />
        </div>
      </div>

      {/* Pagination dots */}
      {reviewsList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {reviewsList.map((r, i) => (
            <button
              key={r.id || i}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              onClick={() => goTo(i, i > index ? "right" : "left")}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;