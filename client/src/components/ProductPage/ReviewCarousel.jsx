import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewCard from "./ReviewCard.jsx";
import { colours, fonts } from "../../theme/theme.js";
import reviewService from "../../services/reviewService.js";

const defaultReviews = [
  {
    id: 1,
    customer_name: "Kishore M.",
    rating: 5,
    heading: "Perfect lightweight day cream with a beautiful glow!",
    review: "This cream absorbs beautifully without feeling greasy. It keeps my skin perfectly hydrated throughout the day and leaves a subtle, healthy radiance.",
  },
  {
    id: 2,
    customer_name: "Monika A.",
    rating: 5,
    heading: "Truly transformed my skin routine",
    review: "This is my second purchase. I have oily skin, but this cream moisturizes without making it greasy. It blends smoothly and leaves a natural glow.",
  },
  {
    id: 3,
    customer_name: "Bhavya M.",
    rating: 4.5,
    heading: "Hydrating & gentle on sensitive skin",
    review: "I really like how soft my skin feels after applying this. It helps clear up redness and keeps my skin balanced all day long.",
  },
  {
    id: 4,
    customer_name: "Aman A.",
    rating: 5,
    heading: "Amazing scent and non-acnegenic",
    review: "It's a great hydrating cream with a light botanical smell. Does not cause breakouts or clog pores. Highly recommended for daily use!",
  },
  {
    id: 5,
    customer_name: "Jayal P.",
    rating: 5,
    heading: "Effective for blemishes & marks",
    review: "My skin texture has improved drastically within three weeks of daily use. Highly impressed with the quality and natural formula.",
  },
  {
    id: 6,
    customer_name: "Aishwarya D.",
    rating: 5,
    heading: "Best moisturizer in my cabinet!",
    review: "Lightweight texture, super nourishing, and doesn't leave any heavy residue. I receive so many compliments on my healthy skin.",
  },
];

const slots = [-3, -2, -1, 0, 1, 2, 3];

const mod = (value, length) => {
  return ((value % length) + length) % length;
};

const getPositionStyles = (offset) => {
  if (offset === 0) {
    return {
      transform: "translateX(0px) translateZ(240px) rotateY(0deg) scale(1)",
      zIndex: 50,
      opacity: 1,
    };
  }

  if (offset === 1) {
    return {
      transform: "translateX(220px) translateZ(80px) rotateY(-32deg) scale(0.86)",
      zIndex: 40,
      opacity: 0.92,
    };
  }

  if (offset === -1) {
    return {
      transform: "translateX(-220px) translateZ(80px) rotateY(32deg) scale(0.86)",
      zIndex: 40,
      opacity: 0.92,
    };
  }

  if (offset === 2) {
    return {
      transform: "translateX(400px) translateZ(-80px) rotateY(-45deg) scale(0.70)",
      zIndex: 30,
      opacity: 0.6,
    };
  }

  if (offset === -2) {
    return {
      transform: "translateX(-400px) translateZ(-80px) rotateY(45deg) scale(0.70)",
      zIndex: 30,
      opacity: 0.6,
    };
  }

  if (offset === 3) {
    return {
      transform: "translateX(540px) translateZ(-180px) rotateY(-55deg) scale(0.55)",
      zIndex: 10,
      opacity: 0,
    };
  }

  return {
    transform: "translateX(-540px) translateZ(-180px) rotateY(55deg) scale(0.55)",
    zIndex: 10,
    opacity: 0,
  };
};

export default function ReviewCarousel({ reviews: propReviews }) {
  const [activePosition, setActivePosition] = useState(0);
  const [dbReviews, setDbReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews from database via public API
  useEffect(() => {
    let isMounted = true;
    const fetchDbReviews = async () => {
      try {
        const data = await reviewService.getPublicReviews();
        if (isMounted && data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setDbReviews(data.reviews);
        }
      } catch (err) {
        console.error("Failed to load reviews from database:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDbReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine active review dataset priority: propReviews > dbReviews > defaultReviews
  const reviewItems =
    propReviews && propReviews.length > 0
      ? propReviews
      : dbReviews.length > 0
        ? dbReviews
        : defaultReviews;

  const handlePrev = () => {
    setActivePosition((prev) => prev - 1);
  };

  const handleNext = () => {
    setActivePosition((prev) => prev + 1);
  };

  return (
    <section className="relative flex my-12 w-full items-center justify-center overflow-hidden bg-transparent px-4 sm:px-6">
      {/* Left Navigation Button styled with theme colors */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous review"
        className="absolute left-2 sm:left-6 md:left-12 z-[60] flex h-12 w-12 items-center justify-center rounded-full shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border"
        style={{
          backgroundColor: colours.primary || "#F7F3EC",
          borderColor: colours.border || "#D8D2C8",
          color: colours.secondary || "#171715",
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div
        className="relative h-[440px] w-full max-w-6xl flex items-center justify-center"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[340px] w-[300px] sm:w-[330px] -translate-x-1/2 -translate-y-1/2"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {slots.map((slot) => {
            const virtualIndex = activePosition + slot;
            const reviewIndex = mod(virtualIndex, reviewItems.length);
            const review = reviewItems[reviewIndex];
            const style = getPositionStyles(slot);

            return (
              <div
                key={virtualIndex}
                className="absolute inset-0 transition-all duration-700 ease-in-out"
                style={style}
              >
                <ReviewCard review={review} clampText={true} compact={true} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Navigation Button styled with theme colors */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next review"
        className="absolute right-2 sm:right-6 md:right-12 z-[60] flex h-12 w-12 items-center justify-center rounded-full shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border"
        style={{
          backgroundColor: colours.primary || "#F7F3EC",
          borderColor: colours.border || "#D8D2C8",
          color: colours.secondary || "#171715",
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </section>
  );
}