import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReviewCard from "./ReviewCard.jsx";
import { colours, fonts } from "../../theme/theme.js";
import reviewService from "../../services/reviewService.js";

// Re-export ReviewCard for backwards compatibility
export { ReviewCard };

// ---------- Review Grid using dynamic height ReviewCards ----------
const ReviewGrid = ({ reviews: propReviews, product, productName, productSlug }) => {
  const params = useParams();
  const paramsSlug = params?.slug;

  const [dbReviews, setDbReviews] = useState([]);
  const [reviewsBgImage, setReviewsBgImage] = useState(null);
  const [loading, setLoading] = useState(!propReviews);
  const [isExpanded, setIsExpanded] = useState(false);

  const targetSlug = productSlug || product?.slug || paramsSlug;
  const targetName = productName || product?.name;

  useEffect(() => {
    let isMounted = true;
    const fetchDbReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getPublicReviews(targetSlug);
        if (isMounted && data) {
          if (data.reviews_bg_image) {
            setReviewsBgImage(data.reviews_bg_image);
          }
          if (Array.isArray(data.reviews)) {
            let fetched = data.reviews;
            if (targetSlug || targetName) {
              const tSlug = (targetSlug || "").toLowerCase();
              const tName = (targetName || (targetSlug ? targetSlug.replace(/-/g, " ") : "")).toLowerCase();

              fetched = fetched.filter((r) => {
                const rName = (r.product_name || "").toLowerCase();
                const rLink = (r.product_link || "").toLowerCase();
                return rName === tName || rName === tSlug || (tSlug && rLink.includes(tSlug));
              });
            }
            setDbReviews(fetched);
          }
        }
      } catch (err) {
        console.error("Failed to load public reviews for ReviewGrid:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDbReviews();

    return () => {
      isMounted = false;
    };
  }, [propReviews, targetSlug, targetName]);

  const displayReviews = propReviews && Array.isArray(propReviews) ? propReviews : dbReviews;
  const bgImage = product?.reviews_bg_image || reviewsBgImage;

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-12 md:px-24 lg:px-48 py-8 sm:py-12 text-center">
        <p className="text-xs sm:text-sm text-[#7C7770]">Loading reviews...</p>
      </div>
    );
  }

  if (!displayReviews || displayReviews.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-2.5 sm:px-12 md:px-24 lg:px-48 py-6 sm:py-14 relative overflow-hidden transition-all duration-500">
      {/* Background image layer with reduced opacity */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-500"
          style={{
            backgroundImage: `url("${bgImage}")`,
            opacity: 0.9,
          }}
        />
      )}

      <div className="columns-2 md:columns-2 lg:columns-3 gap-2.5 sm:gap-6 space-y-2.5 sm:space-y-6 max-w-7xl mx-auto relative z-10">
        {displayReviews.map((review, index) => {
          const isHiddenMobile = !isExpanded && index >= 3;

          return (
            <div
              key={review.id || index}
              className={`break-inside-avoid w-full ${
                isHiddenMobile ? "hidden sm:inline-block" : "inline-block"
              }`}
            >
              <ReviewCard review={review} clampText={false} className="h-auto" />
            </div>
          );
        })}
      </div>

      {displayReviews.length > 3 && (
        <div className="mt-8 text-center sm:hidden relative z-10">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-block text-xs font-medium uppercase tracking-[0.15em] border-b border-dotted pb-0.5 transition-opacity hover:opacity-75"
            style={{
              color: colours.accent || "#A77C6B",
              borderColor: colours.accent || "#A77C6B",
              fontFamily: fonts?.secondary || "sans-serif",
            }}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewGrid;