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
    label: "Home",
    href: "/",
  },
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

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
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
            <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-black/10 px-5 sm:px-8">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close navigation menu"
                className="-ml-2 flex h-11 items-center gap-3 text-[#171717] transition-opacity duration-300 hover:opacity-55"
                style={{
                  fontFamily: fonts.primary,
                }}
              >
                <X size={24} strokeWidth={1.5} />
                <span className="text-md">Close</span>
              </button>
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

              <div className="mt-auto pt-6">
                

                
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