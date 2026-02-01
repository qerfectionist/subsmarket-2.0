import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, Subscription, CreateClubRequest } from '@/api';
import { t } from '@/i18n';
import { useHaptic } from '@/hooks/useHaptic';

export function CreateClubPage() {
    const navigate = useNavigate();
    const haptic = useHaptic();

    // Form state
    const [subscriptionId, setSubscriptionId] = useState<string>('');
    const [priceTotal, setPriceTotal] = useState<string>('');
    const [maxMembers, setMaxMembers] = useState<number>(4);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('kaspi');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [paymentDay, setPaymentDay] = useState<string>('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');

    // Load subscriptions
    const { data: subscriptions, isLoading: loadingSubs } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: () => api.getSubscriptions(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateClubRequest) => api.createClub(data),
        onSuccess: (club) => {
            haptic.notification('success');
            navigate(`/clubs/${club.club_id}`);
        },
        onError: () => {
            haptic.notification('error');
        },
    });

    // Calculate price per person
    const pricePerPerson = priceTotal && maxMembers
        ? (parseFloat(priceTotal) / maxMembers).toFixed(0)
        : '0';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        haptic.impact('medium');

        if (!subscriptionId) {
            alert('Выберите сервис');
            return;
        }

        createMutation.mutate({
            subscription_id: subscriptionId,
            price_total: parseFloat(priceTotal),
            max_members: maxMembers,
            login: login || undefined,
            password: password || undefined,
            payment_method: paymentMethod,
            payment_details: paymentDetails || undefined,
            payment_day: paymentDay ? parseInt(paymentDay) : undefined,
            description: description || undefined,
            rules: rules || undefined,
        });
    };

    // Get selected subscription
    const selectedSub = subscriptions?.find(s => s.subscription_id === subscriptionId);

    return (
        <div className="p-4 pb-24">
            {/* Header */}
            <header className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-2xl"
                >
                    ←
                </button>
                <h1 className="text-xl font-bold">{t('create_club', 'title')}</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Selection */}
                <div className="card">
                    <label className="block text-sm text-secondary mb-2">
                        {t('create_club', 'select_service')}
                    </label>

                    {loadingSubs ? (
                        <div className="text-center py-4 text-secondary">{t('common', 'loading')}</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {subscriptions?.map((sub) => (
                                <button
                                    key={sub.subscription_id}
                                    type="button"
                                    onClick={() => {
                                        haptic.selection();
                                        setSubscriptionId(sub.subscription_id);
                                        // Set default price if available
                                        if (sub.official_price) {
                                            setPriceTotal(sub.official_price.toString());
                                        }
                                        if (sub.max_members) {
                                            setMaxMembers(sub.max_members);
                                        }
                                    }}
                                    className={`p-3 rounded-xl text-center transition-colors ${subscriptionId === sub.subscription_id
                                            ? 'bg-[var(--color-accent)] text-white'
                                            : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">
                                        {sub.icon_url ? (
                                            <img src={sub.icon_url} alt={sub.service_name} className="w-8 h-8 mx-auto rounded" />
                                        ) : (
                                            sub.category === 'digital' ? '📺' : '📱'
                                        )}
                                    </div>
                                    <div className="text-xs font-medium truncate">{sub.service_name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price & Members */}
                <div className="card">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-secondary mb-2">
                                {t('create_club', 'total_price')} (₸)
                            </label>
                            <input
                                type="number"
                                value={priceTotal}
                                onChange={(e) => setPriceTotal(e.target.value)}
                                placeholder="4500"
                                className="input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-secondary mb-2">
                                {t('create_club', 'max_members')}
                            </label>
                            <select
                                value={maxMembers}
                                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                                className="input w-full"
                            >
                                {[2, 3, 4, 5, 6].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price preview */}
                    <div className="mt-4 p-3 bg-[var(--color-bg-tertiary)] rounded-xl text-center">
                        <span className="text-2xl font-bold text-[var(--color-accent)]">
                            {pricePerPerson} ₸
                        </span>
                        <span className="text-secondary ml-2">{t('create_club', 'price_per_person')}</span>
                    </div>
                </div>

                {/* Credentials */}
                <div className="card">
                    <h3 className="font-semibold mb-1">{t('create_club', 'credentials_title')}</h3>
                    <p className="text-xs text-secondary mb-3">{t('create_club', 'credentials_hint')}</p>

                    <div className="space-y-3">
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="email@example.com"
                            className="input w-full"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input w-full"
                        />
                    </div>
                </div>

                {/* Payment */}
                <div className="card">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-secondary mb-2">
                                {t('create_club', 'payment_method')}
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="input w-full"
                            >
                                <option value="kaspi">Kaspi</option>
                                <option value="halyk">Halyk</option>
                                <option value="jusan">Jusan</option>
                                <option value="crypto">Crypto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-secondary mb-2">
                                {t('create_club', 'payment_details')}
                            </label>
                            <input
                                type="text"
                                value={paymentDetails}
                                onChange={(e) => setPaymentDetails(e.target.value)}
                                placeholder="+7 (7xx) xxx-xx-xx"
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-secondary mb-2">
                                {t('create_club', 'payment_day')}
                            </label>
                            <input
                                type="number"
                                value={paymentDay}
                                onChange={(e) => setPaymentDay(e.target.value)}
                                placeholder="1"
                                min="1"
                                max="31"
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Description & Rules */}
                <div className="card space-y-3">
                    <div>
                        <label className="block text-sm text-secondary mb-2">
                            {t('create_club', 'description')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Опишите свой клуб..."
                            className="input w-full h-20 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-secondary mb-2">
                            {t('create_club', 'rules')}
                        </label>
                        <textarea
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            placeholder="Правила участия..."
                            className="input w-full h-20 resize-none"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={createMutation.isPending || !subscriptionId || !priceTotal}
                    className="btn btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50"
                >
                    {createMutation.isPending ? t('common', 'loading') : t('create_club', 'submit')}
                </button>
            </form>
        </div>
    );
}
