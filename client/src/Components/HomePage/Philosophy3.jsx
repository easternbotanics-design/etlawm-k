import { forwardRef } from "react";
import { Link } from "react-router-dom";
import treeImg from "../../assets/tree.png";
import { colours, fonts } from "../../theme/theme.js";

const palette = {
  cream: colours.primary || "#F7F3EC",
  paper: colours.background || "#FFFFFF",
  ink: colours.secondary || colours.text || "#171715",
  accent: colours.accent || "#A77C6B",
  surface: colours.surface || "#E8E2D8",
  border: colours.border || "#D8D2C8",
  muted: colours.mutedText || "#7C7770",
  hover: colours.hover || "#C8B9A4",
};

const principles = [
  {
    number: "01",
    label: "The root",
    title: "Begin with what belongs.",
    description:
      "Every formula starts with restraint. We keep the ingredients that serve the skin and remove the ones that only add noise.",
  },
  {
    number: "02",
    label: "The formula",
    title: "Let nature stay practical.",
    description:
      "Botanical care should not feel complicated. We refine plant-led ingredients into products that fit naturally into daily use.",
  },
  {
    number: "03",
    label: "The rhythm",
    title: "Care should be repeatable.",
    description:
      "A good ritual is not about doing more. It is about returning to a few dependable steps with consistency.",
  },
];

const Philosophy = forwardRef(function Philosophy(props, ref) {
  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden px-5 py-24 md:px-10 md:py-32 lg:px-16"
      style={{
        backgroundColor: palette.cream,
        color: palette.ink,
      }}
    >
      <style>
        {`
          .philosophy-tree-float {
            animation: philosophyTreeFloat 9s ease-in-out infinite alternate;
          }

          @keyframes philosophyTreeFloat {
            from {
              transform: translate3d(-2%, 1%, 0) rotate(-1deg);
            }
            to {
              transform: translate3d(1%, -1%, 0) rotate(1deg);
            }
          }

          .philosophy-card-line {
            position: relative;
          }

          .philosophy-card-line::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            height: 0%;
            width: 1px;
            background: ${palette.accent};
            transition: height 0.55s ease;
          }

          .philosophy-card-line:hover::before {
            height: 100%;
          }

          .philosophy-word {
            writing-mode: vertical-rl;
            text-orientation: mixed;
          }

          @media (max-width: 1024px) {
            .philosophy-word {
              writing-mode: horizontal-tb;
            }
          }
        `}
      </style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={treeImg}
          alt=""
          className="philosophy-tree-float absolute -left-24 bottom-0 w-[420px] max-w-none opacity-[0.18] mix-blend-multiply md:-left-32 md:w-[560px] lg:-left-40 lg:w-[720px]"
        />

        <div
          className="absolute left-0 top-0 h-full w-[48%]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.34), transparent)",
          }}
        />

        <p
          className="absolute -right-8 top-12 hidden select-none text-[10rem] font-normal leading-none tracking-[-0.08em] opacity-[0.045] xl:block"
          style={{
            fontFamily: fonts.primary,
            color: palette.ink,
          }}
        >
          ROOTED
        </p>

        <div
          className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full blur-3xl"
          style={{
            backgroundColor: `${palette.accent}22`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div
            className="relative overflow-hidden rounded-[2rem] border p-7 md:p-9 lg:min-h-[620px]"
            style={{
              borderColor: `${palette.ink}20`,
              backgroundColor: `${palette.paper}82`,
              boxShadow: "0 24px 90px rgba(23, 23, 21, 0.07)",
            }}
          >
            <img
              src={treeImg}
              alt=""
              className="absolute -bottom-20 -left-24 w-[390px] opacity-[0.22] mix-blend-multiply md:w-[500px]"
            />

            <div className="relative z-10 flex h-full flex-col justify-between gap-20">
              <div>
                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{
                    color: palette.accent,
                    fontFamily: fonts.secondary,
                  }}
                >
                  Manifesto
                </p>

                <h3
                  className="max-w-sm text-5xl font-normal leading-[0.88] tracking-[-0.055em] md:text-6xl"
                  style={{
                    fontFamily: fonts.primary,
                  }}
                >
                  <p>
                    Less is More.
                  </p>
                  <p>
                    Pure is Better.
                  </p>
                </h3>
              </div>

              <div
                className="relative ml-auto max-w-sm rounded-[1.5rem] border p-6 backdrop-blur-md"
                style={{
                  borderColor: `${palette.ink}18`,
                  backgroundColor: "rgba(255, 255, 255, 0.54)",
                }}
              >
                <p
                  className="text-sm leading-7"
                  style={{
                    color: palette.muted,
                    fontFamily: fonts.secondary,
                  }}
                >
                  We do not build routines around excess. We build them around
                  clarity: what cleanses, what restores, what protects, and what
                  can be repeated without confusion.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {principles.map((principle, index) => (
              <article
                key={principle.number}
                className="philosophy-card-line group relative overflow-hidden rounded-[2rem] border p-6 transition duration-500 hover:-translate-y-1 md:p-8"
                style={{
                  borderColor: `${palette.ink}20`,
                  backgroundColor:
                    index === 1 ? `${palette.surface}88` : `${palette.paper}90`,
                  boxShadow: "0 18px 70px rgba(23, 23, 21, 0.055)",
                }}
              >
                <div
                  className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{
                    backgroundColor: `${palette.hover}30`,
                  }}
                />

                <div className="relative grid gap-8 md:grid-cols-[110px_1fr] md:items-start">
                  <div>
                    <p
                      className="text-5xl font-normal leading-none tracking-[-0.06em]"
                      style={{
                        fontFamily: fonts.primary,
                        color: palette.accent,
                      }}
                    >
                      {principle.number}
                    </p>

                    <p
                      className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
                      style={{
                        color: palette.muted,
                        fontFamily: fonts.secondary,
                      }}
                    >
                      {principle.label}
                    </p>
                  </div>

                  <div>
                    <h3
                      className="max-w-2xl text-4xl font-normal leading-[0.92] tracking-[-0.05em] md:text-5xl"
                      style={{
                        fontFamily: fonts.primary,
                      }}
                    >
                      {principle.title}
                    </h3>

                    <p
                      className="mt-5 max-w-2xl text-sm leading-7 md:text-base"
                      style={{
                        color: palette.muted,
                        fontFamily: fonts.secondary,
                      }}
                    >
                      {principle.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            
          </div>
        </div>
      </div>
    </section>
  );
});

export default Philosophy;