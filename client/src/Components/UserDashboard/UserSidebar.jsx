import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { colours, fonts } from "../../theme/theme";
import { Home, User, MapPin, ShoppingBag, MessageSquare, ArrowRight } from "lucide-react";

const menuItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: (className) => <Home className={className} />,
    end: true
  },
  {
    label: "Profile",
    path: "/dashboard/profile",
    icon: (className) => <User className={className} />,
  },
  {
    label: "Address",
    path: "/dashboard/address",
    icon: (className) => <MapPin className={className} />,
  },
  {
    label: "Orders",
    path: "/dashboard/orders",
    icon: (className) => <ShoppingBag className={className} />,
  },
  {
    label: "Customer Support",
    path: "/dashboard/support",
    icon: (className) => <MessageSquare className={className} />,
  }
];

const SidebarNavLink = ({ to, label, icon, end }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      end={end}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all duration-200 no-underline w-full"
      style={({ isActive }) => ({
        backgroundColor: isActive
          ? colours.accent
          : hovered
            ? colours.surface
            : "transparent",
        color: isActive
          ? colours.background
          : hovered
            ? colours.secondary
            : colours.mutedText,
        fontFamily: fonts.secondary,
      })}
    >
      {({ isActive }) => {
        const foregroundColor = isActive
          ? colours.background
          : hovered
            ? colours.secondary
            : colours.mutedText;

        return (
          <>
            <span
              className="flex shrink-0"
              style={{ color: foregroundColor }}
            >
              {icon("w-5 h-5 transition-colors duration-200")}
            </span>
            <span>{label}</span>
          </>
        );
      }}
    </NavLink>
  );
};

const UserSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const sidebarStyle = {
    backgroundColor: colours.subBackground,
    color: colours.text,
    borderColor: colours.border,
    fontFamily: fonts.secondary,
  };

  const titleStyle = {
    color: colours.secondary,
    fontFamily: fonts.primary,
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <div>
      {/* Desktop sidebar */}
      <aside
        data-lenis-prevent
        className="hidden md:flex w-64 border-r p-6 h-screen sticky top-0 shrink-0 flex-col justify-between"
        style={sidebarStyle}
      >
        <div className="overflow-y-auto flex-1 pr-1 no-scrollbar">
          <h2
            className="text-xl font-bold tracking-wide mb-8 px-4"
            style={titleStyle}
          >
            My Account
          </h2>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <SidebarNavLink
                key={item.path}
                to={item.path}
                end={item.end}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t mt-4 shrink-0" style={{ borderColor: colours.border }}>
          <NavLink
            to="/"
            className="px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-all duration-200 no-underline"
            style={({ isActive }) => ({
              color: colours.mutedText,
              fontFamily: fonts.secondary,
            })}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colours.surface;
              e.currentTarget.style.color = colours.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colours.mutedText;
            }}
          >
            <span>Back to website</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[105] backdrop-blur-xs transition-opacity duration-300 md:hidden"
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-[110] w-64 p-6 flex flex-col justify-between transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={sidebarStyle}
      >
        <div className="overflow-y-auto flex-1 pr-1 no-scrollbar">
          <h2
            className="text-xl font-bold tracking-wide mb-8 px-4"
            style={titleStyle}
          >
            My Account
          </h2>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <SidebarNavLink
                key={item.path}
                to={item.path}
                end={item.end}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t mt-4 shrink-0" style={{ borderColor: colours.border }}>
          <NavLink
            to="/"
            className="px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-all duration-200 no-underline"
            style={{
              color: colours.mutedText,
              fontFamily: fonts.secondary,
            }}
          >
            <span>Back to website</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
