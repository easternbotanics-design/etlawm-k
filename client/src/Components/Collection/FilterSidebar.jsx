import { useState, useEffect } from "react";
import { CONCERNS, SORT_OPTIONS } from "../../data/products.js";
import { getCategories } from "../../services/categoryService.js";
import { colours, fonts } from "../../theme/theme.js";
import CustomSelect from "../CustomSelect";

const INK = colours.text;
const BARK = colours.accent;
const CREAM = colours.background;

const SCOPED_CSS = `
  .filter-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border: 1px solid var(--color-border);
    border-radius: 2px;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    position: relative;
    transition: border-color 0.2s, background 0.2s;
  }

  .filter-checkbox:checked {
    background: ${INK};
    border-color: ${INK};
  }

  .filter-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 2px;
    top: -1px;
    width: 9px;
    height: 5px;
    border-left: 1.5px solid ${CREAM};
    border-bottom: 1.5px solid ${CREAM};
    transform: rotate(-45deg) translateY(2px);
  }

  .filter-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C8B77' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px !important;
  }
`;

const SectionLabel = ({ children }) => (
  <p
    style={{
      fontFamily: fonts.secondary,
      fontSize: "0.65rem",
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: BARK,
      margin: "0 0 12px 0",
    }}
  >
    {children}
  </p>
);

const Divider = () => (
  <div
    style={{
      width: "100%",
      height: "1px",
      background: "rgba(199,165,138,0.18)",
      margin: "20px 0",
    }}
  />
);

/**
 * FilterContent — shared filter content used both in the desktop sidebar
 * and the mobile drawer.
 */
export function FilterContent({ filters, setFilters }) {
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoryLoading(true);
        setCategoryError("");

        const data = await getCategories();

        if (cancelled) return;

        setCategories(data.filter((category) => category.isActive));
      } catch (err) {
        if (!cancelled) {
          setCategoryError(err.message || "Failed to load categories");
        }
      } finally {
        if (!cancelled) {
          setCategoryLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key];

      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const clearAll = () => {
    setFilters({
      categories: [],
      concerns: [],
      sort: "newest",
    });
  };

  const hasActive =
    filters.categories.length > 0 ||
    filters.concerns.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontFamily: fonts.primary,
            fontSize: "1.1rem",
            fontWeight: 400,
            color: INK,
            margin: 0,
            letterSpacing: "0.06em",
          }}
        >
          Filters
        </h2>

        {hasActive && (
          <button
            onClick={clearAll}
            style={{
              fontFamily: fonts.secondary,
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: BARK,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <SectionLabel>Sort by</SectionLabel>

      <CustomSelect
        value={filters.sort}
        onChange={(val) =>
          setFilters((prev) => ({
            ...prev,
            sort: val,
          }))
        }
        options={SORT_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
        inputClassName="w-full border bg-transparent py-[9px] px-[12px] text-[0.78rem] outline-none cursor-pointer rounded-[2px]"
        optionClassName="px-[12px] py-[9px] text-[0.78rem]"
        inputStyle={{
          borderColor: "rgba(199,165,138,0.35)",
          color: INK,
        }}
      />

      <Divider />

      {/* Category */}
      <SectionLabel>Category</SectionLabel>

      {categoryLoading && (
        <p
          style={{
            fontFamily: fonts.secondary,
            fontSize: "0.75rem",
            color: BARK,
            margin: 0,
          }}
        >
          Loading categories...
        </p>
      )}

      {categoryError && (
        <p
          style={{
            fontFamily: fonts.secondary,
            fontSize: "0.75rem",
            color: "#A44A3F",
            margin: 0,
          }}
        >
          {categoryError}
        </p>
      )}

      {!categoryLoading && !categoryError && categories.length === 0 && (
        <p
          style={{
            fontFamily: fonts.secondary,
            fontSize: "0.75rem",
            color: BARK,
            margin: 0,
          }}
        >
          No categories found.
        </p>
      )}

      {!categoryLoading &&
        !categoryError &&
        categories.map((category) => (
          <label
            key={category.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={filters.categories.includes(category.slug)}
              onChange={() => toggle("categories", category.slug)}
            />

            <span
              style={{
                fontFamily: fonts.secondary,
                fontSize: "0.78rem",
                color: INK,
                letterSpacing: "0.02em",
              }}
            >
              {category.name}
            </span>
          </label>
        ))}

      <Divider />

      {/* Concerns */}
      <SectionLabel>Concerns</SectionLabel>

      {CONCERNS.map(({ value, label }) => (
        <label
          key={value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.concerns.includes(value)}
            onChange={() => toggle("concerns", value)}
          />

          <span
            style={{
              fontFamily: fonts.secondary,
              fontSize: "0.78rem",
              color: INK,
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * FilterSidebar — desktop sticky left column.
 */
export function FilterSidebar({ filters, setFilters }) {
  return (
    <>
      <style>{SCOPED_CSS}</style>

      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          position: "sticky",
          top: "100px",
          alignSelf: "flex-start",
          background: "var(--color-soft-secondary)",
          border: "1px solid rgba(199,165,138,0.25)",
          borderRadius: "4px",
          padding: "28px 24px",
        }}
      >
        <FilterContent filters={filters} setFilters={setFilters} />
      </aside>
    </>
  );
}

/**
 * MobileFilterDrawer — slide-up panel triggered by a button.
 */
export function MobileFilterDrawer({ filters, setFilters }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <style>{SCOPED_CSS}</style>

      {/* Trigger button */}
      <button
        id="mobile-filter-trigger"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: fonts.secondary,
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: INK,
          background: "var(--color-soft-secondary)",
          border: "1px solid rgba(199,165,138,0.45)",
          borderRadius: "2px",
          padding: "10px 18px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
        </svg>

        Filters

        {(filters.categories.length + filters.concerns.length) > 0 && (
          <span
            style={{
              background: INK,
              color: CREAM,
              borderRadius: "99px",
              fontSize: "0.6rem",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {filters.categories.length + filters.concerns.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 290,
          background: "rgba(20,14,8,0.45)",
          backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          background: CREAM,
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 40px",
          maxHeight: "85vh",
          overflowY: "auto",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.42s cubic-bezier(0.25, 0.5, 0.25, 1)",
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: "36px",
            height: "3px",
            background: "rgba(199,165,138,0.4)",
            borderRadius: "99px",
            margin: "0 auto 24px",
          }}
        />

        <FilterContent filters={filters} setFilters={setFilters} />

        {/* Apply button */}
        <button
          onClick={() => setOpen(false)}
          style={{
            marginTop: "24px",
            width: "100%",
            fontFamily: fonts.secondary,
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            background: INK,
            color: CREAM,
            border: "none",
            borderRadius: "2px",
            padding: "16px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Apply Filters
        </button>
      </div>
    </>
  );
}