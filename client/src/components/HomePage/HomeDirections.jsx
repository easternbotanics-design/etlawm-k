import { Play } from "lucide-react";
import { Link } from "react-router-dom";

const HomeDirections = () => {
  return (
    <section className="bg-[#F7F3EC] px-5 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl bg-[#FFFBF4] p-5 shadow-[0_20px_80px_rgba(23,23,21,0.08)] md:p-10">
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#68B7AA]">
              Direction first
            </p>

            <h2
              className="text-4xl font-normal leading-[0.95] tracking-[-0.04em] md:text-6xl"
              style={{ fontFamily: "'Crimson Text', Georgia, serif" }}
            >
              Get direction on the ritual your skin is asking for.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#171715]/70">
              Instead of throwing products at a concern, start with a simple
              pathway. Choose what your skin or hair needs, then build a routine
              around a few dependable steps.
            </p>

            <Link
              to="/collection"
              className="mt-7 inline-flex rounded-full bg-[#68B7AA] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#579f94]"
            >
              Explore rituals
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -left-5 -top-5 h-full w-full border border-[#171715]/20" />

            <div className="relative overflow-hidden bg-[#171715] shadow-[0_16px_50px_rgba(23,23,21,0.18)]">
              <div className="aspect-video bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_30%),linear-gradient(135deg,#312C26,#0E0E0C)]">
                <div className="flex h-full items-center justify-center">
                  <button
                    type="button"
                    aria-label="Play video"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFFBF4] text-[#171715] shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition hover:scale-105"
                  >
                    <Play size={24} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#171715]/50">
              Three-minute routine guide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeDirections;