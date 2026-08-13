import CollectionProductCard from "./CollectionProductCard2.jsx";
import { colours, fonts } from "../../theme/theme.js";

/**
 * ProductGrid — responsive grid of CollectionProductCard items.
 * Props:
 *   products — filtered + sorted array of product objects
 */
export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: `1.5px solid ${colours.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colours.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: "1.4rem",
            color: colours.text,
            margin: 0,
            textAlign: "center",
          }}
        >
          No products found
        </p>
        <p
          style={{
            fontFamily: fonts.secondary,
            fontSize: "0.8rem",
            color: colours.accent,
            margin: 0,
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          Try adjusting your filters to discover more
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Result count */}
      <p
        style={{
          fontFamily: fonts.secondary,
          fontSize: "0.72rem",
          color: colours.accent,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          margin: "0 0 20px 0",
          fontWeight: 500,
        }}
      >
        {products.length} {products.length === 1 ? "Product" : "Products"}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        {products.map(product => (
          <CollectionProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}