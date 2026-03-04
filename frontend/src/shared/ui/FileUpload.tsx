import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { MSIcon } from './MSIcon';

export interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number;
    label?: string;
    error?: string;
    className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    accept = 'image/*',
    maxSize = 5,
    label = 'Нажмите или перетащите файл',
    error,
    className
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            alert(`Размер файла не должен превышать ${maxSize}MB`);
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
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={cn('w-full', className)}>
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer',
                    isDragging
                        ? 'border-primary bg-primary-50'
                        : 'border-default-200 hover:border-default-400 bg-content2',
                    error && 'border-danger bg-danger-50'
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
                    <div className="bg-content1 rounded-xl p-3 flex items-center gap-3 animate-in fade-in">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-content2 rounded-xl flex items-center justify-center">
                                <MSIcon name="description" size={24} className="text-default-400" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                            <p className="text-xs text-default-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        <button
                            onClick={clearFile}
                            className="p-1.5 hover:bg-content2 rounded-full transition-colors text-default-400"
                        >
                            <MSIcon name="close" size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-content1 border border-default-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <MSIcon name="cloud_upload" size={24} className="text-default-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                        <p className="text-xs text-default-400">Макс. {maxSize}MB</p>
                    </div>
                )}
            </div>
            {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
        </div>
    );
};
