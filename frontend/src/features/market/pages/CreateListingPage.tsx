import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody } from '@heroui/react';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { t } from '@/shared/i18n';
import { api } from '@/shared/api';
import { OperatorSelect } from '@/shared/ui/OperatorSelect';
import { MSIcon } from '@/shared/ui/MSIcon';

const OPERATORS = [
    { id: 'altel', name: 'Altel', color: '#FF0055' },
    { id: 'tele2', name: 'Tele2', color: '#111111' },
    { id: 'kcell', name: 'Kcell', color: '#6A0DAD' },
    { id: 'beeline', name: 'Beeline', color: '#FFCC00' },
];

const CreateListingPage = () => {
    const navigate = useNavigate();
    const haptic = useHaptic();
    const [amount, setAmount] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [operatorId, setOperatorId] = useState<string>('altel');
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
            await api.createGigabyteOffer({
                operator: operatorId,
                amount_gb: Number(amount),
                price: Number(price)
            });
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
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background px-4 py-3 flex items-center gap-3 border-b border-default-100">
                <Button isIconOnly variant="light" radius="full" onPress={() => navigate(-1)} className="text-default-500 shrink-0">
                    <MSIcon name="arrow_back" size={22} />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold tracking-tight">{t('listing', 'title') || 'Создать объявление'}</h1>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 px-4 pt-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 w-full">

                {/* Operator Section */}
                <section>
                    <div className="flex items-center gap-2 pl-1 mb-3">
                        <span className="text-xs font-bold text-default-500 uppercase tracking-wider">
                            {t('listing', 'operator') || 'Оператор связи'}
                        </span>
                    </div>
                    <OperatorSelect
                        operators={OPERATORS}
                        selectedId={operatorId}
                        onSelect={setOperatorId}
                        className="sm:grid-cols-2"
                    />
                </section>

                {/* Details Section */}
                <section>
                    <div className="flex items-center gap-2 pl-1 mb-3">
                        <span className="text-xs font-bold text-default-500 uppercase tracking-wider">
                            Детали объявления
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Input
                            label={t('listing', 'amount') || 'Объем'}
                            placeholder="0"
                            type="number"
                            value={amount}
                            onValueChange={setAmount}
                            min={1}
                            labelPlacement="inside"
                            endContent={<span className="text-default-400 text-sm">ГБ</span>}
                            size="lg"
                            variant="bordered"
                            className="bg-content1"
                        />

                        <Input
                            label={t('listing', 'price') || 'Цена за весь объем'}
                            placeholder="0"
                            type="number"
                            value={price}
                            onValueChange={setPrice}
                            min={100}
                            labelPlacement="inside"
                            endContent={<span className="text-default-400 text-sm">₸</span>}
                            size="lg"
                            variant="bordered"
                            className="bg-content1"
                            description={<span className="text-[11px] font-medium">{`${t('listing', 'recommended') || 'Рекомед. цена'}: ${amount ? Number(amount) * 40 : 0} - ${amount ? Number(amount) * 60 : 0} ₸`}</span>}
                        />
                    </div>
                </section>

                {/* Warnings */}
                <Card shadow="none" className="bg-warning-50 border-none">
                    <CardBody className="p-4 flex flex-col gap-3 text-sm text-warning-700 font-medium">
                        <div className="flex gap-3 items-start">
                            <MSIcon name="info" size={20} filled className="shrink-0 text-warning-600 mt-0.5" />
                            <p className="leading-snug">{t('listing', 'warn_operator') || 'Доступно только для абонентов вашей сети.'}</p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <MSIcon name="description" size={20} filled className="shrink-0 text-warning-600 mt-0.5" />
                            <p className="leading-snug">{t('listing', 'warn_manual') || 'Перевод осуществляется вами вручную через официальное приложение оператора.'}</p>
                        </div>
                    </CardBody>
                </Card>

                {/* Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background border-t border-default-100 z-50">
                    <Button
                        type="submit"
                        color="primary"
                        isLoading={loading}
                        size="lg"
                        fullWidth
                        className="font-bold text-base shadow-sm h-14"
                        onPress={() => haptic.impact('medium')}
                    >
                        {loading ? t('listing', 'publishing') || 'Публикация...' : t('listing', 'submit') || 'Опубликовать'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateListingPage;
