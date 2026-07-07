import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar2.jsx";
import Footer from "../Components/Footer.jsx";
import CategoryCard from "../Components/Collection/CategoryCard.jsx";
import ProductsCollection from "./ProductsCollection.jsx";
import { getProducts } from "../services/productService.js";
import { getCategories } from "../services/categoryService.js";
import { colours, fonts } from "../theme/theme.js";

const INK = colours.text;
const BARK = colours.accent;

/* ─── Breadcrumb ──────────────────────────────────────────────── */
function Breadcrumb({ category }) {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: fonts.secondary,
        fontSize: "0.7rem",
        color: BARK,
        letterSpacing: "0.1em",
        marginBottom: "12px",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: BARK,
          padding: 0,
          fontSize: "inherit",
          letterSpacing: "inherit",
        }}
      >
        Home
      </button>

      <span style={{ opacity: 0.4 }}>›</span>

      <button
        onClick={() => navigate("/collection")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: category ? BARK : INK,
          padding: 0,
          fontSize: "inherit",
          letterSpacing: "inherit",
          fontWeight: category ? 400 : 600,
        }}
      >
        Collection
      </button>

      {category && (
        <>
          <span style={{ opacity: 0.4 }}>›</span>

          <span style={{ color: INK, fontWeight: 600 }}>
            {category.name}
          </span>
        </>
      )}
    </nav>
  );
}

/* ─── Main Collection Page ────────────────────────────────────── */
export default function Collection() {
  const { category: categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    async function fetchCollectionData() {
      setLoading(true);
      setError(null);

      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        if (cancelled) return;

        setProducts(productsData);

        setCategories(
          categoriesData.filter((category) => category.isActive && category.slug !== "all-products")
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load collection.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCollectionData();

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

  const pageTitle = activeCategory
    ? activeCategory.name
    : "Shop Collection";

  const pageSubtitle = activeCategory
    ? activeCategory.description || activeCategory.subtitle
    : "Pure botanical rituals for hair and skin — crafted with Ayurvedic wisdom";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colours.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .collection-category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .collection-category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .collection-category-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <NavBar />

      <main style={{ flex: 1, paddingTop: "100px" }}>
        {/* ── Hero header ─────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "8px 24px 0",
          }}
        >
          <Breadcrumb />

          {/* <div style={{ marginBottom: "12px" }}>
            <h1
              style={{
                fontFamily: fonts.primary,
                fontSize: "clamp(2.4rem, 3vw, 4rem)",
                fontWeight: 300,
                color: INK,
                margin: 0,
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              {pageTitle}
            </h1>
          </div>*/}

          {/* <div
            style={{
              width: "30%",
              height: "1px",
              background: `linear-gradient(to right, ${colours.accent}, transparent)`,
              margin: "20px 0 28px",
            }}
          />*/}
        </section>

        {/* ── Category cards, only on /collection ─────────────────── */}
        {!categorySlug && (
          <section
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              padding: "0 24px 56px",
            }}
          >
            {loading && (
              <p
                style={{
                  fontFamily: fonts.secondary,
                  color: colours.mutedText,
                  fontSize: "0.9rem",
                }}
              >
                Loading categories...
              </p>
            )}

            {error && (
              <p
                style={{
                  fontFamily: fonts.secondary,
                  color: "#A44A3F",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </p>
            )}

            {!loading && !error && categories.length === 0 && (
              <p
                style={{
                  fontFamily: fonts.secondary,
                  color: colours.mutedText,
                  fontSize: "0.9rem",
                }}
              >
                No categories available.
              </p>
            )}

            {!loading && !error && categories.length > 0 && (
              <div className="collection-category-grid">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    slug={category.slug}
                    label={category.name}
                    description={
                      category.description ||
                      category.subtitle ||
                      `Products in ${category.name}`
                    }
                    image={
                      category.image ||
                      category.imageUrl ||
                      "/products/placeholder.png"
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Product grid, only on /collection/:category ─────────── */}
        {categorySlug && (
          <ProductsCollection
            categorySlug={categorySlug}
            activeCategory={activeCategory}
            filters={filters}
            setFilters={setFilters}
            loading={loading}
            error={error}
            setFetchKey={setFetchKey}
            visibleProducts={visibleProducts}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}