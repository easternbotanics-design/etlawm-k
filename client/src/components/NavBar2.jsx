import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { colours, fonts } from '../theme/theme';
import OpenMenu from './OpenMenu';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Collection', path: '/collection' },
  { name: 'Ritual', path: '/ritual' },
  { name: 'Science', path: '/science' },
  { name: 'Ingredients', path: '/ingredients' },
  // { name: 'Scrap', path: '/scrap' },
];

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 md:top-4 left-0 right-0 z-50 w-full bg-white/75 backdrop-blur-md border-b border-[#D8D2C8]/60 transition-all duration-300"
        style={{
          color: colours.text
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-[#171715] hover:text-[#A77C6B] hover:bg-black/5 focus:outline-none transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <Menu size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 md:flex-none text-center md:text-left">
              <Link
                to="/"
                className="text-2xl sm:text-3xl tracking-widest text-[#171715] hover:opacity-80 transition-opacity font-normal inline-block"
                style={{ fontFamily: fonts.logo || 'sans-serif' }}
              >
                ETLAWM
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm tracking-wider uppercase transition-colors relative py-1 ${isActive
                        ? 'text-[#A77C6B] font-medium'
                        : 'text-[#171715] hover:text-[#A77C6B]'
                      }`}
                    style={{ fontFamily: fonts.secondary || 'sans-serif' }}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#A77C6B] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-4">
              

              <Link
                to="/login"
                className="p-2 text-[#171715] hover:text-[#A77C6B] transition-colors rounded-full hover:bg-black/5"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.75} />
              </Link>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Navigation Side Bar using OpenMenu Component */}
      <OpenMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default NavBar;
