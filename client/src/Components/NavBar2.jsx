import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import NavHome from "./NavHome";
import OpenMenu from "./OpenMenu";

const SCROLL_UP_THRESHOLD = 10;
const NAVBAR_HEIGHT = 72;
const HIDE_START_THRESHOLD = 10;

const NavBar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [atTop, setAtTop] = useState(() => window.scrollY <= 20);
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  const lastScrollY = useRef(0);
  const scrollUpDistance = useRef(0);
  const isMenuOpenRef = useRef(false);

  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY.current;

      const nowAtTop = currentScrollY <= 20;
      setIsScrolled(!nowAtTop);
      setAtTop(nowAtTop);

      if (nowAtTop) {
        setTranslateY(0);
        setIsHidden(false);
        scrollUpDistance.current = 0;
        lastScrollY.current = currentScrollY;
        return;
      }

      if (isMenuOpenRef.current) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (delta > 0) {
        if (currentScrollY > HIDE_START_THRESHOLD) {
          setTranslateY(-NAVBAR_HEIGHT);
          setIsHidden(true);
          scrollUpDistance.current = 0;
        }
      }

      if (delta < 0) {
        scrollUpDistance.current += Math.abs(delta);
        if (scrollUpDistance.current >= SCROLL_UP_THRESHOLD) {
          setTranslateY(0);
          setIsHidden(false);
          scrollUpDistance.current = 0;
        }
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      setTranslateY(0);
      setIsHidden(false);
    } else {
      document.body.style.overflow = previousOverflow;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <NavHome
        isHomePage={isHomePage}
        isScrolled={isScrolled}
        atTop={atTop}
        isHidden={isHidden}
        translateY={translateY}
        isMenuOpen={isMenuOpen}
        onMenuOpen={() => setIsMenuOpen(true)}
      />
      <OpenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default NavBar;