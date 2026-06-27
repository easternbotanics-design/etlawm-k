import { useState, useEffect } from "react";
import { colours, fonts } from "../theme/theme";

export default function FloatingBox() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem("floating-box-dismissed") === "true";
    if (!isDismissed) {
      // Delay slightly for a smoother, premium entry animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsAnimatingOut(true);
    // Wait for slide-out animation to complete before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("floating-box-dismissed", "true");
    }, 400); // matches the duration of slide-out transition (400ms)
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        className={`fixed top-4 right-4 z-[9999] w-80 md:w-96 max-w-[calc(100vw-2rem)] p-5 rounded-xl border shadow-2xl transition-all duration-400 ease-in-out cursor-default
          ${isAnimatingOut
            ? "opacity-0 translate-y-[-20px] scale-95 pointer-events-none"
            : "opacity-100 translate-y-0 scale-100 animate-slide-in"
          }
        `}
        style={{
          backgroundColor: `${colours.primary}ee`, // premium look matching index.css palette
          borderColor: colours.border,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 20px 40px -15px rgba(23, 23, 21, 0.15), 0 0 0 1px rgba(23, 23, 21, 0.05)",
        }}
      >
        {/* Close button - "cross on the right top corner" */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer"
          style={{
            color: colours.mutedText,
            backgroundColor: `${colours.surface}55`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colours.text;
            e.currentTarget.style.backgroundColor = colours.surface;
            e.currentTarget.style.transform = "rotate(90deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colours.mutedText;
            e.currentTarget.style.backgroundColor = `${colours.surface}55`;
            e.currentTarget.style.transform = "rotate(0deg)";
          }}
          aria-label="Dismiss banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Floating box content */}
        <div className="pr-6">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-2.5"
            style={{
              backgroundColor: colours.accent,
              color: colours.primary,
              fontFamily: fonts.secondary,
            }}
          >
            Announcement
          </span>
          <h4
            className="text-base font-semibold tracking-tight mb-1.5"
            style={{
              color: colours.mutedText,
              fontFamily: fonts.primary,
            }}
          >
            Discover Our Collection
          </h4>
          <p
            className="text-xs font-normal leading-relaxed"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            <div>
              For Product Enquiries or Ordering Service
            </div>
            <div>
              Contact us at +91 7708234137 or +91 8429121121
            </div>
          </p>
        </div>
      </div>
    </>
  );
}
