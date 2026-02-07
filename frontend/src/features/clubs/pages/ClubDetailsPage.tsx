import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { t } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';
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
                <div className="text-white/30 text-sm font-medium tracking-wide animate-pulse">LOADING...</div>
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="text-red-400 font-bold mb-4">FAILED TO LOAD CLUB</div>
                <button
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-all"
                    onClick={() => navigate(-1)}
                >
                    BACK
                </button>
            </div>
        );
    }

    const isFull = club.status === 'full';
    const hasCredentials = !!club.login;
    const currentUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    const isHost = club.host_id === currentUserId;
    const isMember = hasCredentials;

    return (
        <div className="p-4 pb-32 space-y-4">
            {/* Header */}
            <header className="flex items-center gap-4 mb-6 pt-2">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-all text-white/60 hover:bg-white/10"
                >
                    <span className="text-xl pb-1">‹</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-[28px] font-bold leading-none tracking-tight">{club.subscription.service_name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[11px] uppercase font-bold tracking-wide px-2.5 py-1 rounded-lg border ${club.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                            club.status === 'full' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10' :
                                'bg-red-500/10 text-red-400 border-red-500/10'
                            }`}>
                            {club.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </header>

            {/* Price card */}
            <div className="glass-card p-6 text-center">
                <div className="text-[40px] font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent leading-none tracking-tight">
                    {Math.round(club.price_per_member)} ₸
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wide font-medium mt-1 mb-4">Per Month</div>
                <div className="inline-block px-3 py-1.5 rounded-lg bg-white/5 text-[11px] text-white/60 font-medium">
                    Total: {club.price_total} ₸ / {club.max_members} members
                </div>
            </div>

            {/* Host info */}
            <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/10">
                    {club.host.first_name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                    <div className="text-[10px] text-white/40 uppercase tracking-wide font-semibold mb-0.5">HOST</div>
                    <div className="font-semibold text-base tracking-tight">{club.host.first_name || club.host.username || 'User'}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase tracking-wide font-semibold mb-0.5">TRUST</div>
                    <div className="font-bold text-yellow-400 text-sm flex items-center justify-end gap-1">
                        ★ {club.host.trust_score}
                    </div>
                </div>
            </div>

            {/* Members */}
            <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/80">Members</span>
                    <span className="text-[10px] text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded">
                        {club.current_members}/{club.max_members}
                    </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {Array.from({ length: club.current_members }).map((_, i) => (
                        <div
                            key={`member-${i}`}
                            className="w-10 h-10 shrink-0 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-white/60"
                        >
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                        </div>
                    ))}
                    {Array.from({ length: club.max_members - club.current_members }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="w-10 h-10 shrink-0 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/20 text-lg"
                        >
                            +
                        </div>
                    ))}
                </div>
            </div>

            {/* Credentials (only for members) */}
            {hasCredentials && (
                <div className="glass-card p-4 border-l-4 border-l-emerald-500">
                    <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
                        CREDENTIALS
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">LOGIN</div>
                            <div className="font-mono text-sm select-all text-white/90">{club.login}</div>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">PASSWORD</div>
                            <div className="font-mono text-sm select-all text-white/90">{club.password || '••••••••'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment info */}
            <div className="glass-card p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-white/80 mb-4">Payment Details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs text-white/50">Method</span>
                        <span className="text-sm font-medium capitalize text-white/90">{club.payment_method}</span>
                    </div>
                    {club.payment_details && (
                        <div className="py-2 border-b border-white/5">
                            <span className="text-xs text-white/50 block mb-1">Details</span>
                            <span className="text-sm font-mono text-white/80 block break-all">{club.payment_details}</span>
                        </div>
                    )}
                    {club.payment_day && (
                        <div className="flex justify-between items-center py-2">
                            <span className="text-xs text-white/50">Payment Day</span>
                            <span className="text-sm font-medium text-white/90">Day {club.payment_day} of month</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rules */}
            {club.rules && (
                <div className="glass-card p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-white/80 mb-3">Rules</h3>
                    <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{club.rules}</p>
                </div>
            )}

            {/* Description */}
            {club.description && (
                <div className="glass-card p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-white/80 mb-3">Description</h3>
                    <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{club.description}</p>
                </div>
            )}

            {/* Telegram group */}
            {club.telegram_group_link && (
                <a
                    href={club.telegram_group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl border border-blue-500/10">
                        t
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-sm">Join Telegram Group</div>
                        <div className="text-[10px] text-white/40">Discuss with club members</div>
                    </div>
                    <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                </a>
            )}

            {/* Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
                {!isMember && !isHost && (
                    <button
                        onClick={() => {
                            haptic.impact('medium');
                            joinMutation.mutate();
                        }}
                        disabled={isFull || joinMutation.isPending}
                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold tracking-wide shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] text-[17px]"
                    >
                        {joinMutation.isPending ? 'Processing...' :
                            isFull ? 'Club Full' : `Join Club (${Math.round(club.price_per_member)} ₸)`}
                    </button>
                )}

                {isMember && !isHost && (
                    <button
                        onClick={() => {
                            haptic.impact('light');
                            setShowLeaveModal(true);
                        }}
                        className="w-full h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-semibold tracking-wide transition-all active:scale-[0.98] text-[17px]"
                    >
                        Leave Club
                    </button>
                )}

                {isHost && (
                    <div className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white/40">
                        You are the host
                    </div>
                )}
            </div>

            {/* Leave confirmation modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="glass-card p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-2">LEAVE CLUB?</h3>
                        <p className="text-sm text-white/60 mb-6 leading-relaxed">{t('club_details', 'confirm_leave')}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveModal(false)}
                                className="flex-1 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={() => {
                                    haptic.impact('heavy');
                                    leaveMutation.mutate();
                                }}
                                disabled={leaveMutation.isPending}
                                className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-colors"
                            >
                                {leaveMutation.isPending ? '...' : 'LEAVE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
