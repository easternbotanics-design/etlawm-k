import { useEffect, useRef, useState } from "react";

const RenderWhenVisible = ({ children, minHeight = "500px" }) => {
  const wrapperRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ minHeight }}>
      {isVisible ? children : null}
    </div>
  );
};

export default RenderWhenVisible;