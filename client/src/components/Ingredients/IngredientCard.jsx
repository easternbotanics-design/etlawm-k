import React from "react";
import { colours, fonts } from "../../theme/theme.js";
import { Sparkles, Leaf } from "lucide-react";

export default function IngredientCard({ ingredient, index = 0 }) {
  if (!ingredient) return null;

  const {
    name,
    scientific_name,
    scientificName,
    image_url,
    imageUrl,
    para1,
    para2,
    para3,
  } = ingredient;

  const img = image_url || imageUrl;
  const sciName = scientific_name || scientificName;

  return (
    <article
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: colours.border,
        boxShadow: "0 10px 30px -10px rgba(23, 23, 21, 0.05)",
      }}
      className="group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Subtle background gradient accent */}
      <div 
        className="absolute top-0 right-0 h-32 w-32 rounded-bl-full pointer-events-none opacity-30 transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background: `radial-gradient(circle, ${colours.accent}33 0%, transparent 70%)`
        }}
      />

      <div className="p-5 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start">
        {/* Image + Mobile Header Row */}
        <div className="flex flex-row md:flex-col shrink-0 items-start gap-4 md:gap-4 w-full md:w-auto">
          {/* Ingredient Image container */}
          <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 relative rounded-xl overflow-hidden bg-[#F7F3EC] border border-[#E8E2D8] shadow-inner flex items-center justify-center">
            {img ? (
              <img
                src={img}
                alt={name || "Botanical Ingredient"}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement.querySelector(".fallback-icon");
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback Icon */}
            <div
              className="fallback-icon flex flex-col items-center justify-center gap-1.5 p-2 text-center w-full h-full"
              style={{ display: img ? "none" : "flex" }}
            >
              <div 
                className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colours.accent}1A`, color: colours.accent }}
              >
                <Leaf size={18} className="md:w-6 md:h-6" />
              </div>
              <span 
                className="text-[8px] md:text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
              >
                Extract
              </span>
            </div>

            {/* Index Badge */}
            <div 
              className="absolute top-2 left-2 md:top-3 md:left-3 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-semibold backdrop-blur-md border shadow-sm"
              style={{ 
                backgroundColor: "rgba(247, 243, 236, 0.85)", 
                color: colours.text,
                borderColor: colours.border,
                fontFamily: fonts.secondary 
              }}
            >
              #{String(index + 1).padStart(2, "0")}
            </div>
          </div>

          {/* On Mobile: Header (Key Active, Name, Scientific Name) on right side of image */}
          <div className="md:hidden flex-1 min-w-0 space-y-1">
            <span 
              className="inline-block text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${colours.accent}1F`, 
                color: colours.accent,
                fontFamily: fonts.secondary 
              }}
            >
              Key Active
            </span>

            <h3
              className="text-xl font-normal leading-tight transition-colors duration-300 group-hover:text-[#A77C6B]"
              style={{ color: colours.text, fontFamily: fonts.primary }}
            >
              {name || "Active Botanical"}
            </h3>

            {sciName && (
              <p
                className="text-xs italic font-light tracking-wide"
                style={{ color: colours.accent, fontFamily: fonts.primary }}
              >
                {sciName}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          {/* Header section for Desktop only */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${colours.accent}1F`, 
                  color: colours.accent,
                  fontFamily: fonts.secondary 
                }}
              >
                Key Active
              </span>
            </div>

            <h3
              className="text-2xl md:text-3xl font-normal leading-tight transition-colors duration-300 group-hover:text-[#A77C6B]"
              style={{ color: colours.text, fontFamily: fonts.primary }}
            >
              {name || "Active Botanical"}
            </h3>

            {sciName && (
              <p
                className="text-sm italic mt-1 font-light tracking-wide"
                style={{ color: colours.accent, fontFamily: fonts.primary }}
              >
                {sciName}
              </p>
            )}
          </div>

          <div 
            className="w-16 h-[1px] my-2 md:my-3"
            style={{ backgroundColor: `${colours.accent}40` }}
          />

          {/* Paragraph details */}
          <div className="space-y-3 text-xs md:text-sm leading-relaxed" style={{ color: colours.text, fontFamily: fonts.secondary }}>
            {para1 && (
              <p className="font-normal text-[#2C2C2A] leading-relaxed">
                {para1}
              </p>
            )}

            {para2 && (
              <p className="text-xs md:text-sm text-[#5C5750] leading-relaxed pl-3 border-l-2" style={{ borderColor: colours.accent }}>
                {para2}
              </p>
            )}

            {para3 && (
              <p className="text-xs text-[#7C7770] leading-relaxed pt-1">
                {para3}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
