import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Club } from '@/shared/api';
import { t } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Skeleton, Button, Chip, Navbar, NavbarContent, NavbarItem } from '@heroui/react';
import { cn } from '@/shared/lib/utils';
import { MSIcon } from '@/shared/ui/MSIcon';

type Filter = 'all' | 'digital' | 'telecom';

export function ClubsPage() {
    const [filter, setFilter] = useState<Filter>('all');
    const haptic = useHaptic();
    const navigate = useNavigate();

    const { data: clubs, isLoading, error, refetch } = useQuery({
        queryKey: ['clubs', filter],
        queryFn: () => api.getClubs(filter === 'all' ? {} : { category: filter }),
    });

    const handleFilterChange = (newFilter: Filter) => {
        haptic.selection();
        setFilter(newFilter);
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-28">
            {/* Header Sticky Bar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider pb-2">
                <Navbar isBlurred={false} className="bg-transparent px-0">
                    <NavbarContent justify="start" className="px-4">
                        <NavbarItem className="flex flex-col items-start">
                            <span className="text-xl font-bold leading-tight">{t('clubs', 'title')}</span>
                            <span className="text-xs text-default-500 font-medium">
                                {t('clubs', 'subtitle')}
                            </span>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-4">
                    <Chip
                        variant={filter === 'all' ? 'solid' : 'flat'}
                        color={filter === 'all' ? 'primary' : 'default'}
                        className="cursor-pointer flex-shrink-0"
                        size="md"
                        onClick={() => handleFilterChange('all')}
                    >
                        Все
                    </Chip>
                    <Chip
                        variant={filter === 'digital' ? 'solid' : 'flat'}
                        color={filter === 'digital' ? 'primary' : 'default'}
                        className="cursor-pointer flex-shrink-0"
                        size="md"
                        onClick={() => handleFilterChange('digital')}
                    >
                        Сервисы
                    </Chip>
                    <Chip
                        variant={filter === 'telecom' ? 'solid' : 'flat'}
                        color={filter === 'telecom' ? 'primary' : 'default'}
                        className="cursor-pointer flex-shrink-0"
                        size="md"
                        onClick={() => handleFilterChange('telecom')}
                    >
                        Связь
                    </Chip>
                </div>
            </div>

            <main className="flex-1 p-4 max-w-lg mx-auto w-full">
                {/* Content */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="bg-content1 shadow-sm">
                                <CardBody className="p-4 flex-row gap-4 items-center">
                                    <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-32 rounded-lg" />
                                        <Skeleton className="h-3 w-24 rounded-md" />
                                    </div>
                                    <Skeleton className="h-8 w-16 rounded-lg" />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {error && (
                    <Card className="mx-1 mt-4 border-none bg-danger/10 shadow-sm">
                        <CardBody className="py-12 items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-danger/20 text-danger flex items-center justify-center mb-4">
                                <MSIcon name="cancel" size={32} filled />
                            </div>
                            <p className="text-danger font-semibold text-lg mb-1">Ошибка загрузки</p>
                            <p className="text-default-500 text-sm mb-6">Проверьте подключение к интернету</p>
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={() => refetch()}
                                className="font-medium"
                            >
                                Повторить
                            </Button>
                        </CardBody>
                    </Card>
                )}

                {clubs && clubs.length === 0 && (
                    <div className="pt-8">
                        <EmptyState
                            title="Клубы не найдены"
                            description={filter !== 'all' ? 'Попробуйте другой фильтр или создайте свой клуб' : 'Станьте первым — создайте клуб!'}
                            iconName="grid_view"
                            actionLabel="Создать клуб"
                            onAction={() => navigate('/clubs/create')}
                        />
                    </div>
                )}

                {clubs && clubs.length > 0 && (
                    <div className="space-y-3">
                        {clubs.map((club) => (
                            <ClubCard key={club.club_id} club={club} />
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <Link
                to="/clubs/create"
                className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform active:scale-95 duration-200 z-50 hover:bg-primary/90"
                onClick={() => haptic.impact('medium')}
            >
                <MSIcon name="add" size={24} weight={600} />
            </Link>
        </div>
    );
}

function ClubCard({ club }: { club: Club }) {
    const haptic = useHaptic();
    const isFull = club.status === 'full';
    const isFrozen = club.status === 'frozen';
    const isDigital = club.category === 'digital';
    const spotsFree = club.max_members - club.current_members;

    return (
        <Card
            as={Link}
            to={`/clubs/${club.club_id}`}
            isPressable
            className="w-full"
            onPress={() => haptic.impact('light')}
            shadow="sm"
        >
            <CardBody className="p-3 flex flex-row items-center gap-4 overflow-hidden">
                {/* Icon */}
                <div className={cn(
                    "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center overflow-hidden",
                    isDigital ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                )}>
                    {club.subscription.icon_url ? (
                        <img
                            src={club.subscription.icon_url}
                            alt={club.subscription.service_name}
                            className="w-8 h-8 rounded-lg object-cover"
                        />
                    ) : (
                        <span className="text-xl font-bold">
                            {club.subscription.service_name.charAt(0)}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-semibold text-sm truncate leading-tight text-foreground mb-1">
                        {club.subscription.service_name}
                    </h3>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="flex items-center text-xs font-medium text-default-500 gap-1 truncate shrink-0">
                            <MSIcon name="group" size={14} className="shrink-0" />
                            {club.current_members}/{club.max_members}
                        </div>

                        {!isFull && !isFrozen && spotsFree > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-default-300 shrink-0 mx-0.5" />
                                <span className="text-xs font-medium text-success truncate shrink-0 block">
                                    {spotsFree} мест
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Price & Status */}
                <div className="text-right flex flex-col items-end gap-1.5 shrink-0 pl-2">
                    <div className="font-bold text-base leading-none text-foreground flex items-center gap-0.5">
                        {Math.round(club.price_per_member)}
                        <span className="text-xs font-semibold text-default-500 relative top-[1px]">₸</span>
                    </div>

                    <div className="flex justify-end h-5">
                        {isFull && (
                            <Chip size="sm" color="warning" variant="flat" className="h-5 text-[10px] px-1 font-bold tracking-wider uppercase border-none">
                                Full
                            </Chip>
                        )}
                        {isFrozen && (
                            <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px] px-1 font-bold tracking-wider uppercase border-none">
                                Paused
                            </Chip>
                        )}
                        {!isFull && !isFrozen && (
                            <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider relative top-[2px]">
                                /мес
                            </span>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
