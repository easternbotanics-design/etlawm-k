import React from "react";
import { Star, Quote } from "lucide-react";
import { colours, fonts } from "../../theme/theme.js";

export default function ReviewCard({
  review = {},
  name,
  rating,
  headline,
  body,
  clampText = false,
  compact = false,
  className = "",
}) {
  // Extract values with flexible fallbacks for database (cms_reviews) and standard fields
  const reviewerName = review.customer_name || review.name || name || "Verified Customer";
  const reviewRating = Number(review.rating ?? rating ?? 5);
  const reviewHeadline = review.heading || review.headline || review.title || "";
  const reviewBody = review.review || review.body || body || "";
  const productName = review.product_name || "";

  return (
    <div
      className={`relative flex flex-col justify-between h-auto w-full ${compact ? "p-2.5 sm:p-5" : "p-2.5 sm:p-7"
        } rounded-lg sm:rounded-2xl transition-all duration-300 select-none overflow-hidden text-left ${className}`}
      style={{
        backgroundColor: colours.primary,
      }}
    >
      {/* Decorative subtle Quote Icon in background using theme accent */}
      <Quote
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 ${compact ? "h-4 w-4 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-12 sm:w-12"
          } rotate-180 pointer-events-none opacity-15`}
        style={{ color: colours.accent || "#A77C6B" }}
      />

      <div className="relative z-10 flex flex-col justify-between h-auto">
        <div>
          {/* Rating Section */}
          <div className={`flex items-center gap-1 sm:gap-1.5 ${compact ? "mb-1 sm:mb-2" : "mb-1 sm:mb-3"}`}>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={compact ? "h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" : "h-2.5 w-2.5 sm:h-4 sm:w-4.5"}
                  style={{
                    fill: i < Math.floor(reviewRating) ? colours.accent || "#A77C6B" : "transparent",
                    color: i < Math.floor(reviewRating) ? colours.accent || "#A77C6B" : colours.border || "#D8D2C8",
                  }}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span
              className={`${compact ? "text-[9px] sm:text-[11px]" : "text-[9px] sm:text-xs"} font-semibold ml-0.5 sm:ml-1`}
              style={{ color: colours.mutedText || "#7C7770" }}
            >
              {reviewRating.toFixed(1)}
            </span>
          </div>

          {/* Headline */}
          {reviewHeadline && (
            <h4
              className={`${compact ? "text-[10px] sm:text-sm mb-1 sm:mb-1.5" : "text-[11px] sm:text-lg mb-1 sm:mb-2.5"
                } font-bold leading-snug ${clampText ? "line-clamp-2" : ""}`}
              style={{
                color: colours.secondary || colours.text || "#171715",
                fontFamily: fonts.title || fonts.primary || "serif",
              }}
            >
              {reviewHeadline}
            </h4>
          )}

          {/* Body */}
          {reviewBody && (
            <p
              className={`${compact ? "text-[9.5px] sm:text-xs leading-tight sm:leading-relaxed" : "text-[10px] sm:text-sm leading-tight sm:leading-relaxed"
                } ${clampText ? "line-clamp-4" : ""}`}
              style={{
                color: colours.mutedText || "#7C7770",
                fontFamily: fonts.secondary || "sans-serif",
              }}
            >
              "{reviewBody}"
            </p>
          )}
        </div>

        {/* Bottom Section: Name & Product / Verified badge */}
        <div
          className={`${compact ? "mt-1.5 pt-1.5" : "mt-2 sm:mt-5 pt-1.5 sm:pt-3.5"
            } border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2`}
          style={{ borderColor: colours.border }}
        >
          <div className="flex flex-col min-w-0">
            <span
              className={`font-semibold ${compact ? "text-[10px] sm:text-xs" : "text-[10px] sm:text-sm"
                } tracking-wide truncate`}
              style={{
                color: colours.secondary || colours.text || "#171715",
                fontFamily: fonts.secondary || "sans-serif",
              }}
            >
              {reviewerName}
            </span>
            {productName && (
              <span
                className={`${compact ? "text-[8px]" : "text-[8px] sm:text-[11px]"} truncate max-w-[90px] sm:max-w-[130px]`}
                style={{
                  color: colours.mutedText || "#7C7770",
                  fontFamily: fonts.secondary || "sans-serif",
                }}
              >
                {productName}
              </span>
            )}
          </div>

          <span
            className={`${compact ? "text-[7.5px] sm:text-[9px] px-1 sm:px-2 py-0.5" : "text-[7.5px] sm:text-xs px-1.5 sm:px-2.5 py-0.5"
              } font-medium uppercase tracking-wider rounded-full border shrink-0 w-max`}
            style={{
              backgroundColor: colours.surface || "#E8E2D8",
              borderColor: colours.border || "#D8D2C8",
              color: colours.secondary || "#171715",
              fontFamily: fonts.secondary || "sans-serif",
            }}
          >
            Verified Review
          </span>
        </div>
      </div>
    </div>
  );
}
