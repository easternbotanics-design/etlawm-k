import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    badgeColor: 'text-[#1f5c52] bg-[#1f5c52]/10 border-[#1f5c52]/20',
    barColor: 'bg-[#1f5c52]',
    borderColor: 'border-[#1f5c52]/30',
  },
  error: {
    icon: AlertCircle,
    badgeColor: 'text-[#DD0000] bg-[#DD0000]/10 border-[#DD0000]/20',
    barColor: 'bg-[#DD0000]',
    borderColor: 'border-[#DD0000]/30',
  },
  warning: {
    icon: AlertTriangle,
    badgeColor: 'text-[#C2410C] bg-[#C2410C]/10 border-[#C2410C]/20',
    barColor: 'bg-[#C2410C]',
    borderColor: 'border-[#C2410C]/30',
  },
  info: {
    icon: Info,
    badgeColor: 'text-[#A77C6B] bg-[#A77C6B]/15 border-[#A77C6B]/30',
    barColor: 'bg-[#A77C6B]',
    borderColor: 'border-[#A77C6B]/30',
  },
};

/**
 * Toast Component
 * 
 * @param {Object} props
 * @param {string|React.ReactNode} props.heading - The title or header node of the toast
 * @param {React.ReactNode} props.children - The variable body content (can be any JSX)
 * @param {'success'|'error'|'warning'|'info'} [props.type='info'] - Variant type
 * @param {React.ComponentType|React.ReactNode|false} [props.icon] - Custom icon component or SVG element
 * @param {Function} [props.onClose] - Callback when dismissed
 * @param {number} [props.duration=5000] - Duration in ms (0 or null to disable auto-close)
 * @param {boolean} [props.isOpen=true] - Useful for controlled standalone usage
 * @param {string} [props.className] - Optional custom CSS classes
 */
const Toast = ({
  heading,
  children,
  type = 'info',
  icon,
  onClose,
  duration = 5000,
  isOpen = true,
  className = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const timerRef = useRef(null);

  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const EffectiveIcon = icon !== undefined ? icon : config.icon;

  const isIndefinite = duration === -1 || duration <= 0 || duration == null;

  useEffect(() => {
    // If duration is -1, 0, or null, keep toast indefinitely until user dismisses it
    if (!isOpen || isIndefinite) return;

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const totalDuration = remainingTimeRef.current;
    const intervalMs = 25;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, totalDuration - elapsed);
      const percentage = (remaining / duration) * 100;
      
      setProgress(percentage);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        onClose?.();
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, duration, isIndefinite, onClose]);

  const handleMouseEnter = () => {
    if (isIndefinite) return;
    setIsPaused(true);
    // calculate remaining
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (isIndefinite) return;
    setIsPaused(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.92, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="status"
          aria-live="polite"
          className={`relative overflow-hidden w-full max-w-sm sm:max-w-md bg-[#FAF7F2]/95 backdrop-blur-md rounded-xl border ${config.borderColor} shadow-[0_12px_32px_rgba(23,23,21,0.12)] p-4 sm:p-5 text-[#171715] transition-shadow hover:shadow-[0_16px_36px_rgba(23,23,21,0.16)] ${className}`}
        >
          {/* Main Content Grid */}
          <div className="flex items-start gap-3.5">
            {/* Status Icon */}
            {EffectiveIcon && (
              <div className={`shrink-0 p-2 rounded-lg border ${config.badgeColor} mt-0.5 flex items-center justify-center`}>
                {React.isValidElement(EffectiveIcon) ? (
                  EffectiveIcon
                ) : typeof EffectiveIcon === 'function' || typeof EffectiveIcon === 'object' ? (
                  React.createElement(EffectiveIcon, { className: "w-5 h-5 stroke-[2]" })
                ) : null}
              </div>
            )}

            {/* Heading & Variable Body */}
            <div className="flex-1 min-w-0 pr-6">
              {heading && (
                <div className="font-['Montserrat',sans-serif] font-semibold text-sm sm:text-base tracking-tight text-[#171715] mb-1">
                  {heading}
                </div>
              )}
              {children && (
                <div className="font-['Montserrat',sans-serif] text-xs sm:text-sm text-[#5C5750] leading-relaxed break-words">
                  {children}
                </div>
              )}
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
                className="absolute top-3.5 right-3.5 p-1 rounded-md text-[#7C7770] hover:text-[#171715] hover:bg-[#E8E2D8]/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Auto-Dismiss Progress Bar (hidden when duration is -1 / indefinite) */}
          {!isIndefinite && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8E2D8]/40 overflow-hidden">
              <div
                className={`h-full ${config.barColor} transition-[width] duration-75 ease-linear opacity-80`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;