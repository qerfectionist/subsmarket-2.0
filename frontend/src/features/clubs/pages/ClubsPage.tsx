import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Club } from '@/shared/api';
import { t } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';

type Filter = 'all' | 'digital' | 'telecom';

export function ClubsPage() {
    const [filter, setFilter] = useState<Filter>('all');
    const haptic = useHaptic();

    const { data: clubs, isLoading, error } = useQuery({
        queryKey: ['clubs', filter],
        queryFn: () => api.getClubs(filter === 'all' ? {} : { category: filter }),
    });

    const handleFilterChange = (newFilter: Filter) => {
        haptic.selection();
        setFilter(newFilter);
    };

    return (
        <div className="p-4 space-y-6 pb-28">
            {/* Header */}
            <header className="px-1 pt-2">
                <h1 className="text-[34px] font-bold tracking-tight leading-none text-white">{t('clubs', 'title')}</h1>
                <p className="text-white/50 text-[13px] font-medium mt-1 tracking-wide">{t('clubs', 'subtitle')}</p>
            </header>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar px-1">
                <FilterButton
                    active={filter === 'all'}
                    onClick={() => handleFilterChange('all')}
                >
                    All
                </FilterButton>
                <FilterButton
                    active={filter === 'digital'}
                    onClick={() => handleFilterChange('digital')}
                >
                    Digital
                </FilterButton>
                <FilterButton
                    active={filter === 'telecom'}
                    onClick={() => handleFilterChange('telecom')}
                >
                    Telecom
                </FilterButton>
            </div>

            {/* Content */}
            {isLoading && (
                <div className="text-center py-24 text-white/30 text-[13px] font-medium tracking-wide animate-pulse">
                    Loading Clubs...
                </div>
            )}

            {error && (
                <div className="text-center py-24 glass-card p-6 mx-1">
                    <p className="text-red-400 font-medium mb-4 text-sm">Failed to load content</p>
                    <button
                        className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[13px] font-semibold transition-all active:scale-95"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            )}

            {clubs && clubs.length === 0 && (
                <div className="text-center py-24 text-white/30 text-[13px] font-medium tracking-wide">
                    No clubs found
                </div>
            )}

            {clubs && clubs.length > 0 && (
                <div className="space-y-3">
                    {clubs.map((club) => (
                        <ClubCard key={club.club_id} club={club} />
                    ))}
                </div>
            )}

            {/* Create button */}
            <a
                href="/clubs/create"
                className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center text-3xl leading-none transition-transform active:scale-90 active:rotate-90 duration-300 z-50 hover:bg-blue-500"
                onClick={() => haptic.impact('medium')}
            >
                <span className="mb-1 font-light">+</span>
            </a>
        </div>
    );
}

function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all border active:scale-95 ${active
                ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
                }`}
        >
            {children}
        </button>
    );
}

function ClubCard({ club }: { club: Club }) {
    const haptic = useHaptic();
    const isFull = club.status === 'full';
    const isFrozen = club.status === 'frozen';

    return (
        <a
            href={`/clubs/${club.club_id}`}
            onClick={() => haptic.impact('light')}
            className="glass-card p-5 flex gap-5 items-center group active:scale-[0.98] transition-all"
        >
            {/* Icon */}
            <div className={`w-[56px] h-[56px] shrink-0 rounded-[18px] flex items-center justify-center text-xl font-bold border ${club.category === 'digital'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/10'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/10'
                }`}>
                {club.subscription.icon_url ? (
                    <img
                        src={club.subscription.icon_url}
                        alt={club.subscription.service_name}
                        className="w-10 h-10 rounded-xl"
                    />
                ) : (
                    <span className="text-xl">{club.category === 'digital' ? 'S' : 'T'}</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
                <h3 className="font-semibold text-[17px] truncate leading-tight tracking-tight text-white mb-1.5">
                    {club.subscription.service_name}
                </h3>
                <div className="flex items-center gap-2">
                    <p className="text-[11px] text-white/50 font-medium tracking-wide">
                        {club.current_members}/{club.max_members} Members
                    </p>
                    <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
                    <p className="text-[11px] text-white/50 font-medium tracking-wide">
                        {club.category === 'digital' ? 'Digital' : 'Telecom'}
                    </p>
                </div>
            </div>

            {/* Price & Status */}
            <div className="text-right flex flex-col items-end gap-1.5">
                <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-[15px] leading-none text-white/90">{Math.round(club.price_per_member)} ₸</span>
                </div>

                {isFull && (
                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/10 uppercase tracking-wide">Full</span>
                )}
                {isFrozen && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/10 uppercase tracking-wide">Paused</span>
                )}
                {!isFull && !isFrozen && (
                    <span className="text-[11px] text-white/30 font-medium pr-1">/mo</span>
                )}
            </div>
        </a>
    );
}
