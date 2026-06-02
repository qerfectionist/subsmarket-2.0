import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import { api } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { SERVICE_COLORS } from '../data/serviceCatalog';

const pageMaxWidth = 600;

export function ClubDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const queryClient = useQueryClient();

    const [leaveOpen, setLeaveOpen] = useState(false);
    const [phoneOpen, setPhoneOpen] = useState(false);
    const [joinResultOpen, setJoinResultOpen] = useState(false);
    const [joinMessage, setJoinMessage] = useState<'pending' | 'approved'>('pending');
    const [phoneNumber, setPhoneNumber] = useState('');

    const { data: club, isLoading, error } = useQuery({
        queryKey: ['club', id],
        queryFn: () => api.getClub(id!),
        enabled: Boolean(id),
    });

    const joinMutation = useMutation({
        mutationFn: (phone?: string | void) => api.joinClub(id!, phone || undefined),
        onSuccess: data => {
            haptic.notification('success');
            setJoinMessage(data.message?.toLowerCase().includes('auto') ? 'approved' : 'pending');
            setJoinResultOpen(true);
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => haptic.notification('error'),
        onSettled: () => setPhoneOpen(false),
    });

    const leaveMutation = useMutation({
        mutationFn: () => api.leaveClub(id!),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.removeQueries({ queryKey: ['club', id] });
            navigate('/clubs');
        },
        onError: () => haptic.notification('error'),
    });

    const cancelMutation = useMutation({
        mutationFn: () => api.cancelJoinRequest(id!),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => haptic.notification('error'),
    });

    const remindMutation = useMutation({
        mutationFn: () => api.remindHost(id!),
        onSuccess: () => haptic.notification('success'),
        onError: () => haptic.notification('error'),
    });

    if (isLoading) return <ClubDetailsSkeleton />;

    if (error || !club) {
        return (
            <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', display: 'grid', placeItems: 'center', p: 2 }}>
                <Box sx={{ maxWidth: 360, textAlign: 'center' }}>
                    <Typography fontSize={22} fontWeight={760}>Клуб не открылся</Typography>
                    <Typography color="#77736B" sx={{ mt: 0.75, mb: 2 }}>
                        Возможно, он удалён или временно недоступен.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/clubs')}>Вернуться к местам</Button>
                </Box>
            </Box>
        );
    }

    const currentUserId = getCurrentUserId();
    const isHost = club.host_id === currentUserId;
    const isMember = isHost || club.my_status === 'active' || club.my_status === 'approved';
    const isPending = !isHost && club.my_status === 'pending';
    const isFull = club.status === 'full';
    const membersCount = club.current_members ?? 0;
    const spotsLeft = Math.max(0, club.max_members - membersCount);
    const fillPercent = Math.min(100, Math.round((membersCount / club.max_members) * 100));
    const serviceColor = (SERVICE_COLORS as Record<string, string>)[club.subscription.service_name?.toLowerCase()] || '#FFE15A';
    const statusLabel = getStatusLabel(club.status);
    const price = Math.round(club.price_per_member);
    const total = Math.round(club.price_total);
    const paymentDay = club.payment_day ? `${club.payment_day} числа` : 'по договорённости';
    const paymentMethod = formatPaymentMethod(club.payment_method);

    const handleCopy = async (value: string) => {
        await navigator.clipboard?.writeText(value);
        haptic.selection();
    };

    const handlePhoneInput = (raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 11);
        if (!digits) {
            setPhoneNumber('');
            return;
        }

        const fixed = digits.startsWith('7') ? digits : `7${digits.slice(0, 10)}`;
        const d = fixed.padEnd(11, '_').split('');
        setPhoneNumber(`+${d[0]} (${d[1]}${d[2]}${d[3]}) ${d[4]}${d[5]}${d[6]}-${d[7]}${d[8]}-${d[9]}${d[10]}`);
    };

    const isPhoneComplete = phoneNumber.replace(/\D/g, '').length === 11;

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 18 }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 40, bgcolor: 'rgba(245,244,239,0.94)', backdropFilter: 'blur(20px)', px: 1.5, pt: 1, pb: 1 }}>
                <Box sx={{ maxWidth: pageMaxWidth, mx: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff' }}>
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontSize={17} fontWeight={760} noWrap>{club.subscription.service_name}</Typography>
                        <Typography fontSize={12.5} color="#77736B" fontWeight={560}>совместная подписка</Typography>
                    </Box>
                    {isMember && !isHost ? (
                        <IconButton onClick={() => setLeaveOpen(true)} sx={{ bgcolor: '#fff', color: '#D84315' }}>
                            <LogoutRoundedIcon fontSize="small" />
                        </IconButton>
                    ) : <Box sx={{ width: 44 }} />}
                </Box>
            </Box>

            <Box sx={{ maxWidth: pageMaxWidth, mx: 'auto', px: 2, pt: 1 }}>
                <Stack spacing={1.1}>
                    <Card sx={{ borderRadius: '30px', overflow: 'hidden' }}>
                        <CardContent sx={{ p: 2.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                    <Avatar
                                        src={club.subscription.icon_url || undefined}
                                        variant="rounded"
                                        sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: serviceColor, color: '#111', fontSize: 23, fontWeight: 800, '& img': { objectFit: 'contain' } }}
                                    >
                                        {club.subscription.service_name.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography fontSize={18} fontWeight={760} noWrap>{club.subscription.service_name}</Typography>
                                        <Typography fontSize={13} color="#77736B" fontWeight={560}>
                                            {membersCount}/{club.max_members} участников · {spotsLeft ? `${spotsLeft} свободно` : 'мест нет'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip label={statusLabel} sx={{ bgcolor: club.status === 'open' ? '#DFF8E8' : '#F2F1EC', color: club.status === 'open' ? '#087A34' : '#77736B', flexShrink: 0 }} />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2.3 }}>
                                <Metric label="Ваша доля" value={`${price} ₸`} strong />
                                <Metric label="Всего" value={`${total} ₸`} align="right" />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Stack spacing={1.25}>
                                <InfoRow label="Оплата" value={paymentMethod} />
                                <InfoRow label="Дата" value={paymentDay} />
                                {isMember && club.payment_details && (
                                    <InfoRow
                                        label="Реквизиты"
                                        value={club.payment_details}
                                        action={<ContentCopyRoundedIcon sx={{ fontSize: 16, color: '#B7B1A8' }} />}
                                        onClick={() => handleCopy(club.payment_details!)}
                                        mono
                                    />
                                )}
                                {isMember && club.login && <InfoRow label="Логин" value={club.login} action={<ContentCopyRoundedIcon sx={{ fontSize: 16, color: '#B7B1A8' }} />} onClick={() => handleCopy(club.login!)} mono />}
                                {isMember && club.password && <InfoRow label="Пароль" value={club.password} action={<ContentCopyRoundedIcon sx={{ fontSize: 16, color: '#B7B1A8' }} />} onClick={() => handleCopy(club.password!)} mono />}
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: '28px' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.4 }}>
                                <Typography fontSize={16} fontWeight={760}>Участники</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, bgcolor: '#F2F1EC', borderRadius: 999, px: 1.2, py: 0.55 }}>
                                    <GroupRoundedIcon sx={{ fontSize: 16, color: '#77736B' }} />
                                    <Typography fontSize={12.5} fontWeight={700}>{membersCount}/{club.max_members}</Typography>
                                </Box>
                            </Box>
                            <LinearProgress variant="determinate" value={fillPercent} sx={{ height: 7, borderRadius: 999, bgcolor: '#F2F1EC', mb: 1.5, '& .MuiLinearProgress-bar': { bgcolor: '#111', borderRadius: 999 } }} />

                            <Stack>
                                <MemberRow
                                    name={`${club.host.first_name || club.host.username || 'Организатор'}${isHost ? ' (вы)' : ''}`}
                                    caption="организатор"
                                    badge="Оплачено"
                                    initial={(club.host.first_name || club.host.username || 'D').charAt(0)}
                                />
                                {Array.from({ length: Math.max(0, membersCount - 1) }).map((_, index) => (
                                    <MemberRow key={`member-${index}`} name={isMember && !isHost && index === 0 ? 'Вы' : 'Участник'} caption="в клубе" badge="Активен" muted />
                                ))}
                                {Array.from({ length: spotsLeft }).map((_, index) => (
                                    <EmptySlot key={`empty-${index}`} />
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>

                    {(club.description || club.rules || club.telegram_group_link) && (
                        <Card sx={{ borderRadius: '28px' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Typography fontSize={16} fontWeight={760} sx={{ mb: 1 }}>Детали</Typography>
                                {club.description && <Typography fontSize={14} color="#77736B" sx={{ lineHeight: 1.45, mb: 1 }}>{club.description}</Typography>}
                                {club.rules && <Typography fontSize={14} color="#77736B" sx={{ lineHeight: 1.45, mb: 1 }}>{club.rules}</Typography>}
                                {club.telegram_group_link && (
                                    <Button href={club.telegram_group_link} target="_blank" fullWidth sx={{ mt: 0.5, bgcolor: '#F2F1EC', color: '#111', '&:hover': { bgcolor: '#E9E7DF' } }}>
                                        Открыть Telegram-группу
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </Box>

            {renderBottomAction({
                isHost,
                isMember,
                isPending,
                isFull,
                price,
                onRequests: () => navigate(`/clubs/${id}/requests`),
                onJoin: () => {
                    haptic.impact('medium');
                    if (club.category === 'telecom' || club.subscription.category === 'telecom') {
                        setPhoneOpen(true);
                    } else {
                        joinMutation.mutate();
                    }
                },
                onRemind: () => remindMutation.mutate(),
                onCancel: () => cancelMutation.mutate(),
                joinLoading: joinMutation.isPending,
                remindDone: remindMutation.isSuccess,
                remindLoading: remindMutation.isPending,
                cancelLoading: cancelMutation.isPending,
            })}

            <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} PaperProps={{ sx: { borderRadius: '28px', m: 2, maxWidth: 360, width: '100%' } }}>
                <DialogTitle sx={{ fontWeight: 760, pb: 0.5 }}>Выйти из клуба?</DialogTitle>
                <DialogContent>
                    <Typography color="#77736B">Доступ к реквизитам и данным подписки будет закрыт.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button onClick={() => setLeaveOpen(false)} sx={{ bgcolor: '#F2F1EC', color: '#111' }}>Отмена</Button>
                    <Button color="error" variant="contained" disabled={leaveMutation.isPending} onClick={() => leaveMutation.mutate()}>
                        Выйти
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={phoneOpen} onClose={() => setPhoneOpen(false)} PaperProps={{ sx: { borderRadius: '28px', m: 2, maxWidth: 360, width: '100%' } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 760 }}>
                    <PhoneRoundedIcon sx={{ display: 'block', mx: 'auto', mb: 1, color: '#111' }} />
                    Номер телефона
                </DialogTitle>
                <DialogContent>
                    <Typography fontSize={14} color="#77736B" textAlign="center" sx={{ mb: 2 }}>
                        Организатору нужен номер, чтобы добавить вас в семейный тариф.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        placeholder="+7 (___) ___-__-__"
                        value={phoneNumber}
                        onChange={event => handlePhoneInput(event.target.value)}
                        type="tel"
                        inputProps={{ inputMode: 'numeric' }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button onClick={() => setPhoneOpen(false)} sx={{ bgcolor: '#F2F1EC', color: '#111' }}>Отмена</Button>
                    <Button variant="contained" disabled={!isPhoneComplete || joinMutation.isPending} onClick={() => joinMutation.mutate(phoneNumber)}>
                        Отправить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={joinResultOpen} onClose={() => setJoinResultOpen(false)} PaperProps={{ sx: { borderRadius: '28px', m: 2, maxWidth: 360, width: '100%' } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 760 }}>
                    {joinMessage === 'approved' ? 'Вы в клубе' : 'Заявка отправлена'}
                </DialogTitle>
                <DialogContent>
                    <Typography color="#77736B" textAlign="center">
                        {joinMessage === 'approved'
                            ? 'Теперь вам доступны реквизиты и данные подписки.'
                            : 'Организатор рассмотрит заявку. Статус появится на этом экране.'}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button variant="contained" fullWidth onClick={() => setJoinResultOpen(false)}>Понятно</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function renderBottomAction(props: {
    isHost: boolean;
    isMember: boolean;
    isPending: boolean;
    isFull: boolean;
    price: number;
    onRequests: () => void;
    onJoin: () => void;
    onRemind: () => void;
    onCancel: () => void;
    joinLoading: boolean;
    remindDone: boolean;
    remindLoading: boolean;
    cancelLoading: boolean;
}) {
    if (props.isMember && !props.isPending && !props.isHost) return null;

    return (
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(73px + env(safe-area-inset-bottom))', zIndex: 45, px: 2, pb: 1.5, pt: 3, background: 'linear-gradient(to top, #F5F4EF 62%, rgba(245,244,239,0))' }}>
            <Box sx={{ maxWidth: pageMaxWidth, mx: 'auto' }}>
                {props.isHost && (
                    <Button variant="contained" fullWidth size="large" startIcon={<SettingsRoundedIcon />} onClick={props.onRequests}>
                        Управление клубом
                    </Button>
                )}
                {props.isPending && !props.isHost && (
                    <Stack spacing={1}>
                        <Typography fontSize={13} color="#8A6500" textAlign="center" fontWeight={700}>Заявка ждёт ответа организатора</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                            <Button variant="contained" disabled={props.remindLoading || props.remindDone} startIcon={<NotificationsRoundedIcon />} onClick={props.onRemind}>
                                {props.remindDone ? 'Напомнили' : 'Напомнить'}
                            </Button>
                            <Button sx={{ bgcolor: '#FFE0D6', color: '#B42318', '&:hover': { bgcolor: '#FFD2C2' } }} disabled={props.cancelLoading} startIcon={<CancelRoundedIcon />} onClick={props.onCancel}>
                                Отменить
                            </Button>
                        </Box>
                    </Stack>
                )}
                {!props.isMember && !props.isPending && !props.isHost && (
                    <Button variant="contained" fullWidth size="large" disabled={props.isFull || props.joinLoading} onClick={props.onJoin}>
                        {props.isFull ? 'Мест нет' : `Вступить · ${props.price} ₸/мес`}
                    </Button>
                )}
            </Box>
        </Box>
    );
}

function Metric({ label, value, strong, align = 'left' }: { label: string; value: string; strong?: boolean; align?: 'left' | 'right' }) {
    return (
        <Box sx={{ textAlign: align }}>
            <Typography fontSize={11} fontWeight={760} color="#B7B1A8" sx={{ textTransform: 'uppercase', letterSpacing: 1.4 }}>
                {label}
            </Typography>
            <Typography fontSize={strong ? 34 : 25} fontWeight={820} lineHeight={1.05}>
                {value}
            </Typography>
        </Box>
    );
}

function InfoRow({ label, value, action, onClick, mono }: { label: string; value: string; action?: React.ReactNode; onClick?: () => void; mono?: boolean }) {
    return (
        <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, cursor: onClick ? 'pointer' : 'default' }}>
            <Typography fontSize={14} color="#77736B" fontWeight={560}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
                <Typography fontSize={14} fontWeight={700} noWrap sx={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined }}>
                    {value}
                </Typography>
                {action}
            </Box>
        </Box>
    );
}

function MemberRow({ name, caption, badge, initial = 'U', muted }: { name: string; caption: string; badge: string; initial?: string; muted?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, borderTop: '1px solid rgba(17,17,17,0.07)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                <Avatar sx={{ width: 38, height: 38, bgcolor: muted ? '#F2F1EC' : '#E3F2FF', color: muted ? '#77736B' : '#0077C8', fontSize: 15 }}>
                    {initial.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography fontSize={14} fontWeight={720} noWrap>{name}</Typography>
                    <Typography fontSize={12.5} color="#77736B" fontWeight={560}>{caption}</Typography>
                </Box>
            </Box>
            <Chip icon={<CheckCircleRoundedIcon />} label={badge} size="small" sx={{ bgcolor: '#E8F8EE', color: '#087A34', '& .MuiChip-icon': { color: '#087A34' } }} />
        </Box>
    );
}

function EmptySlot() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1.25, borderTop: '1px solid rgba(17,17,17,0.07)' }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px dashed #D8D3CA', display: 'grid', placeItems: 'center' }}>
                <PersonAddRoundedIcon sx={{ fontSize: 18, color: '#B7B1A8' }} />
            </Box>
            <Typography fontSize={14} color="#77736B" fontWeight={650}>Свободное место</Typography>
        </Box>
    );
}

function ClubDetailsSkeleton() {
    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', p: 2, pb: 14 }}>
            <Box sx={{ maxWidth: pageMaxWidth, mx: 'auto' }}>
                <Skeleton variant="rounded" height={52} sx={{ mb: 1.5, borderRadius: '22px' }} />
                <Skeleton variant="rounded" height={220} sx={{ mb: 1, borderRadius: '30px' }} />
                <Skeleton variant="rounded" height={240} sx={{ borderRadius: '28px' }} />
            </Box>
        </Box>
    );
}

function getCurrentUserId() {
    const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgUserId) return Number(tgUserId);

    const initData = window.Telegram?.WebApp?.initData || '';
    if (initData.startsWith('mock:')) return Number(initData.split(':')[1]) || 12345;

    return 12345;
}

function getStatusLabel(status: string) {
    if (status === 'open') return 'Набор открыт';
    if (status === 'full') return 'Заполнен';
    if (status === 'frozen') return 'На паузе';
    return 'Закрыт';
}

function formatPaymentMethod(method?: string) {
    if (!method) return 'не указано';
    if (method.toLowerCase() === 'kaspi') return 'Kaspi';
    return method;
}

export default ClubDetailsPage;
