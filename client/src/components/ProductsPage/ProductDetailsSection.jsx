import { colours, fonts } from "../../theme/theme.js";

function DetailBlock({ eyebrow, title, children }) {
  return (
    <article
      className="border-t py-10 first:border-t-0 first:pt-0"
      style={{ borderColor: colours.border }}
    >
      <p
        className="mb-3 text-[0.68rem] uppercase tracking-[0.2em]"
        style={{ color: colours.accent, fontFamily: fonts.secondary }}
      >
        {eyebrow}
      </p>
      <h2
        className="mb-5 text-3xl font-normal"
        style={{ color: colours.text, fontFamily: fonts.primary }}
      >
        {title}
      </h2>
      <div
        className="text-sm leading-7"
        style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
      >
        {children}
      </div>
    </article>
  );
}

export default function ProductDetailsSection({
  description,
  ingredients,
  benefits,
  usageInstructions,
  concerns,
  productSize,
  code,
}) {
  return (
    <section
      className="relative z-10 border-t"
      style={{
        backgroundColor: colours.background,
        borderColor: colours.border,
      }}
    >
      <div className="mx-auto max-w-[1260px] px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p
              className="mb-4 text-[0.7rem] uppercase tracking-[0.22em]"
              style={{ color: colours.accent, fontFamily: fonts.secondary }}
            >
              Product information
            </p>
            <h2
              className="max-w-md text-[clamp(2.4rem,5vw,4.8rem)] font-normal leading-[1.02]"
              style={{ color: colours.text, fontFamily: fonts.primary }}
            >
              Everything behind the formula.
            </h2>
          </div>

          <div>
            <DetailBlock title="Description">
              <p>{description}</p>
            </DetailBlock>

            <DetailBlock title="Ingredients">
              <p>{ingredients || "Ingredients are not listed for this product."}</p>
            </DetailBlock>

            <DetailBlock title="Benefits">
              {benefits.length ? (
                <ul className="grid gap-3 pl-5 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              ) : (
                <p>Benefits are not listed for this product.</p>
              )}
            </DetailBlock>

            <DetailBlock title="How to use">
              <p>{usageInstructions || "Usage instructions are not listed for this product."}</p>
            </DetailBlock>

            {(concerns.length > 0 || productSize || code) && (
              <DetailBlock title="Additional information">
                <dl className="grid gap-5 sm:grid-cols-2">
                  {productSize && (
                    <div>
                      <dt className="mb-1 font-semibold" style={{ color: colours.text }}>
                        Size
                      </dt>
                      <dd>{productSize}</dd>
                    </div>
                  )}
                  {code && (
                    <div>
                      <dt className="mb-1 font-semibold" style={{ color: colours.text }}>
                        Product code
                      </dt>
                      <dd>{code}</dd>
                    </div>
                  )}
                  {concerns.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="mb-2 font-semibold" style={{ color: colours.text }}>
                        Suitable concerns
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {concerns.map((concern) => (
                          <span
                            key={concern}
                            className="rounded-full border px-3 py-1.5 text-xs"
                            style={{ borderColor: colours.border }}
                          >
                            {concern}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </DetailBlock>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}