import type { FC, ReactNode } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import React from 'react';

// ── Slide-up transition for BottomSheet ──────────────────────────────────────
const SlideUp = React.forwardRef(function SlideUp(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// ── Modal ────────────────────────────────────────────────────────────────────
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    placement?: 'auto' | 'top' | 'center' | 'bottom';
    backdrop?: 'transparent' | 'opaque' | 'blur';
    isDismissable?: boolean;
    className?: string;
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    isDismissable = true,
}) => (
    <Dialog
        open={isOpen}
        onClose={isDismissable ? onClose : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
            sx: {
                borderRadius: 4,
                bgcolor: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundImage: 'none',
                mx: 2,
            }
        }}
    >
        {title && (
            <DialogTitle sx={{ fontWeight: 800, fontSize: 17, pr: 6 }}>
                {title}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}
                >
                    <CloseRoundedIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
        )}
        <DialogContent>{children}</DialogContent>
        {footer && <DialogActions sx={{ px: 3, pb: 3 }}>{footer}</DialogActions>}
    </Dialog>
);

Modal.displayName = 'Modal';

// ── BottomSheet ──────────────────────────────────────────────────────────────
export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export const BottomSheet: FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    children,
}) => (
    <Dialog
        open={isOpen}
        onClose={onClose}
        TransitionComponent={SlideUp}
        fullWidth
        maxWidth="sm"
        PaperProps={{
            sx: {
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                m: 0,
                width: '100%',
                maxWidth: '100% !important',
                borderRadius: '20px 20px 0 0',
                bgcolor: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                backgroundImage: 'none',
                maxHeight: '90dvh',
            }
        }}
        sx={{ '& .MuiDialog-container': { alignItems: 'flex-end' } }}
    >
        {/* Drag handle */}
        <DialogTitle sx={{ textAlign: 'center', pt: 1.5, pb: title ? 1 : 0.5 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 8px' }} />
            {title && <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            {children}
        </DialogContent>
    </Dialog>
);

BottomSheet.displayName = 'BottomSheet';
