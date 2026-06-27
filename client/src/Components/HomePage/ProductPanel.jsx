import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import CollectionProductCard from "../Collection/CollectionProductCard2.jsx";
import { getProducts } from "../../services/productService.js";
import { colours, fonts } from "../../theme/theme.js";

const normalizeProduct = (product) => {
  const image =
    product.image ||
    product.imageUrl ||
    product.image_url ||
    product.primary_image ||
    product.primaryImage ||
    product.thumbnail ||
    product.images?.[0]?.image_url ||
    product.images?.[0]?.imageUrl ||
    product.images?.[0]?.url ||
    product.images?.[0] ||
    "/products/placeholder.png";

  return {
    ...product,
    id: product.id,
    name: product.name || "Untitled Product",
    slug: product.slug || String(product.id),
    image,
    price: Number(product.price || 0),
    originalPrice:
      product.originalPrice ||
      product.original_price ||
      product.mrp ||
      product.compare_at_price ||
      null,
    category: product.category || product.category_slug || product.categorySlug,
    concerns: Array.isArray(product.concerns) ? product.concerns : [],
  };
};

const ProductPanelSketch = () => {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden overflow-hidden lg:block">
      <svg
        viewBox="0 0 1440 240"
        className="h-[190px] w-full opacity-50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 186C135 158 245 143 386 163C538 185 628 226 789 205C965 182 1048 113 1224 119C1315 122 1384 147 1440 174V240H0V186Z"
          fill="#EFE7D8"
        />

        <path
          d="M0 191C136 162 249 153 391 170C546 189 629 228 785 211C956 192 1046 126 1219 128C1312 129 1384 153 1440 181"
          stroke="#171715"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="4 8"
        />

        <path
          d="M58 197C111 166 157 163 213 178C272 194 303 229 368 219C449 207 464 148 546 151C617 154 651 205 724 206C807 207 843 154 927 146C1028 137 1072 205 1175 185C1287 163 1328 116 1440 158"
          stroke="#171715"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M126 189V112M126 112L88 183M126 112L165 183M126 140L100 188M126 140L153 188"
          stroke="#171715"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <path
          d="M1300 166V78M1300 78L1260 158M1300 78L1342 158M1300 110L1272 164M1300 110L1329 164"
          stroke="#171715"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <path
          d="M748 93C767 68 797 58 823 66C852 75 867 105 854 132C841 159 803 164 778 144C756 127 733 117 748 93Z"
          fill="#C94131"
          stroke="#171715"
          strokeWidth="2"
        />

        <path
          d="M800 144C797 166 794 188 793 216"
          stroke="#171715"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

const ProductPanel = ({ limit = 4 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHomeProducts() {
      setLoading(true);
      setError(null);

      try {
        const productsData = await getProducts();

        if (cancelled) return;

        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load products.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHomeProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return [...products]
      .map(normalizeProduct)
      .filter((product) => {
        const isActive =
          product.is_active !== false &&
          product.isActive !== false &&
          product.status !== "archive" &&
          product.status !== "archived";

        return isActive && product.name && product.slug && product.image;
      })
      .sort((a, b) => {
        const aIsNew = a.is_new || a.isNew ? 1 : 0;
        const bIsNew = b.is_new || b.isNew ? 1 : 0;

        if (aIsNew !== bIsNew) return bIsNew - aIsNew;

        return Number(b.id || 0) - Number(a.id || 0);
      })
      .slice(0, limit);
  }, [products, limit]);

  return (
    <section
      className="relative overflow-hidden px-5 py-24 md:px-10 lg:px-16"
      style={{
        background: colours.primary,
        color: colours.text,
      }}
    >

      <div className="relative z-10 mx-auto max-w-7xl">
        

        <div className="mb-7 flex items-center justify-between gap-5">
          <p
            className="text-xs font-semibold uppercase tracking-[0.26em]"
            style={{
              color: colours.accent,
              fontFamily: fonts.secondary,
            }}
          >
            {loading
              ? "Loading products"
              : error
              ? "Products unavailable"
              : `From the shelf`}
          </p>

          <div className="hidden h-px flex-1 bg-[#171715]/15 sm:block" />

          <Link
            to="/collection"
            className="text-xs font-semibold uppercase tracking-[0.2em] underline-offset-4 hover:underline"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div
                  className="aspect-[2/3] animate-pulse rounded-2xl"
                  style={{
                    background: colours.surface,
                  }}
                />
                <div className="mx-auto h-4 w-2/3 animate-pulse rounded-full bg-[#171715]/10" />
                <div className="mx-auto h-3 w-1/3 animate-pulse rounded-full bg-[#171715]/10" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-2xl border px-6 py-10 text-center"
            style={{
              borderColor: colours.border,
              background: colours.background,
            }}
          >
            <p
              className="text-sm"
              style={{
                color: colours.mutedText,
                fontFamily: fonts.secondary,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {!loading && !error && visibleProducts.length === 0 && (
          <div
            className="rounded-2xl border px-6 py-10 text-center"
            style={{
              borderColor: colours.border,
              background: colours.background,
            }}
          >
            <p
              className="text-sm"
              style={{
                color: colours.mutedText,
                fontFamily: fonts.secondary,
              }}
            >
              No products available yet.
            </p>
          </div>
        )}

        {!loading && !error && visibleProducts.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <CollectionProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductPanel;