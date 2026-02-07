import { useState } from 'react';
import { useTelegram } from '@/app/providers/TelegramProvider';
import { Bell, CreditCard, ShieldCheck, Zap, Activity } from 'lucide-react';
import {
    BottomSheet,
    Button,
    Card,
    FAB,
    ListItem,
    ListSection,
    MarketChart,
    SegmentControl,
    StatusIndicator
} from '@/shared/ui';

export function DemoPage() {
    useTelegram();

    // State for interactive demos
    const [sheetOpen, setSheetOpen] = useState(false);
    const [segment, setSegment] = useState('activity');

    return (
        <div className="min-h-screen pb-32 bg-black">
            <div className="p-5 space-y-8 animate-in fade-in duration-500">

                {/* Header Area */}
                <div className="flex justify-between items-center pt-2">
                    <div>
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1 block">
                            System V3.0
                        </span>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Control Center
                        </h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Bell size={20} className="text-white" />
                    </div>
                </div>

                {/* Main Dashboard Card */}
                <div className="relative overflow-hidden rounded-[32px] p-6 border border-white/10 shadow-2xl">
                    {/* Background Mesh Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-sm text-white/60 font-medium uppercase tracking-wider mb-1">Total Balance</p>
                                <h2 className="text-4xl font-bold text-white tracking-tight">
                                    1,240.50 <span className="text-2xl text-white/40">TON</span>
                                </h2>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-green-400">+12.5%</span>
                            </div>
                        </div>

                        <div className="h-16">
                            <MarketChart
                                data={[
                                    { label: '1', value: 10 },
                                    { label: '2', value: 45 },
                                    { label: '3', value: 30 },
                                    { label: '4', value: 80 },
                                    { label: '5', value: 55 },
                                    { label: '6', value: 90 },
                                ]}
                                color="#3b82f6"
                                height={60}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card clickable className="flex flex-col gap-3 min-h-[140px] justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight mb-1">Quick Swap</h3>
                            <p className="text-xs text-white/50">Exchange assets instantly</p>
                        </div>
                    </Card>
                    <Card clickable className="flex flex-col gap-3 min-h-[140px] justify-between">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight mb-1">Security</h3>
                            <p className="text-xs text-white/50">2FA & Recovery</p>
                        </div>
                    </Card>
                </div>

                {/* Segment Control */}
                <SegmentControl
                    options={[
                        { value: 'activity', label: 'Activity' },
                        { value: 'assets', label: 'Assets' },
                        { value: 'p2p', label: 'P2P' }
                    ]}
                    value={segment}
                    onChange={setSegment}
                    fullWidth
                />

                {/* Settings List */}
                <ListSection title="Configuration">
                    <ListItem
                        icon={<Activity size={20} />}
                        label="System Status"
                        rightElement={<StatusIndicator status="online" showLabel />}
                    />
                    <ListItem
                        icon={<CreditCard size={20} />}
                        label="Payment Method"
                        value="Kaspi Gold"
                        hasArrow
                    />
                    <ListItem
                        label="Dark Mode"
                        toggle
                        isOn={true}
                    />
                </ListSection>

                {/* Floating Action Button */}
                <FAB onClick={() => setSheetOpen(true)} />

                {/* Bottom Sheet Modal */}
                <BottomSheet
                    isOpen={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                    title="Quick Actions"
                >
                    <div className="grid grid-cols-2 gap-3 pb-8">
                        <Button variant="secondary" size="lg" className="h-24 flex-col gap-2 rounded-[24px]">
                            <Zap size={24} className="text-yellow-400" />
                            <span>Flash Deal</span>
                        </Button>
                        <Button variant="secondary" size="lg" className="h-24 flex-col gap-2 rounded-[24px]">
                            <CreditCard size={24} className="text-blue-400" />
                            <span>Top Up</span>
                        </Button>
                        <div className="col-span-2 mt-2">
                            <Button fullWidth variant="primary" size="lg" onClick={() => setSheetOpen(false)}>
                                Close Menu
                            </Button>
                        </div>
                    </div>
                </BottomSheet>

            </div>
        </div>
    );
}
