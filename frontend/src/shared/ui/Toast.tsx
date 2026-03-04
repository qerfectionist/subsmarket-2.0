import * as React from 'react';
import { MSIcon } from './MSIcon';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

const TYPE_ICON: Record<string, string> = {
  success: 'check_circle',
  error: 'cancel',
  info: 'info',
};
const TYPE_COLOR: Record<string, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-primary',
};

export function Toast({ message, isVisible, onClose, duration = 3000, type = 'success' }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-content1 border border-default-100 text-foreground px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 min-w-[220px]">
        <MSIcon name={TYPE_ICON[type]} size={20} filled className={TYPE_COLOR[type]} />
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
}
