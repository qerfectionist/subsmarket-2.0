import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, AccountOffer } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { Tabs, Tab, Button, Card, CardBody, Input, Select, SelectItem, Textarea, Chip } from "@heroui/react";

type TabKey = 'buy' | 'sell';

export function AccountsPage() {
    const [tab, setTab] = useState<TabKey>('buy');
    const haptic = useHaptic();
    const { webapp } = useTelegram();
    const user = webapp?.initDataUnsafe?.user;

    // Fetch offers
    const { data: offers = [], isLoading, refetch } = useQuery({
        queryKey: ['account-offers'],
        queryFn: () => api.getAccountOffers(),
        refetchInterval: 10000,
    });

    const handleTabChange = (key: React.Key) => {
        haptic.selection();
        setTab(key as TabKey);
    };

    return (
        <div className="p-4 pb-28 min-h-[100dvh] bg-background text-foreground">
            {/* Header */}
            <header className="mb-6 pt-2">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                    🔐 Accounts Market
                </h1>
                <p className="text-default-500 text-sm mt-1 font-medium tracking-wide">
                    Buy and sell digital accounts safely.
                </p>
            </header>

            {/* Tabs */}
            <Tabs
                fullWidth
                size="md"
                selectedKey={tab}
                onSelectionChange={handleTabChange}
                className="mb-6"
                color="primary"
                variant="bordered"
            >
                <Tab key="buy" title="Buy" />
                <Tab key="sell" title="Sell" />
            </Tabs>

            {/* Content */}
            {tab === 'buy' && (
                <div className="space-y-3">
                    {isLoading && <div className="text-center py-10 text-default-400 font-medium">Loading offers...</div>}

                    {!isLoading && offers.length === 0 && (
                        <div className="text-center py-12 text-default-400 bg-content1 rounded-2xl border border-default-100 shadow-sm">
                            <div className="text-4xl mb-3 text-default-300">📭</div>
                            <span className="font-semibold text-sm">No active offers found.</span>
                        </div>
                    )}

                    {offers.map(offer => (
                        <AccountCard
                            key={offer.offer_id}
                            offer={offer}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}

            {tab === 'sell' && (
                <SellAccountForm onSuccess={() => {
                    handleTabChange('buy');
                    refetch();
                }} />
            )}
        </div>
    );
}

function AccountCard({ offer, currentUserId }: { offer: AccountOffer; currentUserId?: number }) {
    const haptic = useHaptic();
    const { showConfirm } = useTelegram();
    const queryClient = useQueryClient();

    const buyMutation = useMutation({
        mutationFn: () => api.createDeal({
            offer_type: 'account',
            offer_id: offer.offer_id,
            amount: offer.price
        }),
        onSuccess: (deal) => {
            haptic.notification('success');
            alert(`Deal #${deal.deal_id.slice(0, 8)} created!\nCheck "My Deals" tab.`);
            queryClient.invalidateQueries({ queryKey: ['account-offers'] });
        },
        onError: (e) => {
            haptic.notification('error');
            console.error(e);
            alert('Failed to create deal');
        }
    });

    const handleBuy = async () => {
        haptic.impact('medium');
        const confirmed = await showConfirm(`Buy "${offer.title}" for ${offer.price} ₸?`);
        if (!confirmed) return;
        buyMutation.mutate();
    };

    const isOwner = currentUserId === offer.seller_id;

    return (
        <Card shadow="sm" className="bg-content1 border-none mb-3">
            <CardBody className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <Chip size="sm" variant="flat" color="primary" className="mb-2 font-bold tracking-wider uppercase text-[9px]">
                            {offer.service_category}
                        </Chip>
                        <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2">{offer.title}</h3>
                    </div>
                    <div className="text-lg font-bold text-foreground bg-default-100 px-2 py-1 rounded-lg tabular-nums tracking-tight flex-shrink-0">
                        {offer.price} <span className="text-sm font-medium text-default-400">₸</span>
                    </div>
                </div>

                <p className="text-sm text-default-500 mb-4 line-clamp-3 bg-content2 p-3 rounded-xl border-none leading-relaxed">
                    {offer.description}
                </p>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-default-100">
                    <span className="text-[10px] font-mono text-default-400">SELLER #{offer.seller_id}</span>

                    {!isOwner && (
                        <Button
                            onPress={handleBuy}
                            color="primary"
                            variant="flat"
                            size="sm"
                            className="font-bold tracking-wide"
                            isLoading={buyMutation.isPending}
                        >
                            Buy Now
                        </Button>
                    )}
                    {isOwner && (
                        <Chip size="sm" variant="dot" color="success" className="font-medium text-xs border-none">
                            Your Offer
                        </Chip>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

function SellAccountForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Gaming');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const haptic = useHaptic();

    const createMutation = useMutation({
        mutationFn: () => api.createAccountOffer({
            title,
            service_category: category,
            price: Number(price),
            description: desc
        }),
        onSuccess: () => {
            haptic.notification('success');
            alert('Offer created successfully!');
            onSuccess();
        },
        onError: (e) => {
            haptic.notification('error');
            alert('Error creating offer');
            console.error(e);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const categoryOptions = [
        { value: 'Gaming', label: 'Gaming' },
        { value: 'VPN', label: 'VPN' },
        { value: 'Streaming', label: 'Streaming' },
        { value: 'Social', label: 'Social Media' },
        { value: 'Other', label: 'Other' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card shadow="sm" className="bg-content1 pb-4">
                <CardBody className="p-5 space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onValueChange={setTitle}
                        placeholder="e.g. Steam GTA V"
                        isRequired
                        variant="bordered"
                    />

                    <Select
                        label="Category"
                        selectedKeys={[category]}
                        onChange={(e) => setCategory(e.target.value)}
                        variant="bordered"
                    >
                        {categoryOptions.map(opt => (
                            <SelectItem key={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </Select>

                    <Input
                        type="number"
                        label="Price"
                        value={price}
                        onValueChange={setPrice}
                        placeholder="5000"
                        min="100"
                        isRequired
                        variant="bordered"
                        endContent={<span className="text-default-400 text-sm">₸</span>}
                    />

                    <Textarea
                        label="Description"
                        value={desc}
                        onValueChange={setDesc}
                        placeholder="Describe what is included..."
                        isRequired
                        variant="bordered"
                        minRows={3}
                        maxRows={5}
                    />

                    <Button
                        type="submit"
                        isLoading={createMutation.isPending}
                        className="w-full text-base font-bold mt-2"
                        color="primary"
                        size="lg"
                    >
                        {createMutation.isPending ? 'Publishing...' : 'Publish Offer'}
                    </Button>

                    <div className="bg-warning-50 border-none p-3 rounded-xl mt-4">
                        <p className="text-[11px] text-warning-600 font-medium text-center leading-relaxed">
                            Credentials are shared via chat after payment.
                            <br />Do not share passwords here!
                        </p>
                    </div>
                </CardBody>
            </Card>
        </form>
    );
}
