import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { fonts } from "../../theme/theme.js";

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const IngredientScene = ({ ingredient, index, total, scrollProgress }) => {
  const { width, height } = useWindowSize();

  const isMobile = width < 768;
  const [isActive, setIsActive] = useState(index === 0);

  const start = index / total;
  const end = (index + 1) / total;

  const localProgress = useTransform(scrollProgress, [start, end], [0, 1]);
  const fallStart = 0.42;
  const fallEnd = 0.72;
  const fallMiddle = fallStart + (fallEnd - fallStart) * 0.58;
  const disappearStart = 0.68;
  const disappearEnd = 0.78;

  useMotionValueEvent(localProgress, "change", (value) => {
    if (value > 0.015 && value < 0.985) {
      setIsActive(true);
    }

    if (value <= 0.005 || value >= 0.985) {
      setIsActive(index === 0 && value <= 0.005);
    }
  });

  const sceneExitOpacity = useTransform(
    localProgress,
    [0, 0.72, 0.92, 1],
    [1, 1, 0, 0],
  );

  const contentY = useTransform(
    localProgress,
    [0, fallStart, fallEnd],
    [0, 0, -120],
  );

  const contentOpacity = useTransform(
    localProgress,
    [0, disappearStart, disappearEnd, 1],
    [1, 1, 0, 0],
  );

  const rightTextY = useTransform(
    localProgress,
    [0, fallStart, fallEnd],
    [0, 0, -140],
  );

  const rightTextOpacity = useTransform(
    localProgress,
    [0, disappearStart, disappearEnd, 1],
    [1, 1, 0, 0],
  );

  const circleSize = isMobile ? 220 : 300;
  const circleRadius = circleSize / 2;

  const startCenterX = width * 0.5;
  const startCenterY = isMobile ? height * 0.25 : height * 0.34;

  const baseLeft = startCenterX - circleRadius;
  const baseTop = startCenterY - circleRadius;

  const targetCenterX = isMobile ? width * 0.5 : width * 0.15;
  const targetCenterY = isMobile ? height * 0.78 : height * 0.76;

  const arcHeight = isMobile ? height * 0.14 : height * 0.2;

  const getFallProgress = (value) => {
    return clamp((value - fallStart) / (fallEnd - fallStart), 0, 1);
  };

  const circleX = useTransform(localProgress, (value) => {
    if (value < fallStart) return 0;

    const t = getFallProgress(value);
    const currentCenterX = startCenterX + (targetCenterX - startCenterX) * t;

    return currentCenterX - startCenterX;
  });

  const circleY = useTransform(localProgress, (value) => {
    if (value < fallStart) return 0;

    const t = getFallProgress(value);
    const linearY = startCenterY + (targetCenterY - startCenterY) * t;
    const arcOffset = Math.sin(Math.PI * t) * arcHeight;

    return linearY - arcOffset - startCenterY;
  });

  const circleScale = useTransform(
    localProgress,
    [0, fallStart, fallMiddle, fallEnd, 1],
    [1, 1, 0.65, 0.18, 0.18],
  );

  const circleOpacity = useTransform(
    localProgress,
    [0, disappearStart, disappearEnd, 1],
    [1, 1, 0, 0],
  );

  const length = 1 / total;
  const bgOpacity = useTransform(
    scrollProgress,
    index === 0
      ? [0, 0.72 * length, 0.92 * length]
      : [
          (index - 1 + 0.72) * length,
          (index - 1 + 0.92) * length,
          (index + 0.72) * length,
          (index + 0.92) * length,
        ],
    index === 0 ? [1, 1, 0] : [0, 1, 1, 0],
  );

  return (
    <motion.div
      style={{ opacity: sceneExitOpacity }}
      className="pointer-events-none absolute inset-0 z-20"
    >
      <div className="relative h-full w-full overflow-hidden">
        <motion.div
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 z-0"
        >
          <motion.img
            src={ingredient.image}
            alt=""
            style={{ opacity: contentOpacity }}
            className="h-full w-full scale-110 object-cover blur-2xl"
          />

          <div className="absolute inset-0 bg-[#11130c]/45" />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(12,18,9,0.82) 0%, rgba(24,37,16,0.48) 38%, rgba(15,22,10,0.24) 62%, rgba(9,16,7,0.72) 100%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 36%, rgba(247,243,236,0.18), transparent 28%), radial-gradient(circle at 16% 78%, rgba(167,124,107,0.18), transparent 24%)",
            }}
          />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            y: isActive ? 0 : 22,
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            left: baseLeft,
            top: baseTop,
          }}
          className="absolute z-50"
        >
          <motion.div
            style={{
              x: circleX,
              y: circleY,
              scale: circleScale,
              opacity: circleOpacity,
            }}
          >
            <div
              style={{
                width: circleSize,
                height: circleSize,
              }}
              className="relative overflow-hidden rounded-full border border-[#f7f3ec]/70 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.3)]"
            >
              <img
                src={ingredient.image}
                alt={ingredient.name}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            y: isActive ? 0 : 24,
          }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            left: isMobile ? 24 : width * 0.5 - 220,
            top: isMobile ? height * 0.41 : height * 0.55,
            width: isMobile ? width - 48 : 440,
          }}
          className="absolute z-30 text-center"
        >
          <motion.div
            style={{
              y: contentY,
              opacity: contentOpacity,
            }}
          >
            <h2 className="font-serif text-5xl leading-none text-[#f7f3ec] drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] md:text-6xl">
              {ingredient.name}
            </h2>

            {ingredient.scientificName && (
              <p className="mt-3 font-serif text-lg italic text-[#e8e2d8]/85">
                {ingredient.scientificName}
              </p>
            )}

            <p
              className="mx-auto mt-6 max-w-[420px] text-base leading-8 text-[#f7f3ec]/85 drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)] md:text-lg"
              style={{ fontFamily: fonts.secondary }}
            >
              {ingredient.leftText}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            y: isActive ? 0 : 24,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
            delay: 0.08,
          }}
          style={{
            right: isMobile ? 20 : "6vw",
            top: isMobile ? height * 0.58 : "12vh",
            width: isMobile ? width - 40 : 430,
          }}
          className="absolute z-40"
        >
          <motion.div
            style={{
              y: rightTextY,
              opacity: rightTextOpacity,
            }}
            className="rounded-[22px] border border-white/35 bg-[#f7f3ec]/65 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl"
          >
            <p
              className="text-lg leading-9 text-[#171715]/80"
              style={{ fontFamily: fonts.secondary }}
            >
              {ingredient.rightTextOne}
            </p>

            <p
              className="mt-7 text-lg leading-9 text-[#171715]/80"
              style={{ fontFamily: fonts.secondary }}
            >
              {ingredient.rightTextTwo}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IngredientScene;