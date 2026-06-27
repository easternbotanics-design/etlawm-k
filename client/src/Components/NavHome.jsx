import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { fonts } from "../theme/theme";
import BurgerMenu from "./BurgerMenu";

const NavHome = ({
  isHomePage = false,
  isScrolled = false,
  atTop = true,
  isHidden = false,
  translateY = 0,
  isMenuOpen = false,
  onMenuOpen,
}) => {
  const useSolidNavbar = isScrolled && !isHidden;
  const foregroundColor = isHomePage && !useSolidNavbar ? "#ffffff" : "#171717";

  // Only animate the background when going white → transparent (returning to top).
  // Transparent → white (scrolling down) snaps instantly.
  const bgTransition = atTop
    ? "background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease"
    : "none";

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-[100]
        ${useSolidNavbar
          ? "border-b border-black/10 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
          : "border-b border-transparent bg-transparent shadow-none"
        }
        ${isMenuOpen
          ? "pointer-events-none opacity-0"
          : "pointer-events-auto opacity-100"
        }
      `}
      style={{
        transform: `translateY(${translateY}px)`,
        transition: `transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease, ${bgTransition}`,
      }}
    >
      <nav className="grid h-[72px] w-full grid-cols-3 items-center px-5 sm:px-8 lg:px-12">
        <div className="justify-self-start">
          <BurgerMenu
            isOpen={false}
            onToggle={onMenuOpen}
            color={foregroundColor}
          />
        </div>

        <Link
          to="/"
          aria-label="ETLAWM home"
          className="justify-self-center whitespace-nowrap text-[22px] leading-none tracking-[0.085em] hover:opacity-65 sm:text-[27px]"
          style={{
            fontFamily: fonts.logo,
            color: foregroundColor,
            // Colour only transitions when going white → transparent (atTop).
            transition: atTop && isHomePage ? "color 300ms ease, opacity 250ms ease" : "opacity 250ms ease",
          }}
        >
          ETLAWM
        </Link>

        <Link
          aria-label="Search"
          className="flex h-10 w-10 items-center justify-end justify-self-end hover:opacity-60"
          style={{
            color: foregroundColor,
            transition: atTop ? "color 300ms ease, opacity 250ms ease" : "opacity 250ms ease",
          }}
        >
          <Search size={20} strokeWidth={1.25} />
        </Link>
      </nav>
    </header>
  );
};

export default NavHome;