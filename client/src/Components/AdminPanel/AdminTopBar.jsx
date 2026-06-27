import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { colours, fonts } from "../../theme/theme.js";

const SCOPED_CSS = `
  .topbar-link:hover {
    background-color: ${colours.primary} !important;
    color: ${colours.accent} !important;
  }
  .topbar-logout:hover {
    background-color: ${colours.primary} !important;
    color: ${colours.accent} !important;
  }
`;

const AdminTopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
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

  // Close dropdown when route changes
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const firstName = user?.first_name || "Admin";
  const lastName = user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();

  // Dynamic breadcrumb generation
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const section = pathSegments[1]
    ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1).replace("-", " ")
    : "Overview";
  const subSection = pathSegments[2]
    ? ` / ${pathSegments[2].charAt(0).toUpperCase() + pathSegments[2].slice(1).replace("-", " ")}`
    : "";

  return (
    <div>
      <style>{SCOPED_CSS}</style>
      <header
        style={{
          fontFamily: fonts.secondary,
          backgroundColor: colours.subBackground,
          borderColor: colours.border,
          color: colours.text,
        }}
        className="border rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm animate-in fade-in duration-200"
      >
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span style={{ color: colours.mutedText }} className="text-[11px] font-semibold uppercase tracking-widest">
            Console
          </span>
          <span style={{ color: colours.border }} className="text-[11px]">•</span>
          <span style={{ color: colours.accent }} className="text-[11px] font-semibold uppercase tracking-widest">
            {section}{subSection}
          </span>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={() => setProfileHovered(true)}
            onMouseLeave={() => setProfileHovered(false)}
            style={{
              color: colours.text,
              backgroundColor: profileHovered
                ? colours.primary
                : "transparent",
              borderColor: colours.border,
            }}
            className="flex items-center gap-3 p-1 rounded-full transition-colors focus:outline-hidden cursor-pointer border-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar with Initials */}
            <div
              style={{
                background: `linear-gradient(135deg, ${colours.secondary}, ${colours.accent})`,
                color: colours.background,
                borderColor: colours.border,
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs border"
            >
              {initials}
            </div>
            {/* Name & Dropdown Arrow (Desktop only) */}
            <div className="hidden sm:flex flex-col items-start pr-1">
              <span style={{ color: colours.text }} className="text-xs font-bold tracking-wide leading-tight">
                {fullName}
              </span>
              <span style={{ color: colours.mutedText }} className="text-[10px] tracking-wider uppercase font-semibold">
                Store Owner
              </span>
            </div>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 hidden sm:block ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              style={{ color: dropdownOpen ? colours.accent : colours.mutedText }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                backgroundColor: colours.background,
                borderColor: colours.border,
              }}
              className="absolute right-0 mt-2.5 w-56 border rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div style={{ borderBottomColor: colours.border }} className="px-4 py-2 border-b mb-1">
                <p style={{ color: colours.mutedText }} className="text-[11px] font-semibold uppercase tracking-widest m-0">
                  Account
                </p>
                <p style={{ color: colours.text }} className="text-xs font-bold truncate mt-0.5 mb-0">{fullName}</p>
                <p style={{ color: colours.mutedText }} className="text-[11px] truncate m-0 mt-0.5">{user?.phone_number || user?.email}</p>
              </div>

              {/* Profile Link */}
              <Link
                to="/admin/profile"
                style={{ color: colours.text }}
                className="topbar-link flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors no-underline"
              >
                <svg
                  style={{ color: colours.mutedText }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                Profile Settings
              </Link>

              {/* Settings Link */}
              <Link
                to="/admin/settings"
                style={{ color: colours.text }}
                className="topbar-link flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors no-underline"
              >
                <svg
                  style={{ color: colours.mutedText }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Console Settings
              </Link>

              <div style={{ borderTopColor: colours.border }} className="border-t my-1"></div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{ color: colours.accent }}
                className="topbar-logout w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold transition-colors text-left cursor-pointer border-none bg-transparent"
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: colours.accent }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default AdminTopBar;
