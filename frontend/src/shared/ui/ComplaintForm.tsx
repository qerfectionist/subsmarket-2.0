/**
 * ComplaintForm Component
 * 
 * Modal form for submitting complaints according to PROJECT_MASTER:
 * - Reasons: fraud, non_payment, spam, fake_listing, no_delivery, other
 * - Evidence URLs (screenshots)
 * - Related deal ID (optional)
 */
import { FC, useState, useCallback } from 'react';

// === Types ===

export type ComplaintReason =
    | 'fraud'
    | 'non_payment'
    | 'spam'
    | 'fake_listing'
    | 'no_delivery'
    | 'other';

export interface ComplaintFormData {
    targetId: number;
    dealId?: string;
    reason: ComplaintReason;
    description: string;
    evidenceUrls: string[];
}

export interface ComplaintFormProps {
    /** Target user ID */
    targetId: number;
    /** Target username for display */
    targetUsername?: string;
    /** Related deal ID (optional) */
    dealId?: string;
    /** Callback on submit */
    onSubmit: (data: ComplaintFormData) => Promise<void>;
    /** Callback on cancel */
    onCancel: () => void;
    /** Loading state */
    isLoading?: boolean;
}

// === Reason Options ===

const COMPLAINT_REASONS: { value: ComplaintReason; label: string; icon: string }[] = [
    { value: 'fraud', label: 'Мошенничество', icon: '🚨' },
    { value: 'non_payment', label: 'Неоплата', icon: '💸' },
    { value: 'no_delivery', label: 'Не отправил товар', icon: '📦' },
    { value: 'fake_listing', label: 'Фейковое объявление', icon: '🎭' },
    { value: 'spam', label: 'Спам', icon: '📢' },
    { value: 'other', label: 'Другое', icon: '❓' },
];

// === Component ===

export const ComplaintForm: FC<ComplaintFormProps> = ({
    targetId,
    targetUsername,
    dealId,
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const [reason, setReason] = useState<ComplaintReason | ''>('');
    const [description, setDescription] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleAddEvidence = useCallback(() => {
        if (evidenceUrl && evidenceUrl.startsWith('http')) {
            setEvidenceUrls(prev => [...prev, evidenceUrl]);
            setEvidenceUrl('');
        }
    }, [evidenceUrl]);

    const handleRemoveEvidence = useCallback((index: number) => {
        setEvidenceUrls(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason) {
            setError('Выберите причину жалобы');
            return;
        }

        if (!description.trim()) {
            setError('Опишите проблему');
            return;
        }

        if (description.length < 20) {
            setError('Описание должно быть не менее 20 символов');
            return;
        }

        try {
            await onSubmit({
                targetId,
                dealId,
                reason,
                description: description.trim(),
                evidenceUrls,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка отправки');
        }
    }, [reason, description, evidenceUrls, targetId, dealId, onSubmit]);

    return (
        <div className="bg-slate-900 rounded-xl p-6 max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Пожаловаться</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white p-1"
                    disabled={isLoading}
                >
                    ✕
                </button>
            </div>

            {/* Target info */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-400">Жалоба на пользователя:</p>
                <p className="text-white font-medium">
                    {targetUsername || `ID: ${targetId}`}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Reason */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Причина жалобы *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {COMPLAINT_REASONS.map(({ value, label, icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setReason(value)}
                                className={`
                  flex items-center gap-2 p-3 rounded-lg border text-left transition-all
                  ${reason === value
                                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                        : 'border-slate-600 bg-slate-800/50 text-gray-300 hover:border-slate-500'
                                    }
                `}
                            >
                                <span>{icon}</span>
                                <span className="text-sm">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Описание проблемы *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Опишите ситуацию подробно. Что произошло? Когда? Какие действия предпринимались?"
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Минимум 20 символов. Написано: {description.length}
                    </p>
                </div>

                {/* Evidence URLs */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Доказательства (скриншоты)
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="url"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={handleAddEvidence}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            disabled={isLoading || !evidenceUrl}
                        >
                            +
                        </button>
                    </div>
                    {evidenceUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {evidenceUrls.map((url, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1 bg-slate-700 rounded px-2 py-1 text-sm"
                                >
                                    <span className="text-gray-300 truncate max-w-[150px]">
                                        {new URL(url).hostname}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEvidence(index)}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Прикрепите ссылки на скриншоты переписки или оплаты
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                        disabled={isLoading || !reason}
                    >
                        {isLoading ? 'Отправка...' : 'Отправить жалобу'}
                    </button>
                </div>
            </form>

            {/* Warning */}
            <p className="text-xs text-gray-500 text-center mt-4">
                ⚠️ Ложные жалобы могут привести к снижению вашего рейтинга
            </p>
        </div>
    );
};

export default ComplaintForm;
