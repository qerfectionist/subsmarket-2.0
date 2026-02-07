import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, AccountOffer } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Select, SelectOption } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Tabs, Tab } from "@heroui/react";

type TabKey = 'buy' | 'sell';

export function AccountsPage() {
    const [tab, setTab] = useState<TabKey>('buy');
    const haptic = useHaptic();
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

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
        <div className="p-4 pb-24">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    🔐 Accounts Market
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                    Buy and sell digital accounts safely.
                </p>
            </header>

            {/* Tabs */}
            <Tabs
                fullWidth
                size="lg"
                selectedKey={tab}
                onSelectionChange={handleTabChange}
                className="mb-6"
                classNames={{
                    cursor: "bg-[var(--color-bg-primary)] shadow-sm",
                    tabContent: "font-semibold group-data-[selected=true]:text-[var(--color-text-primary)]"
                }}
            >
                <Tab key="buy" title="Buy" />
                <Tab key="sell" title="Sell" />
            </Tabs>

            {/* Content */}
            {tab === 'buy' && (
                <div className="space-y-3">
                    {isLoading && <div className="text-center py-10 text-[var(--color-text-secondary)]">Loading offers...</div>}

                    {!isLoading && offers.length === 0 && (
                        <div className="text-center py-10 text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] rounded-xl">
                            <div className="text-2xl mb-2">📭</div>
                            No active offers found.
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

    const handleBuy = async () => {
        haptic.impact('medium');
        if (!confirm(`Buy "${offer.title}" for ${offer.price} ₸?`)) return;

        try {
            const deal = await api.createDeal({
                offer_type: 'account',
                offer_id: offer.offer_id,
                amount: offer.price
            });
            haptic.notification('success');
            alert(`Deal #${deal.deal_id.slice(0, 8)} created!\nCheck "My Deals" tab.`);
        } catch (e) {
            haptic.notification('error');
            console.error(e);
            alert('Failed to create deal');
        }
    };

    const isOwner = currentUserId === offer.seller_id;

    return (
        <Card>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-medium text-[var(--color-accent)] bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md mb-2 inline-block">
                        {offer.service_category}
                    </span>
                    <h3 className="font-semibold text-lg">{offer.title}</h3>
                </div>
                <div className="text-xl font-bold bg-[var(--color-bg-secondary)] px-3 py-1 rounded-lg">
                    {offer.price} ₸
                </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-3 bg-[var(--color-bg-tertiary)] p-2 rounded-lg">
                {offer.description}
            </p>

            <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)]">
                <span>Seller ID: {offer.seller_id}</span>
                {/* Buy Button */}
                {!isOwner && (
                    <Button
                        onPress={handleBuy}
                        color="primary"
                        variant="solid"
                        size="sm"
                        className="font-semibold"
                    >
                        Buy Now
                    </Button>
                )}
                {isOwner && (
                    <span className="text-[var(--color-accent)] font-medium">Your Offer</span>
                )}
            </div>
        </Card>
    );
}

function SellAccountForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Gaming');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const haptic = useHaptic();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.createAccountOffer({
                title,
                service_category: category,
                price: Number(price),
                description: desc
            });
            haptic.notification('success');
            alert('Offer created successfully!');
            onSuccess();
        } catch (e) {
            haptic.notification('error');
            alert('Error creating offer');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions: SelectOption[] = [
        { value: 'Gaming', label: 'Gaming' },
        { value: 'VPN', label: 'VPN' },
        { value: 'Streaming', label: 'Streaming' },
        { value: 'Social', label: 'Social Media' },
        { value: 'Other', label: 'Other' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="space-y-4">
                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Steam GTA V"
                    required
                />

                <Select
                    label="Category"
                    options={categoryOptions}
                    value={category}
                    onChange={setCategory}
                />

                <Input
                    type="number"
                    label="Price (₸)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="5000"
                    min="100"
                    required
                />

                <Textarea
                    label="Description"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe what is included..."
                    required
                />

                <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full text-lg font-semibold"
                    color="primary"
                    variant="shadow"
                    size="lg"
                >
                    {loading ? 'Publishing...' : 'Publish Offer'}
                </Button>

                <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-2">
                    Credentials are shared via chat after payment.
                    <br />Do not share passwords here!
                </p>
            </Card>
        </form>
    );
}
