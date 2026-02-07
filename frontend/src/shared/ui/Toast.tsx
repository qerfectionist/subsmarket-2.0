import * as React from 'react';
import { useHaptic } from '@/shared/hooks/useHaptic';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const haptic = useHaptic();

  React.useEffect(() => {
    if (isVisible) {
      haptic.notification('success');
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[var(--color-bg-content)] text-[var(--color-text-primary)] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <svg className="w-5 h-5 text-[#34c759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
