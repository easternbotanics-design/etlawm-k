const ProductReveal = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#f7f3ec] px-6">
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Final Blend
          </p>

          <h2 className="mb-6 font-serif text-5xl leading-tight text-black md:text-7xl">
            The product rises after every ingredient settles in.
          </h2>

          <p className="max-w-xl text-lg leading-8 text-neutral-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            viverra magna at lorem tincidunt, sed dignissim purus pulvinar.
            Donec vitae arcu in ipsum posuere fermentum.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex h-[520px] w-[360px] items-center justify-center rounded-[40px] bg-white shadow-2xl">
            <div className="h-[420px] w-[240px] rounded-[32px] bg-black/90" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductReveal;