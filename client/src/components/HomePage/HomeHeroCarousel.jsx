import React, { useState, useEffect } from "react";
import hero from "../../assets/heroBanner3.png";
import { colours, fonts } from "../../theme/theme.js";
import Card from "../CarouselCards/Card.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    subtitle: `Hey dear, I can really see a difference in my skin... I can feel the smoothness just in one use\n\nAlso, the pigmentation cream is working so well... redness has reduced a lot and my skin looks much clearer and more even now.`,
    bgColor: "#144d37",
    isBig: false,
  },
  {
    id: 2,
    subtitle: `I have been applying the pigmentation cream on my face and it is very effective.. my face used to be completely red, but after that, the redness subsided and my skin became smooth.\n\nIt also cleared up the dark patches, making my skin look clear and clean now.`,
    bgColor: "#1c563e",
    isBig: false,
  },
  {
    id: 3,
    subtitle: `This product worked well for me. It helped reduce my hair fall gradually, and the consistency is really nice. It feels light, non-sticky, and doesn't make the hair oily. Overall, I had an good experience using it mam`,
    bgColor: "#0e3b2b",
    isBig: false,
  },
  {
    id: 4,
    subtitle: `My mom has pigmentation and she tried so many Korean products as well but nothing worked. She used one bottle each of vitamin c and depigmentation and she's seeing results. Your products are great.`,
    bgColor: "#164536",
    isBig: false,
  },
  {
    id: 5,
    subtitle: `My personal feedback so far is helping with itchy scalp and I don't look greasy.\n\nMy sister recommending to my other sister's that it dont get oily and more like serum so women can use`,
    bgColor: "#124233",
    isBig: false,
  },
  {
    id: 6,
    subtitle: `I used this hair oil just three times and noticed a wonderful reduction in my dandruff (of course to reduce 100% need to apply several time). What I really liked is that its not thick or heavy it feels light, absorbs well and is gentle on the scalp. Seeing such quick results truly impressed me, and I would confidently recommend it to anyone dealing with dandruff.`,
    bgColor: "#184f39",
    isBig: true,
  },
];

// Helper to build desktop frames (2 per frame, 1 for big)
const buildDesktopFrames = (items) => {
  const result = [];
  let currentGroup = [];

  items.forEach((item) => {
    if (item.isBig || item.subtitle.length > 300) {
      if (currentGroup.length > 0) {
        result.push(currentGroup);
        currentGroup = [];
      }
      result.push([item]);
    } else {
      currentGroup.push(item);
      if (currentGroup.length === 2) {
        result.push(currentGroup);
        currentGroup = [];
      }
    }
  });

  if (currentGroup.length > 0) {
    result.push(currentGroup);
  }

  return result;
};

const desktopFrames = buildDesktopFrames(testimonials);
const mobileFrames = testimonials.map((item) => [item]);

const HomeHeroCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const minSwipeDistance = 40;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeFrames = isMobile ? mobileFrames : desktopFrames;

  useEffect(() => {
    if (currentFrame >= activeFrames.length) {
      setCurrentFrame(0);
    }
  }, [activeFrames, currentFrame]);

  const handlePrev = () => {
    setCurrentFrame((prev) => (prev > 0 ? prev - 1 : activeFrames.length - 1));
  };

  const handleNext = () => {
    setCurrentFrame((prev) => (prev < activeFrames.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const distance = dragStartX - e.clientX;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <section
      className="relative w-full py-8 md:py-16 px-4 sm:px-6 md:px-10 flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: colours.primary }}
    >
      {/* Box Container enclosing Header, Cards Carousel, and Background Image */}
      <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden py-8 md:py-12 px-2 sm:px-6 md:px-8 shadow-2xl bg-[#171715]">
        {/* Background Image with Ambient Overlay inside Box Only */}
        <img
          src={hero}
          alt="ETLAWM hero background"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171715]/80 via-transparent to-[#171715]/90 pointer-events-none" />

        {/* Header Overlay */}
        <div className="relative z-10 text-center px-4 mb-3 md:mb-8">
          <p
            className="text-[10px] md:text-sm uppercase tracking-[0.25em] md:tracking-[0.3em] font-medium"
            style={{ color: colours.accent, fontFamily: fonts.secondary }}
          >
            Real Experiences & Love
          </p>
          <h2
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-normal mt-0.5 md:mt-1 tracking-wide"
            style={{ color: colours.primary, fontFamily: fonts.sail }}
          >
            Customer Testimonials
          </h2>
        </div>

        {/* Carousel Track with Drag & Touch Support */}
        <div
          className="relative z-10 w-full max-w-6xl mx-auto px-10 sm:px-14 md:px-20 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out items-center"
            style={{ transform: `translateX(-${currentFrame * 100}%)` }}
          >
            {activeFrames.map((pair, frameIdx) => (
              <div
                key={frameIdx}
                className="w-full shrink-0 flex-none px-2 py-4 md:py-6 flex items-center justify-center"
              >
                <div
                  className={`w-full grid items-center gap-6 md:gap-10 ${
                    pair.length === 1
                      ? "grid-cols-1 max-w-md sm:max-w-xl mx-auto justify-items-center"
                      : "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto justify-items-center"
                  }`}
                >
                  {pair.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`w-full flex justify-center transform transition-transform ${
                        pair.length > 1
                          ? idx === 0
                            ? "md:-translate-y-5"
                            : "md:translate-y-5"
                          : ""
                      }`}
                    >
                      <Card
                        subtitle={item.subtitle}
                        bgColor={item.bgColor}
                        className="w-full max-w-xs sm:max-w-md h-auto pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center justify-between pointer-events-none absolute inset-y-0 left-1 right-1 sm:left-2 sm:right-2 md:left-4 md:right-4">
            <button
              onClick={handlePrev}
              aria-label="Previous frame"
              className="pointer-events-auto p-2 sm:p-2.5 md:p-3 rounded-full bg-[#171715]/80 hover:bg-[#171715] text-[#F7F3EC] border border-[#F7F3EC]/20 backdrop-blur-md shadow-xl transition hover:scale-110 active:scale-95 z-20"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next frame"
              className="pointer-events-auto p-2 sm:p-2.5 md:p-3 rounded-full bg-[#171715]/80 hover:bg-[#171715] text-[#F7F3EC] border border-[#F7F3EC]/20 backdrop-blur-md shadow-xl transition hover:scale-110 active:scale-95 z-20"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroCarousel;