import { Box, Card, Stack, Typography } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const requestSections = [
    {
        title: 'Входящие заявки',
        subtitle: 'люди, которые хотят вступить в ваши клубы',
        icon: <AssignmentRoundedIcon />,
    },
    {
        title: 'Исходящие заявки',
        subtitle: 'ваши заявки на вступление в клубы',
        icon: <ScheduleRoundedIcon />,
    },
    {
        title: 'Ожидают действия',
        subtitle: 'доступы, оплаты и подтверждения',
        icon: <CheckCircleRoundedIcon />,
    },
];

export function RequestsHubPage() {
    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', px: 2, pt: 2, pb: 14 }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Typography fontSize={31} fontWeight={840} lineHeight={1.02}>
                    Заявки
                </Typography>
                <Typography fontSize={14} fontWeight={560} color="#77736B" sx={{ mt: 0.4, mb: 1.8 }}>
                    Детальная логика заявок появится в Phase 2.
                </Typography>

                <Stack spacing={1}>
                    {requestSections.map(section => (
                        <Card key={section.title} sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
                            <Box sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: '#F2F1EC', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                    {section.icon}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography fontSize={16} fontWeight={780} lineHeight={1.2}>
                                        {section.title}
                                    </Typography>
                                    <Typography fontSize={13} color="#77736B" fontWeight={560}>
                                        {section.subtitle}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}

export default RequestsHubPage;
