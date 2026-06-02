import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, Club, CreateClubRequest, pricingApi, PricingService } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Box, Switch, Avatar, Snackbar, Alert } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { BottomSheet } from '@/shared/ui/Modal';
import { MSIcon } from '@/shared/ui/MSIcon';
import { cn } from '@/shared/lib/utils';
import {
    STATIC_SERVICES,
    SERVICE_COLORS,
    SERVICE_ICONS,
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
    iconUrl?: string;
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

function SuccessScreen({ svcName, svcColor, iconUrl, pricePerson: _pricePerson, createdClub, bank, phone, payDay, desc, onOpen, onAllClubs, haptic, onUpdated }: SuccessScreenProps) {
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
        <div className="min-h-[100dvh] bg-[#F5F4EF] text-[#111] flex flex-col">
            <div className="flex-1 flex flex-col items-center px-5 pb-8 pt-12 gap-6 overflow-y-auto">
                {/* Icon */}
                <div className="relative">
                    <Avatar
                        src={iconUrl}
                        alt={svcName}
                        variant="rounded"
                        sx={{
                            width: 96, height: 96, borderRadius: 6,
                            bgcolor: svcColor, color: 'white', fontSize: 36, fontWeight: 700,
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                            '& img': { objectFit: 'contain' }
                        }}
                    >
                        {svcName.charAt(0)}
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
                        <MSIcon name="check" size={18} className="text-white" filled />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-black text-[#111]">Клуб создан</h1>
                    <p className="text-[#77736B] mt-1 text-sm font-semibold">{svcName}</p>
                </div>

                {/* Details card */}
                <div className="w-full bg-white rounded-[28px] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#F0EEE8] flex items-center justify-between">
                        <p className="text-xs text-[#77736B] uppercase tracking-wider font-bold">Детали клуба</p>
                        <button
                            className="flex items-center gap-1 text-[#111] text-xs font-bold"
                            onClick={() => setEditOpen(true)}
                        >
                            <MSIcon name="edit" size={14} />
                            Изменить
                        </button>
                    </div>
                    {rows.map((row, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F0EEE8] last:border-0">
                            <div className="w-9 h-9 rounded-2xl bg-[#F2F1EC] flex items-center justify-center flex-shrink-0">
                                <MSIcon name={row.icon} size={16} className="text-[#77736B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#77736B] font-semibold">{row.label}</p>
                                <p className="text-sm font-bold text-[#111] truncate">{row.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Club ID */}
                <p className="text-xs text-[#B2AEA5] text-center">ID: {createdClub.club_id}</p>
            </div>

            {/* Bottom actions */}
            <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-3">
                <button
                    className="w-full py-4 rounded-[28px] font-black text-white text-base bg-[#111]"
                    onClick={onOpen}
                >
                    Открыть клуб
                </button>
                <button
                    className="w-full py-3 rounded-[24px] font-bold text-[#111] text-sm bg-white"
                    onClick={onAllClubs}
                >
                    Все клубы
                </button>
            </div>

            {/* Edit Bottom Sheet */}
            <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Исправить данные">
                <div className="flex flex-col gap-4 pb-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#77736B] font-bold">Общая цена (₸/мес)</label>
                        <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="w-full bg-[#F2F1EC] rounded-2xl px-4 py-3 text-sm text-[#111] border border-transparent focus:outline-none focus:border-[#111]"
                            placeholder="Например: 2000"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#77736B] font-bold">Реквизиты (телефон / номер карты)</label>
                        <input
                            type="text"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            className="w-full bg-[#F2F1EC] rounded-2xl px-4 py-3 text-sm text-[#111] border border-transparent focus:outline-none focus:border-[#111]"
                            placeholder="+7 (7XX) XXX XX XX"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#77736B] font-bold">День оплаты (1–31)</label>
                        <input
                            type="number"
                            min={1}
                            max={31}
                            value={editPayDay}
                            onChange={e => setEditPayDay(e.target.value)}
                            className="w-full bg-[#F2F1EC] rounded-2xl px-4 py-3 text-sm text-[#111] border border-transparent focus:outline-none focus:border-[#111]"
                            placeholder="Например: 15"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#77736B] font-bold">Описание</label>
                        <textarea
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-[#F2F1EC] rounded-2xl px-4 py-3 text-sm text-[#111] border border-transparent focus:outline-none focus:border-[#111] resize-none"
                            placeholder="Описание клуба..."
                        />
                    </div>
                    <button
                        className="w-full py-4 rounded-[28px] font-black text-white text-base bg-[#111] disabled:opacity-50"
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

const BOT_USERNAME = 'subscription_market_bot';

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
    const [groupRequesting, setGroupRequesting] = useState(false);
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

    const [localError, setLocalError] = useState<string | null>(null);

    const showAlert = (msg: string) => {
        setLocalError(msg);
    };

    const phoneOk = /^\+7 \(\d{3}\) \d{3} \d{2} \d{2}$/.test(phone);
    const tgLinkOk = /^https:\/\/t\.me\/(\+|joinchat\/|[A-Za-z0-9_])/.test(tgLink.trim());

    const stepOk = [
        !!svcId,
        !!price && parseFloat(price) > 0 && members >= 2 && !!payDay,
        phoneOk && (!useTg || (tgLinkOk && botAdmin)),
    ];

    const createFn = useMutation({
        mutationFn: (d: CreateClubRequest) => api.createClub(d),
        onSuccess: (c: Club) => {
            haptic.notification('success');
            setCreatedClub(c);
            setStep(3); // success step
        },
        onError: (err: any) => {
            haptic.notification('error');
            showAlert(err.message || 'Произошла ошибка при создании клуба. Попробуйте еще раз.');
        },
    });

    /* --- handlers --- */
    const pick = (s: CatalogService) => {
        haptic.selection();
        setSelected(s); setSvcId(s.id);
        setPrice(String(s.priceRange.recommended));
        setMembers(2);
        setPayDay(null);
    };

    const next = () => {
        if (!stepOk[step]) {
            haptic.notification('error');
            if (step === 0) showAlert('Пожалуйста, выберите сервис, чтобы продолжить.');
            else if (step === 1) {
                if (!price || parseFloat(price) <= 0) showAlert('Пожалуйста, укажите корректную стоимость.');
                else if (members < 2) showAlert('Количество участников должно быть минимум 2.');
                else if (!payDay) showAlert('Пожалуйста, выберите день оплаты.');
            }
            return;
        }
        haptic.impact('light');
        setStep(x => x + 1);
    };

    const back = () => step > 0 ? (haptic.impact('light'), setStep(x => x - 1)) : navigate(-1);

    const openTelegramLink = (url: string) => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.openTelegramLink) tg.openTelegramLink(url);
        else window.open(url, '_blank');
    };

    const waitForTelegramGroupLink = async (requestId: string): Promise<boolean> => {
        for (let attempt = 0; attempt < 8; attempt += 1) {
            if (attempt > 0) {
                await new Promise(resolve => window.setTimeout(resolve, 1500));
            }

            const resolved = await api.resolveTelegramGroupRequest(requestId);
            if (resolved.status === 'ready' && resolved.link) {
                setTgLink(resolved.link);
                setBotAdmin(true);
                return true;
            }
        }

        return false;
    };

    const requestTelegramGroup = async () => {
        const tg = (window as any).Telegram?.WebApp;
        haptic.impact('medium');

        if (!tg?.requestChat) {
            showAlert('Создание группы работает только внутри Telegram Mini App с обновленным Telegram. В браузере этот экран не поддерживается.');
            return;
        }

        setGroupRequesting(true);
        try {
            const prepared = await api.createTelegramGroupRequest();
            tg.requestChat(prepared.prepared_id, async (success: boolean) => {
                if (!success) {
                    setGroupRequesting(false);
                    return;
                }

                try {
                    const linked = await waitForTelegramGroupLink(prepared.request_id);
                    if (linked) {
                        haptic.notification('success');
                    } else {
                        haptic.notification('warning');
                        setBotAdmin(true);
                        tg.showAlert?.('Группа выбрана. Telegram пока не отдал ссылку автоматически — вставьте invite-ссылку вручную ниже.');
                    }
                } catch {
                    haptic.notification('warning');
                    setBotAdmin(true);
                    tg.showAlert?.('Группа выбрана. Не удалось получить ссылку автоматически — вставьте invite-ссылку вручную ниже.');
                } finally {
                    setGroupRequesting(false);
                }
            });
        } catch (e) {
            haptic.notification('error');
            setGroupRequesting(false);
            showAlert('Не удалось открыть создание группы. Обновите Telegram и попробуйте еще раз.');
        }
    };

    const submit = () => {
        if (!stepOk[step]) {
            haptic.notification('error');
            if (step === 2) {
                if (!phone) showAlert('Пожалуйста, укажите реквизиты для оплаты.');
                else if (!/^\+7 \(\d{3}\) \d{3} \d{2} \d{2}$/.test(phone)) showAlert('Пожалуйста, введите полный номер телефона в правильном формате: +7 (XXX) XXX XX XX');
                else if (useTg && !tgLinkOk) showAlert('Укажите корректную ссылку на Telegram-группу.');
                else if (useTg && !botAdmin) showAlert('Подтвердите, что бот добавлен администратором группы.');
            }
            return;
        }
        haptic.impact('medium');
        const structuredDesc = [
            'Оплата: после вступления и проверки доступа',
            desc || null,
        ].filter(Boolean).join('\n');
        createFn.mutate({
            service_id: svcId,
            price_total: parseFloat(price),
            max_members: members,
            payment_method: bank,
            payment_details: phone,
            payment_day: payDay ?? undefined,
            description: structuredDesc || undefined,
            approval_mode: 'auto',
            ...(useTg && tgLinkOk ? { telegram_group_link: tgLink.trim() } : {}),
        });
    };



    // ─── UI ────────────────────────────────────────────────────────────────

    // ─── Success Screen ────────────────────────────────────────────────────
    if (step === 3 && createdClub) {
        const svcName = selected?.name ?? createdClub.subscription?.service_name ?? 'Клуб';
        const svcColor = (SERVICE_COLORS as Record<string, string>)[selected?.id ?? ''] || '#6366f1';
        const iconUrl = selected ? SERVICE_ICONS[selected.logo] : undefined;
        const pricePerson = Math.round(createdClub.price_total / createdClub.max_members);
        return <SuccessScreen
            svcName={svcName}
            svcColor={svcColor}
            iconUrl={iconUrl}
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
        <div className="min-h-[100dvh] bg-[#F5F4EF] text-[#111] flex flex-col">

            {/* top nav */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 1.5, pb: 1, backdropFilter: 'blur(20px)', bgcolor: 'rgba(245,244,239,0.94)', flexShrink: 0 }}>
                <button onClick={back} className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform" aria-label="Назад">
                    <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18, color: '#111' }} />
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 850, lineHeight: 1.1 }}>Новый клуб</p>
                    <p style={{ fontSize: 12, color: '#77736B', fontWeight: 650, marginTop: 2 }}>
                        {step === 0 && 'Выберите сервис'}
                        {step === 1 && 'Параметры'}
                        {step === 2 && 'Реквизиты'}
                        {step === 3 && 'Telegram'}
                    </p>
                </div>
                <div style={{ width: 40, flexShrink: 0 }} />
            </Box>

            {/* progress dots */}
            <div className="flex gap-1.5 justify-center py-3 flex-shrink-0">
                {STEPS.map((_, i) => (
                    <div key={i} className={cn(
                        'rounded-full transition-all duration-300',
                        i === step ? 'w-7 h-2 bg-[#111]' : i < step ? 'w-2 h-2 bg-[#111]/35' : 'w-2 h-2 bg-[#E6E3DA]'
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
                        <div className="flex items-center gap-2 bg-white rounded-[28px] px-4 h-14">
                            <MSIcon name="search" size={18} className="text-[#77736B] flex-shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Найти YouTube, Яндекс, Spotify..."
                                className="flex-1 bg-transparent text-[17px] font-semibold outline-none placeholder:text-[#77736B]"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="w-6 h-6 rounded-full bg-[#F2F1EC] flex items-center justify-center"
                                >
                                    <MSIcon name="close" size={12} className="text-[#77736B]" />
                                </button>
                            )}
                        </div>

                        {/* Search results (inline list when typing) */}
                        {search && (
                            <div>
                                {searchResults.length === 0 && (
                                    <p className="text-center text-[#77736B] text-[15px] py-12">Ничего не найдено</p>
                                )}
                                <div className="bg-white rounded-[28px] overflow-hidden">
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
                                                        'w-full flex items-center gap-3 px-4 h-[58px] transition-colors active:bg-[#F2F1EC] text-left',
                                                        isActive ? 'bg-[#FFE15A]/25' : ''
                                                    )}
                                                >
                                                    <Avatar
                                                        src={SERVICE_ICONS[s.logo]}
                                                        alt={s.name}
                                                        variant="rounded"
                                                        sx={{
                                                            width: 32, height: 32, flexShrink: 0, borderRadius: 2,
                                                            bgcolor: 'transparent', color: color, fontSize: 13, fontWeight: 700,
                                                            '& img': { objectFit: 'contain' }
                                                        }}
                                                    >
                                                        {s.name[0]}
                                                    </Avatar>
                                                    <span className={cn(
                                                        'flex-1 text-[17px] truncate',
                                                        isActive ? 'text-[#111] font-black' : 'text-[#111] font-semibold'
                                                    )}>{s.name}</span>
                                                    <span className="text-[15px] text-[#77736B] font-bold mr-1">{s.priceRange.recommended} ₸</span>
                                                    {isActive
                                                        ? <MSIcon name="check" size={18} className="text-[#111]" />
                                                        : <MSIcon name="chevron_right" size={16} className="text-[#B2AEA5]" />}
                                                </button>
                                                {!isLast && <div className="ml-[64px] h-px bg-[#F0EEE8]" />}
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
                                    <p className="text-[13px] text-[#77736B] font-bold flex-shrink-0">
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
                                                    'flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-bold transition-colors',
                                                    catFilter === cat
                                                        ? 'bg-[#111] text-white'
                                                        : 'bg-white text-[#77736B]'
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
                                                    'bg-white rounded-[28px] p-4 flex flex-col gap-3 text-left transition-colors active:opacity-80',
                                                    isActive ? 'ring-2 ring-[#111] ring-offset-2 ring-offset-[#F5F4EF]' : ''
                                                )}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <Avatar
                                                        src={SERVICE_ICONS[s.logo]}
                                                        alt={s.name}
                                                        variant="rounded"
                                                        sx={{
                                                            width: 44, height: 44, flexShrink: 0, borderRadius: 3,
                                                            bgcolor: 'transparent', color: color, fontSize: 18, fontWeight: 700,
                                                            '& img': { objectFit: 'contain' }
                                                        }}
                                                    >
                                                        {s.name[0]}
                                                    </Avatar>
                                                    {isActive && (
                                                            <div className="w-5 h-5 rounded-full bg-[#111] flex items-center justify-center">
                                                                <MSIcon name="check" size={12} className="text-white" />
                                                            </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        'text-[15px] font-semibold leading-tight',
                                                        isActive ? 'text-[#111]' : 'text-[#111]'
                                                    )}>{s.name}</p>
                                                    <p className="text-[13px] text-[#77736B] font-semibold mt-0.5">
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
                                    <div className="flex items-center gap-3 bg-white rounded-[28px] p-3">
                                        <Avatar
                                            src={SERVICE_ICONS[selected.logo]}
                                            alt={selected.name}
                                            variant="rounded"
                                            sx={{
                                                width: 44, height: 44, flexShrink: 0, borderRadius: 4,
                                                bgcolor: 'transparent', color: 'white', fontSize: 16, fontWeight: 700,
                                                '& img': { objectFit: 'contain' }
                                            }}
                                        >
                                            {selected.name[0]}
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black truncate text-[#111]">{selected.name}</p>
                                            <p className="text-xs text-[#77736B] font-semibold">
                                                Рынок: {selected.priceRange.min}–{selected.priceRange.max} ₸/мес
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Main form card — all 3 rows in one card ── */}
                                <div className="bg-white rounded-[28px] overflow-hidden">

                                    {/* ROW 1: PRICE */}
                                    <div className="px-5 pt-4 pb-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-[#77736B] mb-0.5">
                                                    Стоимость в месяц
                                                </p>
                                                {/* chip below label */}
                                                <div className="min-h-[20px]">
                                                    {priceState === 'low' && <span className="text-[11px] font-bold text-[#B7791F]">Ниже рынка</span>}
                                                    {priceState === 'high' && <span className="text-[11px] font-bold text-[#D92D20]">Выше рынка</span>}
                                                    {priceState === 'ok' && <span className="text-[11px] font-bold text-[#169B55]">Хорошая цена</span>}
                                                    {!price && selected && <span className="text-[11px] text-[#77736B] font-semibold">~{selected.priceRange.recommended} ₸ рекоменд.</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <input
                                                    type="text"
                                                    value={price}
                                                    onChange={e => setPrice(e.target.value.replace(/\D/g, ''))}
                                                    placeholder={selected ? `${selected.priceRange.recommended}` : '0'}
                                                    className="w-28 text-right text-[32px] leading-none font-black bg-transparent outline-none tabular-nums text-[#111] placeholder:text-[#B2AEA5]"
                                                    inputMode="numeric"
                                                    autoFocus
                                                />
                                                <span className="text-base font-bold text-[#77736B]">₸</span>
                                                <div className="w-5">
                                                    {priceOk && <MSIcon name="check_circle" size={18} className="text-[#169B55]" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* divider */}
                                    <div className="h-px bg-[#F0EEE8] mx-5" />

                                    {/* ROW 2: MEMBERS */}
                                    <div className={cn(
                                        'px-5 py-3 transition-opacity duration-300',
                                        !priceOk ? 'opacity-60 pointer-events-none select-none' : ''
                                    )}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-[#77736B] mb-0.5">
                                                    Участников (включая вас)
                                                </p>
                                                <div className="min-h-[20px]">
                                                    {pricePer > 0
                                                        ? <span className="text-[11px] font-bold text-[#111]">{pricePer} ₸/чел</span>
                                                        : <span className="text-[11px] text-[#77736B] font-semibold">нажмите + чтобы выбрать</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => { haptic.selection(); setMembers(m => m === 0 ? 0 : Math.max(2, m - 1)); }}
                                                    className="w-9 h-9 rounded-full bg-[#F2F1EC] flex items-center justify-center active:scale-90 transition-transform"
                                                >
                                                    <MSIcon name="remove" size={16} className="text-[#111]" />
                                                </button>
                                                <span className={cn(
                                                    'text-xl font-black tabular-nums w-7 text-center',
                                                    members === 0 ? 'text-[#B2AEA5]' : 'text-[#111]'
                                                )}>
                                                    {members === 0 ? '—' : members}
                                                </span>
                                                <button
                                                    onClick={() => { haptic.selection(); setMembers(m => m === 0 ? 2 : Math.min(selected?.familySize || 6, m + 1)); }}
                                                    className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center active:scale-90 transition-transform"
                                                >
                                                    <MSIcon name="add" size={16} className="text-white" />
                                                </button>
                                                <div className="w-5">
                                                    {membersOk && <MSIcon name="check_circle" size={18} className="text-[#169B55]" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* divider */}
                                    <div className="h-px bg-[#F0EEE8] mx-5" />

                                    {/* ROW 3: PAYMENT DAY — inline accordion */}
                                    <div className={cn(
                                        'transition-opacity duration-300',
                                        dayLocked ? 'opacity-60 pointer-events-none' : ''
                                    )}>
                                        {/* header row — tap to toggle */}
                                        <button
                                            onClick={() => { haptic.impact('light'); setDayOpen(o => !o); }}
                                            disabled={dayLocked}
                                            className="w-full px-5 pt-3 pb-3 text-left"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-[#77736B] mb-0.5">
                                                        День списания
                                                    </p>
                                                    <p className={cn(
                                                        'text-sm font-bold',
                                                        dayOk ? 'text-[#111]' : 'text-[#B2AEA5]'
                                                    )}>
                                                        {dayOk ? `${payDay} числа каждого месяца` : 'Не выбрано'}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-2">
                                                    {dayOk && !dayOpen && (
                                                        <MSIcon name="check_circle" size={18} className="text-[#169B55]" />
                                                    )}
                                                    <MSIcon
                                                        name="expand_more"
                                                        size={20}
                                                        className={cn(
                                                            'text-[#77736B] transition-transform duration-300',
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
                                                <p className="text-[11px] text-[#77736B] font-semibold text-center mb-3">
                                                    Каждый месяц бот напомнит об оплате
                                                </p>
                                                <div className="grid grid-cols-7 gap-1.5">
                                                    {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => (
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
                                                                    ? 'bg-[#111] text-white'
                                                                    : 'bg-[#F2F1EC] text-[#77736B]'
                                                            )}
                                                        >
                                                            {d}
                                                        </button>
                                                    ))}
                                                </div>
                                                {payDay && (
                                                    <button
                                                        onClick={() => { setPayDay(null); setDayOpen(false); }}
                                                        className="w-full mt-2 py-2 text-xs text-[#77736B] font-bold"
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
                                    'bg-white rounded-[28px] px-5 py-4 transition-opacity duration-300',
                                    !membersOk ? 'opacity-60 pointer-events-none select-none' : ''
                                )}>
                                    <textarea
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        placeholder="Описание (необязательно) — особые условия, что входит в подписку..."
                                        rows={2}
                                        className="w-full bg-transparent text-sm font-semibold outline-none resize-none text-[#111] placeholder:text-[#77736B]"
                                    />
                                </div>

                                <div className="bg-[#111] text-white rounded-[32px] p-5 shadow-[0_18px_45px_rgba(17,17,17,0.12)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-bold text-white/55 uppercase tracking-[0.08em]">Предпросмотр</p>
                                            <p className="mt-1 text-[22px] leading-tight font-black truncate">
                                                {selected?.name || 'Семейная подписка'}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-white/55">
                                                {members > 1 ? `${Math.max(members - 1, 1)} свободн. ${members - 1 === 1 ? 'место' : 'места'}` : 'места появятся после выбора участников'}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-[#FFE15A] text-[#111] flex items-center justify-center flex-shrink-0">
                                            <MSIcon name="groups" size={24} filled />
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <div className="rounded-3xl bg-white/10 px-4 py-3">
                                            <p className="text-[12px] font-bold text-white/50">Ваша доля</p>
                                            <p className="mt-0.5 text-[22px] font-black tabular-nums">
                                                {pricePer > 0 ? `${pricePer} ₸` : '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl bg-white/10 px-4 py-3">
                                            <p className="text-[12px] font-bold text-white/50">Оплата</p>
                                            <p className="mt-0.5 text-[22px] font-black tabular-nums">
                                                {payDay ? `${payDay} числа` : '—'}
                                            </p>
                                        </div>
                                    </div>
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
                                <div className="bg-white rounded-[28px] overflow-hidden">
                                    <div className={cn(
                                        'px-5 pt-4 pb-3 transition-all',
                                        hasPhoneError ? 'ring-2 ring-inset ring-[#D92D20]/50 rounded-[28px]' : ''
                                    )}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-[#77736B] mb-0.5">
                                                    Номер для получения оплаты
                                                </p>
                                                <p className="text-[11px] text-[#77736B] font-semibold">
                                                    {hasPhoneError
                                                        ? <span className="text-[#D92D20]">Формат: +7 (7XX) XXX XX XX</span>
                                                        : 'Участники переводят через Kaspi'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isPhoneFull && <MSIcon name="check_circle" size={18} className="text-[#169B55]" />}
                                            </div>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            placeholder="+7 (702) 123 45 67"
                                            className="mt-3 w-full bg-transparent text-xl font-black outline-none text-[#111] placeholder:text-[#B2AEA5] placeholder:font-semibold placeholder:text-base"
                                            inputMode="tel"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* ── TG Group card ── */}
                                <div className="bg-white rounded-[28px] overflow-hidden">
                                    {/* toggle row */}
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-[#111]">Telegram-группа</p>
                                            <p className="text-xs text-[#77736B] font-semibold mt-0.5">
                                                {useTg
                                                    ? 'Вход, доступ и всё общение — в группе'
                                                    : 'Лучший способ решать вопросы участников'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={useTg}
                                            onChange={e => { haptic.selection(); setUseTg(e.target.checked); }}
                                            size="small"
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#111' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#111' },
                                            }}
                                        />
                                    </div>

                                    {/* expand when useTg */}
                                    {useTg && (
                                        <>
                                            <div className="h-px bg-[#F0EEE8] mx-5" />

                                            <div className="px-5 py-4">
                                                <button
                                                    onClick={requestTelegramGroup}
                                                    disabled={groupRequesting}
                                                    className="w-full h-13 rounded-[24px] bg-[#111] text-white flex items-center justify-center gap-2 text-sm font-black active:scale-[0.98] transition-transform disabled:opacity-60"
                                                >
                                                    <MSIcon name="group_add" size={20} className="text-white" />
                                                    {groupRequesting ? 'Получаем ссылку...' : 'Создать или выбрать группу'}
                                                </button>
                                                <p className="mt-2 text-[11px] text-[#77736B] font-semibold leading-relaxed">
                                                    Telegram откроет окно, где можно выбрать существующую группу или создать новую. Ссылка подтянется автоматически.
                                                </p>
                                            </div>

                                            <div className="h-px bg-[#F0EEE8] mx-5" />

                                            {/* steps */}
                                            <div className="px-5 py-4 space-y-3">
                                                {[
                                                    ['Откройте окно Telegram', 'Кнопка выше откроет выбор или создание группы'],
                                                    ['Назначьте бота администратором', 'С правом отправки сообщений'],
                                                    ['Дождитесь ссылки', 'Мы вставим invite-ссылку в поле ниже'],
                                                ].map(([title, sub], i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#F2F1EC] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-[10px] font-black text-[#111]">{i + 1}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#111] leading-tight">{title}</p>
                                                            {sub && <p className="text-[11px] text-[#77736B] font-semibold mt-0.5">{sub}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="h-px bg-[#F0EEE8] mx-5" />

                                            {/* open bot button */}
                                            <button
                                                onClick={() => { haptic.impact('light'); openTelegramLink(`https://t.me/${BOT_USERNAME}`); }}
                                                className="w-full px-5 py-3 flex items-center justify-between text-left"
                                            >
                                                <span className="text-sm font-black text-[#111]">Открыть @{BOT_USERNAME}</span>
                                                <MSIcon name="open_in_new" size={16} className="text-[#111]" />
                                            </button>

                                            <div className="h-px bg-[#F0EEE8] mx-5" />

                                            {/* link input */}
                                            <div className="px-5 py-4">
                                                <p className="text-xs font-bold text-[#77736B] mb-2">Ссылка на группу</p>
                                                <input
                                                    value={tgLink}
                                                    onChange={e => setTgLink(e.target.value)}
                                                    placeholder="https://t.me/+xxxxxx"
                                                    className="w-full bg-transparent text-sm font-semibold outline-none text-[#111] placeholder:text-[#B2AEA5]"
                                                />
                                            </div>

                                            <div className="h-px bg-[#F0EEE8] mx-5" />

                                            {/* bot admin confirm */}
                                            <button
                                                onClick={() => { haptic.selection(); setBotAdmin(!botAdmin); }}
                                                className="w-full px-5 py-4 flex items-center gap-3 text-left"
                                            >
                                                <div className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                                    botAdmin ? 'bg-[#169B55] border-[#169B55]' : 'border-[#B2AEA5]'
                                                )}>
                                                    {botAdmin && <MSIcon name="check" size={11} className="text-white" />}
                                                </div>
                                                <p className="text-sm font-black text-[#111]">Бот назначен администратором</p>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* tip */}
                                <div className="flex gap-3 px-4 py-3 bg-[#FFE15A] rounded-[24px]">
                                    <MSIcon name="tips_and_updates" size={16} className="text-[#111] flex-shrink-0 mt-0.5" filled />
                                    <p className="text-xs text-[#5F551D] font-semibold leading-relaxed">
                                        Создайте Telegram-группу для участников — там удобно делиться доступом, решать вопросы и держать всех в курсе.
                                    </p>
                                </div>

                            </div>
                        );
                    })()
                }

            </div >

            {/* ── BOTTOM CTA ── */}
            < div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-[#F5F4EF]/90 backdrop-blur-xl z-40" >
                {
                    step < STEPS.length - 1 ? (
                        <button
                            onClick={next}
                            className={cn(
                                'w-full h-14 rounded-2xl text-base font-black transition-all',
                                stepOk[step]
                                    ? 'bg-[#111] text-white active:scale-[0.98]'
                                    : 'bg-white text-[#B2AEA5] cursor-not-allowed'
                            )}
                        >
                            Далее
                        </button>
                    ) : (
                        <button
                            onClick={!createFn.isPending ? submit : undefined}
                            disabled={createFn.isPending}
                            className={cn(
                                'w-full h-14 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-2',
                                stepOk[step]
                                    ? 'bg-[#111] text-white active:scale-[0.98]'
                                    : 'bg-white text-[#B2AEA5] cursor-not-allowed',
                                createFn.isPending ? 'opacity-60' : ''
                            )}
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
                                <p className="text-[13px] text-[#77736B] font-bold mb-2 px-1">{CAT_META[cat]}</p>
                                <div className="bg-white rounded-[28px] overflow-hidden">
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
                                                        'w-full flex items-center gap-3 px-4 h-[58px] transition-colors active:bg-[#F2F1EC] text-left',
                                                        isActive ? 'bg-[#FFE15A]/25' : ''
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
                                                        isActive ? 'text-[#111] font-black' : 'text-[#111] font-semibold'
                                                    )}>{s.name}</span>
                                                    <span className="text-[15px] text-[#77736B] font-bold mr-1">{s.priceRange.recommended} ₸</span>
                                                    {isActive
                                                        ? <MSIcon name="check" size={18} className="text-[#111]" />
                                                        : <MSIcon name="chevron_right" size={16} className="text-[#B2AEA5]" />}
                                                </button>
                                                {!isLast && <div className="ml-[56px] h-px bg-[#F0EEE8]" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>
            </BottomSheet >

            <Snackbar
                open={!!localError}
                autoHideDuration={4000}
                onClose={() => setLocalError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ mt: 2, zIndex: 99999 }}
            >
                <Alert
                    severity="error"
                    onClose={() => setLocalError(null)}
                    variant="filled"
                    sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        backgroundColor: '#f31260',
                        color: 'white',
                        boxShadow: '0 10px 20px -5px rgba(243, 18, 96, 0.4)'
                    }}
                >
                    {localError}
                </Alert>
            </Snackbar>
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
