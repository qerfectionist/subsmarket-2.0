import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { api, GigabyteOffer, CreateGigabyteOfferRequest } from '@/shared/api';
// import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Tooltip } from '@/shared/ui/Popover';
import { Tab, Tabs, Slider } from "@heroui/react";

type TabKey = 'buy' | 'sell' | 'my';

const operators = [
    { id: 'beeline', name: 'Beeline', color: '#FFB800', bg: '#FFB800' },
    { id: 'tele2', name: 'Tele2', color: '#00B4E6', bg: '#1F2229' },
    { id: 'altel', name: 'Altel', color: '#7C3AED', bg: '#7C3AED' },
    { id: 'kcell', name: 'Kcell', color: '#00A651', bg: '#00A651' },
    { id: 'activ', name: 'Activ', color: '#FF6B00', bg: '#FF6B00' },
];

export function GBMarketPage() {
    const [tab, setTab] = useState<TabKey>('buy');
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const haptic = useHaptic();
    const { showConfirm } = useTelegram();
    const queryClient = useQueryClient();

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['gb-offers', selectedOperator],
        queryFn: () => api.getGigabyteOffers(selectedOperator ? { operator: selectedOperator } : undefined),
    });

    const createDealMutation = useMutation({
        mutationFn: api.createDeal,
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['my-deals'] });
            setTab('my');
        },
        onError: () => haptic.notification('error'),
    });

    const handleTabChange = (key: React.Key) => {
        haptic.selection();
        setTab(key as TabKey);
    };

    const handleBuyOffer = async (offer: GigabyteOffer) => {
        haptic.impact('heavy');
        const confirmed = await showConfirm(`Buy ${offer.amount_gb} GB for ${offer.price} ₸?`);
        if (confirmed) {
            createDealMutation.mutate({
                offer_type: 'gigabyte',
                offer_id: offer.offer_id,
                amount: offer.price
            });
        }
    };

    return (
        <div className="p-4 pb-24 space-y-4">
            {/* Header */}
            <header className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight leading-none">Market</h1>
                    <p className="text-white/50 text-[13px] font-medium mt-1">Trade mobile traffic instantly</p>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10 tracking-wide uppercase">
                    Live
                </div>
            </header>

            {/* Tabs */}
            <Tabs
                fullWidth
                size="lg"
                selectedKey={tab}
                onSelectionChange={handleTabChange}
                classNames={{
                    cursor: "bg-[var(--color-bg-primary)] shadow-sm",
                    tabContent: "font-bold group-data-[selected=true]:text-[var(--color-text-primary)]"
                }}
            >
                <Tab key="buy" title="Buy" />
                <Tab key="sell" title="Sell" />
                <Tab key="my" title="History" />
            </Tabs>

            {/* Operator Filters (only on Buy tab) */}
            {tab === 'buy' && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    <Button
                        size="sm"
                        radius="full"
                        variant={!selectedOperator ? 'solid' : 'flat'}
                        onPress={() => {
                            haptic.selection();
                            setSelectedOperator(null);
                        }}
                    >
                        All
                    </Button>
                    {operators.map(op => (
                        <Button
                            key={op.id}
                            size="sm"
                            radius="full"
                            style={selectedOperator === op.id ? { backgroundColor: op.color, color: 'white' } : {}}
                            variant={selectedOperator === op.id ? 'solid' : 'flat'}
                            onPress={() => {
                                haptic.selection();
                                setSelectedOperator(op.id);
                            }}
                            startContent={
                                <span className="w-2 h-2 rounded-full bg-current opacity-50" style={{ backgroundColor: selectedOperator !== op.id ? op.color : 'white' }} />
                            }
                        >
                            {op.name}
                        </Button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="min-h-[300px]">
                {tab === 'buy' && (
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="glass-card p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="h-6 w-24 rounded-lg bg-white/5" />
                                            <Skeleton className="h-8 w-20 rounded-lg bg-white/5" />
                                        </div>
                                        <Skeleton className="h-4 w-32 rounded-lg bg-white/5" />
                                        <div className="flex justify-between items-center pt-2">
                                            <Skeleton className="h-4 w-16 rounded-lg bg-white/5" />
                                            <Skeleton className="h-9 w-24 rounded-lg bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : offers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-secondary)] space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl grayscale opacity-50">
                                    📭
                                </div>
                                <p className="text-[13px] font-medium text-white/40">No offers found for {selectedOperator || 'any operator'}</p>
                            </div>
                        ) : (
                            offers.map(offer => (
                                <OfferCard
                                    key={offer.offer_id}
                                    offer={offer}
                                    onBuy={() => handleBuyOffer(offer)}
                                />
                            ))
                        )}
                    </div>
                )}

                {tab === 'sell' && (
                    <SellForm onSuccess={() => handleTabChange('my')} />
                )}

                {tab === 'my' && (
                    <MyDealsList />
                )}
            </div>
        </div>
    );
}

function OfferCard({ offer, onBuy }: { offer: GigabyteOffer, onBuy: () => void }) {
    const op = operators.find(o => o.id === offer.operator.toLowerCase());

    // Calculate price per GB quality (good deal vs bad deal)
    const pricePerGb = offer.price / offer.amount_gb;
    const isGoodDeal = pricePerGb < 100; // < 100 T/GB is good

    return (
        <button
            className="glass-card flex flex-row p-0 overflow-hidden w-full text-left active:scale-[0.98] transition-all group"
            onClick={onBuy}
        >
            {/* Left Stripe */}
            <div className="w-1.5" style={{ backgroundColor: op?.color || '#666' }} />

            <div className="p-5 flex-1 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-[52px] h-[52px] bg-white/5 rounded-2xl font-semibold text-xl border border-white/5">
                        <span>{offer.amount_gb}</span>
                        <span className="text-[9px] text-white/40 uppercase -mt-1 font-bold">GB</span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[17px] tracking-tight">{op?.name || offer.operator}</h3>
                            {isGoodDeal && (
                                <Tooltip content="Below market average!">
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase cursor-help border border-emerald-500/10 tracking-wide">
                                        Hot
                                    </span>
                                </Tooltip>
                            )}
                        </div>
                        <p className="text-white/40 text-[11px] uppercase tracking-wide font-medium">
                            Seller #{offer.seller_id}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="font-semibold text-[20px] tracking-tight text-white/90">{offer.price} ₸</div>
                    <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg inline-block mt-1 group-hover:bg-blue-500 group-hover:text-white transition-colors uppercase tracking-wide">
                        Buy
                    </div>
                </div>
            </div>
        </button>
    );
}

function SellForm({ onSuccess }: { onSuccess: () => void }) {
    const haptic = useHaptic();
    const queryClient = useQueryClient();
    const [operator, setOperator] = useState('beeline');
    const [gb, setGb] = useState<number>(10);
    const [price, setPrice] = useState<string>('500');

    const createOfferMutation = useMutation({
        mutationFn: (data: CreateGigabyteOfferRequest) => api.createGigabyteOffer(data),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['gb-offers'] });
            onSuccess();
        },
        onError: () => haptic.notification('error')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        haptic.impact('heavy');
        createOfferMutation.mutate({
            operator,
            amount_gb: gb,
            price: parseInt(price)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Operator Selection */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase ml-1 tracking-widest">Operator</label>
                <div className="grid grid-cols-3 gap-2">
                    {operators.slice(0, 3).map(op => (
                        <Button
                            key={op.id}
                            className="h-14 font-bold"
                            style={operator === op.id ? { backgroundColor: op.color, color: 'white' } : {}}
                            variant={operator === op.id ? 'solid' : 'flat'}
                            onPress={() => {
                                haptic.selection();
                                setOperator(op.id);
                            }}
                        >
                            {op.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* GB Slider */}
            <div className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Traffic Volume</label>
                    <span className="text-2xl font-black tracking-tight">{gb} GB</span>
                </div>
                <Slider
                    step={1}
                    maxValue={50}
                    minValue={1}
                    value={gb}
                    onChange={(val) => {
                        haptic.selection();
                        const v = Array.isArray(val) ? val[0] : val;
                        setGb(v);
                        setPrice((v * 50).toString());
                    }}
                    aria-label="GB"
                    color="foreground"
                    className="max-w-md"
                />
                <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)] font-bold uppercase">
                    <span>1 GB</span>
                    <span>50 GB</span>
                </div>
            </div>

            {/* Price Input */}
            <div className="glass-card p-6 space-y-2">
                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Price (KZT)</label>
                <div className="relative">
                    <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="text-2xl font-bold text-center"
                        classNames={{
                            input: "text-center text-2xl font-bold h-12"
                        }}
                    />
                </div>
                <p className="text-center text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wide">
                    ~ {Math.round(parseInt(price || '0') / gb)} ₸ per GB
                </p>
            </div>

            <Button
                type="submit"
                disabled={createOfferMutation.isPending}
                className="w-full h-14 text-lg font-bold tracking-wide rounded-xl shadow-xl shadow-blue-900/20"
                color="primary"
                variant="shadow"
                size="lg"
                isLoading={createOfferMutation.isPending}
            >
                {createOfferMutation.isPending ? 'PUBLISHING...' : 'PUBLISH OFFER'}
            </Button>
        </form>
    );
}

function MyDealsList() {
    const queryClient = useQueryClient();
    const haptic = useHaptic();
    const { data: deals = [] } = useQuery({
        queryKey: ['my-deals'],
        queryFn: api.getMyDeals,
        refetchInterval: 3000,
    });

    const handleDispute = async (dealId: string) => {
        haptic.impact('heavy');
        const reason = prompt("Please describe the issue with this deal:");
        if (!reason) return;

        try {
            await api.openDispute(dealId, reason);
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['my-deals'] });
        } catch {
            haptic.notification('error');
            alert("Failed to open dispute. Ensure 15 minutes have passed since payment.");
        }
    };

    if (deals.length === 0) return (
        <div className="text-center py-24 text-white/30 text-sm font-medium tracking-wide">
            NO ACTIVE DEALS
        </div>
    );

    return (
        <div className="space-y-4 pb-24">
            {deals.map(deal => {
                const isPaid = deal.status === 'paid_by_buyer';
                const canDispute = isPaid && deal.paid_at && (Date.now() - new Date(deal.paid_at).getTime() > 15 * 60 * 1000);
                const timeLeft = isPaid && deal.paid_at ? Math.max(0, 15 - (Date.now() - new Date(deal.paid_at).getTime()) / 60000) : 0;

                return (
                    <div key={deal.deal_id} className="glass-card p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold flex items-center gap-2 text-sm tracking-wide">
                                    DEAL #{deal.deal_id.slice(0, 4)}
                                    {deal.status === 'dispute_open' && (
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                    )}
                                </div>
                                <div className="text-[10px] text-white/50 uppercase mt-1 font-medium tracking-widest">
                                    {deal.status.replace(/_/g, ' ')}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">{deal.amount} ₸</div>
                                <div className="text-[10px] text-white/40">
                                    {new Date(deal.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Dispute Actions */}
                        {isPaid && (
                            <div className="pt-3 border-t border-white/5">
                                {canDispute ? (
                                    <Button
                                        size="sm"
                                        className="w-full font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95 h-10"
                                        onPress={() => handleDispute(deal.deal_id)}
                                    >
                                        OPEN DISPUTE
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-xs text-white/40 bg-white/5 py-2 rounded-lg border border-white/5">
                                        <div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                                        <span>Protection ends in <span className="font-mono text-white/80">{Math.ceil(timeLeft)}m</span></span>
                                    </div>
                                )}
                            </div>
                        )}

                        {deal.status === 'dispute_open' && (
                            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-xs text-red-200 leading-relaxed">
                                <strong className="text-red-400 block mb-1 uppercase tracking-wider text-[10px]">Argument</strong>
                                {deal.dispute_reason}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

