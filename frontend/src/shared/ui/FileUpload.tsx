import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // in MB
    label?: string;
    error?: string;
    className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    accept = 'image/*',
    maxSize = 5,
    label = 'Tap or drag to upload',
    error,
    className
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size must be less than ${maxSize}MB`);
            return;
        }
        setSelectedFile(file);
        onFileSelect(file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer overflow-hidden",
                    isDragging 
                        ? "border-[var(--color-button)] bg-[var(--color-button)]/10" 
                        : "border-[var(--color-separator)] hover:border-[var(--color-text-secondary)]",
                    error ? "border-[var(--color-destructive)] bg-[var(--color-destructive)]/5" : "bg-[var(--color-bg-secondary)]"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept={accept}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {selectedFile ? (
                    <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 flex items-center gap-3 relative z-10 animate-in fade-in">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-12 h-12 rounded object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-[var(--color-bg-primary)] rounded flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[var(--color-text-secondary)]">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        <button
                            onClick={clearFile}
                            className="p-2 hover:bg-[var(--color-bg-primary)] rounded-full transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[var(--color-text-secondary)]">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[var(--color-text-secondary)]">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            {label}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                            Max {maxSize}MB
                        </p>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-[var(--color-destructive)]">{error}</p>
            )}
        </div>
    );
};
