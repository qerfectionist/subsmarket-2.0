import type { FC, ReactNode } from 'react';
import {
    Modal as HeroModal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@heroui/react";

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
    size = 'md',
    placement = 'center',
    backdrop = 'blur',
    isDismissable = true,
    className
}) => (
    <HeroModal
        isOpen={isOpen}
        onClose={onClose}
        size={size}
        placement={placement}
        backdrop={backdrop}
        isDismissable={isDismissable}
        classNames={{
            base: `bg-content1 ${className || ''}`,
            backdrop: "bg-black/50"
        }}
    >
        <ModalContent>
            {() => (
                <>
                    {title && (
                        <ModalHeader className="flex flex-col gap-1">
                            {title}
                        </ModalHeader>
                    )}
                    <ModalBody>
                        {children}
                    </ModalBody>
                    {footer && (
                        <ModalFooter>
                            {footer}
                        </ModalFooter>
                    )}
                </>
            )}
        </ModalContent>
    </HeroModal>
);

Modal.displayName = 'Modal';

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
    className
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        placement="bottom"
        size="full"
        className={className}
    >
        {children}
    </Modal>
);

BottomSheet.displayName = 'BottomSheet';
