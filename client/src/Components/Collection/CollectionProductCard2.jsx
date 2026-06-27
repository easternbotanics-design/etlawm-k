import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { colours, fonts } from "../../theme/theme.js";

export default function CollectionProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlisted((prev) => !prev);
  };

  return (
    <>
      <style>
        {`
          .collection-product-name {
            position: relative;
            display: inline-block;
          }

          .collection-product-name::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -3px;
            width: 100%;
            height: 1px;
            background: ${colours.text};
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.35s ease;
          }

          .collection-product-name-link:hover .collection-product-name::after {
            transform: scaleX(1);
          }
        `}
      </style>

      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <Link
          to={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            aspectRatio: "2 / 3",
            overflow: "hidden",
            borderRadius: "16px",
            background: colours.surface,
            textDecoration: "none",
            boxShadow: isHovered
              ? "0 8px 24px rgba(20, 16, 12, 0.08), 0 0 0 1px rgba(167, 124, 107, 0.16)"
              : "0 8px 24px rgba(20, 16, 12, 0.08), 0 0 0 1px rgba(167, 124, 107, 0.08)",
            transition: "box-shadow 0.35s ease, transform 0.35s ease",
            transform: isHovered ? "translateY(-3px)" : "translateY(0)",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: isHovered ? "scale(1.06)" : "scale(1)",
              transition:
                "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.55)",
              background: "rgba(255, 255, 255, 0.78)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 8px 18px rgba(0, 0, 0, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
              transition:
                "background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 18px rgba(0, 0, 0, 0.12)";
            }}
          >
            <Star
              size={18}
              strokeWidth={1.9}
              color={isWishlisted ? colours.accent : colours.text}
              fill={isWishlisted ? colours.accent : "none"}
            />
          </button>
        </Link>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          <Link
            to={`/product/${product.slug}`}
            className="collection-product-name-link"
            style={{
              textDecoration: "none",
              color: colours.text,
            }}
          >
            <h3
              className="collection-product-name"
              style={{
                margin: 0,
                fontFamily: fonts.primary,
                fontSize: "1.08rem",
                fontWeight: 400,
                lineHeight: 1.25,
                letterSpacing: "0.01em",
              }}
            >
              {product.name}
            </h3>
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: fonts.secondary,
                fontSize: "0.95rem",
                fontWeight: 500,
                color: colours.text,
              }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            {product.originalPrice && (
              <span
                style={{
                  fontFamily: fonts.secondary,
                  fontSize: "0.8rem",
                  color: colours.mutedText,
                  textDecoration: "line-through",
                }}
              >
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </article>
    </>
  );
}