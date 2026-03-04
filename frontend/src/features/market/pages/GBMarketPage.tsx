import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { api, GigabyteOffer, CreateGigabyteOfferRequest } from '@/shared/api';
import { t } from '@/shared/i18n';
import { Tab, Tabs, Slider, Card, CardBody, Button, Chip, Input, Divider, Skeleton, Tooltip, Navbar, NavbarContent, NavbarItem } from "@heroui/react";
import DealsListPage from '@/features/deals/pages/DealsListPage';
import { MSIcon } from '@/shared/ui/MSIcon';

type TabKey = 'buy' | 'sell' | 'my';

const operators = [
    { id: 'beeline', name: 'Beeline' },
    { id: 'tele2', name: 'Tele2' },
    { id: 'altel', name: 'Altel' },
    { id: 'kcell', name: 'Kcell' },
    { id: 'activ', name: 'Activ' },
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
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-24">
            {/* Header Sticky */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider pb-3">
                <Navbar isBlurred={false} className="bg-transparent px-0">
                    <NavbarContent justify="start" className="px-4">
                        <NavbarItem className="flex flex-col items-start gap-0.5">
                            <span className="text-xl font-bold leading-tight">{t('market', 'title')}</span>
                            <span className="text-xs text-default-500 font-medium">{t('market', 'subtitle')}</span>
                        </NavbarItem>
                    </NavbarContent>
                    <NavbarContent justify="end">
                        <NavbarItem>
                            <Chip color="success" variant="flat" size="sm" className="font-bold tracking-wider uppercase text-[10px]">
                                {t('market', 'live')}
                            </Chip>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>

                <div className="px-4 mt-2">
                    <Tabs
                        fullWidth
                        size="md"
                        selectedKey={tab}
                        onSelectionChange={handleTabChange}
                        color="primary"
                        variant="solid"
                        radius="lg"
                    >
                        <Tab key="buy" title={t('market', 'buy')} />
                        <Tab key="sell" title={t('market', 'sell')} />
                        <Tab key="my" title={t('market', 'history')} />
                    </Tabs>
                </div>
            </div>

            <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
                {/* Operator Filters (only on Buy tab) */}
                {tab === 'buy' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                        <Chip
                            size="md"
                            className="cursor-pointer font-medium flex-shrink-0"
                            color={!selectedOperator ? 'primary' : 'default'}
                            variant={!selectedOperator ? 'solid' : 'flat'}
                            onClick={() => {
                                haptic.selection();
                                setSelectedOperator(null);
                            }}
                        >
                            Все
                        </Chip>
                        {operators.map(op => (
                            <Chip
                                key={op.id}
                                size="md"
                                color={selectedOperator === op.id ? 'primary' : 'default'}
                                variant={selectedOperator === op.id ? 'solid' : 'flat'}
                                className="cursor-pointer font-medium flex-shrink-0"
                                onClick={() => {
                                    haptic.selection();
                                    setSelectedOperator(op.id);
                                }}
                            >
                                {op.name}
                            </Chip>
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
                                        <Card key={i} shadow="sm">
                                            <CardBody className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <Skeleton className="h-6 w-24 rounded-lg" />
                                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                                </div>
                                                <Skeleton className="h-4 w-32 rounded-lg" />
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            ) : offers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center text-default-400">
                                        <MSIcon name="storefront" size={32} />
                                    </div>
                                    <p className="text-sm font-medium text-default-500">{t('market', 'no_offers')}</p>
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
                        <div className="pt-2">
                            <SellForm onSuccess={() => {
                                setTab('my');
                            }} />
                        </div>
                    )}

                    {tab === 'my' && (
                        <DealsListPage />
                    )}
                </div>
            </main>
        </div>
    );
}

function OfferCard({ offer, onBuy }: { offer: GigabyteOffer, onBuy: () => void }) {
    const op = operators.find(o => o.id === offer.operator.toLowerCase());
    const pricePerGb = offer.price / offer.amount_gb;
    const isGoodDeal = pricePerGb < 100;

    return (
        <Card isPressable shadow="sm" className="bg-content1 hover:bg-default-50 border-1 border-transparent hover:border-default-200 transition-colors w-full" onPress={onBuy}>
            <CardBody className="p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-[52px] h-[52px] bg-content2 text-primary rounded-xl font-semibold text-xl border border-default-100">
                        <span>{offer.amount_gb}</span>
                        <span className="text-[9px] uppercase -mt-1 font-bold">GB</span>
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm tracking-tight">{op?.name || offer.operator}</h3>
                            {isGoodDeal && (
                                <Tooltip content={t('market', 'good_deal')}>
                                    <Chip color="success" size="sm" variant="flat" className="h-5 text-[10px] px-1 uppercase shrink-0 font-bold border-none">
                                        {t('market', 'hot')}
                                    </Chip>
                                </Tooltip>
                            )}
                        </div>
                        <p className="text-default-400 text-[10px] uppercase font-semibold">
                            {t('market', 'seller')} #{offer.seller_id}
                        </p>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-bold text-lg tracking-tight">{offer.price} ₸</div>
                    <span className="text-[10px] font-bold text-primary uppercase bg-primary-50 px-2 py-1 rounded-md">
                        {t('market', 'buy_action')}
                    </span>
                </div>
            </CardBody>
        </Card>
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
            <div className="space-y-2">
                <label className="text-xs font-semibold text-default-500 uppercase tracking-widest px-1">
                    {t('listing', 'operator')}
                </label>
                <div className="flex flex-wrap gap-2">
                    {operators.map(op => (
                        <Button
                            key={op.id}
                            size="md"
                            radius="md"
                            className="font-medium"
                            color={operator === op.id ? 'primary' : 'default'}
                            variant={operator === op.id ? 'flat' : 'light'}
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

            <Card className="bg-content1 shadow-sm">
                <CardBody className="p-0">
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">{t('listing', 'amount')} (GB)</label>
                            <span className="text-base font-bold text-primary">{gb}</span>
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
                            color="primary"
                            className="max-w-md"
                        />
                    </div>
                    <Divider />
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex flex-col justify-center">
                            <label className="text-sm font-medium">{t('listing', 'price')} (₸)</label>
                            <span className="text-xs text-default-500 mt-0.5">
                                ~ {Math.round(parseInt(price || '0') / gb)} ₸ / GB
                            </span>
                        </div>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-32"
                            variant="flat"
                            color="primary"
                            classNames={{
                                input: "text-right font-bold text-lg",
                            }}
                            endContent={
                                <span className="text-lg font-medium text-default-400">₸</span>
                            }
                        />
                    </div>
                </CardBody>
            </Card>

            <Button
                type="submit"
                color="primary"
                size="lg"
                fullWidth
                className="font-bold text-base mt-4"
                isDisabled={createOfferMutation.isPending}
                isLoading={createOfferMutation.isPending}
            >
                {createOfferMutation.isPending ? t('listing', 'publishing') : t('listing', 'submit')}
            </Button>
        </form>
    );
}

export default GBMarketPage;
