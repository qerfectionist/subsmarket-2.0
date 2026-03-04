import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ClubMember } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { MSIcon } from '@/shared/ui/MSIcon';
import {
    Card, CardBody, Button, Skeleton, Avatar, Chip, Divider, Tooltip
} from '@heroui/react';

// ─── Score ring: coloured based on value ───────────────────────────────────
function TrustBadge({ score }: { score: number }) {
    const color = score >= 4.5 ? 'success' : score >= 3.5 ? 'warning' : 'danger';
    return (
        <Tooltip content="Рейтинг доверия">
            <Chip
                color={color}
                variant="flat"
                size="sm"
                startContent={
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                }
                className="font-bold text-[11px]"
            >
                {Number(score).toFixed(1)}
            </Chip>
        </Tooltip>
    );
}

// ─── Time since request ─────────────────────────────────────────────────────
function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return `${Math.floor(diff / 86400)} дн назад`;
}

// ─── Single applicant card ──────────────────────────────────────────────────
function ApplicantCard({
    member,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
}: {
    member: ClubMember;
    onApprove: () => void;
    onReject: () => void;
    isApproving: boolean;
    isRejecting: boolean;
}) {
    const { user } = member;
    const deals = user.p2p_deals_count ?? 0;
    const success = user.p2p_success_count ?? 0;
    const successRate = deals > 0 ? Math.round((success / deals) * 100) : null;

    return (
        <Card className="bg-content1 border border-default-100 shadow-sm w-full overflow-hidden">
            {/* User info row */}
            <CardBody className="p-4 gap-3">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={user.first_name?.[0] || user.username?.[0] || 'U'}
                        size="md"
                        className="flex-shrink-0 font-bold"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                            {user.first_name || user.username || `User #${user.user_id}`}
                        </p>
                        {user.username && (
                            <p className="text-xs text-default-400 truncate">@{user.username}</p>
                        )}
                        <p className="text-[11px] text-default-400 mt-0.5">{timeAgo(member.joined_at)}</p>
                    </div>
                    <TrustBadge score={Number(user.trust_score)} />
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Chip variant="flat" size="sm" className="text-[11px]">
                        <span className="text-default-500">Сделок: </span>
                        <span className="font-bold">{deals}</span>
                    </Chip>
                    {successRate !== null && (
                        <Chip variant="flat" color="success" size="sm" className="text-[11px]">
                            <span className="font-bold">{successRate}%</span>
                            <span className="text-default-500"> успешных</span>
                        </Chip>
                    )}
                    {member.phone_number && (
                        <Chip variant="flat" color="primary" size="sm" className="text-[11px]" startContent={
                            <MSIcon name="phone" size={12} />
                        }>
                            {member.phone_number}
                        </Chip>
                    )}
                </div>

                <Divider />

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button
                        color="success"
                        variant="flat"
                        fullWidth
                        size="sm"
                        className="h-10 font-bold rounded-xl"
                        startContent={!isApproving && <MSIcon name="check_circle" size={16} />}
                        isLoading={isApproving}
                        isDisabled={isRejecting}
                        onPress={onApprove}
                    >
                        Принять
                    </Button>
                    <Button
                        color="danger"
                        variant="flat"
                        fullWidth
                        size="sm"
                        className="h-10 font-bold rounded-xl"
                        startContent={!isRejecting && <MSIcon name="cancel" size={16} />}
                        isLoading={isRejecting}
                        isDisabled={isApproving}
                        onPress={onReject}
                    >
                        Отклонить
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function ClubRequestsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const queryClient = useQueryClient();

    const { data: requests, isLoading, error } = useQuery({
        queryKey: ['club-requests', id],
        queryFn: () => api.getPendingMembers(id!),
        enabled: !!id,
        refetchInterval: 15000, // auto-refresh every 15s
    });

    const approveMutation = useMutation({
        mutationFn: (memberId: string) => api.approveMember(id!, memberId),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['club-requests', id] });
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => haptic.notification('error'),
    });

    const rejectMutation = useMutation({
        mutationFn: (memberId: string) => api.rejectMember(id!, memberId),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['club-requests', id] });
        },
        onError: () => haptic.notification('error'),
    });

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-default-100">
                <div className="flex items-center gap-3 p-4 max-w-lg mx-auto w-full">
                    <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        radius="full"
                        onPress={() => navigate(-1)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </Button>
                    <div>
                        <h1 className="text-base font-bold leading-tight">Заявки на вступление</h1>
                        <p className="text-xs text-default-400">Просматривайте и принимайте решения</p>
                    </div>
                    {requests && requests.length > 0 && (
                        <Chip color="danger" size="sm" className="ml-auto font-bold">
                            {requests.length}
                        </Chip>
                    )}
                </div>
            </header>

            <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="bg-content1 border border-default-100">
                                <CardBody className="gap-3 p-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1 gap-2 flex flex-col">
                                            <Skeleton className="h-4 w-32 rounded-lg" />
                                            <Skeleton className="h-3 w-20 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 flex-1 rounded-xl" />
                                        <Skeleton className="h-10 flex-1 rounded-xl" />
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <div className="w-14 h-14 bg-danger/10 text-danger rounded-full flex items-center justify-center">
                            <MSIcon name="error" size={28} filled />
                        </div>
                        <p className="text-sm text-default-500">
                            {error instanceof Error ? error.message : 'Ошибка загрузки'}
                        </p>
                        <p className="text-xs text-default-400">Возможно, вы не являетесь организатором этого клуба</p>
                    </div>
                )}

                {!isLoading && !error && requests?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-2">
                            <MSIcon name="check_circle" size={32} filled />
                        </div>
                        <p className="font-bold text-lg">Нет новых заявок</p>
                        <p className="text-sm text-default-500 max-w-xs">
                            Когда кто-то захочет вступить в ваш клуб, заявки появятся здесь
                        </p>
                    </div>
                )}

                {requests && requests.length > 0 && (
                    <>
                        {/* Sort hint */}
                        <div className="flex items-center gap-2 px-1">
                            <MSIcon name="info" size={14} className="text-default-400" />
                            <p className="text-xs text-default-400">Заявки отсортированы по времени подачи. Оцените рейтинг и активность пользователя.</p>
                        </div>

                        {requests.map((member) => (
                            <ApplicantCard
                                key={member.member_id}
                                member={member}
                                onApprove={() => {
                                    haptic.impact('medium');
                                    approveMutation.mutate(member.member_id);
                                }}
                                onReject={() => {
                                    haptic.impact('light');
                                    rejectMutation.mutate(member.member_id);
                                }}
                                isApproving={approveMutation.isPending && approveMutation.variables === member.member_id}
                                isRejecting={rejectMutation.isPending && rejectMutation.variables === member.member_id}
                            />
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}
