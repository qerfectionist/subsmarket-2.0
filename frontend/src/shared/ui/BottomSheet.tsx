import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, triggerHaptic } from '@/shared/lib/utils';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) {
                                triggerHaptic('medium');
                                onClose();
                            }
                        }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-50",
                            "bg-[#121212] border-t border-white/10 rounded-t-[32px] overflow-hidden",
                            "shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                        )}
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="px-6 py-4 border-b border-white/5">
                                <h3 className="text-[20px] font-bold text-white tracking-tight">{title}</h3>
                            </div>
                        )}

                        {/* Content */}
                        <div className="max-h-[85vh] overflow-y-auto px-6 pb-8 pt-4">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
