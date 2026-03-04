import { useState } from 'react';
import { trustApi } from '@/shared/api/trust';
import { Button } from '@/shared/ui';
import { useHaptic } from '@/shared/hooks/useHaptic';

const ReceiptAnalyzerPage = () => {
    const haptic = useHaptic();
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            haptic.selection();
        }
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
            // Mock result for demo if backend fails or no API key
            if (process.env.NODE_ENV === 'development') {
                setResult({
                    is_receipt: true,
                    bank_name: "Kaspi Bank",
                    amount: 5000,
                    currency: "KZT",
                    date: "2024-05-20 14:30",
                    recipient: "John Doe",
                    sender: "Jane Smith",
                    status: "Success",
                    transaction_id: "123456789"
                });
            } else {
                alert('Error analyzing receipt');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <h1 className="text-xl font-bold">🧾 AI Receipt Analyzer</h1>

            <div className="bg-secondary/30 p-4 rounded-xl border border-white/10">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary/80"
                />

                {file && (
                    <div className="mt-4">
                        <p className="text-xs text-hint mb-2">Selected: {file.name}</p>
                        <Button
                            isLoading={loading}
                            onClick={handleAnalyze}
                            fullWidth
                        >
                            Analyze Receipt
                        </Button>
                    </div>
                )}
            </div>

            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className={`p-4 rounded-xl border ${result.is_receipt ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold text-lg ${result.is_receipt ? 'text-green-400' : 'text-red-400'}`}>
                                {result.is_receipt ? '✅ Valid Receipt' : '❌ Not a Receipt'}
                            </span>
                            {result.bank_name && (
                                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                                    {result.bank_name}
                                </span>
                            )}
                        </div>

                        {result.is_receipt && (
                            <div className="space-y-2 text-sm">
                                <Row label="Amount" value={`${result.amount} ${result.currency || ''}`} />
                                <Row label="Date" value={result.date} />
                                <Row label="Sender" value={result.sender} />
                                <Row label="Recipient" value={result.recipient} />
                                <Row label="Status" value={result.status} />
                            </div>
                        )}

                        {result.error && (
                            <p className="text-red-400 text-xs mt-2">{result.error}</p>
                        )}
                    </div>

                    <pre className="text-[10px] bg-black/30 p-2 rounded overflow-x-auto text-gray-500">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

const Row = ({ label, value }: { label: string, value: any }) => (
    <div className="flex justify-between border-b border-white/5 pb-1 last:border-0">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-foreground text-right">{value || '—'}</span>
    </div>
);

export default ReceiptAnalyzerPage;
