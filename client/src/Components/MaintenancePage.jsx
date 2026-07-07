import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../theme/theme";
import catImg from "../assets/cat.png";

export default function MaintenancePage() {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full min-h-screen px-6 py-12 select-none overflow-hidden"
      style={{
        backgroundColor: colours.background,
      }}
    >
      {/* Top Left: Back arrow saying "back to previous page" */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2.5 group transition-all duration-300 cursor-pointer"
        style={{
          color: colours.text,
          fontFamily: fonts.secondary,
        }}
        aria-label="Go back to previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        <span className="text-sm font-medium tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-current group-hover:after:w-full after:transition-all after:duration-300">
          back to previous page
        </span>
      </button>

      {/* Center: Under Construction Message */}
      <div className="text-center max-w-lg px-4 animate-fade-in">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ backgroundColor: colours.primary }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={colours.accent}
            className="w-8 h-8 animate-spin-slow"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.827m11.379-8.16l1.15-.827M8.14 19.142l.707-1.03m7.743-5.617l.707-1.03M12 21v-1.5m0-15V3m0 16.5V12"
            />
          </svg>
        </div>

        <h1
          className="text-4xl md:text-5xl font-semibold tracking-tight mb-4"
          style={{
            color: colours.text,
            fontFamily: fonts.primary,
          }}
        >
          Under Construction
        </h1>
        
        <p
          className="text-sm md:text-base leading-relaxed max-w-sm mx-auto"
          style={{
            color: colours.mutedText,
            fontFamily: fonts.secondary,
          }}
        >
          This page is under construction. We are currently working hard to bring you a brand new experience. Please visit us again soon!
        </p>
      </div>

      {/* Bottom Left: Cat PNG Image from assets */}
      <div className="absolute bottom-0 left-4 md:left-8 max-w-[120px] sm:max-w-[150px] md:max-w-[180px] pointer-events-none transition-transform duration-500 ease-out hover:scale-105">
        <img
          src={catImg}
          alt="Cat character"
          className="w-full h-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinSlow 15s linear infinite;
        }
      `}</style>
    </div>
  );
}