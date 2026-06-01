import { useState } from 'react';
import { trustApi } from '@/shared/api/trust';
import { useHaptic } from '@/shared/hooks/useHaptic';
import {
    Box, Typography, Button, Card, CardContent,
    Stack, alpha, CircularProgress,
} from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const Row = ({ label, value }: { label: string; value: any }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid rgba(255,255,255,0.06)', '&:last-child': { borderBottom: 'none' } }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
    </Box>
);

const ReceiptAnalyzerPage = () => {
    const haptic = useHaptic();
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); haptic.selection(); }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        haptic.impact('medium');
        try {
            const data = await trustApi.verifyProof(file);
            setResult(data);
            haptic.notification('success');
        } catch (error) {
            console.error(error);
            haptic.notification('error');
            if (import.meta.env.DEV) {
                setResult({ is_receipt: true, bank_name: 'Kaspi Bank', amount: 5000, currency: 'KZT', date: '2024-05-20 14:30', recipient: 'John Doe', sender: 'Jane Smith', status: 'Success', transaction_id: '123456789' });
            } else {
                alert('Error analyzing receipt');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, pb: 12, minHeight: '100dvh', bgcolor: 'background.default' }}>
            <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ReceiptLongRoundedIcon /> AI Receipt Analyzer
            </Typography>

            {/* Upload area */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Box
                        component="label"
                        sx={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
                            p: 3, borderRadius: 3, border: '2px dashed rgba(255,255,255,0.12)',
                            cursor: 'pointer', transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#2196F3', 0.04) },
                        }}
                    >
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        <ReceiptLongRoundedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {file ? file.name : 'Нажмите, чтобы выбрать изображение чека'}
                        </Typography>
                    </Box>

                    {file && (
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleAnalyze}
                            disabled={loading}
                            sx={{ mt: 2, height: 48, borderRadius: 3, fontWeight: 700 }}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
                        >
                            {loading ? 'Анализируем...' : 'Analyze Receipt'}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Result */}
            {result && (
                <Stack spacing={2}>
                    <Card sx={{
                        bgcolor: result.is_receipt ? alpha('#4CAF50', 0.08) : alpha('#F44336', 0.08),
                        border: `1px solid ${result.is_receipt ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`,
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {result.is_receipt
                                        ? <CheckCircleRoundedIcon color="success" />
                                        : <CancelRoundedIcon color="error" />}
                                    <Typography fontWeight={800} color={result.is_receipt ? 'success.main' : 'error.main'}>
                                        {result.is_receipt ? 'Valid Receipt' : 'Not a Receipt'}
                                    </Typography>
                                </Box>
                                {result.bank_name && (
                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.08)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                        <Typography variant="caption" fontWeight={600}>{result.bank_name}</Typography>
                                    </Box>
                                )}
                            </Box>
                            {result.is_receipt && (
                                <>
                                    <Row label="Amount" value={`${result.amount} ${result.currency || ''}`} />
                                    <Row label="Date" value={result.date} />
                                    <Row label="Sender" value={result.sender} />
                                    <Row label="Recipient" value={result.recipient} />
                                    <Row label="Status" value={result.status} />
                                </>
                            )}
                            {result.error && (
                                <Typography color="error" variant="caption" mt={1} display="block">{result.error}</Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Raw JSON */}
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 3, p: 2, overflowX: 'auto' }}>
                        <Typography component="pre" variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 10 }}>
                            {JSON.stringify(result, null, 2)}
                        </Typography>
                    </Box>
                </Stack>
            )}
        </Box>
    );
};

export default ReceiptAnalyzerPage;
