import { Link } from 'react-router-dom';
import { Box, Card, CardActionArea, Stack, Typography } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const requestSections = [
    {
        title: 'Вступление',
        subtitle: 'заявки в ваши клубы',
        value: '0',
        to: '/my',
        icon: <AssignmentRoundedIcon />,
    },
    {
        title: 'Ожидают оплаты',
        subtitle: 'участники с выданным доступом',
        value: '0',
        to: '/my',
        icon: <ScheduleRoundedIcon />,
    },
    {
        title: 'На подтверждении',
        subtitle: 'чеки и отметки оплаты',
        value: '0',
        to: '/my',
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
                    входящие заявки, доступы и оплаты
                </Typography>

                <Stack spacing={1}>
                    {requestSections.map(section => (
                        <Card key={section.title} sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
                            <CardActionArea component={Link} to={section.to} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
                                <Typography fontSize={15} fontWeight={820} color="#77736B">
                                    {section.value}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}

export default RequestsHubPage;
