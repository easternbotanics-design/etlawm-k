import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Truck } from 'lucide-react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

const FREE_DELIVERY_THRESHOLD = 399;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const lastToastTimeRef = useRef(0);
  const deliveryToastIdRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(({ heading, body, type = 'info', icon, duration = 5000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast = {
      id,
      heading,
      body,
      type,
      icon,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const showFreeDeliveryUnlockedToast = useCallback((duration = 5000) => {
    if (deliveryToastIdRef.current) {
      dismissToast(deliveryToastIdRef.current);
    }
    const id = showToast({
      type: 'success',
      icon: Truck,
      heading: 'Free Delivery Unlocked!',
      body: (
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <span className="text-[#1f5c52] font-semibold">
            You've unlocked Free Delivery on this order!
          </span>
        </div>
      ),
      duration,
    });
    deliveryToastIdRef.current = id;
    return id;
  }, [showToast, dismissToast]);

  const showFreeDeliveryPromptToast = useCallback((remaining, duration = -1) => {
    if (deliveryToastIdRef.current) {
      dismissToast(deliveryToastIdRef.current);
    }
    const id = showToast({
      type: 'warning',
      icon: Truck,
      heading: 'Almost there...!',
      body: (
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <span className="text-[#A77C6B] font-semibold">
            Add ₹{Number(remaining).toFixed(0)} more to unlock Free Delivery!
          </span>
        </div>
      ),
      duration,
    });
    deliveryToastIdRef.current = id;
    return id;
  }, [showToast, dismissToast]);

  const toast = useMemo(
    () => ({
      show: showToast,
      success: (heading, body, duration, icon) =>
        showToast({ heading, body, type: 'success', duration, icon }),
      error: (heading, body, duration, icon) =>
        showToast({ heading, body, type: 'error', duration, icon }),
      warning: (heading, body, duration, icon) =>
        showToast({ heading, body, type: 'warning', duration, icon }),
      info: (heading, body, duration, icon) =>
        showToast({ heading, body, type: 'info', duration, icon }),
      freeDeliveryUnlocked: showFreeDeliveryUnlockedToast,
      freeDeliveryPrompt: showFreeDeliveryPromptToast,
      dismiss: dismissToast,
    }),
    [showToast, dismissToast, showFreeDeliveryUnlockedToast, showFreeDeliveryPromptToast]
  );

  // Listen for items added to cart across the application
  useEffect(() => {
    const handleCartItemAdded = (event) => {
      const cart = event?.detail?.cart;
      const cartValue = Number(
        event?.detail?.cartValue ??
        (cart?.total != null && cart.total > 0 ? cart.total : cart?.subtotal)
      ) || 0;

      // Debounce rapid multiple events (e.g. adding combos)
      const now = Date.now();
      if (now - lastToastTimeRef.current < 600) {
        return;
      }
      lastToastTimeRef.current = now;

      // Trigger respective toast based on threshold
      if (cartValue < FREE_DELIVERY_THRESHOLD) {
        const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cartValue);
        showFreeDeliveryPromptToast(remaining);
      } else {
        showFreeDeliveryUnlockedToast(5000);
      }
    };

    window.addEventListener('cart-item-added', handleCartItemAdded);
    return () => {
      window.removeEventListener('cart-item-added', handleCartItemAdded);
    };
  }, [showFreeDeliveryPromptToast, showFreeDeliveryUnlockedToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast,
        toast,
        showFreeDeliveryUnlockedToast,
        showFreeDeliveryPromptToast,
      }}
    >
      {children}

      {/* Global Toast Container */}
      <div 
        aria-live="polite" 
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2rem)] w-full items-end"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto w-full max-w-sm sm:max-w-md">
            <Toast
              heading={item.heading}
              type={item.type}
              icon={item.icon}
              duration={item.duration}
              onClose={() => dismissToast(item.id)}
            >
              {item.body}
            </Toast>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
