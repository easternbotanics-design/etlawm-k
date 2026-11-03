import { fonts } from "../theme/theme";
import { Link } from "react-router-dom";
import Ghost from "../components/FloatingGhost";

const NotFoundPage = () => {
  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center text-white bg-black"
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: fonts.mono
      }}
    >
      <Link
        to="/"
        aria-label="ETLAWM home"
        className="absolute top-6 left-6 sm:top-8 sm:left-12 text-[22px] sm:text-[27px] leading-none tracking-[0.085em] hover:opacity-75 transition-opacity"
        style={{
          fontFamily: fonts.logo,
          color: "#ffffff"
        }}
      >
        ETLAWM
      </Link>
      <div
        className="flex items-center gap-8"
      >
        <Ghost />
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-light tracking-widest uppercase mb-2">404</h1>
          <p className="text-sm text-gray-400 tracking-wider mb-6">Page Not Found</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-white/40 px-5 py-2 rounded-md hover:bg-white hover:text-black hover:border-white transition-colors duration-200 text-sm tracking-wider"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;