import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";

/**
 * CategoryCard — large editorial card linking to a category route.
 * Props:
 *   slug        — e.g. "hair-care"
 *   label       — e.g. "Hair Care"
 *   description — short subtitle
 *   image       — URL for the background image
 */
export default function CategoryCard({ slug, label, description, image }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/collection/${slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "420px",
        maxHeight: "520px",
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
        background: colours.surface,
        boxShadow: hovered
          ? "0 20px 56px rgba(30,20,10,0.22)"
          : "0 4px 24px rgba(30,20,10,0.1)",
        transition: "box-shadow 0.5s ease",
      }}
    >
      {/* Background image with zoom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(20,14,8,0.72) 0%, rgba(20,14,8,0.1) 60%)"
            : "linear-gradient(to top, rgba(20,14,8,0.55) 0%, rgba(20,14,8,0.05) 60%)",
          transition: "background 0.5s ease",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Label */}
        <h3
          style={{
            fontFamily: fonts.primary,
            fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
            fontWeight: 400,
            color: colours.background,
            margin: 0,
            letterSpacing: "0.06em",
            lineHeight: 1.2,
          }}
        >
          {label}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: fonts.secondary,
            fontSize: "0.8rem",
            color: "rgba(247,243,238,0.75)",
            margin: 0,
            letterSpacing: "0.05em",
            opacity: hovered ? 1 : 0.8,
            transform: hovered ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {description}
        </p>

        {/* Arrow CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s",
          }}
        >
          <span
            style={{
              fontFamily: fonts.secondary,
              fontSize: "0.7rem",
              color: colours.background,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Shop Now
          </span>
          <svg
            width="18"
            height="8"
            viewBox="0 0 18 8"
            fill="none"
            stroke={colours.background}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 4h16M12 1l4 3-4 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}