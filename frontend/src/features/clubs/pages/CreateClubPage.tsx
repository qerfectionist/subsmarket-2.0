import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, CreateClubRequest, pricingApi, PricingService } from '@/shared/api';
import { t } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectOption } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Autocomplete } from '@/shared/ui/Autocomplete';
import { Badge } from '@/shared/ui/Badge';

export function CreateClubPage() {
    const navigate = useNavigate();
    const haptic = useHaptic();

    // Form state
    const [subscriptionId, setSubscriptionId] = useState<string>('');
    const [priceTotal, setPriceTotal] = useState<string>('');
    const [maxMembers, setMaxMembers] = useState<string>('4');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('kaspi');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [paymentDay, setPaymentDay] = useState<string>('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');
    const [approvalMode, setApprovalMode] = useState<string>('manual');
    const [minTrustScore, setMinTrustScore] = useState<string>('');

    // State for selected service details (for market check)
    const [selectedService, setSelectedService] = useState<PricingService | null>(null);

    // Load market services
    const { data: pricingData, isLoading: loadingPricing } = useQuery({
        queryKey: ['pricing_services'],
        queryFn: () => pricingApi.getServices(),
    });

    const services = pricingData?.services || [];

    // Transform services to Autocomplete options
    const serviceOptions = services.map((s: PricingService) => ({
        key: s.id,
        label: s.name,
        description: s.category,
        icon: s.logo || undefined
    }));

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateClubRequest) => api.createClub(data),
        onSuccess: (club: { club_id: string }) => {
            haptic.notification('success');
            navigate(`/clubs/${club.club_id}`);
        },
        onError: () => {
            haptic.notification('error');
        },
    });

    // Calculate price per person
    const parsedMaxMembers = parseInt(maxMembers);
    const pricePerPerson = priceTotal && parsedMaxMembers
        ? (parseFloat(priceTotal) / parsedMaxMembers).toFixed(0)
        : '0';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        haptic.impact('medium');

        if (!subscriptionId) {
            alert('Please select a service');
            return;
        }

        createMutation.mutate({
            subscription_id: subscriptionId,
            price_total: parseFloat(priceTotal),
            max_members: parsedMaxMembers,
            login: login || undefined,
            password: password || undefined,
            payment_method: paymentMethod,
            payment_details: paymentDetails,
            payment_day: paymentDay ? parseInt(paymentDay) : undefined,
            description: description || undefined,
            rules: rules || undefined,
            approval_mode: approvalMode as 'manual' | 'auto',
            min_trust_score: approvalMode === 'auto' && minTrustScore ? parseFloat(minTrustScore) : undefined,
        });
    };

    const maxMemberOptions: SelectOption[] = [2, 3, 4, 5, 6].map(n => ({ value: n.toString(), label: n.toString() }));
    const paymentMethodOptions: SelectOption[] = [
        { value: 'kaspi', label: 'Kaspi' },
        { value: 'halyk', label: 'Halyk' },
        { value: 'jusan', label: 'Jusan' },
        { value: 'crypto', label: 'Crypto' }
    ];

    return (
        <div className="p-4 pb-28 space-y-6">
            {/* Header */}
            <header className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-all text-white/60 hover:bg-white/10"
                >
                    <span className="text-xl pb-1">‹</span>
                </button>
                <h1 className="text-2xl font-bold tracking-tight">{t('create_club', 'title')}</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div className="glass-card p-4 space-y-4">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {t('create_club', 'select_service')}
                    </label>

                    <Autocomplete
                        options={serviceOptions}
                        selectedKey={subscriptionId}
                        onSelectionChange={(key) => {
                            if (!key) return;
                            haptic.selection();
                            const service = services.find((s: PricingService) => s.id === key);
                            if (service) {
                                setSelectedService(service);
                                setSubscriptionId(service.id);
                                setPriceTotal(service.price_range.recommended.toString());
                                setMaxMembers(service.family_size.toString());
                            }
                        }}
                        isLoading={loadingPricing}
                        placeholder="Выберите сервис (напр. Netflix)"
                    />

                    {selectedService && (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5 animate-in fade-in zoom-in-95">
                            <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                {selectedService.logo ? (
                                    <img src={selectedService.logo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-white/20">
                                        {selectedService.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate">{selectedService.name}</div>
                                <div className="text-[10px] text-white/40 uppercase font-bold tracking-tight">
                                    {selectedService.category} • {selectedService.billing_cycle === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                                </div>
                            </div>
                            <Badge variant="info" size="sm">
                                {selectedService.popularity}% поп.
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Price & Members */}
                <div className="glass-card p-4 space-y-4">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                        Cost Configuration
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="Total Price (₸)"
                            value={priceTotal}
                            onChange={(e) => setPriceTotal(e.target.value)}
                            placeholder="4500"
                            required
                        />
                        <Select
                            label="Max Members"
                            options={maxMemberOptions}
                            value={maxMembers}
                            onChange={setMaxMembers}
                        />
                    </div>

                    {selectedService && priceTotal && (
                        <div className="animate-in fade-in slide-in-from-left-2 px-1">
                            {parseFloat(priceTotal) < selectedService.price_range.min * 0.5 ? (
                                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span>⚠️ Подозрительно низкая цена</span>
                                </div>
                            ) : parseFloat(priceTotal) > selectedService.price_range.max * 1.2 ? (
                                <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span>❌ Цена выше рыночной</span>
                                </div>
                            ) : (
                                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Добрая цена</span>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedService && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 border-l-primary border-l-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                                <span>Рыночный диапазон</span>
                                <span className="text-primary-400">₸ {selectedService.price_range.min} — {selectedService.price_range.max}</span>
                            </div>
                        </div>
                    )}

                    {/* Price preview */}
                    <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between border border-white/5 mt-2">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wide">Price Per Person</span>
                        <span className="text-lg font-bold text-emerald-400 tracking-tight">
                            {pricePerPerson} ₸
                        </span>
                    </div>
                </div>

                {/* Credentials */}
                <div className="glass-card p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Access Credentials
                        </div>
                        <div className="text-[9px] text-white/30 uppercase tracking-wider font-medium bg-white/5 px-2 py-0.5 rounded">
                            Encrypted
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            type="email"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="login@example.com"
                            label="Login Email"
                        />
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            label="Password"
                        />
                    </div>
                </div>

                {/* Payment */}
                <div className="glass-card p-4 space-y-4">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                        Payment Setup
                    </div>
                    <div className="space-y-4">
                        <Select
                            label="Payment Method"
                            options={paymentMethodOptions}
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                        />
                        <Input
                            label="Payment Details (Phone/Card)"
                            value={paymentDetails}
                            onChange={(e) => setPaymentDetails(e.target.value)}
                            placeholder="+7 700 000 00 00"
                        />
                        <Input
                            type="number"
                            label="Monthly Payment Day"
                            value={paymentDay}
                            onChange={(e) => setPaymentDay(e.target.value)}
                            placeholder="1"
                            min="1"
                            max="31"
                        />
                    </div>
                </div>

                {/* Approval Settings */}
                <div className="glass-card p-4 space-y-4">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                        Approval Logic
                    </div>
                    <div className="space-y-4">
                        <Select
                            label="Join Request Mode"
                            options={[
                                { value: 'manual', label: 'Manual Review' },
                                { value: 'auto', label: 'Auto-Approve by Trust Score' }
                            ]}
                            value={approvalMode}
                            onChange={setApprovalMode}
                        />

                        {approvalMode === 'auto' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <Input
                                    type="number"
                                    label="Min Trust Score (0.0 - 5.0)"
                                    value={minTrustScore}
                                    onChange={(e) => setMinTrustScore(e.target.value)}
                                    placeholder="4.5"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                />
                                <p className="text-[9px] text-white/30 uppercase tracking-wide mt-2 leading-relaxed">
                                    Users with a score ≥ {minTrustScore || '0'} will be auto-accepted.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description & Rules */}
                <div className="glass-card p-4 space-y-4">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                        Information
                    </div>
                    <Textarea
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell members about your club..."
                    />
                    <Textarea
                        label="Club Rules"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="Do's and Don'ts..."
                    />
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={createMutation.isPending || !subscriptionId || !priceTotal}
                    isLoading={createMutation.isPending}
                    className="w-full text-[17px] font-semibold tracking-wide h-14 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-transform"
                    color="primary"
                    size="lg"
                    variant="shadow"
                >
                    {createMutation.isPending ? 'Check Details...' : 'Create Club'}
                </Button>
            </form>
        </div>
    );
}
