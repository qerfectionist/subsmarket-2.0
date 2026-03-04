import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { api } from '@/shared/api';
import { t } from '@/shared/i18n';
import { Card, CardBody, Button, Chip, Skeleton } from '@heroui/react';
import { MSIcon } from '@/shared/ui/MSIcon';
import { cn } from '@/shared/lib/utils';

const STEPS = ['CREATED', 'PAID_BY_BUYER', 'COMPLETED'];

const STATUS_META: Record<string, { label: string; color: "primary" | "warning" | "success" | "danger" | "default" }> = {
    CREATED: { label: 'Ожидание оплаты', color: 'primary' },
    PAID_BY_BUYER: { label: 'Оплачено', color: 'warning' },
    COMPLETED: { label: 'Завершено', color: 'success' },
    DISPUTED: { label: 'Спор', color: 'danger' },
    CANCELLED: { label: 'Отменено', color: 'default' },
};

export default function DealPage() {
    const { dealId } = useParams<{ dealId: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const { showConfirm, webapp } = useTelegram();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: api.getMe,
    });

    const { data: deal, isLoading, error } = useQuery({
        queryKey: ['deal', dealId],
        queryFn: () => api.getDeal(dealId!),
        enabled: !!dealId,
        refetchInterval: 5000,
    });

    const payMutation = useMutation({
        mutationFn: (file?: File) => api.payDeal(dealId!, file),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setSelectedFile(null);
        },
        onError: () => {
            haptic.notification('error');
            webapp?.showAlert(t('common', 'error'));
        },
    });

    const confirmMutation = useMutation({
        mutationFn: () => api.confirmDeal(dealId!),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
        onError: () => {
            haptic.notification('error');
            webapp?.showAlert(t('common', 'error'));
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            haptic.selection();
            setSelectedFile(e.target.files[0]);
        }
    };

    const handlePay = async () => {
        haptic.impact('heavy');
        if (!selectedFile) {
            const confirmed = await showConfirm(t('deal', 'confirm_without_receipt'));
            if (confirmed) payMutation.mutate(undefined);
        } else {
            payMutation.mutate(selectedFile);
        }
    };

    const handleConfirm = async () => {
        haptic.impact('heavy');
        const confirmed = await showConfirm(t('deal', 'confirm_fund_received'));
        if (confirmed) confirmMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 pb-28">
                <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
                <Card className="bg-content1 shadow-sm">
                    <CardBody className="p-6 space-y-3">
                        <Skeleton className="h-10 w-28 rounded-xl mx-auto" />
                        <Skeleton className="h-4 w-48 rounded mx-auto" />
                    </CardBody>
                </Card>
                <Card className="bg-content1 shadow-sm">
                    <CardBody className="p-4 space-y-3">
                        <Skeleton className="h-8 w-full rounded-lg" />
                        <Skeleton className="h-8 w-full rounded-lg" />
                    </CardBody>
                </Card>
                <Card className="bg-content1 shadow-sm">
                    <CardBody className="p-4">
                        <Skeleton className="h-14 w-full rounded-xl" />
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (error || !deal) {
        return (
            <div className="flex flex-col items-center justify-center p-4 min-h-[50vh] gap-4">
                <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-2">
                    <MSIcon name="error" size={28} filled />
                </div>
                <p className="text-danger font-semibold text-sm">{t('common', 'error')}</p>
                <p className="text-default-400 text-xs text-center max-w-[240px]">Сделка не найдена или произошла ошибка</p>
                <Button
                    variant="flat"
                    onPress={() => navigate(-1)}
                    className="mt-4 font-semibold"
                >
                    ← {t('common', 'back')}
                </Button>
            </div>
        );
    }

    const isBuyer = user?.user_id === deal.buyer_id;
    const isSeller = user?.user_id === deal.seller_id;
    const config = STATUS_META[deal.status] || STATUS_META.CREATED;
    const currentStep = STEPS.indexOf(deal.status);

    return (
        <div className="min-h-[100dvh] bg-background text-foreground pb-32 p-4 space-y-4">
            {/* Header */}
            <header className="flex items-center gap-4 pt-2">
                <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    onPress={() => navigate(-1)}
                    className="text-default-500"
                >
                    <MSIcon name="arrow_back" size={22} />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold leading-tight tracking-tight">{t('deal', 'title')}</h1>
                    <span className="text-[10px] text-default-400 font-mono">#{deal.deal_id.slice(0, 8)}</span>
                </div>
                <Chip size="sm" variant="flat" color={config.color} className="font-bold tracking-widest text-[8px] uppercase px-1">
                    {config.label}
                </Chip>
            </header>

            {/* Progress Timeline */}
            {deal.status !== 'DISPUTED' && deal.status !== 'CANCELLED' && (
                <Card shadow="sm" className="bg-content1">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between relative px-[10px]">
                            {/* Connector line background */}
                            <div className="absolute left-[30px] right-[30px] top-4 h-[3px] bg-default-100 rounded-full" />
                            {/* Active line */}
                            <div
                                className="absolute left-[30px] top-4 h-[3px] bg-primary rounded-full transition-all duration-700 ease-in-out"
                                style={{
                                    width: currentStep >= 2 ? 'calc(100% - 60px)' : currentStep >= 1 ? 'calc(50% - 30px)' : '0%',
                                }}
                            />

                            {STEPS.map((step, i) => {
                                const done = i <= currentStep;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-2 relative z-10 w-12">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 text-[13px] font-bold",
                                            done ? "bg-primary border-primary text-primary-foreground" : "bg-content1 text-default-300 border-default-200"
                                        )}>
                                            {done ? (
                                                <MSIcon name="check" size={14} weight={700} />
                                            ) : i + 1}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-medium tracking-wider whitespace-nowrap",
                                            done ? "text-foreground" : "text-default-400"
                                        )}>
                                            {i === 0 ? 'Создано' : i === 1 ? 'Оплата' : 'Готово'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Amount card */}
            <Card shadow="sm" className="bg-content1 overflow-hidden">
                <CardBody className="p-6 text-center">
                    <div className="text-4xl font-bold text-foreground leading-none tracking-tight tabular-nums mt-2">
                        {deal.amount} ₸
                    </div>
                    <div className="text-[10px] text-default-400 uppercase tracking-widest font-bold mt-3 mb-4">Сумма сделки</div>
                    <div className="flex justify-center gap-4">
                        <Chip variant="flat" size="sm" color="default" className="text-[11px] font-medium px-2 h-6">
                            {deal.offer_type} • #{(deal.gb_offer_id || deal.club_id || deal.deal_id).slice(-6)}
                        </Chip>
                    </div>
                </CardBody>
            </Card>

            {/* Parties */}
            <Card shadow="sm" className="bg-content1">
                <CardBody className="p-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-default-500 mb-4 ml-1">Участники</h3>
                    <div className="space-y-0">
                        <div className="flex justify-between items-center py-3 border-b border-default-100 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-content2 text-primary flex items-center justify-center border border-default-100">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <span className="text-sm text-default-500 font-medium">
                                    {isBuyer ? 'Вы (покупатель)' : 'Покупатель'}
                                </span>
                            </div>
                            <span className="font-mono text-xs text-default-400">#{String(deal.buyer_id).slice(-6)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-content2 text-success flex items-center justify-center border border-default-100">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <span className="text-sm text-default-500 font-medium">
                                    {isSeller ? 'Вы (продавец)' : 'Продавец'}
                                </span>
                            </div>
                            <span className="font-mono text-xs text-default-400">#{String(deal.seller_id).slice(-6)}</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Created at */}
            <Card shadow="sm" className="bg-content1">
                <CardBody className="p-4 flex-row items-center justify-between">
                    <span className="text-sm text-default-500 font-medium ml-1">Создано</span>
                    <span className="text-sm text-foreground font-medium">
                        {new Date(deal.created_at || deal.updated_at).toLocaleString('ru-RU', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                    </span>
                </CardBody>
            </Card>

            {/* Actions for Buyer */}
            {isBuyer && deal.status === 'CREATED' && (
                <Card shadow="sm" className="bg-content1 border-l-4 border-l-primary">
                    <CardBody className="p-5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Оплата
                        </h3>
                        <div className="text-sm text-default-500 leading-relaxed">
                            {t('deal', 'pay_desc')} <span className="font-bold text-foreground">{deal.amount} ₸</span>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />

                        {selectedFile ? (
                            <div className="bg-default-100 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-default-200 rounded-lg flex items-center justify-center text-default-500">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-medium truncate">{selectedFile.name}</div>
                                    <div className="text-xs text-default-400">{(selectedFile.size / 1024).toFixed(0)} KB</div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    color="default"
                                    radius="full"
                                    onPress={() => setSelectedFile(null)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onPress={() => fileInputRef.current?.click()}
                                variant="bordered"
                                className="w-full h-14 border-dashed font-medium text-default-500"
                                startContent={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                }
                            >
                                {t('deal', 'upload_receipt')}
                            </Button>
                        )}

                        <Button
                            color="primary"
                            onPress={handlePay}
                            isDisabled={payMutation.isPending}
                            isLoading={payMutation.isPending}
                            className="w-full h-14 font-bold text-base mt-2"
                        >
                            {t('deal', 'pay_btn')}
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* Actions for Seller */}
            {isSeller && deal.status === 'PAID_BY_BUYER' && (
                <Card shadow="sm" className="bg-content1 border-l-4 border-l-success">
                    <CardBody className="p-5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-success flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Подтверждение
                        </h3>
                        <div className="text-sm text-default-500 leading-relaxed">
                            {t('deal', 'confirm_desc')} <span className="font-bold text-foreground">{deal.amount} ₸</span>
                        </div>

                        {deal.proof_screenshot_id && (
                            <div className="bg-content2 p-3 rounded-xl border-none flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-content3 text-primary flex items-center justify-center border border-default-100">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <span className="text-sm text-default-500 font-medium">Чек от покупателя прикреплён</span>
                            </div>
                        )}

                        <Button
                            color="success"
                            onPress={handleConfirm}
                            isDisabled={confirmMutation.isPending}
                            isLoading={confirmMutation.isPending}
                            className="w-full h-14 font-bold text-base mt-2"
                        >
                            {t('deal', 'confirm_btn')}
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* Waiting States */}
            {isBuyer && deal.status === 'PAID_BY_BUYER' && (
                <Card shadow="sm" className="bg-content1">
                    <CardBody className="p-8 text-center items-center">
                        <div className="w-16 h-16 rounded-full bg-content2 text-warning flex items-center justify-center mb-4 border border-default-100">
                            <span className="text-3xl animate-pulse">⏳</span>
                        </div>
                        <p className="font-semibold text-sm text-foreground mb-1">Ожидание подтверждения</p>
                        <p className="text-xs text-default-500">Продавец проверяет оплату</p>
                    </CardBody>
                </Card>
            )}

            {isSeller && deal.status === 'CREATED' && (
                <Card shadow="sm" className="bg-content1">
                    <CardBody className="p-8 text-center items-center">
                        <div className="w-16 h-16 rounded-full bg-content2 text-primary flex items-center justify-center mb-4 border border-default-100">
                            <span className="text-3xl">💤</span>
                        </div>
                        <p className="font-semibold text-sm text-foreground mb-1">Ожидание оплаты</p>
                        <p className="text-xs text-default-500">Покупатель ещё не оплатил сделку</p>
                    </CardBody>
                </Card>
            )}

            {/* Completed */}
            {deal.status === 'COMPLETED' && (
                <Card shadow="sm" className="bg-content1">
                    <CardBody className="p-8 text-center items-center">
                        <div className="w-16 h-16 rounded-full bg-content2 text-success flex items-center justify-center mb-4 border border-default-100">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <p className="font-bold text-success text-lg mb-1">{t('deal', 'deal_completed')}</p>
                        <p className="text-xs text-default-500">Сделка успешно завершена</p>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
