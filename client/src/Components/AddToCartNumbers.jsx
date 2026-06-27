import { useEffect, useRef, useState } from "react";
import { colours, fonts } from "../theme/theme";

const DIGIT_HEIGHT = 32;
const REPEAT_COUNT = 7;
const MIDDLE_SET = 3;

function AnimatedDigit({ digit }) {
  const numericDigit = Number(digit);
  const previousDigitRef = useRef(numericDigit);

  const [position, setPosition] = useState(
    MIDDLE_SET * 10 + numericDigit
  );

  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const digits = Array.from(
    { length: REPEAT_COUNT * 10 },
    (_, index) => index % 10
  );

  useEffect(() => {
    const previousDigit = previousDigitRef.current;

    if (numericDigit === previousDigit) return;

    let direction;

    // Increasing, including 9 → 0
    if (
      numericDigit === (previousDigit + 1) % 10
    ) {
      direction = 1;
    }
    // Decreasing, including 0 → 9
    else if (
      numericDigit === (previousDigit + 9) % 10
    ) {
      direction = -1;
    }
    // Fallback for larger count changes
    else {
      direction = numericDigit > previousDigit ? 1 : -1;
    }

    setTransitionEnabled(true);
    setPosition((currentPosition) => currentPosition + direction);

    previousDigitRef.current = numericDigit;
  }, [numericDigit]);

  const handleTransitionEnd = () => {
    const centredPosition = MIDDLE_SET * 10 + numericDigit;

    setTransitionEnabled(false);
    setPosition(centredPosition);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    });
  };

  return (
    <div className="relative h-8 w-5 overflow-hidden">
      <div
        onTransitionEnd={handleTransitionEnd}
        className="absolute left-0 top-0 flex flex-col ease-out"
        style={{
          transform: `translateY(-${position * DIGIT_HEIGHT}px)`,
          transition: transitionEnabled
            ? "transform 300ms ease-out"
            : "none",
        }}
      >
        {digits.map((number, index) => (
          <span
            key={index}
            className="flex h-8 w-5 shrink-0 items-center justify-center text-lg font-medium tabular-nums text-neutral-900"
          >
            {number}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AddToCartNumbers({ count, onIncrease, onDecrease }) {
  const formattedCount = String(count).padStart(2, "0").slice(-2);
  const tens = formattedCount[0];
  const units = formattedCount[1];

  return (
    <div
      className="inline-flex h-8 items-center gap-2 rounded-full "
      style={{
        background: colours.background,
      }}
    >
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: colours.background,
          borderColor: colours.accent,
          color: colours.accent,
        }}
        aria-label="Decrease quantity"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className="flex h-8 items-center overflow-hidden"
        style={{
          fontFamily: fonts.logo,
        }}
      >
        <AnimatedDigit digit={tens} />
        <AnimatedDigit digit={units} />
      </div>

      <button
        type="button"
        onClick={onIncrease}
        className="flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: colours.background,
          borderColor: colours.accent,
          color: colours.accent,
        }}
        aria-label="Increase quantity"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}