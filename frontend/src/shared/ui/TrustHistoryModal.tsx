/**
 * TrustHistoryModal Component
 * 
 * Displays trust score history with timeline of events
 * According to PROJECT_MASTER Trust System rules
 */
import { FC, memo } from 'react';
import { TrustEvent } from '@/shared/api/trust';

// === Types ===

export interface TrustHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: TrustEvent[];
    isLoading?: boolean;
}

// === Event Labels ===

const EVENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    successful_deal: { label: 'Успешная сделка', icon: '✅', color: 'text-green-400' },
    first_complaint_confirmed: { label: 'Жалоба подтверждена', icon: '⚠️', color: 'text-orange-400' },
    repeat_complaint_confirmed: { label: 'Повторная жалоба', icon: '🚨', color: 'text-red-400' },
    seller_cancellation: { label: 'Отмена продавцом', icon: '❌', color: 'text-red-400' },
    fraud_ban: { label: 'Бан за мошенничество', icon: '🚫', color: 'text-red-500' },
    account_created: { label: 'Аккаунт создан', icon: '🆕', color: 'text-blue-400' },
};

// === Component ===

export const TrustHistoryModal: FC<TrustHistoryModalProps> = memo(({
    isOpen,
    onClose,
    events,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">История рейтинга</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">📊</div>
                            <p className="text-gray-400">История пуста</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Здесь будет отображаться история изменений вашего рейтинга
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event, index) => {
                                const eventInfo = EVENT_LABELS[event.event_type] || {
                                    label: event.event_type,
                                    icon: '📋',
                                    color: 'text-gray-400',
                                };

                                const isPositive = event.score_change > 0;

                                return (
                                    <div
                                        key={event.event_id || index}
                                        className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl"
                                    >
                                        {/* Icon */}
                                        <div className="text-2xl">{eventInfo.icon}</div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`font-medium ${eventInfo.color}`}>
                                                    {eventInfo.label}
                                                </span>
                                                <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {isPositive ? '+' : ''}{Number(event.score_change ?? 0).toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Score transition */}
                                            <div className="text-sm text-gray-500 mt-1">
                                                {Number(event.score_before ?? 0).toFixed(1)} → {Number(event.score_after ?? 0).toFixed(1)}
                                            </div>

                                            {/* Notes */}
                                            {event.notes && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {event.notes}
                                                </p>
                                            )}

                                            {/* Date */}
                                            {event.created_at && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(event.created_at).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
});

TrustHistoryModal.displayName = 'TrustHistoryModal';

export default TrustHistoryModal;
