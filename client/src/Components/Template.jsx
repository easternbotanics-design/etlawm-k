import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { colours, fonts } from "../theme/theme";
import heroBanner3 from "../assets/heroBanner3.png";

/**
 * EllipseSeatCarousel
 * --------------------
 * Carousel template displaying ritual product circles on an elliptical wheel track.
 * Integrates theme colors and fonts from theme.js, renders free-form Why/How/Tips,
 * and displays a clean loading skeleton.
 */

const SNAP_DURATION = 380; // ms
const DRAG_SENSITIVITY = 0.35; // deg per px dragged
const WHEEL_LOCK_MS = 400;
const SEAT_ZONE_RATIO = 0.1; // fraction of height (mobile) / width (desktop) the wheel occupies

export default function EllipseSeatCarousel({ rituals = [], players = [], loading = false, children }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const fontPrimary = fonts?.primary || "'Montaga', serif";
  const fontSecondary = fonts?.secondary || "'Montserrat', sans-serif";

  const colorBg = colours?.background || "#f8f8f8";
  const colorSubBg = colours?.subBackground || "#fbfbfb";
  const colorPrimary = colours?.primary || "#F7F3EC";
  const colorSecondary = colours?.secondary || "#171715";
  const colorText = colours?.text || "#080808";
  const colorAccent = colours?.accent || "#A77C6B";
  const colorSurface = colours?.surface || "#E8E2D8";
  const colorMutedText = colours?.mutedText || "#7C7770";
  const colorBorder = colours?.border || "#D8D2C8";
  const colorAnother = colours?.another || "#F4F1EC";

  const itemsList = (rituals && rituals.length > 0) ? rituals : (players && players.length > 0) ? players : [];
  const N = Math.max(itemsList.length, 1);
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

  const ACTIVE_ANGLE = orientation === "top" ? 90 : 0;

  const seatZoneSize = orientation === "top" ? size.h * SEAT_ZONE_RATIO : size.w * SEAT_ZONE_RATIO;

  let CX, CY, RX, RY, seatSize;
  if (orientation === "top") {
    CX = size.w / 2;
    CY = seatZoneSize * 0.15;
    RX = size.w * 0.44;
    RY = seatZoneSize - CY;
    seatSize = Math.min(seatZoneSize * 0.85, size.w * 0.16);
  } else {
    CY = size.h / 2;
    CX = seatZoneSize * 0.15;
    RY = size.h * 0.48;
    RX = seatZoneSize - CX;
    seatSize = Math.min(seatZoneSize * 0.85, size.h * 0.09);
  }

  const SCALE_MAX = orientation === "top" ? 1.35 : 2.5;
  const SCALE_MIN = orientation === "top" ? 0.6 : 1.05;

  const focusSeatRadius = (seatSize * SCALE_MAX) / 2;
  const desktopContentGap = Math.max(size.w * 0.06, focusSeatRadius + size.w * 0.02);

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

  const INTERACTION_ZONE_RATIO = orientation === "top" ? 0.30 : 0.18;
  const isInZone = (clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return true;
    const rect = el.getBoundingClientRect();
    return orientation === "top"
      ? clientY - rect.top <= rect.height * INTERACTION_ZONE_RATIO
      : clientX - rect.left <= rect.width * INTERACTION_ZONE_RATIO;
  };

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
  }, [dragging, orientation]);

  // ---- Scroll wheel ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!isInZone(e.clientX, e.clientY)) return;

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

  // Which player/ritual currently occupies the focus slot.
  const norm = ((rotation % 360) + 360) % 360;
  const activeIndex = ((Math.round(norm / STEP) % N) + N) % N;
  const activePlayer = itemsList[activeIndex];

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
        className="relative w-full h-full overflow-hidden select-none box-border cursor-default"
      >
        {/* Background Image - lightened with white tone */}
        <img
          src={heroBanner3}
          alt="Rituals background"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-90 brightness-110 contrast-95"
        />

        {/* Light white tone overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: "rgba(247, 243, 236, 0.2)",
          }}
        />

        {/* Wheel clip zone */}
        <div
          className="absolute overflow-hidden pointer-events-none"
          style={
            orientation === "top"
              ? { left: 0, right: 0, top: 0, height: wheelClipExtent }
              : { top: 0, bottom: 0, left: 0, width: wheelClipExtent }
          }
        >
          {/* Ellipse track */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: CX - RX,
              top: CY - RY,
              width: RX * 2,
              height: RY * 2,
              borderRadius: "50%",
              backgroundColor: colorSurface,
              border: `1px solid ${colorBorder}`,
            }}
          />

          {/* Seats / Circle Avatars */}
          {loading ? (
            // Loading Skeleton Seats
            [0, 1, 2].map((i) => {
              const angleDeg = ACTIVE_ANGLE + (i - 1) * 45;
              const rad = (angleDeg * Math.PI) / 180;
              const x = CX + RX * Math.cos(rad);
              const y = CY + RY * Math.sin(rad);
              return (
                <div
                  key={`sk-seat-${i}`}
                  className="absolute rounded-full animate-pulse"
                  style={{
                    left: x,
                    top: y,
                    width: seatSize,
                    height: seatSize,
                    marginLeft: -seatSize / 2,
                    marginTop: -seatSize / 2,
                    backgroundColor: colorBorder,
                  }}
                />
              );
            })
          ) : (
            itemsList.map((p, i) => {
              const angleDeg = ACTIVE_ANGLE + i * STEP - rotation;
              const rad = (angleDeg * Math.PI) / 180;
              const x = CX + RX * Math.cos(rad);
              const y = CY + RY * Math.sin(rad);

              let diff = i - rotation / STEP;
              diff = diff - N * Math.round(diff / N);
              const absDiff = Math.abs(diff);

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

              const imageUrl = p.image_url || p.primary_product_image;

              return (
                <div
                  key={p.id || i}
                  onClick={() => {
                    if (dragDistance.current < 6) goToSeat(i);
                  }}
                  className={`absolute rounded-full flex items-center justify-center font-semibold overflow-hidden pointer-events-auto ${
                    isActive ? "" : "cursor-pointer"
                  }`}
                  style={{
                    left: x,
                    top: y,
                    width: seatSize,
                    height: seatSize,
                    marginLeft: -seatSize / 2,
                    marginTop: -seatSize / 2,
                    backgroundColor: colorPrimary,
                    transform: `scale(${scale})`,
                    opacity,
                    boxShadow: isActive ? `0 0 0 3px ${colorAccent}` : `0 2px 8px rgba(0,0,0,0.08)`,
                    zIndex: Math.round((1 - absDiff) * 1000) + 500,
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.product_name || p.title || p.name || "Ritual"}
                      className="w-full h-full object-cover rounded-full pointer-events-none"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className="w-full h-full flex items-center justify-center text-center font-medium"
                    style={{
                      display: imageUrl ? "none" : "flex",
                      fontSize: seatSize * 0.28,
                      fontFamily: fontPrimary,
                      color: colorSecondary,
                    }}
                  >
                    {(p.product_name || p.title || p.name || "R").charAt(0)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Header row — Product Name on the left, Why/How/Tips tabs on the right */}
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
          {loading ? (
            <div
              className="h-6 w-44 rounded animate-pulse"
              style={{ backgroundColor: colorBorder }}
            />
          ) : (
            <div
              className={`font-semibold tracking-wide uppercase ${
                isMobile ? "text-xs" : "text-sm"
              }`}
              style={{
                fontFamily: fontPrimary,
                color: colorSecondary,
              }}
            >
              {activePlayer?.product_name || activePlayer?.title || activePlayer?.name || ""}
            </div>
          )}

          <div className="relative flex rounded-full p-0.5" style={{ width: isMobile ? "50%" : "35%", backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
            <div
              className="absolute top-0 bottom-0 rounded-full transition-transform duration-300 ease-out shadow-md"
              style={{
                width: `${100 / TABS.length}%`,
                transform: `translateX(${TABS.indexOf(activeTab) * 100}%)`,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 1)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            />
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative flex-1 py-1.5 bg-transparent border-none outline-none cursor-pointer capitalize font-semibold tracking-wide transition-colors duration-300"
                style={{
                  fontFamily: fontSecondary,
                  fontSize: isMobile ? "11px" : "13px",
                  color: activeTab === tab ? "#000000" : "#ffffff",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div
          ref={contentRef}
          className="absolute rounded-2xl flex items-start justify-start overflow-hidden text-sm"
          style={{
            ...(orientation === "top"
              ? {
                  left: size.w * 0.04,
                  right: size.w * 0.04,
                  top: CY + RY + size.h * 0.18,
                  bottom: size.h * 0.10,
                }
              : {
                  left: seatZoneSize + desktopContentGap,
                  right: size.w * 0.04,
                  top: size.h * 0.04 + size.h * 0.06 + size.h * 0.02,
                  bottom: size.h * 0.10,
                }),
            backgroundColor: "rgba(247, 243, 236, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
          }}
        >
          {children ? children : (
            loading ? (
              // Loading Skeleton for Content Panel
              <div className="w-full h-full p-6 md:p-10 flex flex-col gap-4 animate-pulse">
                <div className="h-6 w-44 rounded" style={{ backgroundColor: colorBorder }} />
                <div className="space-y-3 mt-3">
                  <div className="h-4 w-full rounded" style={{ backgroundColor: colorBorder, opacity: 0.7 }} />
                  <div className="h-4 w-11/12 rounded" style={{ backgroundColor: colorBorder, opacity: 0.7 }} />
                  <div className="h-4 w-4/5 rounded" style={{ backgroundColor: colorBorder, opacity: 0.7 }} />
                  <div className="h-4 w-3/4 rounded" style={{ backgroundColor: colorBorder, opacity: 0.7 }} />
                </div>
              </div>
            ) : itemsList.length === 0 || !activePlayer ? (
              <div
                className="flex items-center justify-center w-full h-full text-center p-6"
                style={{ fontFamily: fontSecondary, color: colorMutedText }}
              >
                No rituals available.
              </div>
            ) : (
              <div className="w-full h-full p-6 md:p-10 overflow-y-auto">
                {(() => {
                  let list = [];
                  if (activeTab === "why") list = activePlayer.whys || activePlayer.why || [];
                  else if (activeTab === "how") list = activePlayer.hows || activePlayer.how || [];
                  else if (activeTab === "tips") list = activePlayer.tips || activePlayer.tip || [];

                  if (typeof list === "string") list = [list];

                  if (!Array.isArray(list) || list.length === 0) {
                    return (
                      <div
                        className="flex items-center justify-center h-full italic"
                        style={{ fontFamily: fontSecondary, color: colorMutedText }}
                      >
                        No {activeTab} information available for this ritual.
                      </div>
                    );
                  }

                  const titleText = activeTab === "why" ? "Why Use This Ritual" : activeTab === "how" ? "How To Perform" : "Tips & Guidelines";

                  return (
                    <div className="flex flex-col gap-5">
                      <h3
                        className="text-lg md:text-xl font-medium pb-2 border-b capitalize"
                        style={{
                          fontFamily: fontPrimary,
                          color: colorSecondary,
                          borderColor: colorBorder,
                        }}
                      >
                        {titleText}
                      </h3>

                      {activeTab === "why" ? (
                        // Free-form paragraph for Why section (NO numbers!)
                        <p
                          className="text-sm md:text-base leading-relaxed whitespace-pre-line"
                          style={{
                            fontFamily: fontSecondary,
                            color: colorText,
                            lineHeight: 1.8,
                          }}
                        >
                          {Array.isArray(list) ? list.join("\n\n") : list}
                        </p>
                      ) : (
                        // Free-form steps/items for How and Tips sections (NO cards!)
                        <div className="space-y-4">
                          {list.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 text-sm md:text-base leading-relaxed"
                              style={{
                                fontFamily: fontSecondary,
                                color: colorText,
                                lineHeight: 1.8,
                              }}
                            >
                              {list.length > 1 && (
                                <span
                                  className="font-medium flex-shrink-0"
                                  style={{ color: colorAccent }}
                                >
                                  {activeTab === "how" ? `${idx + 1}.` : "•"}
                                </span>
                              )}
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )
          )}
        </div>

        {/* Back Button below the content box */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{
            left: orientation === "top" ? size.w * 0.04 : seatZoneSize + desktopContentGap,
            bottom: size.h * 0.025,
            backgroundColor: "rgba(247, 243, 236, 0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.4)",
            color: colorSecondary,
            fontFamily: fontSecondary,
            fontSize: isMobile ? "12px" : "13px",
            fontWeight: 600,
            zIndex: 950,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}