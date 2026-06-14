import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, AccountOffer } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';

type TabKey = 'buy' | 'sell' | 'my';

type AccountServiceOption = {
    name: string;
    category: string;
};

const accessTypeOptions = ['Готовый аккаунт', 'Личная активация', 'Промокод', 'Инвайт / команда', 'Общий доступ'];
const periodOptions = ['1 месяц', '2 месяца', '3 месяца', '6 месяцев', '12 месяцев', '18 месяцев', '24 месяца', '36 месяцев'];
const warrantyOptions = ['Замена при слете', 'Гарантия на срок', 'Без гарантии'];

function normalizeAccountTab(value: string | null): TabKey {
    if (value === 'sell' || value === 'create') return 'sell';
    if (value === 'my') return 'my';
    return 'buy';
}

function accountTabToQuery(value: TabKey): string {
    if (value === 'sell') return 'create';
    if (value === 'my') return 'my';
    return 'market';
}

const accountServiceOptions: AccountServiceOption[] = [
    { name: 'ChatGPT Plus', category: 'AI' },
    { name: 'ChatGPT Pro', category: 'AI' },
    { name: 'Claude Pro', category: 'AI' },
    { name: 'Claude Max', category: 'AI' },
    { name: 'Grok Super', category: 'AI' },
    { name: 'Gemini Pro', category: 'AI' },
    { name: 'Google AI Premium', category: 'AI' },
    { name: 'Perplexity Pro', category: 'AI' },
    { name: 'Midjourney', category: 'AI' },
    { name: 'Cursor Pro', category: 'AI' },
    { name: 'GitHub Copilot', category: 'AI' },
    { name: 'Canva Pro', category: 'Дизайн' },
    { name: 'Adobe Creative Cloud', category: 'Дизайн' },
    { name: 'Figma Professional', category: 'Дизайн' },
    { name: 'CapCut Pro', category: 'Дизайн' },
    { name: 'Freepik Premium', category: 'Дизайн' },
    { name: 'Envato Elements', category: 'Дизайн' },
    { name: 'YouTube Premium', category: 'Видео' },
    { name: 'Netflix Premium', category: 'Видео' },
    { name: 'Yandex Plus', category: 'Видео' },
    { name: 'Яндекс Плюс', category: 'Видео' },
    { name: 'Кинопоиск', category: 'Видео' },
    { name: 'IVI', category: 'Видео' },
    { name: 'MEGOGO', category: 'Видео' },
    { name: 'Crunchyroll', category: 'Видео' },
    { name: 'Spotify Premium', category: 'Музыка' },
    { name: 'Apple Music', category: 'Музыка' },
    { name: 'Яндекс Музыка', category: 'Музыка' },
    { name: 'SoundCloud Go+', category: 'Музыка' },
    { name: 'X Premium', category: 'Соцсети' },
    { name: 'Telegram Premium', category: 'Соцсети' },
    { name: 'Discord Nitro', category: 'Соцсети' },
    { name: 'LinkedIn Premium', category: 'Соцсети' },
    { name: 'Microsoft 365', category: 'Облако' },
    { name: 'Google One', category: 'Облако' },
    { name: 'Google One 2TB', category: 'Облако' },
    { name: 'iCloud+', category: 'Облако' },
    { name: 'Яндекс 360', category: 'Облако' },
    { name: 'Dropbox Plus', category: 'Облако' },
    { name: 'Steam аккаунт', category: 'Игры' },
    { name: 'PlayStation Plus', category: 'Игры' },
    { name: 'Xbox Game Pass', category: 'Игры' },
    { name: 'EA Play', category: 'Игры' },
    { name: 'Notion Plus', category: 'Софт' },
    { name: 'Grammarly Premium', category: 'Софт' },
    { name: 'NordVPN', category: 'Софт' },
    { name: 'Surfshark VPN', category: 'Софт' },
    { name: 'Duolingo Super', category: 'Обучение' },
    { name: 'Coursera Plus', category: 'Обучение' },
    { name: 'Udemy', category: 'Обучение' },
    { name: 'Skillshare', category: 'Обучение' },
];

const accountCategoryOptions = ['Категории', ...Array.from(new Set(accountServiceOptions.map(option => option.category)))];

const accountCategoryColors: Record<string, string> = {
    AI: '#D8C7FF',
    'Дизайн': '#B9E7FF',
    'Видео': '#FFE15A',
    'Музыка': '#B9F27D',
    'Соцсети': '#FFD8E6',
    'Облако': '#DCE7FF',
    'Игры': '#FFDCC7',
    'Софт': '#E9E6DE',
    'Обучение': '#D8F7C6',
};

const accountBrandDomains: Array<{ match: string[]; domain: string; color: string }> = [
    { match: ['chatgpt', 'openai'], domain: 'openai.com', color: '#111111' },
    { match: ['claude'], domain: 'anthropic.com', color: '#D97757' },
    { match: ['grok'], domain: 'x.ai', color: '#111111' },
    { match: ['gemini', 'google ai', 'google one'], domain: 'google.com', color: '#4285F4' },
    { match: ['perplexity'], domain: 'perplexity.ai', color: '#20B8CD' },
    { match: ['midjourney'], domain: 'midjourney.com', color: '#111111' },
    { match: ['cursor'], domain: 'cursor.com', color: '#111111' },
    { match: ['copilot', 'github'], domain: 'github.com', color: '#111111' },
    { match: ['canva'], domain: 'canva.com', color: '#00C4CC' },
    { match: ['adobe'], domain: 'adobe.com', color: '#FA0F00' },
    { match: ['figma'], domain: 'figma.com', color: '#A259FF' },
    { match: ['capcut'], domain: 'capcut.com', color: '#111111' },
    { match: ['freepik'], domain: 'freepik.com', color: '#127CFF' },
    { match: ['envato'], domain: 'envato.com', color: '#82B541' },
    { match: ['youtube'], domain: 'youtube.com', color: '#FF0000' },
    { match: ['netflix'], domain: 'netflix.com', color: '#E50914' },
    { match: ['yandex', 'яндекс'], domain: 'yandex.ru', color: '#FFCC00' },
    { match: ['кинопоиск'], domain: 'kinopoisk.ru', color: '#FF6600' },
    { match: ['ivi'], domain: 'ivi.ru', color: '#00B4FF' },
    { match: ['megogo'], domain: 'megogo.net', color: '#1DB954' },
    { match: ['crunchyroll'], domain: 'crunchyroll.com', color: '#F47521' },
    { match: ['spotify'], domain: 'spotify.com', color: '#1DB954' },
    { match: ['apple', 'icloud'], domain: 'apple.com', color: '#A2AAAD' },
    { match: ['soundcloud'], domain: 'soundcloud.com', color: '#FF5500' },
    { match: ['x premium'], domain: 'x.com', color: '#111111' },
    { match: ['telegram'], domain: 'telegram.org', color: '#2AABEE' },
    { match: ['discord'], domain: 'discord.com', color: '#5865F2' },
    { match: ['linkedin'], domain: 'linkedin.com', color: '#0A66C2' },
    { match: ['microsoft'], domain: 'microsoft.com', color: '#00A4EF' },
    { match: ['dropbox'], domain: 'dropbox.com', color: '#0061FF' },
    { match: ['steam'], domain: 'steampowered.com', color: '#111111' },
    { match: ['playstation'], domain: 'playstation.com', color: '#003791' },
    { match: ['xbox'], domain: 'xbox.com', color: '#107C10' },
    { match: ['ea play'], domain: 'ea.com', color: '#FF4747' },
    { match: ['notion'], domain: 'notion.so', color: '#111111' },
    { match: ['grammarly'], domain: 'grammarly.com', color: '#15C39A' },
    { match: ['nordvpn'], domain: 'nordvpn.com', color: '#4687FF' },
    { match: ['surfshark'], domain: 'surfshark.com', color: '#1EBE95' },
    { match: ['duolingo'], domain: 'duolingo.com', color: '#58CC02' },
    { match: ['coursera'], domain: 'coursera.org', color: '#0056D2' },
    { match: ['udemy'], domain: 'udemy.com', color: '#A435F0' },
    { match: ['skillshare'], domain: 'skillshare.com', color: '#00FF84' },
];

function getAccountServiceBrand(serviceName: string) {
    const normalized = serviceName.toLowerCase();
    const brand = accountBrandDomains.find(item => item.match.some(match => normalized.includes(match)));
    const domain = brand?.domain ?? 'subsmarket.xyz';
    return {
        color: brand?.color ?? '#D8C7FF',
        iconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        initial: serviceName.trim().charAt(0).toUpperCase() || 'S',
    };
}

function getCategoryColor(category: string) {
    return accountCategoryColors[category] ?? '#F2F1EC';
}

function getServiceSpecifics(serviceName: string): string[] {
    const name = serviceName.toLowerCase();

    if (!serviceName) return [];

    if (name.includes('chatgpt') || name.includes('claude') || name.includes('grok') || name.includes('gemini') || name.includes('perplexity') || name.includes('cursor')) {
        return [
            'Общий аккаунт: история, память или workspace могут быть видны другим.',
            'AI-сервисы часто банят за разные IP, VPN и корпоративные инвайты.',
            'Claude/Grok могут быстро упереться в лимиты, если доступ делят на многих.',
        ];
    }

    if (name.includes('canva') || name.includes('figma') || name.includes('adobe') || name.includes('capcut') || name.includes('envato') || name.includes('freepik') || name.includes('midjourney')) {
        return [
            'Чаще всего это инвайт в команду или Edu/Enterprise-доступ.',
            'Проекты обычно приватны, но командные настройки и участники могут быть видны.',
            'Уточните коммерческое использование и замену, если команда слетит.',
        ];
    }

    if (name.includes('youtube')) {
        return [
            'YouTube может блокировать семейку за разные адреса и страны.',
            'Сменить Google-семью обычно можно только 1 раз в 12 месяцев.',
            'Уточните формат: инвайт в семью, личная активация или готовый аккаунт.',
        ];
    }

    if (name.includes('spotify') || name.includes('apple music') || name.includes('yandex') || name.includes('яндекс') || name.includes('кинопоиск') || name.includes('ivi') || name.includes('megogo') || name.includes('crunchyroll')) {
        return [
            'Проверьте регион и формат: промокод, семейное место или личная активация.',
            'Для семейных мест аккаунт может не пройти, если уже был в другой семье.',
            'Уточните замену, если подписка перестанет работать раньше срока.',
        ];
    }

    if (name.includes('netflix')) {
        return [
            'Netflix часто продают как общий аккаунт с отдельным профилем.',
            'Есть риск блокировки из-за правила одного домохозяйства.',
            'Уточните PIN профиля, регион и замену при слете доступа.',
        ];
    }

    if (name.includes('x premium') || name.includes('telegram') || name.includes('discord') || name.includes('linkedin')) {
        return [
            'Безопаснее gift-ссылка или активация по username, чем передача пароля.',
            'Подписку могут отменить, если продавец оплатил украденной картой.',
            'Уточните, нужна ли передача пароля и есть ли замена при аннулировании.',
        ];
    }

    if (name.includes('google one') || name.includes('microsoft') || name.includes('icloud') || name.includes('dropbox') || name.includes('яндекс 360')) {
        return [
            'Уточните объем, срок и формат: семейное место, инвайт или аккаунт.',
            'Google One/семьи могут ограничивать повторное вступление после выхода.',
            'Файлы обычно приватны, но владелец семьи/команды управляет доступом.',
        ];
    }

    if (name.includes('vpn') || name.includes('nord') || name.includes('surfshark')) {
        return [
            'Проверьте лимит устройств и срок доступа.',
            'Общий аккаунт может перестать работать, если пароль сменит другой участник.',
            'Уточните замену, если доступ отключат раньше срока.',
        ];
    }

    if (name.includes('steam') || name.includes('playstation') || name.includes('xbox') || name.includes('ea play')) {
        return [
            'Готовые игровые аккаунты имеют высокий риск возврата владельцем.',
            'Уточните регион, 2FA, почту и что именно входит в аккаунт.',
            'Безопаснее код активации или подписка, чем чужой логин.',
        ];
    }

    return [
        'Уточните формат: готовый аккаунт, личная активация, промокод или инвайт.',
        'Не отправляйте пароль, recovery-коды и 2FA без явной необходимости.',
        'Проверьте срок, ограничения и замену при потере доступа.',
    ];
}

function readDescriptionField(description: string, label: string): string | null {
    const line = description.split('\n').find(item => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    return line ? line.slice(label.length + 1).trim() : null;
}

function getAccessTypeSpecifics(accessType: string | null): string[] {
    if (!accessType) return [];

    if (accessType.includes('Готовый')) {
        return [
            'Покупатель получает чужой логин. Проверьте, есть ли почта, 2FA и замена.',
            'Не меняйте пароль до договоренности с продавцом, иначе спор будет сложнее разобрать.',
        ];
    }

    if (accessType.includes('Личная')) {
        return [
            'Продавец может попросить вход в ваш аккаунт. Не передавайте recovery-коды без необходимости.',
            'После активации проверьте подписку и уберите лишние сессии/доступы.',
        ];
    }

    if (accessType.includes('Промокод')) {
        return [
            'Код должен активироваться на вашем аккаунте до оплаты.',
            'Уточните регион и срок действия промокода.',
        ];
    }

    if (accessType.includes('Инвайт')) {
        return [
            'Инвайт безопаснее пароля, но команда/семья может слететь раньше срока.',
            'Проверьте, что доступ пришел именно на вашу почту или аккаунт.',
        ];
    }

    if (accessType.includes('Общий')) {
        return [
            'У общего доступа нет приватности: история, файлы или профиль могут быть видны другим.',
            'Лимиты делятся между участниками, поэтому сервис может закончиться быстрее.',
        ];
    }

    return [];
}

function stripSystemDescription(description: string): string {
    return description
        .split('\n')
        .filter(line => {
            const normalized = line.toLowerCase();
            return !normalized.startsWith('тип:') && !normalized.startsWith('срок:') && !normalized.startsWith('гарантия:') && !normalized.startsWith('передача:');
        })
        .join('\n')
        .trim();
}

function getAccessBadgeColor(accessType: string | null): string {
    if (!accessType) return '#F2F1EC';
    if (accessType.includes('Личная') || accessType.includes('Промокод') || accessType.includes('Инвайт')) return '#D8F7C6';
    if (accessType.includes('Общий') || accessType.includes('Готовый')) return '#FFE1D8';
    return '#F2F1EC';
}

function getWarrantyBadgeColor(warranty: string | null): string {
    if (!warranty) return '#F2F1EC';
    if (warranty.includes('Без')) return '#FFE1D8';
    return '#D8F7C6';
}

export function AccountsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState<TabKey>(() => normalizeAccountTab(searchParams.get('tab')));
    const haptic = useHaptic();
    const { webapp } = useTelegram();
    const user = webapp?.initDataUnsafe?.user;

    const { data: offers = [], isLoading, refetch } = useQuery({
        queryKey: ['account-offers'],
        queryFn: () => api.getAccountOffers(),
        staleTime: 2 * 60 * 1000,
        refetchInterval: 60 * 1000,
    });
    const myOffers = user?.id ? offers.filter(offer => offer.seller_id === user.id) : [];

    useEffect(() => {
        const nextTab = normalizeAccountTab(searchParams.get('tab'));
        setTab(current => current === nextTab ? current : nextTab);
    }, [searchParams]);

    const handleTabChange = (nextTab: TabKey) => {
        haptic.selection();
        setTab(nextTab);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('tab', accountTabToQuery(nextTab));
        setSearchParams(nextParams, { replace: true });
    };

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 14 }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 40, bgcolor: 'rgba(245,244,239,0.94)', backdropFilter: 'blur(20px)', px: 2, pt: 1.8, pb: 1.2 }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.4 }}>
                        <Box>
                            <Typography fontSize={28} fontWeight={760} lineHeight={1.05}>
                                Аккаунты
                            </Typography>
                            <Typography fontSize={13.5} fontWeight={520} color="#77736B">
                                GPT, Canva, Grok и другие аккаунты
                            </Typography>
                        </Box>
                        <Chip label="safe" sx={{ bgcolor: '#D8C7FF', color: '#111' }} />
                    </Box>

                    <Tabs value={tab} onChange={(_, v) => handleTabChange(v)} sx={{ minHeight: 40 }}>
                        <Tab value="buy" label="Предложения" />
                        <Tab value="sell" label="Создать" />
                        <Tab value="my" label="Мои" />
                    </Tabs>
                </Box>
            </Box>

            <Box sx={{ px: 2, pt: 1.4, maxWidth: 600, mx: 'auto' }}>
                {tab === 'buy' && (
                    <Stack spacing={1}>
                        {isLoading && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress size={32} sx={{ color: '#111' }} />
                            </Box>
                        )}
                        {!isLoading && offers.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
                                <KeyRoundedIcon sx={{ fontSize: 44, color: '#B7B1A8', mb: 1 }} />
                                <Typography fontSize={18} fontWeight={720}>Пока нет предложений</Typography>
                                <Typography fontSize={14} color="#77736B" sx={{ mt: 0.5 }}>Создайте первое предложение по аккаунту или сервису.</Typography>
                                <Button onClick={() => handleTabChange('sell')} sx={{ mt: 2, bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>Создать</Button>
                            </Box>
                        )}
                        {offers.map(offer => <AccountCard key={offer.offer_id} offer={offer} currentUserId={user?.id} />)}
                    </Stack>
                )}

                {tab === 'sell' && <SellAccountForm onSuccess={() => { handleTabChange('buy'); refetch(); }} />}
                {tab === 'my' && (
                    <Stack spacing={1}>
                        {isLoading && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress size={32} sx={{ color: '#111' }} />
                            </Box>
                        )}
                        {!isLoading && myOffers.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
                                <StorefrontRoundedIcon sx={{ fontSize: 44, color: '#B7B1A8', mb: 1 }} />
                                <Typography fontSize={18} fontWeight={720}>Ваших аккаунтов пока нет</Typography>
                                <Typography fontSize={14} color="#77736B" sx={{ mt: 0.5 }}>Создайте предложение, и оно появится здесь.</Typography>
                                <Button onClick={() => handleTabChange('sell')} sx={{ mt: 2, bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>Создать</Button>
                            </Box>
                        )}
                        {myOffers.map(offer => <AccountCard key={offer.offer_id} offer={offer} currentUserId={user?.id} />)}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}

function AccountCard({ offer, currentUserId }: { offer: AccountOffer; currentUserId?: number }) {
    const haptic = useHaptic();
    const { showConfirm } = useTelegram();
    const queryClient = useQueryClient();

    const buyMutation = useMutation({
        mutationFn: () => api.createDeal({ offer_type: 'account', offer_id: offer.offer_id, amount: offer.price }),
        onSuccess: (deal) => {
            haptic.notification('success');
            alert(`Сделка #${deal.deal_id.slice(0, 8)} создана. Проверьте раздел сделок.`);
            queryClient.invalidateQueries({ queryKey: ['account-offers'] });
        },
        onError: (e) => {
            haptic.notification('error');
            console.error(e);
            alert('Не удалось создать сделку');
        },
    });

    const handleBuy = async () => {
        haptic.impact('medium');
        const confirmed = await showConfirm(`Оформить "${offer.title}" за ${offer.price} ₸?`);
        if (confirmed) buyMutation.mutate();
    };

    const isOwner = currentUserId === offer.seller_id;
    const accessType = readDescriptionField(offer.description, 'Тип');
    const period = readDescriptionField(offer.description, 'Срок');
    const warranty = readDescriptionField(offer.description, 'Гарантия');
    const publicDescription = stripSystemDescription(offer.description);
    const serviceSpecifics = getServiceSpecifics(offer.title);
    const accessTypeSpecifics = getAccessTypeSpecifics(accessType);
    const buyerWarnings = [...accessTypeSpecifics, ...serviceSpecifics].slice(0, 4);
    const brand = getAccountServiceBrand(offer.title);

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
            <CardContent sx={{ p: 1.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 1.2 }}>
                    <Box sx={{ display: 'flex', gap: 1.15, minWidth: 0 }}>
                        <Avatar
                            src={brand.iconUrl}
                            alt={offer.title}
                            sx={{ width: 48, height: 48, borderRadius: '18px', bgcolor: brand.color, color: '#fff', fontWeight: 900, '& img': { objectFit: 'contain' } }}
                        >
                            {brand.initial}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Chip label={offer.service_category} size="small" sx={{ height: 22, bgcolor: getCategoryColor(offer.service_category), color: '#111', mb: 0.8, fontWeight: 800 }} />
                            <Typography fontWeight={760} fontSize={16.5} lineHeight={1.18}>
                                {offer.title}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 0.9 }}>
                                {accessType && (
                                    <Chip label={accessType} size="small" sx={{ height: 24, bgcolor: getAccessBadgeColor(accessType), color: '#111', fontWeight: 700 }} />
                                )}
                                {period && (
                                    <Chip label={period} size="small" sx={{ height: 24, bgcolor: '#F2F1EC', color: '#111', fontWeight: 700 }} />
                                )}
                                {warranty && (
                                    <Chip label={warranty} size="small" sx={{ height: 24, bgcolor: getWarrantyBadgeColor(warranty), color: '#111', fontWeight: 700 }} />
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ bgcolor: '#F2F1EC', px: 1.3, py: 0.75, borderRadius: '16px', flexShrink: 0 }}>
                        <Typography fontWeight={760} fontSize={16}>{offer.price} ₸</Typography>
                    </Box>
                </Box>

                {publicDescription && (
                    <Typography fontSize={13.5} color="#77736B" lineHeight={1.45} sx={{ mb: 1.2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', whiteSpace: 'pre-line' }}>
                        {publicDescription}
                    </Typography>
                )}

                {buyerWarnings.length > 0 && (
                    <Box sx={{ bgcolor: '#FFF4D8', borderRadius: '18px', px: 1.2, py: 1.1, mb: 1.3 }}>
                        <Typography fontSize={12.5} fontWeight={800} color="#111" sx={{ mb: 0.55 }}>
                            Важно перед покупкой
                        </Typography>
                        <Stack spacing={0.45}>
                            {buyerWarnings.map(item => (
                                <Typography key={item} fontSize={12.2} color="#5E4B12" lineHeight={1.34}>
                                    • {item}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pt: 1.2, borderTop: '1px solid #F0EEE8' }}>
                    <Typography fontSize={12} color="#77736B" fontWeight={520}>продавец #{offer.seller_id}</Typography>
                    {!isOwner && (
                        <Button size="small" disabled={buyMutation.isPending} onClick={handleBuy} sx={{ bgcolor: '#111', color: '#fff', px: 1.6, '&:hover': { bgcolor: '#222' } }}>
                            {buyMutation.isPending ? 'Создаем...' : 'Оформить'}
                        </Button>
                    )}
                    {isOwner && <Chip size="small" label="ваше" sx={{ bgcolor: '#B9F27D' }} />}
                </Box>
            </CardContent>
        </Card>
    );
}

function AccountServicePicker({
    value,
    onSelect,
}: {
    value: AccountServiceOption | null;
    onSelect: (option: AccountServiceOption) => void;
}) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Категории');
    const [isOpen, setIsOpen] = useState(false);
    const haptic = useHaptic();
    const normalizedSearch = search.trim().toLowerCase();
    const filteredServices = accountServiceOptions.filter(option => {
        const matchesCategory = activeCategory === 'Категории' || option.category === activeCategory;
        const matchesSearch = !normalizedSearch || option.name.toLowerCase().includes(normalizedSearch);
        return matchesCategory && matchesSearch;
    });

    return (
        <Box>
            <Typography fontSize={12.5} fontWeight={800} color="#77736B" sx={{ mb: 0.8 }}>
                Сервис *
            </Typography>

            <button
                type="button"
                onClick={() => {
                    haptic.selection();
                    setIsOpen(open => !open);
                }}
                style={{
                    width: '100%',
                    border: value ? '1px solid #111' : 0,
                    background: value ? '#F5F4EF' : '#F2F1EC',
                    borderRadius: 22,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    marginBottom: isOpen ? 10 : 0,
                }}
            >
                {value ? (() => {
                    const brand = getAccountServiceBrand(value.name);
                    return (
                        <>
                            <Avatar
                                src={brand.iconUrl}
                                alt={value.name}
                                sx={{ width: 44, height: 44, borderRadius: '16px', bgcolor: brand.color, '& img': { objectFit: 'contain' } }}
                            >
                                {brand.initial}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography fontSize={16} fontWeight={850} lineHeight={1.1}>{value.name}</Typography>
                                <Typography fontSize={12.5} color="#77736B" fontWeight={700}>{value.category}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexShrink: 0 }}>
                                <CheckCircleRoundedIcon sx={{ color: '#169B55', fontSize: 22 }} />
                                <Typography fontSize={12} fontWeight={850} color="#77736B">
                                    {isOpen ? 'Скрыть' : 'Изменить'}
                                </Typography>
                            </Box>
                        </>
                    );
                })() : (
                    <>
                        <Box sx={{ width: 44, height: 44, borderRadius: '16px', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <SearchRoundedIcon sx={{ color: '#77736B', fontSize: 22 }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography fontSize={16} fontWeight={850} lineHeight={1.1}>Выберите сервис</Typography>
                            <Typography fontSize={12.5} color="#77736B" fontWeight={700}>ChatGPT, Canva, Spotify...</Typography>
                        </Box>
                        <Typography fontSize={12} fontWeight={850} color="#111" sx={{ flexShrink: 0 }}>
                            Открыть
                        </Typography>
                    </>
                )}
            </button>

            {isOpen && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.4, py: 1.1, bgcolor: '#F5F4EF', borderRadius: '22px', mb: 1 }}>
                        <SearchRoundedIcon sx={{ color: '#77736B', fontSize: 20 }} />
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Найти ChatGPT, Canva, Spotify..."
                            style={{
                                width: '100%',
                                border: 0,
                                outline: 0,
                                background: 'transparent',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#111',
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5, mb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {accountCategoryOptions.map(category => {
                            const selected = category === activeCategory;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => {
                                        haptic.selection();
                                        setActiveCategory(category);
                                    }}
                                    style={{
                                        border: 0,
                                        whiteSpace: 'nowrap',
                                        borderRadius: 999,
                                        padding: '9px 13px',
                                        fontSize: 12,
                                        fontWeight: 850,
                                        color: selected ? '#fff' : '#77736B',
                                        background: selected ? '#111' : '#F5F4EF',
                                    }}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </Box>

                    <Box sx={{ maxHeight: 284, overflowY: 'auto', borderRadius: '24px', border: '1px solid #F0EEE8', bgcolor: '#fff' }}>
                        {filteredServices.map(option => {
                            const brand = getAccountServiceBrand(option.name);
                            const selected = value?.name === option.name;
                            return (
                                <button
                                    key={option.name}
                                    type="button"
                                    onClick={() => {
                                        haptic.selection();
                                        onSelect(option);
                                        setSearch('');
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        border: 0,
                                        borderBottom: '1px solid #F0EEE8',
                                        background: selected ? '#F8F7F2' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 12px',
                                        textAlign: 'left',
                                    }}
                                >
                                    <Avatar
                                        src={brand.iconUrl}
                                        alt={option.name}
                                        sx={{ width: 42, height: 42, borderRadius: '15px', bgcolor: brand.color, color: '#fff', fontWeight: 900, '& img': { objectFit: 'contain' } }}
                                    >
                                        {brand.initial}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography fontSize={15.2} fontWeight={820} lineHeight={1.1} noWrap>{option.name}</Typography>
                                        <Typography fontSize={12.2} color="#77736B" fontWeight={700}>{option.category}</Typography>
                                    </Box>
                                    {selected ? <CheckCircleRoundedIcon sx={{ color: '#169B55', fontSize: 22 }} /> : (
                                        <Box sx={{ px: 1, py: 0.35, borderRadius: 999, bgcolor: getCategoryColor(option.category), fontSize: 11, fontWeight: 850 }}>
                                            {option.category}
                                        </Box>
                                    )}
                                </button>
                            );
                        })}

                        {filteredServices.length === 0 && (
                            <Box sx={{ py: 3, textAlign: 'center' }}>
                                <Typography fontSize={14} color="#77736B" fontWeight={700}>Ничего не найдено</Typography>
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}

function AppSelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <Box
            component="label"
            sx={{
                position: 'relative',
                display: 'block',
                bgcolor: '#F2F1EC',
                borderRadius: '22px',
                px: 1.6,
                py: 1.15,
                minHeight: 66,
            }}
        >
            <Typography fontSize={12.5} color="#77736B" fontWeight={800} lineHeight={1.1}>
                {label}
            </Typography>
            <Typography fontSize={16} color="#111" fontWeight={760} lineHeight={1.25} sx={{ mt: 0.35, pr: 4 }}>
                {value}
            </Typography>
            <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#77736B', fontSize: 16 }}>
                ▾
            </Box>
            <select
                value={value}
                onChange={event => onChange(event.target.value)}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                }}
            >
                {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        </Box>
    );
}

function AppPriceField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Box sx={{ bgcolor: '#F2F1EC', borderRadius: '22px', px: 1.6, py: 1.15, minHeight: 66 }}>
            <Typography fontSize={12.5} color="#77736B" fontWeight={800} lineHeight={1.1}>
                Цена
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.35 }}>
                <input
                    value={value}
                    onChange={event => onChange(event.target.value.replace(/\D/g, ''))}
                    placeholder="5000"
                    inputMode="numeric"
                    style={{
                        width: '100%',
                        border: 0,
                        outline: 0,
                        background: 'transparent',
                        color: '#111',
                        fontSize: 22,
                        lineHeight: 1.15,
                        fontWeight: 850,
                        padding: 0,
                    }}
                />
                <Typography fontSize={18} color="#77736B" fontWeight={850}>₸</Typography>
            </Box>
        </Box>
    );
}

function AppTextareaField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Box sx={{ bgcolor: '#F2F1EC', borderRadius: '22px', px: 1.6, py: 1.25, minHeight: 116 }}>
            <Typography fontSize={12.5} color="#77736B" fontWeight={800} lineHeight={1.1} sx={{ mb: 0.7 }}>
                Описание
            </Typography>
            <textarea
                value={value}
                onChange={event => onChange(event.target.value)}
                placeholder="Что входит, срок, условия передачи"
                rows={4}
                style={{
                    width: '100%',
                    resize: 'none',
                    border: 0,
                    outline: 0,
                    background: 'transparent',
                    color: '#111',
                    fontSize: 16,
                    lineHeight: 1.35,
                    fontWeight: 650,
                    padding: 0,
                    fontFamily: 'inherit',
                }}
            />
        </Box>
    );
}

function SellAccountForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('AI');
    const [accessType, setAccessType] = useState('Готовый аккаунт');
    const [period, setPeriod] = useState('1 месяц');
    const [warranty, setWarranty] = useState('Замена при слете');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const haptic = useHaptic();
    const selectedService = accountServiceOptions.find(option => option.name === title);
    const accessTypeSpecifics = getAccessTypeSpecifics(accessType);
    const buyerPreviewWarnings = accessTypeSpecifics.slice(0, 3);

    const createMutation = useMutation({
        mutationFn: () => api.createAccountOffer({
            title,
            service_category: category,
            price: Number(price),
            description: [
                `Тип: ${accessType}`,
                `Срок: ${period}`,
                `Гарантия: ${warranty}`,
                'Передача: после сделки',
                desc,
            ].filter(Boolean).join('\n'),
        }),
        onSuccess: () => {
            haptic.notification('success');
            alert('Предложение опубликовано');
            onSuccess();
        },
        onError: (e) => {
            haptic.notification('error');
            alert('Не удалось создать предложение');
            console.error(e);
        },
    });

    return (
        <Stack
            spacing={1.2}
            component="form"
            onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (!selectedService) {
                    haptic.notification('error');
                    alert('Выберите сервис');
                    return;
                }
                if (!price || Number(price) <= 0) {
                    haptic.notification('error');
                    alert('Укажите цену');
                    return;
                }
                if (!desc.trim()) {
                    haptic.notification('error');
                    alert('Добавьте описание');
                    return;
                }
                createMutation.mutate();
            }}
        >
            <Card sx={{ bgcolor: '#D8C7FF', color: '#111', border: 0, borderRadius: '30px' }}>
                <CardContent sx={{ p: 2.2 }}>
                    <Typography fontSize={25} fontWeight={760} lineHeight={1.06}>Создать аккаунт</Typography>
                    <Typography fontSize={14} color="rgba(0,0,0,0.58)" sx={{ mt: 0.8 }}>Выберите формат: общий логин, личная активация или инвайт в команду.</Typography>
                </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '26px' }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1.4}>
                        <AccountServicePicker
                            value={selectedService ?? null}
                            onSelect={(option) => {
                                setTitle(option?.name ?? '');
                                if (option?.category) {
                                    setCategory(option.category);
                                }
                            }}
                        />
                        <AppSelectField
                            label="Тип доступа"
                            value={accessType}
                            options={accessTypeOptions}
                            onChange={setAccessType}
                        />
                        {selectedService && (
                            <Box sx={{ p: 1.45, bgcolor: '#FFF4D8', borderRadius: '22px', border: '1px solid rgba(17,17,17,0.04)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.9 }}>
                                    <ShieldRoundedIcon sx={{ color: '#111', fontSize: 18 }} />
                                    <Box>
                                        <Typography fontSize={13.5} fontWeight={850} lineHeight={1.1}>
                                            Важно для покупателя
                                        </Typography>
                                        <Typography fontSize={11.7} color="#7A6314" fontWeight={700}>
                                            Формат: {accessType}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={0.6}>
                                    {buyerPreviewWarnings.map(item => (
                                        <Box key={item} sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-start' }}>
                                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#111', mt: 0.75, flexShrink: 0 }} />
                                            <Typography fontSize={12.3} color="#5E4B12" lineHeight={1.35} fontWeight={650}>
                                                {item}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        <AppSelectField
                            label="Срок"
                            value={period}
                            options={periodOptions}
                            onChange={setPeriod}
                        />
                        <AppSelectField
                            label="Гарантия"
                            value={warranty}
                            options={warrantyOptions}
                            onChange={setWarranty}
                        />
                        <AppPriceField value={price} onChange={setPrice} />
                        <AppTextareaField value={desc} onChange={setDesc} />
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ p: 1.6, bgcolor: '#fff', borderRadius: '22px', display: 'flex', gap: 1.1 }}>
                <ShieldRoundedIcon sx={{ color: '#77736B', mt: 0.1 }} />
                <Typography fontSize={12.5} color="#77736B" lineHeight={1.4}>Не публикуйте логины, пароли и коды в описании. Детали передаются после создания сделки.</Typography>
            </Box>

            <Button type="submit" size="large" disabled={createMutation.isPending || !selectedService} startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' }, '&:disabled': { bgcolor: '#fff', color: '#B2AEA5' } }}>
                {createMutation.isPending ? 'Публикуем...' : 'Опубликовать'}
            </Button>
        </Stack>
    );
}

export default AccountsPage;
