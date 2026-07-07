import { useEffect, useMemo, useState } from "react";
import ProductGrid from "../Components/Collection/ProductGrid.jsx";
import {
  FilterSidebar,
  MobileFilterDrawer,
} from "../Components/Collection/FilterSidebar.jsx";
import { getProducts } from "../services/productService.js";
import { getCategories } from "../services/categoryService.js";
import { colours, fonts } from "../theme/theme.js";

const INK = colours.text;
const BARK = colours.accent;

function getLabelFromSlug(slug = "", categories = []) {
  const matchedCategory = categories.find((category) => category.slug === slug);

  if (matchedCategory) {
    return matchedCategory.name;
  }

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ─── Active filter chips ─────────────────────────────────────── */
function ActiveChips({ filters, setFilters, categories }) {
  const chips = [
    ...filters.categories.map((value) => ({
      key: `cat-${value}`,
      label: getLabelFromSlug(value, categories),
      remove: () =>
        setFilters((prev) => ({
          ...prev,
          categories: prev.categories.filter((category) => category !== value),
        })),
    })),

    ...filters.concerns.map((value) => ({
      key: `con-${value}`,
      label: value
        .replace("-", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase()),
      remove: () =>
        setFilters((prev) => ({
          ...prev,
          concerns: prev.concerns.filter((concern) => concern !== value),
        })),
    })),
  ];

  if (chips.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "20px",
      }}
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.remove}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: fonts.secondary,
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: INK,
            background: "rgba(199,165,138,0.12)",
            border: "1px solid rgba(199,165,138,0.3)",
            borderRadius: "99px",
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          {chip.label}

          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ─── Loading Skeleton Grid ───────────────────────────────────── */
function SkeletonGrid() {
  const shimmerBg = "linear-gradient(90deg, #E8DDD3 25%, #F2EDE7 50%, #E8DDD3 75%)";
  const shimmerStyle = {
    background: shimmerBg,
    backgroundSize: "200% 100%",
    animation: "skeletonShimmer 1.6s ease-in-out infinite",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "24px",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "2 / 3",
              borderRadius: "16px",
              ...shimmerStyle,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "0 8px",
            }}
          >
            <div
              style={{
                height: "16px",
                width: "65%",
                borderRadius: "4px",
                ...shimmerStyle,
              }}
            />

            <div
              style={{
                height: "14px",
                width: "35%",
                borderRadius: "4px",
                ...shimmerStyle,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Error State ─────────────────────────────────────────────── */
function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: "16px",
        textAlign: "center",
      }}
    >
      <h3
        style={{
          fontFamily: fonts.primary,
          fontSize: "1.6rem",
          fontWeight: 400,
          color: INK,
          margin: 0,
          letterSpacing: "0.04em",
        }}
      >
        Something went wrong
      </h3>

      <p
        style={{
          fontFamily: fonts.secondary,
          fontSize: "0.83rem",
          color: BARK,
          margin: 0,
          maxWidth: "340px",
          lineHeight: 1.6,
        }}
      >
        {message ??
          "Unable to load products. Please check your connection and try again."}
      </p>

      <button
        onClick={onRetry}
        style={{
          marginTop: "8px",
          fontFamily: fonts.secondary,
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          background: INK,
          color: colours.background,
          border: "none",
          borderRadius: "2px",
          padding: "13px 28px",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

const ProductsCollection = ({ categorySlug }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fetchKey, setFetchKey] = useState(0);

  const [filters, setFilters] = useState({
    categories: categorySlug ? [categorySlug] : [],
    concerns: [],
    sort: "newest",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categories: categorySlug ? [categorySlug] : [],
    }));
  }, [categorySlug]);

  useEffect(() => {
    let cancelled = false;

    const loadCollectionData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        if (cancelled) return;

        setProducts(productsData);
        setCategories(categoriesData.filter((category) => category.isActive && category.slug !== "all-products"));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load products.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCollectionData();

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const activeCategory = useMemo(() => {
    if (!categorySlug) return null;

    return (
      categories.find((category) => category.slug === categorySlug) || null
    );
  }, [categories, categorySlug]);

  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (filters.categories.length > 0 && !filters.categories.includes("all-products")) {
      list = list.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    if (filters.concerns.length > 0) {
      list = list.filter((product) =>
        product.concerns.some((concern) =>
          filters.concerns.includes(concern)
        )
      );
    }

    switch (filters.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;

      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;

      case "best-selling":
        list.sort((a, b) => b.reviews - a.reviews);
        break;

      case "newest":
      default:
        list.sort((a, b) => b.id - a.id);
        break;
    }

    return list;
  }, [products, filters]);

  

  return (
    <section
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "0 24px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div className="block md:hidden">
          <MobileFilterDrawer filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "flex-start",
        }}
      >
        <div className="hidden md:block">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* <ActiveChips
            filters={filters}
            setFilters={setFilters}
            categories={categories}
          />*/}

          {loading && <SkeletonGrid />}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => setFetchKey((key) => key + 1)}
            />
          )}

          {!loading && !error && visibleProducts.length > 0 && (
            <ProductGrid products={visibleProducts} />
          )}

          {!loading && !error && visibleProducts.length === 0 && (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: fonts.primary,
                  fontSize: "1.4rem",
                  fontWeight: 400,
                  color: INK,
                  margin: "0 0 8px",
                  letterSpacing: "0.04em",
                }}
              >
                No products found
              </p>

              <p
                style={{
                  fontFamily: fonts.secondary,
                  fontSize: "0.83rem",
                  color: BARK,
                  margin: 0,
                }}
              >
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsCollection;