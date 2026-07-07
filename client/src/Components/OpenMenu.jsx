import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/cartService";
import { colours, fonts } from "../theme/theme";
import { getCategories } from "../services/categoryService";

const menuLinks = [
  {
    label: "Ritual",
    href: "/ritual",
  },
  {
    label: "Science",
    href: "/science",
  },
  {
    label: "Ingredients",
    href: "/ingredients",
  },
  {
    label: "Collection",
    href: "/collection",
    panel: "collection",
  },
];

const secondaryLinks = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const normalizeCategories = (data) => {
  const list = Array.isArray(data)
    ? data
    : data?.categories || data?.data || [];

  const filtered = list.filter((category) => {
    if (!category) return false;

    const activeValue = category.isActive ?? category.is_active;

    return activeValue === undefined ? true : Boolean(activeValue);
  });

  return filtered.sort((a, b) => {
    if (a.slug === "all-products") return -1;
    if (b.slug === "all-products") return 1;
    return (a.name || "").localeCompare(b.name || "");
  });
};

const getCategoryImage = (category) => {
  return (
    category.imageUrl ||
    category.image_url ||
    category.image ||
    category.thumbnail ||
    "/images/menu/category-placeholder.jpg"
  );
};

const OpenMenu = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [activePanel, setActivePanel] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const isCollectionOpen = activePanel === "collection";

  const accountHref = user
    ? isAdmin
      ? "/admin/dashboard"
      : "/dashboard"
    : "/login";

  const accountLabel = user
    ? isAdmin
      ? "Admin panel"
      : "Dashboard"
    : "Join";

  useEffect(() => {
    if (!isOpen) {
      setActivePanel(null);
      return undefined;
    }

    const loadCartCount = async () => {
      try {
        const cart = await getCart();

        const totalQuantity = (cart?.items ?? []).reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );

        setCartCount(totalQuantity);
      } catch (error) {
        console.error("Unable to load cart count:", error);
        setCartCount(0);
      }
    };

    loadCartCount();

    window.addEventListener("cart-updated", loadCartCount);

    return () => {
      window.removeEventListener("cart-updated", loadCartCount);
    };
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isCollectionOpen) return undefined;

    let ignore = false;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const data = await getCategories();

        if (!ignore) {
          setCategories(normalizeCategories(data));
        }
      } catch (error) {
        console.error("Unable to load categories:", error);

        if (!ignore) {
          setCategories([]);
          setCategoriesError("Unable to load categories.");
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, [isOpen, isCollectionOpen]);

  const handleClose = () => {
    setActivePanel(null);
    onClose();
  };

  const togglePanel = (panelName) => {
    setActivePanel((currentPanel) =>
      currentPanel === panelName ? null : panelName,
    );
  };

  const visibleCategories = categories.slice(0, 4);

  return (
    <div
      className={`
        fixed inset-0 z-[200]
        transition-[visibility] duration-[650ms]
        ${isOpen ? "visible" : "invisible"}
      `}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={handleClose}
        className={`
          absolute inset-0 h-full w-full
          bg-black/35 backdrop-blur-[10px]
          transition-opacity duration-[650ms]
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          absolute bottom-2 left-2 top-2
          flex overflow-hidden rounded-lg bg-[#f4f1ea]
          shadow-[32px_0_80px_rgba(0,0,0,0.18)]
          transition-[width,transform,opacity]
          duration-[700ms]
          ease-[cubic-bezier(0.22,1,0.36,1)]
          will-change-[width,transform]
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-[calc(100%+0.5rem)] opacity-0"}
        `}
        style={{
          width: isCollectionOpen
            ? "min(980px, calc(100vw - 1rem))"
            : "min(430px, calc(100vw - 1rem))",
        }}
      >
        <div className="flex h-full w-full">
          <div className="flex h-full w-full shrink-0 flex-col bg-[#f4f1ea] md:w-[390px]">
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-black/10 px-5 sm:px-8">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close navigation menu"
                className="-ml-2 flex h-11 items-center gap-3 text-[#171717] transition-opacity duration-300 hover:opacity-55"
                style={{
                  fontFamily: fonts.primary,
                }}
              >
                <X size={22} strokeWidth={1.25} />
                <span className="text-sm">Close</span>
              </button>

              <Link
                to="/cart"
                onClick={handleClose}
                aria-label="Open cart"
                className="relative flex h-11 w-11 items-center justify-center text-[#171717] transition-opacity duration-300 hover:opacity-55"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1000 1000"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M126.2 134c-10.7 2.2-20 10.5-24.2 21.7-5.9 15.5 2.2 34.4 17.8 41.6 4.5 2.1 6.1 2.2 45.9 2.5l41.1.3.6 2.2c.3 1.3 21.3 91.2 46.6 199.8 25.3 108.5 47.1 201 48.5 205.4 3.1 10.2 9.1 22.5 16.2 33.4 6.9 10.7 24.9 28.8 35.7 36.1 10.4 6.9 25.9 14.3 37.1 17.5 19.3 5.6 16.4 5.5 166 5.5 83.2-.1 141-.4 145.5-1 55-7.1 98.9-46.6 112.9-101.5.6-2.2 10.7-60.7 22.6-129.9 22.9-134.2 23.1-135.9 20-149.6-4.3-18.3-18.3-36-34.8-44-15.6-7.5 6.4-7-277.4-7-242.1 0-255.2-.1-255.7-1.8-.3-.9-6.1-25.9-13-55.4-8.2-35.2-13.3-55.3-15-58.5-3.3-6.4-8.8-11.6-16.1-15l-6-2.8-55-.2c-30.2 0-56.9.3-59.3.7m667.3 201.2c-.3 1.3-9.5 55.2-20.5 119.8s-20.7 120.9-21.6 125c-4.2 19.9-17.6 37.3-35.7 46.3-14.5 7.1-5.1 6.7-157.3 6.7-133.7 0-137.1-.1-145.3-2-19.1-4.6-34.8-17.5-43.7-35.7-3-6.2-7.9-25.8-33-133.5C320.2 392.4 307 335 307 334.3c0-1.1 44.5-1.3 243.5-1.3H794zM358 733.6c-26.6 4.8-46.7 21.7-54.7 45.8-2.3 7-2.7 9.7-2.7 20.6s.4 13.6 2.7 20.6c5.4 16.2 17.1 30 32.4 38.1 20.1 10.7 45 10.2 64.4-1.4 22.3-13.2 34-35.2 32.6-61.2-.6-11.6-2.6-18.8-8-28.4-11.5-20.6-31.8-33.2-55.1-34.2-5-.2-10.2-.2-11.6.1m364.8.4c-25 4.5-44.3 21.2-52.9 45.7-3 8.4-3.7 24.7-1.5 34.7 6.8 30.5 33.2 51.7 64.6 51.8 12.1.1 21.2-2.1 31.3-7.5 15.3-8.1 27-21.9 32.4-38.1 2.3-7 2.7-9.7 2.7-20.6s-.4-13.6-2.7-20.6c-5.6-16.9-19.4-32.6-34.7-39.6-12.1-5.5-28.1-7.9-39.2-5.8" />
                </svg>

                {cartCount > 0 && (
                  <span
                    className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] leading-none text-white"
                    style={{
                      fontFamily: fonts.secondary,
                    }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-10 sm:px-10 sm:pt-12">
              <nav>
                <ul className="space-y-1">
                  {menuLinks.map((item, index) => (
                    <li
                      key={item.href}
                      className={`
                        transition-all duration-[650ms]
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        ${
                          isOpen
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-5 opacity-0"
                        }
                      `}
                      style={{
                        transitionDelay: isOpen
                          ? `${120 + index * 65}ms`
                          : "0ms",
                      }}
                    >
                      {item.panel ? (
                        <>
                          <button
                            type="button"
                            onClick={() => togglePanel(item.panel)}
                            className={`
                              group flex w-full items-center justify-between py-2 text-left
                              text-[22px] leading-none tracking-[-0.04em]
                              text-[#171717] transition-opacity duration-300
                              hover:opacity-55 sm:text-[26px]
                              ${isCollectionOpen ? "opacity-55" : "opacity-100"}
                            `}
                            style={{
                              fontFamily: fonts.primary,
                            }}
                          >
                            <span>{item.label}</span>

                            <ArrowRight
                              size={20}
                              strokeWidth={1.1}
                              className={`
                                transition-all duration-300
                                ${
                                  isCollectionOpen
                                    ? "translate-x-0 opacity-100"
                                    : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                }
                              `}
                            />
                          </button>

                          <div
                            className={`
                              grid overflow-hidden md:hidden
                              transition-[grid-template-rows,opacity]
                              duration-[600ms]
                              ease-[cubic-bezier(0.22,1,0.36,1)]
                              ${
                                isCollectionOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0"
                              }
                            `}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <div className="grid grid-cols-2 gap-2 pb-4 pt-3">
                                {categoriesLoading ? (
                                  Array.from({ length: 4 }).map((_, cardIndex) => (
                                    <div
                                      key={cardIndex}
                                      className="aspect-[4/5] rounded-md bg-black/10"
                                    />
                                  ))
                                ) : categoriesError ? (
                                  <div
                                    className="col-span-2 py-6 text-sm text-black/55"
                                    style={{
                                      fontFamily: fonts.primary,
                                    }}
                                  >
                                    {categoriesError}
                                  </div>
                                ) : visibleCategories.length === 0 ? (
                                  <div
                                    className="col-span-2 py-6 text-sm text-black/55"
                                    style={{
                                      fontFamily: fonts.primary,
                                    }}
                                  >
                                    No categories found.
                                  </div>
                                ) : (
                                  visibleCategories.map((category) => {
                                    const title = category.name || "Collection";
                                    const slug = category.slug || category.id;
                                    const image = getCategoryImage(category);

                                    return (
                                      <Link
                                        key={category.id ?? category.slug ?? title}
                                        to={slug ? `/collection/${slug}` : "/collection"}
                                        onClick={handleClose}
                                        className="group relative aspect-[4/5] overflow-hidden rounded-md bg-black"
                                      >
                                        <img
                                          src={image}
                                          alt={title}
                                          className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-4 pt-12">
                                          <p
                                            className="text-center text-[13px] text-white underline underline-offset-2"
                                            style={{
                                              fontFamily: fonts.primary,
                                            }}
                                          >
                                            {title}
                                          </p>
                                        </div>
                                      </Link>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={handleClose}
                          className="group flex items-center justify-between py-2 text-[22px] leading-none tracking-[-0.04em] text-[#171717] transition-opacity duration-300 hover:opacity-55 sm:text-[26px]"
                          style={{
                            fontFamily: fonts.primary,
                          }}
                        >
                          <span>{item.label}</span>

                          <ArrowUpRight
                            size={20}
                            strokeWidth={1.1}
                            className="translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                          />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto border-t border-black/10 pt-6">
                <Link
                  to={accountHref}
                  onClick={handleClose}
                  className="group flex items-center gap-4"
                  style={{
                    fontFamily: fonts.primary,
                  }}
                >
                  <span
                    className="flex h-14 items-center px-5 text-xl transition-opacity duration-300 group-hover:opacity-75"
                    style={{
                      backgroundColor: colours.primary,
                      fontFamily: fonts.primary,
                    }}
                  >
                    {accountLabel}
                  </span>

                  <ArrowRight
                    size={21}
                    strokeWidth={1.1}
                    className="translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </Link>

                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {secondaryLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={handleClose}
                        className="text-[12px] uppercase tracking-[0.08em] text-black/55 transition-colors duration-300 hover:text-black"
                        style={{
                          fontFamily: fonts.primary,
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div
            aria-hidden={!isCollectionOpen}
            className={`
              hidden h-full shrink-0 overflow-hidden bg-[#f7f4ee]
              transition-[width,opacity,transform]
              duration-[700ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]
              will-change-[width,transform]
              md:block
              ${
                isCollectionOpen
                  ? "w-[590px] translate-x-0 border-l border-black/10 opacity-100"
                  : "w-0 translate-x-[-18px] border-l-0 opacity-0"
              }
            `}
          >
            <div
              className={`
                h-full w-[590px] p-2
                transition-transform duration-[700ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${
                  isCollectionOpen
                    ? "translate-x-0"
                    : "-translate-x-8"
                }
              `}
            >
              <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
                {categoriesLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-full min-h-0 rounded-md bg-black/10"
                    />
                  ))
                ) : categoriesError ? (
                  <div
                    className="col-span-2 row-span-2 flex h-full items-center justify-center px-6 text-center text-sm text-black/55"
                    style={{
                      fontFamily: fonts.primary,
                    }}
                  >
                    {categoriesError}
                  </div>
                ) : visibleCategories.length === 0 ? (
                  <div
                    className="col-span-2 row-span-2 flex h-full items-center justify-center px-6 text-center text-sm text-black/55"
                    style={{
                      fontFamily: fonts.primary,
                    }}
                  >
                    No categories found.
                  </div>
                ) : (
                  visibleCategories.map((category, index) => {
                    const title = category.name || "Collection";
                    const slug = category.slug || category.id;
                    const image = getCategoryImage(category);

                    return (
                      <Link
                        key={category.id ?? category.slug ?? title}
                        to={slug ? `/collection/${slug}` : "/collection"}
                        onClick={handleClose}
                        className={`
                          group relative h-full min-h-0 overflow-hidden rounded-md bg-black
                          transition-[opacity,transform,filter]
                          duration-[700ms]
                          ease-[cubic-bezier(0.22,1,0.36,1)]
                          ${
                            isCollectionOpen
                              ? "translate-x-0 scale-100 opacity-100 blur-2"
                              : "translate-x-8 scale-[0.97] opacity-0 blur-sm"
                          }
                        `}
                        style={{
                          transitionDelay: isCollectionOpen
                            ? `${180 + index * 75}ms`
                            : "0ms",
                        }}
                      >
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover opacity-85 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/0" />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-5 pt-20">
                          <p
                            className="text-center text-[15px] text-white underline underline-offset-2"
                            style={{
                              fontFamily: fonts.primary,
                            }}
                          >
                            {title}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default OpenMenu;