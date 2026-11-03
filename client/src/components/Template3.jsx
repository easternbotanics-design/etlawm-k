import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * EllipseSeatCarousel
 * --------------------
 * A reusable "table" template: an elliptical track (the game table) with
 * seats/avatars distributed evenly around its FULL perimeter. Only a thin
 * slice of the track is visible (the container clips the rest), so as the
 * wheel rotates, seats sweep through the visible "focus" slot and back out,
 * giving an infinite-loop carousel effect.
 *
 * Two layouts, switched automatically by container width:
 * - MOBILE ("top" orientation): a wide, shallow ellipse sits across the top
 *   of the screen (mostly clipped above the container). Seats sweep
 *   left/right through the bottom focus slot. Drag/scroll is horizontal.
 *   Nameplate + content panel sit stacked below the wheel, full width.
 * - DESKTOP ("left" orientation): a tall, narrow ellipse sits in the left
 *   20% column of the screen (mostly clipped off the left edge). Seats
 *   sweep up/down through the right-edge focus slot — a vertical wheel.
 *   Drag/scroll is vertical. The content panel fills the remaining ~80%
 *   of the screen to the right, with the nameplate floating just past the
 *   wheel's edge.
 *
 * - The ellipse and the two boxes (nameplate + content panel) never move —
 *   only the seat circles travel along the ellipse path.
 * - Rotation is continuous while dragging/scrolling, and always animates
 *   to land exactly on the next seat slot (never stops in-between).
 * - Works with mouse drag, touch drag, and mouse-wheel/trackpad scroll.
 *
 * Swap `DEFAULT_PLAYERS` for your real player list (id, name, and
 * whatever avatar data you have — an image url, initials, etc).
 */

const DEFAULT_PLAYERS = [
  { id: 1, name: "Alex" },
  { id: 2, name: "Priya" },
  { id: 3, name: "Sam" },
  { id: 4, name: "Nora" },
  { id: 5, name: "Kai" },
  { id: 6, name: "Mia" },
  { id: 7, name: "Devon" },
  { id: 8, name: "Ravi" },
];

const SNAP_DURATION = 380; // ms
const DRAG_SENSITIVITY = 0.35; // deg per px dragged
const WHEEL_LOCK_MS = 400;
const SEAT_ZONE_RATIO = 0.1; // fraction of height (mobile) / width (desktop) the wheel occupies

export default function EllipseSeatCarousel({ players = DEFAULT_PLAYERS, children }) {
  const N = players.length;
  const STEP = 360 / N;

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });

  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);

  const TABS = ["why", "how", "tips"];
  const [activeTab, setActiveTab] = useState("why");

  const rotationRef = useRef(0);
  const dragInfo = useRef({ startCoord: 0, startRotation: 0 });
  const dragDistance = useRef(0);
  const animRef = useRef(null);
  const wheelLock = useRef(false);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  // Keep the ellipse proportional to the container's actual rendered size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isMobile = size.w < 640;
  // "top"  -> mobile: wide shallow ellipse across the top, horizontal wheel.
  // "left" -> desktop: tall narrow ellipse down the left, vertical wheel.
  const orientation = isMobile ? "top" : "left";

  // The wheel that carries the active seat into the focus slot.
  // On "top", the focus slot is the bottom of the ellipse (angle 90°).
  // On "left", the focus slot is the right edge of the ellipse (angle 0°).
  const ACTIVE_ANGLE = orientation === "top" ? 90 : 0;

  const seatZoneSize = orientation === "top" ? size.h * SEAT_ZONE_RATIO : size.w * SEAT_ZONE_RATIO;

  let CX, CY, RX, RY, seatSize;
  if (orientation === "top") {
    CX = size.w / 2;
    CY = seatZoneSize * 0.15;
    RX = size.w * 0.44;
    RY = seatZoneSize - CY; // dome's bottom edge lands exactly at the zone's bottom
    seatSize = Math.min(seatZoneSize * 0.85, size.w * 0.16);
  } else {
    CY = size.h / 2;
    CX = seatZoneSize * 0.15;
    RY = size.h * 0.48;
    RX = seatZoneSize - CX; // dome's right edge lands exactly at the zone's right
    seatSize = Math.min(seatZoneSize * 0.85, size.h * 0.09);
  }

  // The focus seat scales up bigger on desktop than on mobile — mobile stays
  // modest since screen real estate near the wheel is tight, desktop has
  // room to make the active seat a real focal point.
  const SCALE_MAX = orientation === "top" ? 1.35 : 2.5;
  const SCALE_MIN = orientation === "top" ? 0.6 : 1.05;

  // On desktop, the gap between the wheel zone and the content box has to
  // fit the biggest the focus seat can actually get (seatSize * SCALE_MAX,
  // i.e. its radius) plus a little breathing room — not just a fixed % of
  // width. On wide screens the fixed 6% margin is already bigger than the
  // circle needs, so it wins; on narrower desktop widths the circle radius
  // wins instead, pushing the content box further right so it always clears
  // the seat instead of the seat just getting clipped flush against it.
  const focusSeatRadius = (seatSize * SCALE_MAX) / 2;
  const desktopContentGap = Math.max(size.w * 0.06, focusSeatRadius + size.w * 0.02);

  // How far the wheel's clipping boundary extends past the zone before the
  // content box begins. Scaled-up seats near the focus slot are clipped at
  // this line, so no matter how big SCALE_MAX makes them (or how the aspect
  // ratio changes RX/RY/seatSize), they can never bleed onto the content box.
  const wheelClipExtent = orientation === "top" ? CY + RY + size.h * 0.18 : seatZoneSize + desktopContentGap;

  const cancelAnim = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  };

  const animateTo = useCallback((target) => {
    cancelAnim();
    const start = rotationRef.current;
    const diff = target - start;
    const t0 = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / SNAP_DURATION);
      const val = start + diff * easeOutCubic(p);
      rotationRef.current = val;
      setRotation(val);
      animRef.current = p < 1 ? requestAnimationFrame(frame) : null;
    };
    animRef.current = requestAnimationFrame(frame);
  }, []);

  const snap = (r) => Math.round(r / STEP) * STEP;

  // Animate whichever seat index was clicked into the focus slot, taking
  // the shortest path around from the current rotation.
  const goToSeat = useCallback(
    (i) => {
      cancelAnim();
      const current = rotationRef.current;
      const base = i * STEP;
      const k = Math.round((current - base) / 360);
      animateTo(base + k * 360);
    },
    [STEP, animateTo]
  );

  // Both scroll AND drag only engage the carousel when the cursor/touch is
  // in the slice of the screen where the seats actually live — a band along
  // the top for the mobile wheel, a column along the left for the desktop
  // wheel.
  const INTERACTION_ZONE_RATIO = orientation === "top" ? 0.44 : 0.36;
  const isInZone = (clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return true;
    const rect = el.getBoundingClientRect();
    return orientation === "top"
      ? clientY - rect.top <= rect.height * INTERACTION_ZONE_RATIO
      : clientX - rect.left <= rect.width * INTERACTION_ZONE_RATIO;
  };

  // The axis that dragging/scrolling acts on: X for the horizontal (top)
  // wheel, Y for the vertical (left) wheel.
  const coordFor = (clientX, clientY) => (orientation === "top" ? clientX : clientY);

  // ---- Drag (mouse + touch) ----
  const startDrag = (clientX, clientY) => {
    cancelAnim();
    dragInfo.current = { startCoord: coordFor(clientX, clientY), startRotation: rotationRef.current };
    dragDistance.current = 0;
    setDragging(true);
  };

  const moveDrag = (clientX, clientY) => {
    const delta = coordFor(clientX, clientY) - dragInfo.current.startCoord;
    dragDistance.current = Math.max(dragDistance.current, Math.abs(delta));
    // On the vertical wheel, dragging down should pull seats down through
    // the focus slot, which means the rotation delta is inverted relative
    // to the horizontal wheel's convention.
    const sign = orientation === "top" ? 1 : -1;
    const val = dragInfo.current.startRotation + sign * delta * DRAG_SENSITIVITY;
    rotationRef.current = val;
    setRotation(val);
  };

  const endDrag = () => {
    setDragging(false);
    animateTo(snap(rotationRef.current));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, orientation]);

  // ---- Scroll wheel: one tick = one seat step, but ONLY when the cursor
  // is in the slice of the screen where the seats actually are.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!isInZone(e.clientX, e.clientY)) return; // outside the zone: ignore, let default scroll happen

      e.preventDefault();
      if (wheelLock.current || dragging) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 4) return;
      wheelLock.current = true;
      const sign = orientation === "top" ? 1 : -1;
      const dir = delta > 0 ? sign : -sign;
      const current = snap(rotationRef.current);
      animateTo(current + dir * STEP);
      setTimeout(() => {
        wheelLock.current = false;
      }, WHEEL_LOCK_MS);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dragging, animateTo, STEP, orientation]);

  useEffect(() => () => cancelAnim(), []);

  // Which player currently occupies the focus slot.
  const norm = ((rotation % 360) + 360) % 360;
  const activeIndex = ((Math.round(norm / STEP) % N) + N) % N;
  const activePlayer = players[activeIndex];

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          if (isInZone(e.clientX, e.clientY)) startDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t && isInZone(t.clientX, t.clientY)) startDrag(t.clientX, t.clientY);
        }}
        className="relative w-full h-full bg-white border-8 border-black overflow-hidden select-none box-border cursor-default"
      >
        {/* Wheel clip zone — hard-clips the ellipse and seats at exactly the
            content box's edge. This is what stops an oversized/scaled-up
            active seat from bleeding onto the content box, regardless of
            scale value or screen aspect ratio. */}
        <div
          className="absolute overflow-hidden pointer-events-none"
          style={
            orientation === "top"
              ? { left: 0, right: 0, top: 0, height: wheelClipExtent }
              : { top: 0, bottom: 0, left: 0, width: wheelClipExtent }
          }
        >
          {/* Ellipse table — fixed, never moves.
              NOTE: border-radius must be a % (not Tailwind's rounded-full,
              which is a fixed 9999px radius) — otherwise a wide/short (or
              tall/narrow) box renders as a stadium/pill shape instead of a
              true ellipse, and the seats (which move on the real elliptical
              path) drift off the drawn edge. */}
          <div
            className="absolute bg-neutral-200 pointer-events-none"
            style={{
              left: CX - RX,
              top: CY - RY,
              width: RX * 2,
              height: RY * 2,
              borderRadius: "50%",
            }}
          />

          {/* Seats travelling around the full perimeter.
              Exactly 3 are shown — focus slot, plus one on either side. They
              stay fully solid while in range and only fade during a narrow
              window right at the edge, so the outgoing seat softly dissolves
              instead of popping out, and the one behind it softly appears in
              its place. */}
          {players.map((p, i) => {
            const angleDeg = ACTIVE_ANGLE + i * STEP - rotation;
            const rad = (angleDeg * Math.PI) / 180;
            const x = CX + RX * Math.cos(rad);
            const y = CY + RY * Math.sin(rad);

            // Circular distance, in "slots", from this seat to the active slot.
            let diff = i - rotation / STEP;
            diff = diff - N * Math.round(diff / N); // wrap into (-N/2, N/2]
            const absDiff = Math.abs(diff);

            // The 3 slots (before / center / after) are absDiff 0..1 — always
            // fully solid, no fading while a seat is simply handing off
            // between those positions. Only once it's pushed PAST the edge
            // slot (absDiff > 1) does it start to fade, fully gone by
            // absDiff = 1 + FADE_WIDTH.
            const FADE_WIDTH = 0.35;
            const opacity =
              absDiff <= 1
                ? 1
                : absDiff >= 1 + FADE_WIDTH
                ? 0
                : 1 - (absDiff - 1) / FADE_WIDTH;

            if (opacity <= 0) return null;

            const scale = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * Math.min(absDiff, 1);
            const isActive = i === activeIndex;

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (dragDistance.current < 6) goToSeat(i);
                }}
                className={`absolute rounded-full flex items-center justify-center font-semibold text-neutral-500 pointer-events-auto ${
                  isActive ? "" : "cursor-pointer"
                }`}
                style={{
                  left: x,
                  top: y,
                  width: seatSize,
                  height: seatSize,
                  marginLeft: -seatSize / 2,
                  marginTop: -seatSize / 2,
                  backgroundColor: "#d9d9d9",
                  transform: `scale(${scale})`,
                  opacity,
                  boxShadow: isActive ? "0 0 0 3px rgba(0,0,0,0.18)" : "none",
                  zIndex: Math.round((1 - absDiff) * 1000) + 500,
                  fontSize: seatSize * 0.28,
                }}
              >
                {p.name.charAt(0)}
              </div>
            );
          })}
        </div>

        {/* Header row — fixed position. Name on the left (plain text, no
            box), Why/How/Tips tabs on the right (borderless/backgroundless,
            with a pill background that slides between them on click). */}
        <div
          className="absolute flex items-center justify-between"
          style={
            orientation === "top"
              ? {
                  left: size.w * 0.04,
                  right: size.w * 0.04,
                  top: CY + RY + size.h * 0.11,
                  height: size.h * 0.04,
                  zIndex: 900,
                }
              : {
                  left: seatZoneSize + desktopContentGap,
                  right: size.w * 0.04,
                  top: size.h * 0.04,
                  height: size.h * 0.06,
                  zIndex: 900,
                }
          }
        >
          <div
            className={`font-medium text-neutral-600 tracking-wide ${
              isMobile ? "text-[11px]" : "text-xs"
            }`}
          >
            {activePlayer?.name}
          </div>

          <div className="relative flex" style={{ width: isMobile ? "45%" : "35%" }}>
            <div
              className="absolute top-0 bottom-0 rounded-full bg-neutral-300 transition-transform duration-300 ease-out"
              style={{
                width: `${100 / TABS.length}%`,
                transform: `translateX(${TABS.indexOf(activeTab) * 100}%)`,
              }}
            />
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-1.5 bg-transparent border-none outline-none cursor-pointer capitalize font-medium tracking-wide transition-colors duration-300 ${
                  isMobile ? "text-[11px]" : "text-xs"
                } ${activeTab === tab ? "text-neutral-700" : "text-neutral-400"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel — fixed, never moves. On mobile it sits below the
            wheel at full width; on desktop it fills the ~80% of the screen
            to the right of the wheel's left column, shifted right a bit
            further past the wheel, with the nameplate sitting on top of it. */}
        <div
          ref={contentRef}
          className="absolute rounded-xl bg-neutral-300 flex items-center justify-center text-neutral-400 text-sm"
          style={
            orientation === "top"
              ? {
                  left: size.w * 0.04,
                  right: size.w * 0.04,
                  top: CY + RY + size.h * 0.18,
                  bottom: size.h * 0.04,
                }
              : {
                  left: seatZoneSize + desktopContentGap,
                  right: size.w * 0.04,
                  top: size.h * 0.04 + size.h * 0.06 + size.h * 0.02,
                  bottom: size.h * 0.04,
                }
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}