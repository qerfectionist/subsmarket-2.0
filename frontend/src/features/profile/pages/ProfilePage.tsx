import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { useTrustHistory, useTrustScore } from '@/shared/api/trust';
import { getLanguage, Language, setLanguage } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { LoadingScreen } from '@/shared/ui/Spinner';
import { TrustHistoryModal } from '@/shared/ui/TrustHistoryModal';
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Divider,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export function ProfilePage() {
    const haptic = useHaptic();
    const [searchParams] = useSearchParams();
    const settingsRef = useRef<HTMLDivElement | null>(null);
    const [currentLang, setLang] = useState<Language>(getLanguage());
    const [showTrustHistory, setShowTrustHistory] = useState(false);

    const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => api.getMe() });
    const { data: trustData } = useTrustScore(user?.user_id || 0);
    const { data: trustHistoryData, isLoading: isHistoryLoading } = useTrustHistory(user?.user_id || 0);

    useEffect(() => {
        if (!isLoading && searchParams.get('section') === 'settings') {
            window.setTimeout(() => {
                settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    }, [isLoading, searchParams]);

    const handleLanguageChange = (lang: Language) => {
        haptic.selection();
        setLanguage(lang);
        setLang(lang);
        window.location.reload();
    };

    if (isLoading) return <LoadingScreen label="Загрузка..." />;

    const score = Number(trustData?.trust_score ?? (user as any)?.trust_score ?? 5.0);
    const dealsCount = Number(trustData?.deals_count ?? (user as any)?.p2p_deals_count ?? 0);
    const photoUrl = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
    const progressColor = score >= 4.5 ? '#2E7D32' : score >= 3.0 ? '#111' : '#D97706';
    const reputationLabel = score >= 4.5 ? 'Отличная репутация' : score >= 3.5 ? 'Хорошая репутация' : score >= 2 ? 'Средняя репутация' : 'Требует внимания';

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 14 }}>
            <Box sx={{ px: 2, pt: 1.8, maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, mb: 1.4 }}>
                    <Avatar src={photoUrl} sx={{ width: 66, height: 66, fontSize: 24, fontWeight: 760, bgcolor: '#111', color: '#fff' }}>
                        {(user?.first_name || 'U')[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontSize={26} fontWeight={760} lineHeight={1.05} noWrap>
                            {user?.first_name ?? 'User'}
                        </Typography>
                        <Typography fontSize={13.5} fontWeight={520} color="#77736B" noWrap>
                            @{user?.username ?? 'no_username'}
                        </Typography>
                    </Box>
                    <Chip label="KZ" sx={{ bgcolor: '#fff', color: '#111' }} />
                </Box>

                <Stack spacing={1.2}>
                    <Card sx={{ bgcolor: '#FFE15A', color: '#111', border: 0, borderRadius: '30px' }}>
                        <CardActionArea onClick={() => { haptic.impact('light'); setShowTrustHistory(true); }} sx={{ p: 2.2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <ShieldRoundedIcon sx={{ fontSize: 20 }} />
                                    <Typography fontSize={14} fontWeight={650}>Доверие</Typography>
                                </Box>
                                <Typography fontSize={13} fontWeight={650}>История ›</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1.4 }}>
                                <Typography fontWeight={760} fontSize={48} lineHeight={1}>{score.toFixed(1)}</Typography>
                                <Typography fontWeight={650} fontSize={17} color="rgba(0,0,0,0.52)">/ 5.0</Typography>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={score * 20}
                                sx={{ height: 7, borderRadius: 99, bgcolor: 'rgba(0,0,0,0.12)', '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 99 } }}
                            />

                            <Typography fontSize={13.5} fontWeight={650} color="rgba(0,0,0,0.58)" sx={{ mt: 1.3 }}>
                                {reputationLabel} · {dealsCount} сделок
                            </Typography>

                            {score < 3 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.2, p: 1.1, bgcolor: 'rgba(255,255,255,0.55)', borderRadius: '18px' }}>
                                    <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />
                                    <Typography fontSize={12.5} fontWeight={650}>Низкий рейтинг. Проверьте историю.</Typography>
                                </Box>
                            )}
                        </CardActionArea>
                    </Card>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        {[
                            { label: 'Сделки', value: (user as any)?.p2p_deals_count || 0, sub: 'всего' },
                            { label: 'Места', value: (user as any)?.clubs_count || 0, sub: 'активно' },
                            { label: 'ГБ', value: (user as any)?.p2p_total_volume_gb || 0, sub: 'объем' },
                            { label: 'Успех', value: `${(user as any)?.p2p_success_count || 0}%`, sub: 'ставка' },
                        ].map(item => (
                            <Card key={item.label} sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
                                <CardContent sx={{ p: 1.6, minHeight: 98 }}>
                                    <Typography fontSize={12.5} color="#77736B" fontWeight={520}>{item.label}</Typography>
                                    <Typography fontSize={26} fontWeight={760} lineHeight={1.1} sx={{ mt: 1 }}>{item.value}</Typography>
                                    <Typography fontSize={12} color="#B7B1A8" fontWeight={520}>{item.sub}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Box ref={settingsRef} sx={{ scrollMarginTop: 18 }}>
                        <SectionTitle title="Настройки" />
                        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '26px', mt: 1 }}>
                        {[
                            { label: 'Мои предложения', sub: 'подписки, тарифы и доступы', icon: <HistoryRoundedIcon /> },
                            { label: 'Безопасность', sub: 'доверие, жалобы, отзывы', icon: <ShieldRoundedIcon /> },
                            { label: 'О приложении', sub: 'версия, правила, поддержка', icon: <ChevronRightRoundedIcon /> },
                        ].map((item, index, arr) => (
                            <Box key={item.label}>
                                <CardActionArea onClick={() => haptic.impact('light')} sx={{ px: 1.5, py: 1.35, display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '15px', bgcolor: '#F2F1EC', display: 'grid', placeItems: 'center', color: '#111' }}>
                                        {item.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontSize={15} fontWeight={650}>{item.label}</Typography>
                                        <Typography fontSize={12.5} color="#77736B">{item.sub}</Typography>
                                    </Box>
                                    <ChevronRightRoundedIcon sx={{ color: '#B7B1A8' }} />
                                </CardActionArea>
                                {index < arr.length - 1 && <Divider sx={{ mx: 1.5, borderColor: '#F0EEE8' }} />}
                            </Box>
                        ))}
                        </Card>
                    </Box>

                    <SectionTitle title="Язык" />
                    <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '26px' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 1 }}>
                            {[
                                { lang: 'ru' as Language, label: 'RU', sub: 'Русский' },
                                { lang: 'kk' as Language, label: 'KZ', sub: 'Қазақша' },
                            ].map(item => (
                                <CardActionArea key={item.lang} onClick={() => handleLanguageChange(item.lang)} sx={{ borderRadius: '20px', textAlign: 'center', py: 1.4, bgcolor: currentLang === item.lang ? '#111' : '#F2F1EC', color: currentLang === item.lang ? '#fff' : '#111' }}>
                                    <LanguageRoundedIcon sx={{ fontSize: 19, mb: 0.4 }} />
                                    <Typography fontWeight={760} fontSize={16}>{item.label}</Typography>
                                    <Typography fontWeight={520} fontSize={12}>{item.sub}</Typography>
                                </CardActionArea>
                            ))}
                        </Box>
                    </Card>

                    <Box sx={{ textAlign: 'center', pt: 2.4, pb: 1 }}>
                        <Typography fontSize={12} color="#B7B1A8" fontWeight={650}>SubsMarket 2.0</Typography>
                        <Typography fontSize={11} color="#B7B1A8">Almaty · 2026</Typography>
                    </Box>
                </Stack>
            </Box>

            <TrustHistoryModal isOpen={showTrustHistory} onClose={() => setShowTrustHistory(false)} events={trustHistoryData?.events || []} isLoading={isHistoryLoading} />
        </Box>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <Typography fontSize={18} fontWeight={760} lineHeight={1.15} sx={{ pt: 0.8 }}>
            {title}
        </Typography>
    );
}

export default ProfilePage;
