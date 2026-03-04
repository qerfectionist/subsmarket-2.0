import { useQuery } from '@tanstack/react-query';
import { api, Deal } from '@/shared/api';
import { Link } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Card, CardBody, Chip, Skeleton } from "@heroui/react";

const STATUS_CONFIG: Record<string, { label: string; color: "warning" | "primary" | "success" | "danger" | "default"; icon: string }> = {
    pending: { label: 'Ожидание', color: 'warning', icon: '⏳' },
    paid: { label: 'Оплачено', color: 'primary', icon: '💳' },
    confirmed: { label: 'Завершено', color: 'success', icon: '✅' },
    cancelled: { label: 'Отменено', color: 'danger', icon: '✕' },
    disputed: { label: 'Спор', color: 'danger', icon: '⚠️' },
};

export function DealsListPage() {
    const haptic = useHaptic();

    const { data: deals, isLoading, error } = useQuery({
        queryKey: ['my-deals'],
        queryFn: () => api.getMyDeals(),
        refetchInterval: 15000,
    });

    if (isLoading) {
        return (
            <div className="space-y-3 pt-2">
                {[1, 2, 3].map(i => (
                    <Card key={i} shadow="sm">
                        <CardBody className="p-4 flex-row items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-28 rounded-lg" />
                                <Skeleton className="h-3 w-16 rounded" />
                            </div>
                            <Skeleton className="h-6 w-14 rounded-md" />
                        </CardBody>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-danger">
                <p className="font-semibold text-sm">Ошибка загрузки сделок</p>
                <p className="text-default-400 text-xs mt-1">Проверьте подключение</p>
            </div>
        );
    }

    if (!deals || deals.length === 0) {
        return (
            <EmptyState
                title="Нет сделок"
                description="Ваши P2P сделки с ГБ будут отображаться здесь"
                icon={
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-default-400">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                }
            />
        );
    }

    return (
        <div className="space-y-3 pt-2">
            {deals.map((deal) => (
                <DealCard key={deal.deal_id} deal={deal} onTap={() => haptic.impact('light')} />
            ))}
        </div>
    );
}

function DealCard({ deal, onTap }: { deal: Deal; onTap: () => void }) {
    const sc = STATUS_CONFIG[deal.status] || STATUS_CONFIG.pending;
    const date = new Date(deal.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

    return (
        <Card
            as={Link}
            to={`/deals/${deal.deal_id}`}
            isPressable
            onClick={onTap}
            shadow="sm"
            className="w-full"
        >
            <CardBody className="p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center text-lg shrink-0">
                        {sc.icon}
                    </div>

                    <div className="flex-1 flex flex-col items-start gap-1 min-w-0">
                        <span className="font-semibold text-sm tracking-tight truncate w-full text-foreground">Сделка #{deal.deal_id.slice(-6)}</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-default-500">
                            <span>{date}</span>
                            <span className="w-1 h-1 rounded-full bg-default-300 mx-0.5" />
                            <span>{deal.offer_type === 'gigabyte' ? 'ГБ' : 'Клуб'}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="font-bold text-base tabular-nums text-foreground tracking-tight">{deal.amount} ₸</span>
                    <Chip size="sm" variant="flat" color={sc.color} className="h-5 text-[10px] px-1 font-bold tracking-wider uppercase border-none">
                        {sc.label}
                    </Chip>
                </div>
            </CardBody>
        </Card>
    );
}

export default DealsListPage;
