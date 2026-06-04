import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { t } from '@/shared/i18n';
import { api } from '@/shared/api';
import { OperatorSelect } from '@/shared/ui/OperatorSelect';
import {
    Box, Typography, TextField, Button, Card, CardContent,
    Stack, alpha, IconButton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

const OPERATORS = [
    { id: 'tele2', name: 'Tele2', color: '#111111' },
    { id: 'kcell', name: 'Kcell', color: '#6A0DAD' },
    { id: 'beeline', name: 'Beeline', color: '#FFCC00' },
];

const CreateListingPage = () => {
    const navigate = useNavigate();
    const haptic = useHaptic();
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [operatorId, setOperatorId] = useState('beeline');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            haptic.notification('error');
            alert(t('listing', 'error_amount_msg') || 'Укажите корректный объем ГБ');
            return;
        }
        if (!price || Number(price) < 100) {
            haptic.notification('error');
            alert(t('listing', 'error_price_msg') || 'Минимальная цена 100 ₸');
            return;
        }
        setLoading(true);
        try {
            await api.createGigabyteOffer({ operator: operatorId, amount_gb: Number(amount), price: Number(price) });
            haptic.notification('success');
            navigate('/market');
        } catch (e) {
            console.error(e);
            haptic.notification('error');
            alert(t('listing', 'error_create_msg') || 'Ошибка при создании. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', bgcolor: 'background.default', pb: 12 }}>
            {/* Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 50,
                bgcolor: alpha('#080808', 0.92), backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 1,
            }}>
                <IconButton onClick={() => navigate(-1)}><ArrowBackRoundedIcon /></IconButton>
                <Typography fontWeight={800} fontSize={16}>
                    {t('listing', 'title') || 'Создать объявление'}
                </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, px: 2, pt: 3 }}>
                <Stack spacing={4}>
                    {/* Operator */}
                    <Box>
                        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 2, color: 'text.secondary', display: 'block', mb: 1.5 }}>
                            {t('listing', 'operator') || 'Оператор связи'}
                        </Typography>
                        <OperatorSelect
                            operators={OPERATORS}
                            selectedId={operatorId}
                            onSelect={setOperatorId}
                        />
                    </Box>

                    {/* Details */}
                    <Box>
                        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 2, color: 'text.secondary', display: 'block', mb: 1.5 }}>
                            Детали объявления
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label={t('listing', 'amount') || 'Объем'}
                                placeholder="0"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                inputProps={{ min: 1 }}
                                fullWidth
                                InputProps={{ endAdornment: <Typography color="text.secondary" fontSize={14} ml={0.5}>ГБ</Typography> }}
                            />
                            <TextField
                                label={t('listing', 'price') || 'Цена за весь объем'}
                                placeholder="0"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                inputProps={{ min: 100 }}
                                fullWidth
                                InputProps={{ endAdornment: <Typography color="text.secondary" fontSize={14} ml={0.5}>₸</Typography> }}
                                helperText={`${t('listing', 'recommended') || 'Рекомед. цена'}: ${amount ? Number(amount) * 40 : 0}–${amount ? Number(amount) * 60 : 0} ₸`}
                            />
                        </Stack>
                    </Box>

                    {/* Warning card */}
                    <Card sx={{ bgcolor: alpha('#FF9800', 0.08), border: '1px solid rgba(255,152,0,0.2)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                    <InfoRoundedIcon sx={{ color: 'warning.main', fontSize: 18, flexShrink: 0, mt: 0.1 }} />
                                    <Typography variant="caption" color="warning.light" fontWeight={500} lineHeight={1.5}>
                                        {t('listing', 'warn_operator') || 'Доступно только для абонентов вашей сети.'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                    <DescriptionRoundedIcon sx={{ color: 'warning.main', fontSize: 18, flexShrink: 0, mt: 0.1 }} />
                                    <Typography variant="caption" color="warning.light" fontWeight={500} lineHeight={1.5}>
                                        {t('listing', 'warn_manual') || 'Перевод осуществляется вами вручную через официальное приложение оператора.'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            {/* Bottom CTA */}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, px: 2, pb: 'max(1rem, env(safe-area-inset-bottom))', bgcolor: alpha('#080808', 0.96), backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', pt: 1.5 }}>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    onClick={() => { haptic.impact('medium'); }}
                    sx={{ height: 56, borderRadius: 3, fontSize: 16, fontWeight: 800 }}
                >
                    {loading ? t('listing', 'publishing') || 'Публикация...' : t('listing', 'submit') || 'Опубликовать'}
                </Button>
            </Box>
        </Box>
    );
};

export default CreateListingPage;
