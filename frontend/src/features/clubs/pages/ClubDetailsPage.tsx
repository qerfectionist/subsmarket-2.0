import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { t } from "@/shared/i18n";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useState } from "react";
import { MSIcon } from "@/shared/ui/MSIcon";
import {
  Card,
  CardBody,
  Button,
  Skeleton,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Navbar,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { SERVICE_COLORS } from "../data/serviceCatalog";

export function ClubDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isPhoneModalOpen,
    onOpen: onPhoneModalOpen,
    onClose: onPhoneModalClose,
  } = useDisclosure();
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [joinMessage, setJoinMessage] = useState<"pending" | "approved">(
    "pending",
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const {
    data: club,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["club", id],
    queryFn: () => api.getClub(id!),
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: (phone?: string | void) =>
      api.joinClub(id!, phone ? phone : undefined),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["club", id] });
      const previousClub = queryClient.getQueryData(["club", id]);
      queryClient.setQueryData(["club", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          my_status: "pending", // Optimistically assume 'pending' initially
          current_members: old.current_members + 1,
        };
      });
      return { previousClub };
    },
    onSuccess: (data) => {
      haptic.notification("success");
      // Detect if auto-approved or pending (so we can adjust UI correctly)
      const msg = (data as { message?: string })?.message || "";
      const isApproved = msg.toLowerCase().includes("auto");

      setJoinMessage(isApproved ? "approved" : "pending");
      setShowJoinSuccess(true);

      // We invalidate to get the correct 'my_status' and potentially actual members list
      queryClient.invalidateQueries({ queryKey: ["club", id] });
    },
    onError: (_err, _newTodo, context) => {
      haptic.notification("error");
      if (context?.previousClub) {
        queryClient.setQueryData(["club", id], context.previousClub);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club", id] });
      onPhoneModalClose();
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.leaveClub(id!),
    onSuccess: () => {
      haptic.notification("success");
      queryClient.removeQueries({ queryKey: ["club", id] }); // clear cache
      navigate("/clubs");
    },
    onError: () => haptic.notification("error"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.cancelJoinRequest(id!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["club", id] });
      const previousClub = queryClient.getQueryData(["club", id]);
      queryClient.setQueryData(["club", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          my_status: null,
          current_members: Math.max(1, old.current_members - 1),
        };
      });
      return { previousClub };
    },
    onSuccess: () => {
      haptic.notification("success");
    },
    onError: (_err, _newTodo, context) => {
      haptic.notification("error");
      if (context?.previousClub) {
        queryClient.setQueryData(["club", id], context.previousClub);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club", id] });
    },
  });

  const remindMutation = useMutation({
    mutationFn: () => api.remindHost(id!),
    onSuccess: () => {
      haptic.notification("success");
    },
    onError: () => haptic.notification("error"),
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 pb-32">
        <header className="flex items-center gap-4 mb-6">
          <Skeleton className="rounded-full w-10 h-10" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-lg" />
          </div>
        </header>
        <Card className="bg-content1 shadow-sm">
          <CardBody className="gap-3 py-8">
            <Skeleton className="h-12 w-1/3 rounded-lg mx-auto" />
            <Skeleton className="h-4 w-1/2 rounded-lg mx-auto" />
          </CardBody>
        </Card>
        <Card className="bg-content1 shadow-sm">
          <CardBody className="gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <div className="w-16 h-16 bg-content2 text-danger rounded-full flex items-center justify-center border border-default-100">
          <MSIcon name="error" size={32} filled />
        </div>
        <h2 className="text-xl font-semibold">Не удалось загрузить клуб</h2>
        <p className="text-default-500 text-sm text-center">
          Клуб был удалён или произошла ошибка загрузки.
        </p>
        <Button
          color="primary"
          variant="flat"
          onPress={() => navigate(-1)}
          className="mt-4"
        >
          Вернуться назад
        </Button>
      </div>
    );
  }

  const isFull = club.status === "full";
  // In prod: real TG user id; in dev/mock: extract from mock init data or fall back to 12345
  const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const currentUserId: number = tgUserId
    ? Number(tgUserId)
    : (() => {
      // Parse mock init data: "mock:12345:dev_user"
      try {
        const initData = window.Telegram?.WebApp?.initData || "";
        if (initData.startsWith("mock:")) {
          return parseInt(initData.split(":")[1]) || 12345;
        }
      } catch {
        /* ignore parse errors */
      }
      return 12345;
    })();
  const isHost = club.host_id === currentUserId;
  const myStatus = club.my_status;
  // Host is always treated as "in the club"
  const isMember = isHost || myStatus === "active" || myStatus === "approved";
  const isPending = !isHost && myStatus === "pending";
  // Backend now counts the host in current_members naturally
  const membersCount = club.current_members ?? 0;
  const fillPercent = Math.round((membersCount / club.max_members) * 100);

  const statusMap: Record<
    string,
    "success" | "warning" | "danger" | "default"
  > = {
    open: "success",
    full: "warning",
    frozen: "danger",
  };
  const statusLabelMap: Record<string, string> = {
    open: "Набор открыт",
    full: "Заполнен",
    frozen: "Заморожен",
  };
  const sc = statusMap[club.status] || "default";
  const statusLabel = statusLabelMap[club.status] || club.status;

  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* ── Navbar ── */}
      <Navbar isBordered isBlurred className="px-0">
        <NavbarContent justify="start">
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              onPress={() => navigate(-1)}
              radius="full"
            >
              <MSIcon name="arrow_back" size={22} />
            </Button>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="center">
          <NavbarItem className="flex flex-col items-center">
            <h1 className="text-base font-bold truncate max-w-[200px]">
              {club.subscription.service_name}
            </h1>
            <span className="text-xs text-default-400 font-medium">
              Клуб совместной подписки
            </span>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="flex items-center">
            {isMember && !isHost ? (
              <Button
                isIconOnly
                variant="flat"
                color="danger"
                radius="full"
                size="sm"
                className="w-9 h-9"
                onPress={() => {
                  haptic.impact("light");
                  onOpen();
                }}
              >
                <MSIcon name="logout" size={18} />
              </Button>
            ) : (
              <div className="w-10" />
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="p-4 space-y-3 max-w-lg mx-auto w-full pb-32">
        {!isMember && !isHost ? (
          // ── VISITOR VIEW ──
          <>
            {/* Hero */}
            <div className="bg-content1 rounded-3xl p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Chip
                  color={sc}
                  variant="flat"
                  size="sm"
                  className="font-semibold text-[11px]"
                >
                  {statusLabel}
                </Chip>
              </div>
              <div
                style={{
                  background:
                    SERVICE_COLORS[
                    club.subscription.service_name?.toLowerCase()
                    ] || "#6366f1",
                }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm mt-2"
              >
                {club.subscription.service_name?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-black">
                  {club.subscription.service_name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-default-500 bg-content2 px-1.5 py-0.5 rounded-md capitalize">
                    {club.payment_method === "kaspi" && (
                      <div className="w-3 h-3 rounded-sm bg-[#f14635] flex items-center justify-center">
                        <span className="text-[7px] font-black text-white leading-none">K</span>
                      </div>
                    )}
                    {club.payment_method === "kaspi" ? "Kaspi" : club.payment_method}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-default-500 bg-content2 px-1.5 py-0.5 rounded-md">
                    <MSIcon name="event" className="text-[12px]" />
                    {club.payment_day || 1} числа
                  </span>
                </div>
              </div>
              <div className="w-full h-px bg-divider" />
              <div>
                <p className="text-[11px] font-semibold text-default-400 uppercase tracking-wider mb-1">
                  С вас в месяц
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black tracking-tight">
                    {Math.round(club.price_per_member)}
                  </span>
                  <span className="text-2xl font-bold text-default-300">₸</span>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="bg-content1 rounded-3xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-default-200 flex items-center justify-center text-sm font-bold">
                  {(club.host.first_name?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {club.host.first_name ||
                      club.host.username ||
                      "Пользователь"}
                  </p>
                  <p className="text-xs text-default-400">Организатор</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-warning/10 rounded-full px-2.5 py-1">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-warning"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-xs font-bold text-warning">
                  {Number(club.host.trust_score).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-content1 rounded-3xl px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Участники</p>
                <p className="text-sm font-bold tabular-nums">
                  {membersCount}{" "}
                  <span className="text-default-400 font-normal">
                    / {club.max_members}
                  </span>
                </p>
              </div>
              <Progress
                value={fillPercent}
                color={isFull ? "success" : "primary"}
                size="sm"
                radius="full"
              />
            </div>

            {(club.description || club.rules) && (
              <div className="bg-content1 rounded-3xl px-5 py-4 space-y-2">
                {club.description && (
                  <p className="text-sm text-default-500 leading-relaxed">
                    {club.description}
                  </p>
                )}
                {club.rules && (
                  <div className="flex gap-2 bg-warning/8 rounded-2xl px-3 py-2 border border-warning/20">
                    <MSIcon
                      name="warning"
                      size={14}
                      className="text-warning flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-default-500">{club.rules}</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // ── MEMBER & HOST VIEW ──
          <>
            {/* ── Minimal Combined Hero, Host & Payment ── */}
            <div className="bg-content1 rounded-3xl p-5 mb-1 flex flex-col gap-5">
              {/* Hero Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      background:
                        SERVICE_COLORS[
                        club.subscription.service_name?.toLowerCase()
                        ] || "#6366f1",
                    }}
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center text-white text-[17px] font-bold flex-shrink-0"
                  >
                    {club.subscription.service_name?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-base leading-tight mb-0.5">
                      {club.subscription.service_name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-default-500">
                        {club.max_members} участника
                      </span>
                      <div className="w-1 h-1 rounded-full bg-default-300" />
                      <span className="text-[12px] text-default-500">
                        в месяц
                      </span>
                    </div>
                  </div>
                </div>
                <Chip
                  color={sc}
                  variant="flat"
                  size="sm"
                  className="font-semibold text-[11px]"
                >
                  {statusLabel}
                </Chip>
              </div>

              {/* Price Breakdown */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-default-500 uppercase tracking-widest font-bold mb-1">
                    Ваша доля
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-black tracking-tight leading-none text-primary">
                      {Math.round(club.price_per_member)}
                    </span>
                    <span className="text-base font-bold text-primary/60 leading-none">
                      ₸
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-default-400 uppercase tracking-widest font-semibold mb-1">
                    Всего
                  </p>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-lg font-bold leading-none">
                      {Math.round(Number(club.price_total))}
                    </span>
                    <span className="text-sm font-semibold text-default-400 leading-none">
                      ₸
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-divider mx-[-4px]" />

              {/* Payment Info inside the same block */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 flex items-center gap-1.5">
                    <MSIcon name="account_balance" className="text-[16px] text-default-400" />
                    Оплата
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize flex items-center gap-1.5 bg-content2 px-2 py-1 rounded-md text-default-700">
                      {club.payment_method === "kaspi" && (
                        <div className="w-3.5 h-3.5 rounded-sm bg-[#f14635] flex items-center justify-center">
                          <span className="text-[8px] font-black text-white leading-none">K</span>
                        </div>
                      )}
                      {club.payment_method === "kaspi"
                        ? "Kaspi"
                        : club.payment_method}
                    </span>
                    <span className="font-semibold flex items-center gap-1 bg-content2 px-2 py-1 rounded-md text-default-700">
                      <MSIcon name="event" className="text-[14px] text-default-400" />
                      {club.payment_day || 1} числа
                    </span>
                  </div>
                </div>
                {club.payment_details && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500 flex items-center gap-1.5">
                      <MSIcon name="credit_score" className="text-[16px] text-default-400" />
                      Реквизиты
                    </span>
                    <div
                      className="flex items-center gap-2 cursor-pointer group active:opacity-70 transition-opacity"
                      onClick={() => {
                        if (club.payment_details) {
                          navigator.clipboard.writeText(club.payment_details);
                          haptic.selection();
                        }
                      }}
                    >
                      <span className="font-mono bg-content2 px-2 py-1 rounded-md text-default-700 font-medium tracking-wider flex items-center gap-2">
                        {club.payment_details}
                        <MSIcon name="content_copy" className="text-[14px] text-default-400 group-active:text-primary transition-colors" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Expanded Participants ── */}
        <div className="bg-content1 rounded-3xl overflow-hidden mt-6">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Участники</p>
            <div className="flex items-center gap-1.5 bg-content2 px-2 py-1.5 rounded-md">
              <MSIcon name="group" className="text-[14px] text-default-400" />
              <p className="text-xs font-semibold tabular-nums text-default-700">
                {membersCount}<span className="text-default-400 font-medium">/{club.max_members}</span>
              </p>
            </div>
          </div>

          <div className="h-px bg-divider mx-5" />

          {/* Host as first member row */}
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {(club.host.first_name?.[0] || "U").toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {club.host.first_name ||
                      club.host.username ||
                      "Пользователь"}
                    {isHost && (
                      <span className="text-primary text-xs font-normal ml-1.5">
                        вы
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <MSIcon
                      name="star"
                      size={12}
                      className="text-warning"
                      filled
                    />
                    <span className="text-[11px] font-bold text-default-600">
                      {Number(club.host.trust_score).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-default-400">Организатор</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Payment status placeholder — будет реальный статус */}
              <div className="flex items-center gap-1.5 bg-success/10 rounded-full px-2.5 py-1">
                <MSIcon
                  name="check_circle"
                  size={13}
                  className="text-success"
                  filled
                />
                <span className="text-[11px] font-semibold text-success">
                  Оплачено
                </span>
              </div>
            </div>
          </div>

          {/* Occupied slots (non-host members) */}
          {membersCount > 1 &&
            Array.from({ length: membersCount - 1 }).map((_, i) => {
              const isMe = isMember && !isHost && i === 0;
              return (
                <div key={`member-${i}`}>
                  <div className="h-px bg-divider mx-5" />
                  <div className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-default-100 flex items-center justify-center text-sm font-bold text-default-400 flex-shrink-0">
                        <MSIcon name="person" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Участник
                          {isMe && (
                            <span className="text-primary text-xs font-normal ml-1.5">
                              вы
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-default-400">В клубе</p>
                      </div>
                    </div>
                    {/* Status Placeholder */}
                    <div className="flex items-center gap-1.5 bg-default-100 rounded-full px-2.5 py-1">
                      <MSIcon
                        name="schedule"
                        size={13}
                        className="text-default-400"
                      />
                      <span className="text-[11px] font-semibold text-default-500">
                        Ожидает статуса
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Empty slots for remaining members */}
          {Array.from({
            length: Math.max(0, club.max_members - membersCount),
          }).map((_, i) => (
            <div key={`empty-${i}`}>
              <div className="h-px bg-divider mx-5" />
              <div className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-default-200 flex items-center justify-center flex-shrink-0">
                  <MSIcon
                    name="person_add"
                    size={16}
                    className="text-default-300"
                  />
                </div>
                <p className="text-sm text-default-300">Свободное место</p>
              </div>
            </div>
          ))}
        </div>



        {/* Telegram group link */}
        {club.telegram_group_link && (
          <a
            href={club.telegram_group_link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-content1 rounded-3xl px-5 py-4 flex items-center justify-between active:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-primary"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Telegram-группа</p>
                <p className="text-xs text-default-400">
                  Группа для участников
                </p>
              </div>
            </div>
            <MSIcon
              name="chevron_right"
              size={20}
              className="text-default-300"
            />
          </a>
        )}
      </main>

      {/* Bottom CTA — fixed above tab bar */}
      {(!isMember || isPending || isHost) && (
        <div className="fixed bottom-16 left-0 right-0 z-50">
          {/* gradient fade */}
          <div className="h-6 bg-gradient-to-t from-background to-transparent" />
          <div className="bg-background px-4 pb-4">
            <div className="max-w-lg mx-auto flex flex-col gap-2">
              {/* Pending state */}
              {isPending && !isHost && (
                <>
                  <div className="flex items-center justify-center gap-2 pb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-warning" />
                    </span>
                    <span className="text-sm text-warning font-semibold">
                      Ждём одобрения организатора
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      size="lg"
                      fullWidth
                      className="font-bold text-sm h-12 rounded-2xl"
                      startContent={
                        !remindMutation.isPending && (
                          <MSIcon name="notifications" size={16} />
                        )
                      }
                      isLoading={remindMutation.isPending}
                      isDisabled={remindMutation.isSuccess}
                      onPress={() => {
                        haptic.impact("medium");
                        remindMutation.mutate();
                      }}
                    >
                      {remindMutation.isSuccess
                        ? "Напомнили ✓"
                        : "Напомнить хосту"}
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      size="lg"
                      fullWidth
                      className="font-bold text-sm h-12 rounded-2xl"
                      startContent={
                        !cancelMutation.isPending && (
                          <MSIcon name="cancel" size={16} />
                        )
                      }
                      isLoading={cancelMutation.isPending}
                      onPress={() => {
                        haptic.impact("heavy");
                        cancelMutation.mutate();
                      }}
                    >
                      Отменить заявку
                    </Button>
                  </div>
                </>
              )}

              {!isMember && !isPending && !isHost && (
                <Button
                  color="primary"
                  size="lg"
                  fullWidth
                  className="font-bold text-base h-14 rounded-2xl"
                  onPress={() => {
                    haptic.impact("medium");
                    if (
                      club?.category === "telecom" ||
                      club?.subscription?.category === "telecom"
                    ) {
                      onPhoneModalOpen();
                    } else {
                      joinMutation.mutate();
                    }
                  }}
                  isLoading={joinMutation.isPending}
                  isDisabled={isFull}
                >
                  {isFull
                    ? "Клуб заполнен"
                    : `Вступить · ${Math.round(club?.price_per_member || 0)} ₸/мес`}
                </Button>
              )}

              {isHost && (
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  fullWidth
                  className="font-bold text-base h-14 rounded-2xl"
                  onPress={() => navigate(`/clubs/${id}/requests`)}
                  startContent={<MSIcon name="group_add" size={20} />}
                >
                  Заявки на вступление
                </Button>
              )}
            </div>
          </div>
        </div>
      )
      }

      {/* Leave Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        hideCloseButton
        classNames={{
          base: "mx-4 max-w-sm",
          body: "px-7 pb-2",
          header: "px-7 pt-7 pb-2",
          footer: "px-7 pb-7 pt-2",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pt-6 text-center">
                <span className="text-lg font-bold">Выход из клуба</span>
              </ModalHeader>
              <ModalBody className="text-center text-default-600 text-sm py-4">
                {t("club_details", "confirm_leave") ||
                  "Вы действительно хотите выйти? Доступ к подписке будет закрыт."}
              </ModalBody>
              <ModalFooter className="flex-col gap-2 pb-6 px-6">
                <Button
                  color="danger"
                  fullWidth
                  size="lg"
                  className="font-bold rounded-2xl h-14"
                  onPress={() => {
                    haptic.impact("heavy");
                    leaveMutation.mutate();
                  }}
                  isLoading={leaveMutation.isPending}
                >
                  Выйти
                </Button>
                <Button
                  variant="flat"
                  fullWidth
                  size="lg"
                  className="font-medium rounded-2xl h-14"
                  onPress={onClose}
                >
                  Отмена
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Phone Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={onPhoneModalClose}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "mx-4 max-w-sm",
          body: "px-6 pb-2",
          header: "px-6 pt-7 pb-3",
          footer: "px-6 pt-2 pb-7",
        }}
      >
        <ModalContent>
          {(onClose) => {
            // Apply phone mask on input
            const MASK = "+7 (___) ___-__-__";
            const isPhoneComplete =
              phoneNumber.replace(/\D/g, "").length === 11;

            const handlePhoneInput = (raw: string) => {
              // Extract only digits, keep leading 7 from +7
              const digits = raw.replace(/\D/g, "").slice(0, 11);
              if (digits.length === 0) {
                setPhoneNumber("");
                return;
              }

              // Always start with 7
              const fixedDigits = digits.startsWith("7")
                ? digits
                : "7" + digits.slice(0, 10);
              const d = (fixedDigits + "___________").slice(0, 11).split("");

              const masked =
                `+${d[0]} (${d[1]}${d[2]}${d[3]}) ${d[4]}${d[5]}${d[6]}-${d[7]}${d[8]}-${d[9]}${d[10]}`.replace(
                  /_/g,
                  "_",
                ); // keep underscores as-is

              setPhoneNumber(masked);
            };

            return (
              <>
                <ModalHeader className="flex flex-col items-center text-center gap-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-2">
                    <MSIcon name="phone" size={22} filled />
                  </div>
                  <span className="text-xl font-black">Номер телефона</span>
                </ModalHeader>
                <ModalBody>
                  <p className="text-center text-default-500 text-sm leading-relaxed mb-4">
                    Организатору нужен номер, чтобы добавить вас в тариф
                    оператора связи.
                  </p>
                  <Input
                    autoFocus
                    placeholder={MASK}
                    value={phoneNumber}
                    onValueChange={handlePhoneInput}
                    variant="bordered"
                    size="lg"
                    type="tel"
                    inputMode="numeric"
                    startContent={
                      <MSIcon
                        name="phone"
                        size={16}
                        className={
                          isPhoneComplete ? "text-success" : "text-default-400"
                        }
                      />
                    }
                    color={isPhoneComplete ? "success" : "default"}
                    classNames={{
                      input: "text-base tracking-widest font-mono",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                  {isPhoneComplete && (
                    <p className="text-xs text-success text-center mt-2 flex items-center justify-center gap-1">
                      <MSIcon name="check_circle" size={12} filled />
                      Номер введён корректно
                    </p>
                  )}
                </ModalBody>
                <ModalFooter className="flex-col gap-2">
                  <Button
                    color="primary"
                    fullWidth
                    size="lg"
                    className="font-bold rounded-2xl h-14 text-base"
                    onPress={() => {
                      if (!isPhoneComplete) return;
                      haptic.impact("medium");
                      joinMutation.mutate(phoneNumber);
                    }}
                    isDisabled={!isPhoneComplete}
                    isLoading={joinMutation.isPending}
                  >
                    Отправить заявку
                  </Button>
                  <Button
                    variant="flat"
                    fullWidth
                    size="lg"
                    className="font-medium rounded-2xl h-13"
                    onPress={onClose}
                  >
                    Отмена
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      {/* Join Result Modal */}
      <Modal
        isOpen={showJoinSuccess}
        onClose={() => setShowJoinSuccess(false)}
        placement="center"
        backdrop="blur"
        hideCloseButton
        classNames={{
          base: "mx-4 max-w-sm",
          body: "px-7 pb-2",
          header: "px-7 pt-8 pb-2",
          footer: "px-7 pb-8 pt-2",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 pt-8 pb-2 items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${joinMessage === "approved"
                    ? "bg-success/20 text-success"
                    : "bg-primary/20 text-primary"
                    }`}
                >
                  <MSIcon
                    name={
                      joinMessage === "approved" ? "check_circle" : "schedule"
                    }
                    size={32}
                    filled
                  />
                </div>
                <span className="text-2xl font-black tracking-tight text-foreground">
                  {joinMessage === "approved"
                    ? "Вы вступили!"
                    : "Заявка отправлена!"}
                </span>
              </ModalHeader>
              <ModalBody className="text-center text-default-600 text-[15px] leading-relaxed py-4 px-6">
                {joinMessage === "approved"
                  ? "Вы успешно вступили в клуб. Данные от аккаунта и реквизиты организатора для оплаты теперь открыты на странице."
                  : "Ваша заявка отправлена. Организатор рассмотрит её и примет решение."}
              </ModalBody>
              <ModalFooter className="flex-col pb-8 px-6">
                <Button
                  color={joinMessage === "approved" ? "primary" : "default"}
                  variant={joinMessage === "approved" ? "solid" : "flat"}
                  fullWidth
                  size="lg"
                  className="font-bold rounded-2xl h-14 text-base"
                  onPress={onClose}
                >
                  {joinMessage === "approved" ? "Продолжить" : "Понятно"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div >
  );
}
