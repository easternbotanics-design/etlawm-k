import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { colours, fonts } from "../../theme/theme.js";
import { ShoppingCart, LogOut, ChevronDown, Menu } from "lucide-react";

const UserTopBar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const firstName = user?.first_name || "Member";
  const lastName = user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase() || "M";

  return (
    <header
      style={{
        fontFamily: fonts.secondary,
        backgroundColor: colours.subBackground,
        borderColor: colours.border,
        color: colours.text,
      }}
      className="border rounded-2xl px-6 py-3 flex items-center justify-between shadow-xs sticky top-4 z-45"
    >
      {/* Left side: Hamburger menu for mobile & Brand link */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1 bg-transparent border-none cursor-pointer flex items-center justify-center text-stone-700 hover:text-stone-900 focus:outline-hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link
          to="/dashboard"
          className="text-lg font-bold tracking-widest no-underline"
          style={{ fontFamily: fonts.logo, color: colours.secondary }}
        >
          ETLAWM
        </Link>
      </div>

      {/* Right side: Shop Cart Link & User settings dropdown */}
      <div className="flex items-center gap-5">
        {/* Shopping Cart button */}
        <Link
          to="/cart"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200 no-underline"
          style={{
            color: colours.mutedText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colours.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colours.mutedText;
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={() => setProfileHovered(true)}
            onMouseLeave={() => setProfileHovered(false)}
            style={{
              color: colours.text,
              backgroundColor: profileHovered ? colours.primary : "transparent",
              borderColor: colours.border,
            }}
            className="flex items-center gap-3 p-1 rounded-full transition-colors focus:outline-hidden cursor-pointer border-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* Initials Avatar */}
            <div
              style={{
                background: `linear-gradient(135deg, ${colours.secondary}, ${colours.accent})`,
                color: colours.background,
                borderColor: colours.border,
              }}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-bold shadow-xs border"
            >
              {initials}
            </div>

            {/* Name & subtitle */}
            <div className="hidden sm:flex flex-col items-start pr-1 text-left">
              <span style={{ color: colours.text }} className="text-xs font-bold tracking-wide leading-tight">
                {fullName}
              </span>
              <span style={{ color: colours.mutedText }} className="text-[10px] tracking-wider uppercase font-semibold">
                Customer
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 hidden sm:block ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              style={{ color: colours.mutedText }}
            />
          </button>

          {/* Dropdown Menu - only containing Logout */}
          {dropdownOpen && (
            <div
              style={{
                backgroundColor: colours.background,
                borderColor: colours.border,
              }}
              className="absolute right-0 mt-2 w-48 border rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <button
                onClick={handleLogout}
                style={{ color: colours.accent }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-stone-100 transition-colors text-left cursor-pointer border-none bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserTopBar;
