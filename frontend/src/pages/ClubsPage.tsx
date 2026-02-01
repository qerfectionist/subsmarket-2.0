import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Club } from '@/api';
import { t } from '@/i18n';
import { useHaptic } from '@/hooks/useHaptic';

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
        <div className="p-4">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold">{t('clubs', 'title')}</h1>
                <p className="text-secondary mt-1">{t('clubs', 'subtitle')}</p>
            </header>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <FilterButton
                    active={filter === 'all'}
                    onClick={() => handleFilterChange('all')}
                >
                    {t('clubs', 'filter_all')}
                </FilterButton>
                <FilterButton
                    active={filter === 'digital'}
                    onClick={() => handleFilterChange('digital')}
                >
                    📺 {t('clubs', 'filter_digital')}
                </FilterButton>
                <FilterButton
                    active={filter === 'telecom'}
                    onClick={() => handleFilterChange('telecom')}
                >
                    📱 {t('clubs', 'filter_telecom')}
                </FilterButton>
            </div>

            {/* Content */}
            {isLoading && (
                <div className="text-center py-12 text-secondary">
                    {t('common', 'loading')}
                </div>
            )}

            {error && (
                <div className="text-center py-12">
                    <p className="text-[var(--color-error)]">{t('common', 'error')}</p>
                    <button
                        className="btn btn-secondary mt-4"
                        onClick={() => window.location.reload()}
                    >
                        {t('common', 'retry')}
                    </button>
                </div>
            )}

            {clubs && clubs.length === 0 && (
                <div className="text-center py-12 text-secondary">
                    {t('clubs', 'empty')}
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
                className="fixed bottom-24 right-4 btn btn-primary shadow-lg"
                onClick={() => haptic.impact('medium')}
            >
                + {t('clubs', 'create_club')}
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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]'
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
            className="card flex gap-4 items-center"
        >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center text-2xl">
                {club.subscription.icon_url ? (
                    <img
                        src={club.subscription.icon_url}
                        alt={club.subscription.service_name}
                        className="w-8 h-8 rounded"
                    />
                ) : (
                    club.category === 'digital' ? '📺' : '📱'
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                    {club.subscription.service_name}
                </h3>
                <p className="text-sm text-secondary">
                    {club.current_members}/{club.max_members} {t('clubs', 'members')}
                </p>
            </div>

            {/* Price & Status */}
            <div className="text-right">
                <div className="font-bold text-[var(--color-accent)]">
                    {Math.round(club.price_per_member)} {t('clubs', 'per_month')}
                </div>
                {isFull && (
                    <span className="badge badge-warning">{t('clubs', 'full')}</span>
                )}
                {isFrozen && (
                    <span className="badge badge-error">{t('clubs', 'frozen')}</span>
                )}
                {!isFull && !isFrozen && (
                    <span className="text-xs text-[var(--color-success)]">
                        {t('clubs', 'join')} →
                    </span>
                )}
            </div>
        </a>
    );
}
