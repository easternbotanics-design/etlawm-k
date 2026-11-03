import { colours, fonts } from "../../theme/theme.js";

const principles = [
  {
    title: "Less noise",
    text: "A routine should be easy to repeat. Fewer steps usually make consistency easier.",
  },
  {
    title: "Barrier first",
    text: "Skin and hair care should support comfort before chasing quick correction.",
  },
  {
    title: "Ingredient clarity",
    text: "Each product should make sense in the routine and have a clear reason to exist.",
  },
  {
    title: "Daily rhythm",
    text: "Care works best when it fits naturally into your morning and evening patterns.",
  },
];

const HomePrinciples = () => {
  return (
    <section className="px-5 py-24 md:px-10 lg:px-16" style={{ backgroundColor: colours.surface }}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.32em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
            Our point of view
          </p>

          <h2
            className="text-5xl font-normal leading-[0.9] tracking-[-0.06em] md:text-7xl"
            style={{ fontFamily: fonts.primary, color: colours.secondary }}
          >
            It is okay to stop and ask for direction.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
            Skin and hair care do not need to feel like trial and error. The
            better path is usually quieter: understand the need, keep the
            routine small, and repeat it well.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {principles.map((item, index) => (
            <article
              key={item.title}
              className="min-h-[230px] p-7 shadow-[0_14px_50px_rgba(23,23,21,0.06)]"
              style={{ backgroundColor: colours.primary }}
            >
              <p className="mb-8 text-xs uppercase tracking-[0.26em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
                0{index + 1}
              </p>

              <h3
                className="text-3xl font-normal leading-none tracking-[-0.04em]"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                {item.title}
              </h3>

              <p className="mt-5 text-sm leading-7" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePrinciples;