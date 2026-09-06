import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";
import ingredientService from "../../services/ingredientService.js";
import { getProductBySlug } from "../../services/productService.js";
import { Leaf, ArrowUpRight } from "lucide-react";

const IngredientSection = ({ slug: propSlug, productId: propProductId, product: propProduct }) => {
  const params = useParams();
  const navigate = useNavigate();
  const currentSlug = propSlug || params.slug;

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadIngredients() {
      setLoading(true);
      try {
        let resolvedProductId = propProductId || propProduct?.id;

        // If no product ID is directly passed, attempt to find product by slug
        if (!resolvedProductId && currentSlug) {
          try {
            const product = await getProductBySlug(currentSlug);
            if (product && product.id) {
              resolvedProductId = product.id;
            }
          } catch (pErr) {
            console.error("Could not fetch product for slug:", pErr);
          }
        }

        let loadedList = [];

        // Fetch product-specific ingredients for this product ID
        if (resolvedProductId) {
          try {
            const res = await ingredientService.getProductIngredients(resolvedProductId);
            if (res && Array.isArray(res.ingredients) && res.ingredients.length > 0) {
              loadedList = res.ingredients;
            }
          } catch (pIngErr) {
            console.warn("Failed to load product-specific ingredients:", pIngErr);
          }
        }

        if (!cancelled) {
          const uniqueList = Array.from(new Map(loadedList.map((i) => [String(i.id), i])).values());
          setIngredients(uniqueList);
        }
      } catch (err) {
        console.error("Error loading ingredients section:", err);
        if (!cancelled) setIngredients([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadIngredients();

    return () => {
      cancelled = true;
    };
  }, [currentSlug, propProductId, propProduct]);

  // If loading is finished and product has no ingredients, do not render the section
  if (!loading && ingredients.length === 0) {
    return null;
  }

  // Build the row structure: chunks of 3 use a 3-column layout (1 box each).
  // The trailing remainder (1 or 2 items) uses a 4-column layout:
  //  - 1 leftover -> centered, spanning the middle 2 of 4 columns
  //  - 2 leftover -> each spans 2 of 4 columns, filling the row edge to edge
  const total = ingredients.length;
  const fullRowsCount = Math.floor(total / 3);
  const leftoverCount = total % 3;

  const rows = [];
  for (let i = 0; i < fullRowsCount; i++) {
    rows.push({
      type: "three",
      items: ingredients.slice(i * 3, i * 3 + 3),
      startIndex: i * 3,
    });
  }
  if (leftoverCount > 0) {
    rows.push({
      type: "four",
      items: ingredients.slice(fullRowsCount * 3),
      startIndex: fullRowsCount * 3,
    });
  }

  const renderIngredientCard = (ingredient, globalIndex, extraClassName = "") => {
    const name = ingredient.name || "Botanical Ingredient";
    const sciName = ingredient.scientific_name || ingredient.scientificName;
    const img = ingredient.image_url || ingredient.imageUrl || ingredient.image;
    const rawDesc = ingredient.para1 || ingredient.description || "";
    const firstPara = rawDesc.split(/\r?\n\r?\n|\r?\n/)[0]?.trim() || "";
    const isHiddenMobile = !isExpanded && globalIndex >= 3;

    return (
      <div
        key={ingredient.id || ingredient._id || globalIndex}
        className={`group flex-row items-start gap-4 sm:gap-5 w-full ${
          isHiddenMobile ? "hidden sm:flex" : "flex"
        } ${extraClassName}`}
      >
        {/* Ingredient Image Circle Frame (Left) */}
        <div
          className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{
            borderColor: colours.border,
            backgroundColor: colours.surface,
          }}
        >
          {img ? (
            <img
              src={img}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement.querySelector(".ingredient-fallback-icon");
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}

          <div
            className="ingredient-fallback-icon flex h-full w-full items-center justify-center"
            style={{ display: img ? "none" : "flex", color: colours.accent }}
          >
            <Leaf size={24} />
          </div>
        </div>

        {/* Ingredient Description and Details (Right) */}
        <div className="flex-1 min-w-0">
          {/* Ingredient Title */}
          <h3
            className="text-base sm:text-lg font-medium leading-snug transition-colors duration-200 group-hover:opacity-80"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            {name}
          </h3>

          {/* Scientific Name (if available) */}
          {sciName && (
            <p
              className="text-xs italic font-light mt-0.5"
              style={{
                color: colours.accent,
                fontFamily: fonts.primary,
              }}
            >
              {sciName}
            </p>
          )}

          {/* Decorative separator line */}
          <div
            className="mt-1.5 mb-2 h-px w-6"
            style={{ backgroundColor: colours.border }}
          />

          {/* Description (1st paragraph only) */}
          {firstPara && (
            <p
              className="text-xs sm:text-sm leading-relaxed"
              style={{
                color: colours.mutedText,
                fontFamily: fonts.secondary,
              }}
            >
              {firstPara}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="px-6 py-16 md:px-12 lg:px-20 md:mx-32 max-w-[1400px]">
      <div
        className="mx-auto max-w-[1260px]"
      >
        {/* Header */}
        <div
          className="mb-16"
        >
          <button
            type="button"
            onClick={() => navigate(currentSlug ? `/ingredient/${currentSlug}` : "/ingredients")}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase transition-opacity hover:opacity-75 cursor-pointer"
            style={{
              color: colours.accent,
              fontFamily: fonts.secondary,
            }}
          >
            <span>KEY INGREDIENTS</span>
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <div
            className="mt-3 mb-6 h-[2px] w-8"
            style={{ backgroundColor: colours.accent }}
          />

          <h2
            className="text-3xl leading-tight md:text-4xl lg:text-[2.75rem] font-normal"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            What&apos;s inside that really matters
          </h2>
        </div>

        {/* Ingredients grid: 3-column layout in full chunks of 3, with a trailing
            4-column row for the last 1 or 2 leftover ingredients */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 items-start">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-row items-start gap-4 animate-pulse w-full"
              >
                <div
                  className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full"
                  style={{ backgroundColor: colours.surface }}
                />
                <div className="flex-1 space-y-2 pt-1">
                  <div
                    className="h-5 w-3/4 rounded"
                    style={{ backgroundColor: colours.surface }}
                  />
                  <div
                    className="h-3 w-1/2 rounded"
                    style={{ backgroundColor: colours.surface }}
                  />
                  <div
                    className="h-3 w-full rounded"
                    style={{ backgroundColor: colours.surface }}
                  />
                  <div
                    className="h-3 w-5/6 rounded"
                    style={{ backgroundColor: colours.surface }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {rows.map((row, rowIdx) => {
              const isThree = row.type === "three";
              const gridColsClass = isThree ? "lg:grid-cols-3" : "lg:grid-cols-4";

              return (
                <div
                  key={rowIdx}
                  className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-x-8 gap-y-12 items-start`}
                >
                  {row.items.map((ingredient, idxInRow) => {
                    const globalIndex = row.startIndex + idxInRow;

                    let extraClassName = "";
                    if (!isThree) {
                      if (row.items.length === 1) {
                        // Single leftover: center it in the middle 2 of 4 columns
                        extraClassName = "sm:col-span-2 lg:col-start-2 lg:col-span-2";
                      } else if (row.items.length === 2) {
                        // Two leftovers: each takes 2 of 4 columns, filling the row
                        extraClassName = "lg:col-span-2";
                      }
                    }

                    return renderIngredientCard(ingredient, globalIndex, extraClassName);
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Show More / Show Less Button */}
        {ingredients.length > 3 && (
          <div className="mt-8 text-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-block text-xs font-medium uppercase tracking-[0.15em] border-b border-dotted pb-0.5 transition-opacity hover:opacity-75"
              style={{
                color: colours.accent,
                borderColor: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default IngredientSection;