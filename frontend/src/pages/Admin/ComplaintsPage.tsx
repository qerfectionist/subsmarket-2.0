import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTelegram } from "@/app/providers/TelegramProvider";
import { trustApi, Complaint } from "@/shared/api/trust";
import { BackButton } from "@twa-dev/sdk/react";

/* 
 * Complaint Card Component 
 * Usually distinct enough to keep inline or move to widgets if reused.
 */
const ComplaintCard = ({
    complaint,
    onResolve
}: {
    complaint: Complaint;
    onResolve: (id: string, action: 'confirm' | 'reject') => void
}) => {
    return (
        <div className="bg-secondary p-4 rounded-xl mb-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <span className="font-medium text-red-500 uppercase text-xs tracking-wider">
                    {complaint.reason}
                </span>
                <span className="text-xs text-hint">{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>

            <div className="text-sm">
                <p>Reporter: {complaint.reporter_id}</p>
                <p>Target: {complaint.target_id}</p>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => onResolve(complaint.complaint_id, 'reject')}
                    className="flex-1 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium"
                >
                    Заблокировать заявку
                </button>
                <button
                    onClick={() => onResolve(complaint.complaint_id, 'confirm')}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                >
                    Подтвердить нарушение
                </button>
            </div>
        </div>
    );
};

export const ComplaintsPage = () => {
    const navigate = useNavigate();
    const { user } = useTelegram();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const data = await trustApi.listComplaints('pending');
            setComplaints(data.complaints);
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки жалоб');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, action: 'confirm' | 'reject') => {
        const confirmMsg = action === 'confirm'
            ? 'Подтвердить нарушение? Это снизит рейтинг пользователя.'
            : 'Отклонить жалобу?';

        if (!window.confirm(confirmMsg)) return;

        try {
            await trustApi.resolveComplaint(id, action);
            // Optimistic update
            setComplaints(prev => prev.filter(c => c.complaint_id !== id));
        } catch (e) {
            console.error(e);
            alert('Ошибка при обработке');
        }
    };

    if (loading) return <div className="p-5 text-center text-hint">Загрузка...</div>;

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <BackButton onClick={() => navigate(-1)} />

            <h1 className="text-2xl font-bold mb-6">Жалобы</h1>

            {complaints.length === 0 ? (
                <div className="text-center text-hint mt-10">
                    Нет активных жалоб 🎉
                </div>
            ) : (
                complaints.map(c => (
                    <ComplaintCard
                        key={c.complaint_id}
                        complaint={c}
                        onResolve={handleResolve}
                    />
                ))
            )}
        </div>
    );
};
