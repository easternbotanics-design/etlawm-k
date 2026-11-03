import React, { useRef } from "react";

// Sample data — swap with your real video/image/name sources
const CARDS = [
  {
    id: 1,
    name: "Aurora",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    image: "https://picsum.photos/seed/aurora/200/200",
  },
  {
    id: 2,
    name: "Solstice",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    image: "https://picsum.photos/seed/solstice/200/200",
  },
  {
    id: 3,
    name: "Nebula",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    image: "https://picsum.photos/seed/nebula/200/200",
  },
  {
    id: 4,
    name: "Ember",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    image: "https://picsum.photos/seed/ember/200/200",
  },
  {
    id: 5,
    name: "Vesper",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    image: "https://picsum.photos/seed/vesper/200/200",
  },
];

// Single card — video top, overlapping image thumbnail, name footer
const VideoCard = ({ video, image, name }) => {
  return (
    <div className="relative flex w-56 flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-neutral-200 shadow-sm">
      {/* Video region */}
      <div className="relative h-72 w-full overflow-hidden bg-neutral-300">
        <video
          src={video}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Name footer */}
      <div className="relative flex h-16 items-center justify-center bg-neutral-900 px-4">
        <span className="truncate text-sm font-medium text-neutral-100">
          {name}
        </span>
      </div>

      {/* Overlapping image thumbnail, straddling video + footer */}
      <div className="absolute bottom-8 left-4 h-20 w-20 overflow-hidden rounded-xl bg-neutral-400 ring-4 ring-neutral-200">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
    </div>
  );
};

const VideoCardCarousel = () => {
  const scrollRef = useRef(null);

  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-white py-8">
      <div className="relative mx-auto max-w-5xl px-4">
        {/* Left arrow */}
        <button
          onClick={() => scrollByAmount(-250)}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 rounded-full bg-white p-2 shadow-md hover:bg-neutral-100"
          aria-label="Scroll left"
        >
          <svg
            className="h-5 w-5 text-neutral-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Scrollable card row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CARDS.map((card) => (
            <VideoCard
              key={card.id}
              video={card.video}
              image={card.image}
              name={card.name}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollByAmount(250)}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full bg-white p-2 shadow-md hover:bg-neutral-100"
          aria-label="Scroll right"
        >
          <svg
            className="h-5 w-5 text-neutral-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoCardCarousel;