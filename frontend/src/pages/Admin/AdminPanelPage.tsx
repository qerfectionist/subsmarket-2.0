import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, SelectItem } from '@heroui/react';
import { MSIcon } from '@/shared/ui/MSIcon';
import { useHaptic } from '@/shared/hooks/useHaptic';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function AdminPanelPage() {
    const haptic = useHaptic();
    const [mockId, setMockId] = useState(() => localStorage.getItem('admin_mock_id') || Math.floor(Math.random() * 100000).toString());
    const [mockName, setMockName] = useState(() => localStorage.getItem('admin_mock_name') || 'AdminUser');
    const [activeTab, setActiveTab] = useState<'users' | 'clubs' | 'sell_gb' | 'buy_gb'>('users');
    const [isLoading, setIsLoading] = useState(false);

    // Data for dropdowns
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [gbOffers, setGbOffers] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);

    useEffect(() => {
        // Save to local storage when changed
        localStorage.setItem('admin_mock_id', mockId);
        localStorage.setItem('admin_mock_name', mockName);
    }, [mockId, mockName]);

    useEffect(() => {
        fetchSubscriptions();
        fetchGbOffers();
        fetchClubs();
    }, []);

    const getHeaders = (id = mockId, name = mockName) => ({
        'X-Telegram-Init-Data': `mock:${id}:${name}`,
        'Content-Type': 'application/json'
    });

    // -----------------------------------------------------
    // API Callers
    // -----------------------------------------------------

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch(`${API_URL}/subscriptions`, { headers: getHeaders() });
            if (res.ok) setSubscriptions(await res.json());
        } catch (e) {
            console.error('Failed to fetch subscriptions:', e);
        }
    };

    const fetchGbOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/gigabytes`, { headers: getHeaders() });
            if (res.ok) setGbOffers(await res.json());
        } catch (e) {
            console.error('Failed to fetch GB offers:', e);
        }
    };

    const fetchClubs = async () => {
        try {
            const res = await fetch(`${API_URL}/clubs`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setClubs(data.items || data);
            }
        } catch (e) {
            console.error('Failed to fetch clubs:', e);
        }
    };

    const handleCreateUser = async () => {
        setIsLoading(true);
        try {
            // Hitting /users/me will auto-create the user in DB based on the mock initData
            const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
            if (res.ok) {
                haptic.notification('success');
                alert(`Пользователь ${mockName} (ID: ${mockId}) успешно создан (или уже существует)!`);
            } else {
                throw new Error(await res.text());
            }
        } catch (e: any) {
            haptic.notification('error');
            alert(`Ошибка: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClub = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            await fetch(`${API_URL}/users/me`, { headers: getHeaders() }); // Ensure user exists

            const payload = {
                subscription_id: fd.get('subscription_id'),
                price_total: Number(fd.get('price_total')),
                max_members: Number(fd.get('max_members')),
                payment_method: fd.get('payment_method'),
                payment_details: fd.get('payment_details') || '1234 5678 9012',
                payment_day: Number(fd.get('payment_day')),
                description: fd.get('description') || 'Тестовый клуб из админки',
                rules: fd.get('rules') || 'Своевременная оплата'
            };

            const res = await fetch(`${API_URL}/clubs`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                haptic.notification('success');
                alert('Клуб успешно создан!');
                if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
                    e.currentTarget.reset();
                } else if (e.target && typeof (e.target as HTMLFormElement).reset === 'function') {
                    (e.target as HTMLFormElement).reset();
                }
                fetchClubs();
            } else {
                throw new Error(await res.text());
            }
        } catch (e: any) {
            haptic.notification('error');
            alert(`Ошибка: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSellGb = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const fd = new FormData(e.currentTarget);

        try {
            await fetch(`${API_URL}/users/me`, { headers: getHeaders() });

            const payload = {
                operator: fd.get('operator'),
                amount_gb: Number(fd.get('amount_gb')),
                price: Number(fd.get('price')),
                description: fd.get('description') || 'Отличный интернет из админки'
            };

            const res = await fetch(`${API_URL}/gigabytes`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                haptic.notification('success');
                alert('Заявка на продажу ГБ успешно создана!');
                if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
                    e.currentTarget.reset();
                } else if (e.target && typeof (e.target as HTMLFormElement).reset === 'function') {
                    (e.target as HTMLFormElement).reset();
                }
                fetchGbOffers(); // refresh offers for buy tab
            } else {
                throw new Error(await res.text());
            }
        } catch (e: any) {
            haptic.notification('error');
            alert(`Ошибка: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBuyGb = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const fd = new FormData(e.currentTarget);
        const amount = Number(fd.get('amount'));
        const offerId = fd.get('offer_id') as string;

        try {
            await fetch(`${API_URL}/users/me`, { headers: getHeaders() });

            const payload = {
                offer_type: 'gigabyte',
                offer_id: offerId,
                amount: amount
            };

            const res = await fetch(`${API_URL}/deals`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                haptic.notification('success');
                alert('Сделка на покупку ГБ успешно создана!');
                if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
                    e.currentTarget.reset();
                } else if (e.target && typeof (e.target as HTMLFormElement).reset === 'function') {
                    (e.target as HTMLFormElement).reset();
                }
            } else {
                throw new Error(await res.text());
            }
        } catch (e: any) {
            haptic.notification('error');
            alert(`Ошибка: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const generateRandomUser = () => {
        setMockId(Math.floor(Math.random() * 100000).toString());
        setMockName('AdminMock_' + Math.floor(Math.random() * 1000));
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-32">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-default-100 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                        <MSIcon name="admin_panel_settings" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-tight">Админ Панель</h1>
                        <p className="text-xs text-default-500 font-medium">Мок-данные и генерация</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-6 max-w-lg mx-auto w-full">

                {/* GLOBAL USER SIMULATOR */}
                <Card className="bg-content1 shadow-sm w-full border border-danger-500/50 p-4">
                    <div className="flex items-center gap-2 mb-4 text-danger font-bold text-sm uppercase tracking-widest">
                        <MSIcon name="vpn_key" size={18} />
                        Текущий "Acting User"
                    </div>
                    <p className="text-xs text-default-500 mb-4 font-medium">Все следующие API запросы будут выполняться от имени этого пользователя. Сервер создаст его автоматически.</p>
                    <div className="flex gap-3 mb-4">
                        <Input
                            label="User ID"
                            size="sm"
                            variant="faded"
                            value={mockId}
                            onChange={(e) => setMockId(e.target.value)}
                        />
                        <Input
                            label="Username"
                            size="sm"
                            variant="faded"
                            value={mockName}
                            onChange={(e) => setMockName(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button color="danger" variant="flat" onPress={generateRandomUser} className="flex-1 font-semibold" size="sm">
                            Случайный
                        </Button>
                        <Button color="danger" onPress={handleCreateUser} isLoading={isLoading} className="flex-1 font-bold" size="sm" startContent={!isLoading && <MSIcon name="person_add" size={16} />}>
                            Создать
                        </Button>
                    </div>
                </Card>

                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {[
                        { id: 'clubs', icon: 'groups', label: 'Клубы' },
                        { id: 'sell_gb', icon: 'sell', label: 'Продать ГБ' },
                        { id: 'buy_gb', icon: 'shopping_cart', label: 'Купить ГБ' }
                    ].map(tab => (
                        <Button
                            key={tab.id}
                            size="sm"
                            radius="full"
                            className={`snap-start whitespace-nowrap px-4 font-semibold ${activeTab === tab.id ? 'bg-foreground text-background shadow-md' : 'bg-content2 text-default-600'}`}
                            onPress={() => setActiveTab(tab.id as any)}
                        >
                            <MSIcon name={tab.icon} size={16} />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* FORMS */}
                {activeTab === 'clubs' && (
                    <Card className="bg-content1 border border-default-100 p-5 w-full">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MSIcon name="add_circle" className="text-secondary" />
                            Создать Клуб
                        </h2>
                        <form onSubmit={handleCreateClub} className="space-y-4">
                            <Select name="subscription_id" label="Сервис" isRequired variant="faded">
                                {subscriptions.map(sub => (
                                    <SelectItem key={sub.subscription_id}>
                                        {sub.service_name} (до {sub.max_members} чел)
                                    </SelectItem>
                                ))}
                            </Select>
                            <div className="flex gap-3">
                                <Input name="price_total" type="number" label="Общая цена (₸)" isRequired variant="faded" defaultValue="2000" />
                                <Input name="max_members" type="number" label="Кол-во мест" isRequired variant="faded" defaultValue="4" />
                            </div>
                            <Select name="payment_method" label="Способ оплаты" isRequired variant="faded" defaultSelectedKeys={['kaspi']}>
                                <SelectItem key="kaspi">Kaspi</SelectItem>
                                <SelectItem key="halyk">Halyk</SelectItem>
                                <SelectItem key="jusan">Jusan</SelectItem>
                                <SelectItem key="bcc">ЦентрКредит</SelectItem>
                            </Select>
                            <Input name="payment_details" label="Реквизиты (телефон или карта)" isRequired variant="faded" defaultValue="+7 777 123 4567" />
                            <Input name="payment_day" type="number" label="День списания (1-31)" isRequired variant="faded" defaultValue="15" />
                            <Input name="description" label="Описание" variant="faded" defaultValue="Супер клуб" />

                            <Button type="submit" color="secondary" className="w-full font-bold shadow-md shadow-secondary/20" isLoading={isLoading}>
                                Опубликовать Клуб
                            </Button>
                        </form>

                        {clubs.length > 0 && (
                            <div className="mt-8 space-y-3">
                                <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">Существующие клубы</h3>
                                {clubs.map(club => (
                                    <div key={club.club_id} className="bg-background rounded-xl p-3 border border-default-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{club.service_name}</span>
                                            <span className="text-xs text-default-500">
                                                ID: {club.club_id.split('-')[0]}... • Хост: {club.host_id}
                                            </span>
                                        </div>
                                        <Button
                                            isIconOnly
                                            color="danger"
                                            variant="light"
                                            size="sm"
                                            onPress={async () => {
                                                if (!confirm('Точно удалить этот клуб?')) return;
                                                try {
                                                    const res = await fetch(`${API_URL}/clubs/${club.club_id}`, {
                                                        method: 'DELETE',
                                                        headers: getHeaders()
                                                    });
                                                    if (res.ok) {
                                                        haptic.notification('success');
                                                        fetchClubs();
                                                    } else {
                                                        throw new Error(await res.text());
                                                    }
                                                } catch (e: any) {
                                                    haptic.notification('error');
                                                    alert(`Ошибка: ${e.message}`);
                                                }
                                            }}
                                        >
                                            <MSIcon name="delete" size={18} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'sell_gb' && (
                    <Card className="bg-content1 border border-default-100 p-5 w-full">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MSIcon name="sell" className="text-primary" />
                            Оффер на продажу ГБ
                        </h2>
                        <form onSubmit={handleCreateSellGb} className="space-y-4">
                            <Select name="operator" label="Оператор связи" isRequired variant="faded" defaultSelectedKeys={['tele2']}>
                                {['tele2', 'altel', 'kcell', 'activ', 'beeline'].map(op => (
                                    <SelectItem key={op} className="capitalize">{op}</SelectItem>
                                ))}
                            </Select>
                            <div className="flex gap-3">
                                <Input name="amount_gb" type="number" label="ГБ" isRequired variant="faded" defaultValue="10" />
                                <Input name="price" type="number" label="Цена (₸) за все ГБ" isRequired variant="faded" defaultValue="500" />
                            </div>
                            <Input name="description" label="Описание (опц.)" variant="faded" />

                            <Button type="submit" color="primary" className="w-full font-bold shadow-md shadow-primary/20" isLoading={isLoading}>
                                Выставить ГБ на продажу
                            </Button>
                        </form>
                    </Card>
                )}

                {activeTab === 'buy_gb' && (
                    <Card className="bg-content1 border border-default-100 p-5 w-full">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MSIcon name="shopping_cart" className="text-success" />
                            Купить ГБ (Сделка)
                        </h2>
                        <p className="text-xs text-default-500 mb-4">Список доступных офферов других пользователей. Сделка создастся от имени Acting User.</p>
                        <form onSubmit={handleCreateBuyGb} className="space-y-4">
                            <Select name="offer_id" label="Выберите оффер" isRequired variant="faded">
                                {gbOffers.length === 0 ? (
                                    <SelectItem key="none" isDisabled>Нет доступных офферов</SelectItem>
                                ) : (
                                    gbOffers.map(offer => (
                                        <SelectItem key={offer.offer_id} textValue={`${offer.amount_gb} ГБ от ID${offer.seller_id} за ${offer.price}₸`}>
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-bold">{offer.amount_gb} ГБ</span>
                                                <span className="text-default-500 text-xs text-right">ID: {offer.seller_id}<br />Цена: {offer.price}₸</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </Select>
                            <Input name="amount" type="number" label="Сколько ГБ из них купить?" isRequired variant="faded" defaultValue="5" />

                            <Button type="submit" color="success" className="w-full text-white font-bold shadow-md shadow-success/20" isLoading={isLoading}>
                                Отправить заявку (Создать Deal)
                            </Button>
                        </form>
                    </Card>
                )}
            </main>
        </div>
    );
}
