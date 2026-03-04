import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, Club, CreateClubRequest, pricingApi, PricingService } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import {
    Navbar, NavbarContent, NavbarItem, Switch,
} from '@heroui/react';
import { BottomSheet } from '@/shared/ui/Modal';
import { MSIcon } from '@/shared/ui/MSIcon';
import { cn } from '@/shared/lib/utils';
import {
    STATIC_SERVICES,
    SERVICE_COLORS,
    CatalogService,
} from '../data/serviceCatalog';

// ─── SuccessScreen ──────────────────────────────────────────────────────────
const API_URL_DEFAULT = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): Record<string, string> {
    const initData = (window as any).Telegram?.WebApp?.initData;
    const auth = initData && initData.length > 0 ? initData : 'mock:12345:dev_user';
    return { 'X-Telegram-Init-Data': auth, 'Content-Type': 'application/json' };
}

interface SuccessScreenProps {
    svcName: string;
    svcColor: string;
    pricePerson: number;
    createdClub: Club;
    bank: string;
    phone: string;
    payDay: number | null;
    desc: string;
    onOpen: () => void;
    onAllClubs: () => void;
    apiUrl: string;
    haptic: ReturnType<typeof useHaptic>;
    onUpdated: (updated: Club) => void;
}

function SuccessScreen({ svcName, svcColor, pricePerson: _pricePerson, createdClub, bank, phone, payDay, desc, onOpen, onAllClubs, haptic, onUpdated }: SuccessScreenProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [editPrice, setEditPrice] = useState(String(createdClub.price_total));
    const [editPhone, setEditPhone] = useState(phone);
    const [editDesc, setEditDesc] = useState(desc);
    const [editPayDay, setEditPayDay] = useState(payDay ? String(payDay) : '');
    const [saving, setSaving] = useState(false);

    const displayPrice = createdClub.price_total;
    const displayPricePer = Math.round(Number(displayPrice) / createdClub.max_members);

    const rows = [
        { icon: 'groups', label: 'Участники', value: `до ${createdClub.max_members} чел.` },
        { icon: 'payments', label: 'Цена за всех', value: `${displayPrice} ₸/мес` },
        { icon: 'person', label: 'Цена за 1 чел.', value: `~${displayPricePer} ₸/мес` },
        { icon: 'account_balance', label: 'Способ оплаты', value: bank.charAt(0).toUpperCase() + bank.slice(1) },
        { icon: 'phone', label: 'Реквизиты', value: phone },
        ...(payDay ? [{ icon: 'calendar_today', label: 'День оплаты', value: `${payDay}-е число` }] : []),
        ...(desc ? [{ icon: 'info', label: 'Описание', value: desc }] : []),
    ] as { icon: string; label: string; value: string }[];

    const saveEdit = async () => {
        setSaving(true);
        try {
            const body: Record<string, unknown> = {};
            if (editPrice) body.price_total = parseFloat(editPrice);
            if (editPayDay) body.payment_day = parseInt(editPayDay);
            if (editDesc !== undefined) body.description = editDesc;
            const res = await fetch(`${API_URL_DEFAULT}/clubs/${createdClub.club_id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated: Club = await res.json();
            haptic.notification('success');
            onUpdated(updated);
            setEditOpen(false);
        } catch (e: any) {
            haptic.notification('error');
            alert(`Ошибка: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-background flex flex-col">
            <div className="flex-1 flex flex-col items-center px-5 pb-8 pt-12 gap-6 overflow-y-auto">
                {/* Icon */}
                <div className="relative">
                    <div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl"
                        style={{ background: svcColor }}
                    >
                        {svcName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
                        <MSIcon name="check" size={18} className="text-white" filled />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Клуб создан! 🎉</h1>
                    <p className="text-default-500 mt-1 text-sm">{svcName}</p>
                </div>

                {/* Details card */}
                <div className="w-full bg-content1 rounded-2xl overflow-hidden border border-default-100">
                    <div className="px-4 py-3 border-b border-default-100 flex items-center justify-between">
                        <p className="text-xs text-default-400 uppercase tracking-wider font-semibold">Детали клуба</p>
                        <button
                            className="flex items-center gap-1 text-primary text-xs font-medium"
                            onClick={() => setEditOpen(true)}
                        >
                            <MSIcon name="edit" size={14} />
                            Изменить
                        </button>
                    </div>
                    {rows.map((row, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-default-100 last:border-0">
                            <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center flex-shrink-0">
                                <MSIcon name={row.icon} size={16} className="text-default-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-default-400">{row.label}</p>
                                <p className="text-sm font-medium text-foreground truncate">{row.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Club ID */}
                <p className="text-xs text-default-300/60 text-center">ID: {createdClub.club_id}</p>
            </div>

            {/* Bottom actions */}
            <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-3">
                <button
                    className="w-full py-4 rounded-2xl font-bold text-white text-base"
                    style={{ background: svcColor }}
                    onClick={onOpen}
                >
                    Открыть клуб
                </button>
                <button
                    className="w-full py-3 rounded-2xl font-medium text-default-500 text-sm border border-default-200"
                    onClick={onAllClubs}
                >
                    Все клубы
                </button>
            </div>

            {/* Edit Bottom Sheet */}
            <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Исправить данные">
                <div className="flex flex-col gap-4 pb-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-default-400">Общая цена (₸/мес)</label>
                        <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="w-full bg-content2 rounded-xl px-4 py-3 text-sm text-foreground border border-default-200 focus:outline-none focus:border-primary"
                            placeholder="Например: 2000"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-default-400">Реквизиты (телефон / номер карты)</label>
                        <input
                            type="text"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            className="w-full bg-content2 rounded-xl px-4 py-3 text-sm text-foreground border border-default-200 focus:outline-none focus:border-primary"
                            placeholder="+7 (7XX) XXX XX XX"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-default-400">День оплаты (1–31)</label>
                        <input
                            type="number"
                            min={1}
                            max={31}
                            value={editPayDay}
                            onChange={e => setEditPayDay(e.target.value)}
                            className="w-full bg-content2 rounded-xl px-4 py-3 text-sm text-foreground border border-default-200 focus:outline-none focus:border-primary"
                            placeholder="Например: 15"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-default-400">Описание</label>
                        <textarea
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-content2 rounded-xl px-4 py-3 text-sm text-foreground border border-default-200 focus:outline-none focus:border-primary resize-none"
                            placeholder="Описание клуба..."
                        />
                    </div>
                    <button
                        className="w-full py-4 rounded-2xl font-bold text-white text-base bg-primary disabled:opacity-50"
                        onClick={saveEdit}
                        disabled={saving}
                    >
                        {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                    </button>
                </div>
            </BottomSheet>
        </div>
    );
}

// ─── Constants ─────────────────────────────────────────────────────────────
const STEPS = ['service', 'settings', 'payment'] as const;

const BOT_USERNAME = 'SubsMarketBot';

// Top popular services (by demand from market data); shown in 2-col grid
const TOP_IDS = [
    'youtube_premium', 'yandex_plus',
    'netflix', 'duolingo',
    'spotify', 'apple_music',
    'microsoft_365', 'google_one',
];

// Category labels used inside BottomSheet full list
const CAT_META: Record<string, string> = {
    video: 'Стриминг',
    music: 'Музыка',
    cloud: 'Облако и AI',
    education: 'Образование',
    telecom: 'Связь',
};
const CAT_ORDER = ['video', 'music', 'cloud', 'education', 'telecom'];

// ─── Main ──────────────────────────────────────────────────────────────────
export function CreateClubPage() {
    const navigate = useNavigate();
    const haptic = useHaptic();
    const [step, setStep] = useState(0);
    const [createdClub, setCreatedClub] = useState<Club | null>(null);

    /* --- step 1 --- */
    const [search, setSearch] = useState('');
    const [svcId, setSvcId] = useState('');
    const [selected, setSelected] = useState<CatalogService | null>(null);

    /* --- step 2 --- */
    const [price, setPrice] = useState('');
    const [members, setMembers] = useState(0);
    const [payDay, setPayDay] = useState<number | null>(null);
    const [desc, setDesc] = useState('');
    const [dayOpen, setDayOpen] = useState(false);

    /* --- step 2 — payment + tg --- */
    const bank = 'kaspi'; // default, no picker
    const [phone, setPhone] = useState('');
    const [useTg, setUseTg] = useState(false);
    const [tgLink, setTgLink] = useState('');
    const [botAdmin, setBotAdmin] = useState(false);
    const [allSheet, setAllSheet] = useState(false);
    const [catFilter, setCatFilter] = useState('all');  // category pill filter

    /* --- pricing data --- */
    const { data: priceData } = useQuery({
        queryKey: ['pricing_services'],
        queryFn: pricingApi.getServices,
        retry: 1, staleTime: 300_000,
    });

    const services = useMemo<CatalogService[]>(() => {
        if (priceData?.services?.length) {
            return priceData.services.map((s: PricingService) => ({
                id: s.id, name: s.name, logo: s.logo || s.id,
                category: mapCat(s.category),
                familySize: s.family_size, billingCycle: s.billing_cycle,
                priceRange: s.price_range,
            }));
        }
        return STATIC_SERVICES;
    }, [priceData]);

    /* --- derived --- */
    const pricePer = useMemo(() => {
        const p = parseFloat(price);
        return p > 0 && members > 0 ? Math.round(p / members) : 0;
    }, [price, members]);

    const priceState = useMemo((): 'low' | 'ok' | 'high' | null => {
        if (!selected || !price) return null;
        const p = parseFloat(price);
        if (p < selected.priceRange.min * 0.5) return 'low';
        if (p > selected.priceRange.max * 1.2) return 'high';
        return 'ok';
    }, [selected, price]);

    // Search results shown inline while typing in Step 0
    const searchResults = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];
        return services.filter(s => s.name.toLowerCase().includes(q));
    }, [services, search]);

    // Popular = top IDs in display order, fallback fills to 8
    const popular = useMemo(() => {
        const ordered = TOP_IDS
            .map((id: string) => services.find(s => s.id === id))
            .filter(Boolean) as CatalogService[];
        if (ordered.length < 8) {
            for (const s of services) {
                if (!ordered.find(o => o.id === s.id)) ordered.push(s);
                if (ordered.length >= 8) break;
            }
        }
        return ordered.slice(0, 8);
    }, [services]);

    // Grouped list for BottomSheet full catalog
    const grouped = useMemo(() => {
        const g: Record<string, CatalogService[]> = {};
        for (const s of services) {
            if (!g[s.category]) g[s.category] = [];
            g[s.category].push(s);
        }
        return g;
    }, [services]);

    const stepOk = [
        !!svcId,
        !!price && parseFloat(price) > 0 && members > 0 && !!payDay,
        !!phone,
    ];

    const createFn = useMutation({
        mutationFn: (d: CreateClubRequest) => api.createClub(d),
        onSuccess: (c: Club) => {
            haptic.notification('success');
            setCreatedClub(c);
            setStep(3); // success step
        },
        onError: () => haptic.notification('error'),
    });

    /* --- handlers --- */
    const pick = (s: CatalogService) => {
        haptic.selection();
        setSelected(s); setSvcId(s.id);
        // Do NOT auto-fill price – user should enter it manually
        // Reset dependent fields when service changes
        setPrice('');
        setMembers(0);
        setPayDay(null);
    };

    const next = () => { haptic.impact('light'); setStep(x => x + 1); };
    const back = () => step > 0 ? (haptic.impact('light'), setStep(x => x - 1)) : navigate(-1);

    const submit = () => {
        haptic.impact('medium');
        createFn.mutate({
            service_id: svcId,
            price_total: parseFloat(price),
            max_members: members,
            payment_method: bank,
            payment_details: phone,
            payment_day: payDay ?? undefined,
            description: desc || undefined,
            approval_mode: 'auto',
            ...(tgLink ? { telegram_group_link: tgLink } : {}),
        });
    };



    // ─── UI ────────────────────────────────────────────────────────────────

    // ─── Success Screen ────────────────────────────────────────────────────
    if (step === 3 && createdClub) {
        const svcName = selected?.name ?? createdClub.subscription?.service_name ?? 'Клуб';
        const svcColor = (SERVICE_COLORS as Record<string, string>)[selected?.id ?? ''] || '#6366f1';
        const pricePerson = Math.round(createdClub.price_total / createdClub.max_members);
        return <SuccessScreen
            svcName={svcName}
            svcColor={svcColor}
            pricePerson={pricePerson}
            createdClub={createdClub}
            bank={bank}
            phone={phone}
            payDay={payDay}
            desc={desc}
            onOpen={() => navigate(`/clubs/${createdClub.club_id}`)}
            onAllClubs={() => navigate('/clubs')}
            apiUrl={import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}
            haptic={haptic}
            onUpdated={(updated) => setCreatedClub(updated)}
        />;
    }


    return (
        <div className="min-h-[100dvh] bg-background flex flex-col">

            {/* top nav */}
            <Navbar isBordered isBlurred maxWidth="sm" className="flex-shrink-0">
                <NavbarContent justify="start">
                    <NavbarItem>
                        <button onClick={back} className="w-10 h-10 rounded-full flex items-center justify-center" aria-label="Назад">
                            <MSIcon name="arrow_back_ios" size={20} className="text-foreground" />
                        </button>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent justify="center">
                    <NavbarItem className="flex flex-col items-center gap-0">
                        <span className="text-[13px] font-semibold text-foreground">Новый клуб</span>
                        <span className="text-[11px] text-default-400">
                            {step === 0 && 'Выберите сервис'}
                            {step === 1 && 'Параметры'}
                            {step === 2 && 'Реквизиты'}
                            {step === 3 && 'Telegram'}
                        </span>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem className="w-10" />
                </NavbarContent>
            </Navbar>

            {/* progress dots */}
            <div className="flex gap-1.5 justify-center py-3 flex-shrink-0">
                {STEPS.map((_, i) => (
                    <div key={i} className={cn(
                        'rounded-full transition-all duration-300',
                        i === step ? 'w-6 h-2 bg-primary' : i < step ? 'w-2 h-2 bg-primary/40' : 'w-2 h-2 bg-default-200'
                    )} />
                ))}
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto pb-28">

                {/* ═══════════════════════════════════════════════════
                    STEP 0 — SERVICE (popular grid)
                ═══════════════════════════════════════════════════ */}
                {step === 0 && (
                    <div className="px-4 pt-2 space-y-4">

                        {/* iOS search bar */}
                        <div className="flex items-center gap-2 bg-default-100 rounded-[10px] px-3 h-9">
                            <MSIcon name="search" size={14} className="text-default-400 flex-shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Поиск"
                                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-default-400"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="w-4 h-4 rounded-full bg-default-300 flex items-center justify-center"
                                >
                                    <MSIcon name="close" size={10} className="text-default-600" />
                                </button>
                            )}
                        </div>

                        {/* Search results (inline list when typing) */}
                        {search && (
                            <div>
                                {searchResults.length === 0 && (
                                    <p className="text-center text-default-400 text-[15px] py-12">Ничего не найдено</p>
                                )}
                                <div className="bg-content1 rounded-2xl overflow-hidden">
                                    {searchResults.map((s, idx) => {
                                        const isActive = svcId === s.id;
                                        const color = SERVICE_COLORS[s.logo] || '#6366f1';
                                        const isLast = idx === searchResults.length - 1;
                                        return (
                                            <div key={s.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => { pick(s); setSearch(''); }}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-4 h-[54px] transition-colors active:bg-default-200 text-left',
                                                        isActive ? 'bg-primary/10' : ''
                                                    )}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                                                        style={{ background: color }}
                                                    >
                                                        {s.name[0]}
                                                    </div>
                                                    <span className={cn(
                                                        'flex-1 text-[17px] truncate',
                                                        isActive ? 'text-primary font-medium' : 'text-foreground'
                                                    )}>{s.name}</span>
                                                    <span className="text-[15px] text-default-400 mr-1">{s.priceRange.recommended} ₸</span>
                                                    {isActive
                                                        ? <MSIcon name="check" size={18} className="text-primary" />
                                                        : <MSIcon name="chevron_right" size={16} className="text-default-300" />}
                                                </button>
                                                {!isLast && <div className="ml-[56px] h-px bg-divider" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Popular 2-col grid (hidden while searching) */}
                        {!search && (
                            <>
                                {/* Header row: label + category chips */}
                                <div className="flex items-center gap-3">
                                    <p className="text-[13px] text-default-400 flex-shrink-0">
                                        {catFilter === 'all' ? 'Популярные' : CAT_META[catFilter]}
                                    </p>
                                    {/* Category chips — tap again to deselect */}
                                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide flex-1">
                                        {CAT_ORDER.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    haptic.selection();
                                                    setCatFilter(prev => prev === cat ? 'all' : cat);
                                                }}
                                                className={cn(
                                                    'flex-shrink-0 h-7 px-3 rounded-full text-[12px] font-medium transition-colors',
                                                    catFilter === cat
                                                        ? 'bg-primary text-white'
                                                        : 'bg-default-100 text-default-400'
                                                )}
                                            >
                                                {CAT_META[cat]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Grid: top 8 OR filtered by category */}
                                <div className="grid grid-cols-2 gap-3">
                                    {(catFilter === 'all'
                                        ? popular
                                        : services.filter(s => s.category === catFilter)
                                    ).map(s => {
                                        const isActive = svcId === s.id;
                                        const color = SERVICE_COLORS[s.logo] || '#6366f1';
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => pick(s)}
                                                className={cn(
                                                    'bg-content1 rounded-3xl p-4 flex flex-col gap-3 text-left transition-colors active:opacity-80',
                                                    isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                                                )}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div
                                                        className="w-11 h-11 rounded-[12px] flex items-center justify-center text-white text-lg font-bold"
                                                        style={{ background: color }}
                                                    >
                                                        {s.name[0]}
                                                    </div>
                                                    {isActive && (
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                            <MSIcon name="check" size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        'text-[15px] font-semibold leading-tight',
                                                        isActive ? 'text-primary' : 'text-foreground'
                                                    )}>{s.name}</p>
                                                    <p className="text-[13px] text-default-400 mt-0.5">
                                                        {s.priceRange.recommended} ₸/мес
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}


                {/* ═══════════════════════════════════════════════════
                    STEP 1 — SETTINGS
                ═══════════════════════════════════════════════════ */}
                {
                    step === 1 && (() => {
                        const priceOk = parseFloat(price) > 0;
                        const membersOk = priceOk && members > 0;
                        const dayOk = !!payDay;
                        const dayLocked = !membersOk;

                        return (
                            <div className="px-4 space-y-3 pb-2">

                                {/* ── Service badge ── */}
                                {selected && (
                                    <div className="flex items-center gap-3 px-1">
                                        <div
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                                            style={{ background: SERVICE_COLORS[selected.logo] || '#6366f1' }}
                                        >
                                            {selected.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{selected.name}</p>
                                            <p className="text-xs text-default-400">
                                                Рынок: {selected.priceRange.min}–{selected.priceRange.max} ₸/мес
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Main form card — all 3 rows in one card ── */}
                                <div className="bg-content1 rounded-3xl overflow-hidden">

                                    {/* ROW 1: PRICE */}
                                    <div className="px-5 pt-4 pb-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-default-400 mb-0.5">
                                                    Стоимость в месяц
                                                </p>
                                                {/* chip below label */}
                                                <div className="min-h-[20px]">
                                                    {priceState === 'low' && <span className="text-[11px] font-semibold text-warning">⚠ Ниже рынка</span>}
                                                    {priceState === 'high' && <span className="text-[11px] font-semibold text-danger">✕ Выше рынка</span>}
                                                    {priceState === 'ok' && <span className="text-[11px] font-semibold text-success">✓ Отличная цена</span>}
                                                    {!price && selected && <span className="text-[11px] text-default-400">~{selected.priceRange.recommended} ₸ рекоменд.</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <input
                                                    type="number"
                                                    value={price}
                                                    onChange={e => setPrice(e.target.value)}
                                                    placeholder={selected ? `${selected.priceRange.recommended}` : '0'}
                                                    className="w-28 text-right text-2xl font-black bg-transparent outline-none tabular-nums text-foreground placeholder:text-default-300"
                                                    inputMode="numeric"
                                                    autoFocus
                                                />
                                                <span className="text-base font-bold text-default-400">₸</span>
                                                <div className="w-5">
                                                    {priceOk && <MSIcon name="check_circle" size={18} className="text-success" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* divider */}
                                    <div className="h-px bg-divider mx-5" />

                                    {/* ROW 2: MEMBERS */}
                                    <div className={cn(
                                        'px-5 py-3 transition-opacity duration-300',
                                        !priceOk ? 'opacity-35 pointer-events-none select-none' : ''
                                    )}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-default-400 mb-0.5">
                                                    Участников (включая вас)
                                                </p>
                                                <div className="min-h-[20px]">
                                                    {pricePer > 0
                                                        ? <span className="text-[11px] font-semibold text-primary">{pricePer} ₸/чел</span>
                                                        : <span className="text-[11px] text-default-400">нажмите + чтобы выбрать</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => { haptic.selection(); setMembers(m => Math.max(1, m - 1)); }}
                                                    className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center active:scale-90 transition-transform"
                                                >
                                                    <MSIcon name="remove" size={16} className="text-foreground" />
                                                </button>
                                                <span className={cn(
                                                    'text-xl font-black tabular-nums w-7 text-center',
                                                    members === 0 ? 'text-default-300' : 'text-foreground'
                                                )}>
                                                    {members === 0 ? '—' : members}
                                                </span>
                                                <button
                                                    onClick={() => { haptic.selection(); setMembers(m => Math.min(6, m + 1)); }}
                                                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform"
                                                >
                                                    <MSIcon name="add" size={16} className="text-white" />
                                                </button>
                                                <div className="w-5">
                                                    {membersOk && <MSIcon name="check_circle" size={18} className="text-success" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* divider */}
                                    <div className="h-px bg-divider mx-5" />

                                    {/* ROW 3: PAYMENT DAY — inline accordion */}
                                    <div className={cn(
                                        'transition-opacity duration-300',
                                        dayLocked ? 'opacity-35 pointer-events-none' : ''
                                    )}>
                                        {/* header row — tap to toggle */}
                                        <button
                                            onClick={() => { haptic.impact('light'); setDayOpen(o => !o); }}
                                            disabled={dayLocked}
                                            className="w-full px-5 pt-3 pb-3 text-left"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-default-400 mb-0.5">
                                                        День списания
                                                    </p>
                                                    <p className={cn(
                                                        'text-sm font-semibold',
                                                        dayOk ? 'text-foreground' : 'text-default-300'
                                                    )}>
                                                        {dayOk ? `${payDay} числа каждого месяца` : 'Не выбрано'}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-2">
                                                    {dayOk && !dayOpen && (
                                                        <MSIcon name="check_circle" size={18} className="text-success" />
                                                    )}
                                                    <MSIcon
                                                        name="expand_more"
                                                        size={20}
                                                        className={cn(
                                                            'text-default-400 transition-transform duration-300',
                                                            dayOpen ? 'rotate-180' : ''
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </button>

                                        {/* expandable day grid */}
                                        <div className={cn(
                                            'overflow-hidden transition-all duration-300 ease-in-out',
                                            dayOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                                        )}>
                                            <div className="px-4 pb-4 pt-1">
                                                <p className="text-[11px] text-default-400 text-center mb-3">
                                                    Каждый месяц бот напомнит об оплате
                                                </p>
                                                <div className="grid grid-cols-7 gap-1.5">
                                                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                                                        <button
                                                            key={d}
                                                            onClick={() => {
                                                                haptic.selection();
                                                                setPayDay(payDay === d ? null : d);
                                                                setDayOpen(false);
                                                            }}
                                                            className={cn(
                                                                'h-9 rounded-xl text-sm font-bold transition-all active:scale-90',
                                                                payDay === d
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-default-100 text-default-600'
                                                            )}
                                                        >
                                                            {d}
                                                        </button>
                                                    ))}
                                                </div>
                                                {payDay && (
                                                    <button
                                                        onClick={() => { setPayDay(null); setDayOpen(false); }}
                                                        className="w-full mt-2 py-2 text-xs text-default-400 font-medium"
                                                    >
                                                        Сбросить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Description — separate compact card ── */}
                                <div className={cn(
                                    'bg-content1 rounded-3xl px-5 py-3 transition-opacity duration-300',
                                    !membersOk ? 'opacity-35 pointer-events-none select-none' : ''
                                )}>
                                    <textarea
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        placeholder="Описание (необязательно) — особые условия, что входит в подписку..."
                                        rows={2}
                                        className="w-full bg-transparent text-sm outline-none resize-none text-foreground placeholder:text-default-400"
                                    />
                                </div>


                            </div>
                        );
                    })()
                }


                {/* ═══════════════════════════════════════════════════
                    STEP 2 — PHONE + TG GROUP
                ═══════════════════════════════════════════════════ */}
                {
                    step === 2 && (() => {
                        const isPhoneFull = /^\+7 \(\d{3}\) \d{3} \d{2} \d{2}$/.test(phone);
                        const hasPhoneError = phone.length > 0 && !isPhoneFull;

                        const fmtPhone = (digits: string) => {
                            if (!digits) return '';
                            let m = '+7 (';
                            m += digits.slice(0, 3);
                            if (digits.length >= 3) m += ') ';
                            if (digits.length > 3) m += digits.slice(3, 6);
                            if (digits.length >= 6) m += ' ';
                            if (digits.length > 6) m += digits.slice(6, 8);
                            if (digits.length >= 8) m += ' ';
                            if (digits.length > 8) m += digits.slice(8, 10);
                            return m;
                        };

                        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value;
                            let raw = val.replace(/\D/g, '');
                            const prevRaw = phone.replace(/\D/g, '');
                            const prevDigits = phone.startsWith('+') ? prevRaw.slice(1) : prevRaw;
                            if (raw.length > 10 || phone.startsWith('+')) {
                                if (raw.startsWith('7') || raw.startsWith('8')) raw = raw.slice(1);
                            }
                            let digits = raw.slice(0, 10);
                            if (digits.length === prevDigits.length && val.length < phone.length) {
                                digits = digits.slice(0, -1);
                            }
                            setPhone(fmtPhone(digits));
                        };

                        return (
                            <div className="px-4 space-y-3 pb-2">

                                {/* ── Phone number card ── */}
                                <div className="bg-content1 rounded-3xl overflow-hidden">
                                    <div className={cn(
                                        'px-5 pt-4 pb-3 transition-all',
                                        hasPhoneError ? 'ring-2 ring-inset ring-danger/50 rounded-3xl' : ''
                                    )}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-default-400 mb-0.5">
                                                    Номер для получения оплаты
                                                </p>
                                                <p className="text-[11px] text-default-400">
                                                    {hasPhoneError
                                                        ? <span className="text-danger">Формат: +7 (7XX) XXX XX XX</span>
                                                        : 'Участники переводят через Kaspi'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isPhoneFull && <MSIcon name="check_circle" size={18} className="text-success" />}
                                            </div>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            placeholder="+7 (702) 123 45 67"
                                            className="mt-3 w-full bg-transparent text-xl font-bold outline-none text-foreground placeholder:text-default-300 placeholder:font-normal placeholder:text-base"
                                            inputMode="tel"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* ── TG Group card ── */}
                                <div className="bg-content1 rounded-3xl overflow-hidden">
                                    {/* toggle row */}
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">Telegram-группа</p>
                                            <p className="text-xs text-default-400 mt-0.5">
                                                {useTg
                                                    ? 'Вход, доступ и всё общение — в группе'
                                                    : 'Лучший способ решать вопросы участников'}
                                            </p>
                                        </div>
                                        <Switch
                                            isSelected={useTg}
                                            onValueChange={v => { haptic.selection(); setUseTg(v); }}
                                            color="primary" size="sm"
                                        />
                                    </div>

                                    {/* expand when useTg */}
                                    {useTg && (
                                        <>
                                            <div className="h-px bg-divider mx-5" />

                                            {/* steps */}
                                            <div className="px-5 py-4 space-y-3">
                                                {[
                                                    ['Создайте Telegram-группу', 'Обычная или супергруппа'],
                                                    [`Добавьте @${BOT_USERNAME}`, 'Найдите бота в поиске'],
                                                    ['Назначьте бота администратором', 'С правом отправки сообщений'],
                                                    ['Вставьте ссылку на группу ниже', ''],
                                                ].map(([title, sub], i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold leading-tight">{title}</p>
                                                            {sub && <p className="text-[11px] text-default-400 mt-0.5">{sub}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="h-px bg-divider mx-5" />

                                            {/* open bot button */}
                                            <button
                                                onClick={() => { haptic.impact('light'); window.open(`https://t.me/${BOT_USERNAME}`, '_blank'); }}
                                                className="w-full px-5 py-3 flex items-center justify-between text-left"
                                            >
                                                <span className="text-sm font-semibold text-primary">Открыть @{BOT_USERNAME}</span>
                                                <MSIcon name="open_in_new" size={16} className="text-primary" />
                                            </button>

                                            <div className="h-px bg-divider mx-5" />

                                            {/* link input */}
                                            <div className="px-5 py-4">
                                                <p className="text-xs font-semibold text-default-400 mb-2">Ссылка на группу</p>
                                                <input
                                                    value={tgLink}
                                                    onChange={e => setTgLink(e.target.value)}
                                                    placeholder="https://t.me/+xxxxxx"
                                                    className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-default-300"
                                                />
                                            </div>

                                            <div className="h-px bg-divider mx-5" />

                                            {/* bot admin confirm */}
                                            <button
                                                onClick={() => { haptic.selection(); setBotAdmin(!botAdmin); }}
                                                className="w-full px-5 py-4 flex items-center gap-3 text-left"
                                            >
                                                <div className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                                    botAdmin ? 'bg-success border-success' : 'border-default-300'
                                                )}>
                                                    {botAdmin && <MSIcon name="check" size={11} className="text-white" />}
                                                </div>
                                                <p className="text-sm font-semibold">Бот назначен администратором</p>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* tip */}
                                <div className="flex gap-3 px-4 py-3 bg-primary/8 rounded-2xl border border-primary/20">
                                    <MSIcon name="tips_and_updates" size={16} className="text-primary flex-shrink-0 mt-0.5" filled />
                                    <p className="text-xs text-default-400 leading-relaxed">
                                        Создайте Telegram-группу для участников — там удобно делиться доступом, решать вопросы и держать всех в курсе.
                                    </p>
                                </div>

                            </div>
                        );
                    })()
                }

            </div >

            {/* ── BOTTOM CTA ── */}
            < div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-background/90 backdrop-blur-xl border-t border-divider z-40" >
                {
                    step < STEPS.length - 1 ? (
                        <button
                            onClick={stepOk[step] ? next : undefined}
                            className={cn(
                                'w-full h-14 rounded-2xl text-base font-black transition-all',
                                stepOk[step]
                                    ? 'bg-primary text-white active:scale-[0.98]'
                                    : 'bg-default-100 text-default-300 cursor-not-allowed'
                            )}
                        >
                            Далее
                        </button>
                    ) : (
                        <button
                            onClick={!createFn.isPending ? submit : undefined}
                            disabled={createFn.isPending}
                            className="w-full h-14 rounded-2xl text-base font-black bg-primary text-white active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {createFn.isPending ? (
                                'Создаём...'
                            ) : (
                                <>
                                    <MSIcon name="group_add" size={20} className="text-white" />
                                    Создать клуб
                                </>
                            )}
                        </button>
                    )
                }
            </div >


            {/* ── ALL SERVICES SHEET ── */}
            < BottomSheet
                isOpen={allSheet}
                onClose={() => setAllSheet(false)}
                title="Все сервисы"
            >
                <div className="space-y-4 pb-6">
                    {CAT_ORDER
                        .filter(cat => grouped[cat]?.length)
                        .map(cat => (
                            <div key={cat}>
                                <p className="text-[13px] text-default-400 mb-2 px-1">{CAT_META[cat]}</p>
                                <div className="bg-content1 rounded-2xl overflow-hidden">
                                    {grouped[cat].map((s, idx) => {
                                        const isActive = svcId === s.id;
                                        const color = SERVICE_COLORS[s.logo] || '#6366f1';
                                        const isLast = idx === grouped[cat].length - 1;
                                        return (
                                            <div key={s.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => { pick(s); setAllSheet(false); }}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-4 h-[54px] transition-colors active:bg-default-200 text-left',
                                                        isActive ? 'bg-primary/10' : ''
                                                    )}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                                                        style={{ background: color }}
                                                    >
                                                        {s.name[0]}
                                                    </div>
                                                    <span className={cn(
                                                        'flex-1 text-[17px] truncate',
                                                        isActive ? 'text-primary font-medium' : 'text-foreground'
                                                    )}>{s.name}</span>
                                                    <span className="text-[15px] text-default-400 mr-1">{s.priceRange.recommended} ₸</span>
                                                    {isActive
                                                        ? <MSIcon name="check" size={18} className="text-primary" />
                                                        : <MSIcon name="chevron_right" size={16} className="text-default-300" />}
                                                </button>
                                                {!isLast && <div className="ml-[56px] h-px bg-divider" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>
            </BottomSheet >
        </div >
    );
}

// ─── helper ─────────────────────────────────────────────────────────────────
function mapCat(a: string): string {
    const m: Record<string, string> = {
        streaming: 'video', entertainment: 'video',
        music: 'music', software: 'cloud', cloud: 'cloud',
        educational: 'education', education: 'education',
        telecom: 'telecom',
    };
    return m[a] || 'video';
}
