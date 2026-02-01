import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ClubDetails } from '@/api';
import { t } from '@/i18n';
import { useHaptic } from '@/hooks/useHaptic';
import { useState } from 'react';

export function ClubDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const queryClient = useQueryClient();
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    const { data: club, isLoading, error } = useQuery({
        queryKey: ['club', id],
        queryFn: () => api.getClub(id!),
        enabled: !!id,
    });

    const joinMutation = useMutation({
        mutationFn: () => api.joinClub(id!),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => haptic.notification('error'),
    });

    const leaveMutation = useMutation({
        mutationFn: () => api.leaveClub(id!),
        onSuccess: () => {
            haptic.notification('success');
            navigate('/clubs');
        },
        onError: () => haptic.notification('error'),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-secondary">{t('common', 'loading')}</div>
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="text-6xl">🔍</div>
                <div className="text-secondary">{t('common', 'error')}</div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    {t('common', 'back')}
                </button>
            </div>
        );
    }

    const isFull = club.status === 'full';
    const hasCredentials = !!club.login;
    const currentUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    const isHost = club.host_id === currentUserId;
    const isMember = hasCredentials; // If credentials are visible, user is a member

    return (
        <div className="p-4 pb-32">
            {/* Header */}
            <header className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-2xl">←</button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{club.subscription.service_name}</h1>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${club.status === 'open' ? 'bg-green-500/20 text-green-400' :
                            club.status === 'full' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        {club.status === 'open' ? '🟢 Открыт' : club.status === 'full' ? '🟡 Полный' : '🔴 ' + club.status}
                    </span>
                </div>
            </header>

            {/* Price card */}
            <div className="card mb-4 text-center">
                <div className="text-4xl font-bold text-[var(--color-accent)]">
                    {Math.round(club.price_per_member)} ₸
                </div>
                <div className="text-secondary">{t('clubs', 'per_month')}</div>
                <div className="mt-2 text-sm text-tertiary">
                    Всего: {club.price_total} ₸ / {club.max_members} чел.
                </div>
            </div>

            {/* Host info */}
            <div className="card mb-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-2xl">
                    👤
                </div>
                <div className="flex-1">
                    <div className="text-sm text-secondary">{t('club_details', 'host')}</div>
                    <div className="font-semibold">{club.host.first_name || club.host.username || 'User'}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-secondary">Рейтинг</div>
                    <div className="font-semibold text-yellow-400">⭐ {club.host.trust_score}</div>
                </div>
            </div>

            {/* Members */}
            <div className="card mb-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Участники</span>
                    <span className="text-secondary">
                        {club.current_members}/{club.max_members}
                    </span>
                </div>
                <div className="flex -space-x-2">
                    {Array.from({ length: club.current_members }).map((_, i) => (
                        <div
                            key={i}
                            className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-bg-primary)] flex items-center justify-center"
                        >
                            👤
                        </div>
                    ))}
                    {Array.from({ length: club.max_members - club.current_members }).map((_, i) => (
                        <div
                            key={i}
                            className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--color-border-default)] flex items-center justify-center text-secondary"
                        >
                            +
                        </div>
                    ))}
                </div>
            </div>

            {/* Credentials (only for members) */}
            {hasCredentials && (
                <div className="card mb-4 border border-[var(--color-accent)]">
                    <h3 className="font-semibold mb-3 text-[var(--color-accent)]">
                        🔐 {t('club_details', 'credentials')}
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-secondary">{t('club_details', 'login')}</span>
                            <span className="font-mono">{club.login}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-secondary">{t('club_details', 'password')}</span>
                            <span className="font-mono">{club.password || '••••••••'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment info */}
            <div className="card mb-4">
                <h3 className="font-semibold mb-3">💳 Оплата</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-secondary">{t('club_details', 'payment_method')}</span>
                        <span className="capitalize">{club.payment_method}</span>
                    </div>
                    {club.payment_details && (
                        <div className="flex justify-between">
                            <span className="text-secondary">Реквизиты</span>
                            <span>{club.payment_details}</span>
                        </div>
                    )}
                    {club.payment_day && (
                        <div className="flex justify-between">
                            <span className="text-secondary">{t('club_details', 'payment_day')}</span>
                            <span>{club.payment_day} числа</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rules */}
            {club.rules && (
                <div className="card mb-4">
                    <h3 className="font-semibold mb-2">📋 {t('club_details', 'rules')}</h3>
                    <p className="text-sm text-secondary whitespace-pre-wrap">{club.rules}</p>
                </div>
            )}

            {/* Description */}
            {club.description && (
                <div className="card mb-4">
                    <h3 className="font-semibold mb-2">📝 Описание</h3>
                    <p className="text-sm text-secondary whitespace-pre-wrap">{club.description}</p>
                </div>
            )}

            {/* Telegram group */}
            {club.telegram_group_link && (
                <a
                    href={club.telegram_group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card mb-4 flex items-center gap-3"
                >
                    <span className="text-2xl">💬</span>
                    <span className="flex-1 font-semibold">{t('club_details', 'telegram_group')}</span>
                    <span className="text-[var(--color-accent)]">→</span>
                </a>
            )}

            {/* Actions */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent">
                {!isMember && !isHost && (
                    <button
                        onClick={() => {
                            haptic.impact('medium');
                            joinMutation.mutate();
                        }}
                        disabled={isFull || joinMutation.isPending}
                        className="btn btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50"
                    >
                        {joinMutation.isPending ? t('common', 'loading') :
                            isFull ? t('clubs', 'full') : t('clubs', 'join')}
                    </button>
                )}

                {isMember && !isHost && (
                    <button
                        onClick={() => {
                            haptic.impact('light');
                            setShowLeaveModal(true);
                        }}
                        className="btn btn-secondary w-full py-4 text-lg font-semibold border border-red-500 text-red-400"
                    >
                        {t('club_details', 'leave_club')}
                    </button>
                )}

                {isHost && (
                    <div className="text-center text-secondary">
                        Вы организатор этого клуба
                    </div>
                )}
            </div>

            {/* Leave confirmation modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="card max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-2">⚠️ Покинуть клуб?</h3>
                        <p className="text-secondary mb-4">{t('club_details', 'confirm_leave')}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveModal(false)}
                                className="btn btn-secondary flex-1"
                            >
                                {t('common', 'cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    haptic.impact('heavy');
                                    leaveMutation.mutate();
                                }}
                                disabled={leaveMutation.isPending}
                                className="btn flex-1 bg-red-500 text-white"
                            >
                                {leaveMutation.isPending ? '...' : 'Выйти'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
