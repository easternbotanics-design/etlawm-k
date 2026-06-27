import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../Components/NavBar2.jsx";
import Footer from "../Components/Footer.jsx";
import { getProductBySlug } from "../services/productService.js";
import { colours, fonts } from "../theme/theme.js";
import ProductImageGallery from "../Components/ProductsPage/ProductImageGallery.jsx";
import ProductPurchasePanel from "../Components/ProductsPage/ProductPurchasePanel.jsx";
import ProductDetailsSection from "../Components/ProductsPage/ProductDetailsSection.jsx";
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_SERVER_API;

function getField(product, camelKey, snakeKey, fallback = "") {
  return product?.[camelKey] ?? product?.[snakeKey] ?? fallback;
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProductSkeleton() {
  return (
    <section className="mx-auto grid max-w-[1260px] gap-9 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="h-[75vh] animate-pulse rounded-[22px]" style={{ backgroundColor: colours.primary }} />
      <div className="h-[520px] animate-pulse rounded-[22px]" style={{ backgroundColor: colours.primary }} />
    </section>
  );
}

function MessageState({ title, message, navigate }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <h1
        className="text-4xl font-normal"
        style={{ color: colours.text, fontFamily: fonts.primary }}
      >
        {title}
      </h1>
      <p
        className="max-w-md text-sm leading-6"
        style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={() => navigate("/collection")}
        className="rounded-full px-8 py-4 text-xs uppercase tracking-[0.2em]"
        style={{
          backgroundColor: colours.text,
          color: colours.background,
          fontFamily: fonts.secondary,
        }}
      >
        Browse collection
      </button>
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((q) => q + 1);
  const decrease = () => setQuantity((q) => Math.max(1, q - 1));

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setProduct(null);
      setImages([]);
      setQuantity(1);

      try {
        const found = await getProductBySlug(slug);
        if (cancelled) return;

        if (!found) {
          setNotFound(true);
          return;
        }

        setProduct(found);

        const seoTitle = getField(found, "seoTitle", "seo_title", found.name);
        const seoDescription = getField(
          found,
          "seoDescription",
          "seo_description",
          found.description,
        );

        if (seoTitle) document.title = seoTitle;
        if (seoDescription) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
          }
          meta.setAttribute("content", seoDescription);
        }

        try {
          const response = await fetch(`${API}/api/product/${found.id}/images`);
          if (response.ok) {
            const data = await response.json();
            const sortedImages = (data.images ?? []).sort(
              (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
            );
            if (!cancelled) setImages(sortedImages);
          }
        } catch (imageError) {
          console.error("Failed to load product images", imageError);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colours.background }}>
        <NavBar />
        <main className="pt-24">
          <ProductSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colours.background }}>
        <NavBar />
        <main className="pt-24">
          <MessageState title="Unable to load product" message={error} navigate={navigate} />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colours.background }}>
        <NavBar />
        <main className="pt-24">
          <MessageState
            title="Product not found"
            message="This product does not exist or may have been removed."
            navigate={navigate}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const category =
    product.categoryName ||
    product.category_name ||
    product.category ||
    product.subtitle ||
    "Product";

  const price = Number(product.price || 0);
  const originalPrice = Number(
    getField(product, "originalPrice", "original_price", 0),
  );
  const discountValue = Number(
    getField(product, "discountValue", "discount_value", 0),
  );
  const discountType = getField(product, "discountType", "discount_type", "");
  const stockQty = Number(getField(product, "stockQty", "stock_qty", 0));
  const sizeValue = getField(product, "sizeValue", "size_value", "");
  const sizeUnit = getField(product, "sizeUnit", "size_unit", "");
  const status = getField(
    product,
    "status",
    "status",
    product.isActive === false || product.is_active === false ? "archived" : "active",
  );

  const description = product.description || "No product description available.";
  const ingredients = getField(product, "ingredients", "ingredients", "");
  const usageInstructions = getField(
    product,
    "usageInstructions",
    "usage_instructions",
    "",
  );
  const benefits = normalizeList(getField(product, "benefits", "benefits", []));
  const concerns = normalizeList(product.concerns);
  const productSize = sizeValue && sizeUnit ? `${sizeValue} ${sizeUnit}` : "";
  const code = getField(product, "code", "code", "");

  const discountPercentage =
    originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null;

  const discountLabel =
    discountValue > 0
      ? discountType === "percentage"
        ? `${discountValue}% off`
        : `₹${discountValue} off`
      : discountPercentage
        ? `${discountPercentage}% off`
        : null;

  const isUnavailable =
    status === "out_of_stock" ||
    status === "archived" ||
    status === "draft" ||
    stockQty <= 0;

  function handleAddToCart() {
    if (isUnavailable || added) return;
    setAdded(true);
    setQuantity(1);
    window.setTimeout(() => setAdded(false), 2500);
  }

  const categorySlug = product.category;
  const isUncategorized = !categorySlug || categorySlug === "uncategorized";
  const backPath = isUncategorized ? "/collection" : `/collection/${categorySlug}`;
  const categoryName = isUncategorized
    ? "Collection"
    : (product.subtitle || product.categoryName || product.category_name || "Products");

  return (
    <div className="min-h-screen" style={{ backgroundColor: colours.background }}>
      <NavBar />

      <main className="pt-24">
        {/* Back Button */}
        <div className="mx-auto max-w-[1260px] px-6 pt-6 pb-2">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="group flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.2em] cursor-pointer"
            style={{
              color: colours.accent,
              fontFamily: fonts.secondary,
              transition: "color 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colours.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colours.accent;
            }}
          >
            <ArrowLeft 
              size={14} 
              className="transition-transform group-hover:-translate-x-1" 
              style={{ strokeWidth: 2 }}
            />
            <span>Back to {categoryName}</span>
          </button>
        </div>

        <nav
          className="mx-auto flex max-w-[1260px] items-center gap-2 overflow-hidden px-6 pt-2 pb-6 text-xs"
          style={{ color: colours.accent, fontFamily: fonts.secondary }}
        >
          <button type="button" onClick={() => navigate("/")}>Home</button>
          <span>/</span>
          <button type="button" onClick={() => navigate("/collection")}>Collection</button>
          <span>/</span>
          <span className="truncate font-semibold" style={{ color: colours.text }}>
            {product.name}
          </span>
        </nav>

        <section className="mx-auto grid max-w-[1260px] items-start gap-9 px-6 pb-24 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductImageGallery
            name={product.name}
            badge={product.badge}
            images={images}
            fallbackImage={product.image}
          />

          <ProductPurchasePanel
            product={product}
            category={category}
            description={description}
            price={price}
            originalPrice={originalPrice}
            discountLabel={discountLabel}
            productSize={productSize}
            quantity={quantity}
            increase={increase}
            decrease={decrease}
            onAddToCart={handleAddToCart}
            added={added}
            isUnavailable={isUnavailable}
          />
        </section>

        <ProductDetailsSection
          description={description}
          ingredients={ingredients}
          benefits={benefits}
          usageInstructions={usageInstructions}
          concerns={concerns}
          productSize={productSize}
          code={code}
        />
      </main>

      <Footer />
    </div>
  );
}