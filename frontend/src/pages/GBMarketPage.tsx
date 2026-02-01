import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { t } from '@/i18n';
import { useHaptic } from '@/hooks/useHaptic';
import api, { GigabyteOffer } from '@/api/client';

type Tab = 'buy' | 'sell' | 'my';

const operators = [
    { id: 'beeline', name: 'Beeline', color: '#FFB800' },
    { id: 'tele2', name: 'Tele2', color: '#00B4E6' },
    { id: 'altel', name: 'Altel', color: '#7C3AED' },
    { id: 'kcell', name: 'Kcell', color: '#00A651' },
    { id: 'activ', name: 'Activ', color: '#FF6B00' },
];

export function GBMarketPage() {
    const [tab, setTab] = useState<Tab>('buy');
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const haptic = useHaptic();

    const { data: offers = [], isLoading, error } = useQuery({
        queryKey: ['gb-offers', selectedOperator],
        queryFn: () => api.getGigabyteOffers(selectedOperator ? { operator: selectedOperator } : undefined),
    });

    const handleTabChange = (newTab: Tab) => {
        haptic.selection();
        setTab(newTab);
    };

    return (
        <div className="p-4 pb-24">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold">📊 GB Маркет</h1>
                <p className="text-secondary mt-1">P2P маркет гигабайтов</p>
            </header>

            {/* Tabs */}
            <div className="flex bg-[var(--color-bg-elevated)] rounded-xl p-1 mb-4">
                <TabButton
                    active={tab === 'buy'}
                    onClick={() => handleTabChange('buy')}
                >
                    Купить
                </TabButton>
                <TabButton
                    active={tab === 'sell'}
                    onClick={() => handleTabChange('sell')}
                >
                    Продать
                </TabButton>
                <TabButton
                    active={tab === 'my'}
                    onClick={() => handleTabChange('my')}
                >
                    Мои
                </TabButton>
            </div>

            {/* Operator filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => {
                        haptic.selection();
                        setSelectedOperator(null);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedOperator
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]'
                        }`}
                >
                    Все
                </button>
                {operators.map(op => (
                    <button
                        key={op.id}
                        onClick={() => {
                            haptic.selection();
                            setSelectedOperator(op.id);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedOperator === op.id
                            ? 'text-white'
                            : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]'
                            }`}
                        style={selectedOperator === op.id ? { backgroundColor: op.color } : {}}
                    >
                        {op.name}
                    </button>
                ))}
            </div>

            {/* Content */}
            {tab === 'buy' && (
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-12 text-secondary">
                            Загрузка...
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">
                            Ошибка загрузки
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="text-center py-12 text-secondary">
                            Предложений не найдено
                        </div>
                    ) : (
                        offers.map(offer => (
                            <OfferCard
                                key={offer.offer_id}
                                offer={offer}
                                type="buy"
                                onAction={() => {
                                    haptic.impact('medium');
                                    alert(`Покупка ${offer.amount_gb} GB`);
                                }}
                            />
                        ))
                    )}
                </div>
            )}

            {tab === 'sell' && (
                <SellForm onSubmit={() => haptic.notification('success')} />
            )}

            {tab === 'my' && (
                <div className="text-center py-12">
                    <span className="text-6xl block mb-4">📦</span>
                    <h3 className="text-lg font-semibold">У вас нет активных сделок</h3>
                    <p className="text-secondary mt-1">
                        Создайте объявление о продаже или купите ГБ
                    </p>
                </div>
            )}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${active
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-secondary)]'
                }`}
        >
            {children}
        </button>
    );
}

interface OfferProps {
    offer: GigabyteOffer;
    type: 'buy' | 'sell';
    onAction: () => void;
}

function OfferCard({
    offer,
    type,
    onAction
}: OfferProps) {
    const op = operators.find(o => o.id === offer.operator.toLowerCase());

    return (
        <div className="card flex items-center gap-4">
            {/* Operator badge */}
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: op?.color || '#666' }}
            >
                {offer.amount_gb}
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{offer.amount_gb} GB</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: op?.color + '20', color: op?.color }}>
                        {op?.name || offer.operator}
                    </span>
                </div>
                <div className="text-sm text-secondary mt-0.5">
                    User #{offer.seller_id}
                </div>
            </div>

            {/* Price & Action */}
            <div className="text-right">
                <div className="font-bold text-lg">{offer.price} ₸</div>
                <button
                    onClick={onAction}
                    className="text-xs text-[var(--color-accent)] font-medium"
                >
                    {type === 'buy' ? 'Купить →' : 'Продать →'}
                </button>
            </div>
        </div>
    );
}

function SellForm({ onSubmit }: { onSubmit: () => void }) {
    const [operator, setOperator] = useState('beeline');
    const [gb, setGb] = useState('');
    const [price, setPrice] = useState('');
    const haptic = useHaptic();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        haptic.impact('medium');
        onSubmit();
        alert(`Объявление создано: ${gb} GB за ${price} ₸`);
    };

    // Price suggestion
    const suggestedPrice = gb ? (parseInt(gb) * 50).toString() : '';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="card">
                <label className="block text-sm text-secondary mb-2">Оператор</label>
                <div className="grid grid-cols-3 gap-2">
                    {operators.slice(0, 3).map(op => (
                        <button
                            key={op.id}
                            type="button"
                            onClick={() => {
                                haptic.selection();
                                setOperator(op.id);
                            }}
                            className={`py-3 rounded-xl font-medium transition-colors ${operator === op.id
                                ? 'text-white'
                                : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]'
                                }`}
                            style={operator === op.id ? { backgroundColor: op.color } : {}}
                        >
                            {op.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-secondary mb-2">Количество GB</label>
                        <input
                            type="number"
                            value={gb}
                            onChange={(e) => {
                                setGb(e.target.value);
                                if (e.target.value) {
                                    setPrice((parseInt(e.target.value) * 50).toString());
                                }
                            }}
                            placeholder="10"
                            className="input w-full"
                            min="1"
                            max="100"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-secondary mb-2">Цена (₸)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={suggestedPrice || '500'}
                            className="input w-full"
                            min="1"
                            required
                        />
                    </div>
                </div>

                {gb && price && (
                    <div className="mt-3 p-2 bg-[var(--color-bg-tertiary)] rounded-lg text-center text-sm">
                        <span className="text-secondary">Цена за 1 GB: </span>
                        <span className="font-semibold text-[var(--color-accent)]">
                            {Math.round(parseInt(price) / parseInt(gb))} ₸
                        </span>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={!gb || !price}
                className="btn btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50"
            >
                Создать объявление
            </button>
        </form>
    );
}
