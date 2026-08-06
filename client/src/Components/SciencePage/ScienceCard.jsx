import React from "react";
import { BlobEffect } from "./Blob.jsx";
import { colours, fonts } from "../../theme/theme.js";
import defaultCompoundImage from "../../assets/niacinamide.svg";

// Blob color layers derived directly from theme.js palette
const themeBlobLayers = [
  "rgba(167, 124, 107, 0.85)", // colours.accent
  "rgba(200, 185, 164, 0.75)", // colours.hover
  "rgba(232, 226, 216, 0.65)", // colours.surface
];

const ScienceCard = ({
  name = "",
  title = "",
  descriptions = [],
  box_1 = "",
  box_2 = "",
  box_3 = "",
  description = "",
  image_url = "",
  tag = "",
  stat = "",
  statLabel = "",
  isReversed = false,
  className = "",
  style = {},
}) => {
  const displayTitle = name || title || "Botanical Compound";
  const displayImage = image_url || defaultCompoundImage;

  const descItems = Array.isArray(descriptions) && descriptions.length > 0
    ? descriptions
    : [box_1, box_2, box_3, description].filter(Boolean);

  const isSvg =
    typeof displayImage === "string" &&
    (displayImage.toLowerCase().endsWith(".svg") ||
      displayImage.toLowerCase().includes(".svg") ||
      displayImage.startsWith("data:image/svg+xml"));

  return (
    <div
      className={`w-full flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-12 my-4 ${className}`}
      style={style}
    >
      {/* Side 1: Animated Blob Component with Compound Image on Top */}
      <div className="relative shrink-0 flex items-center justify-center p-4">
        {/* Blob Animation using theme.js accent color */}
        <BlobEffect
          size={310}
          borderColor={colours.accent}
          hoverColors={themeBlobLayers}
        />

        {/* Compound Image Overlaid: SVG in original shape, other images in a circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
          {isSvg ? (
            <img
              src={displayImage}
              alt={displayTitle}
              className="max-h-[220px] max-w-[220px] object-contain filter drop-shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultCompoundImage;
              }}
            />
          ) : (
            <div className="w-[190px] h-[190px] sm:w-[210px] sm:h-[210px] rounded-full overflow-hidden shadow-xl border-2 border-white/20 flex items-center justify-center shrink-0 bg-stone-100">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultCompoundImage;
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Side 2: Light-Colored Theme Card beside the Blob */}
      <div
        className="flex-1 w-full rounded-2xl md:rounded-3xl p-6 md:p-10 border shadow-lg"
        style={{
          backgroundColor: colours.primary,
          borderColor: colours.border,
          color: colours.text,
          boxShadow: `0 12px 36px rgba(0, 0, 0, 0.08)`,
        }}
      >
        <div className="flex flex-col gap-6">
          {/* Header & Tag */}
          <div>
            <h3
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.04rem]"
              style={{
                fontFamily: fonts.federo || fonts.primary,
                color: colours.secondary,
              }}
            >
              {displayTitle}
            </h3>
          </div>

          {/* Description Contents Rendered as Paragraphs One Below the Other */}
          <div className="space-y-4">
            {descItems.length > 0 ? (
              descItems.map((item, idx) => (
                <p
                  key={idx}
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: colours.text, fontFamily: fonts.secondary }}
                >
                  {item}
                </p>
              ))
            ) : (
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: colours.text, fontFamily: fonts.secondary }}
              >
                Scientific details for this botanical formulation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScienceCard;



