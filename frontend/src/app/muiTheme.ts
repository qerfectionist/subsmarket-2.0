import { createTheme, alpha } from '@mui/material';

export const muiTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#111111', light: '#333333', dark: '#000000' },
        secondary: { main: '#FFE15A' },
        success: { main: '#43D17A' },
        error: { main: '#FF4D4D' },
        warning: { main: '#FFB020' },
        background: {
            default: '#F5F4EF',
            paper: '#ffffff',
        },
        divider: 'rgba(17,17,17,0.08)',
        text: {
            primary: '#111111',
            secondary: '#77736B',
            disabled: '#B7B1A8',
        },
    },
    shape: { borderRadius: 28 },
    typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', system-ui, Arial, sans-serif",
        fontSize: 15,
        h4: { fontWeight: 760, letterSpacing: 0, lineHeight: 1.08 },
        h5: { fontWeight: 760, letterSpacing: 0, lineHeight: 1.12 },
        h6: { fontWeight: 720, letterSpacing: 0, lineHeight: 1.18 },
        subtitle1: { fontWeight: 650, lineHeight: 1.35 },
        subtitle2: { fontWeight: 620, lineHeight: 1.35 },
        body1: { fontWeight: 450, lineHeight: 1.48 },
        body2: { fontWeight: 450, lineHeight: 1.45 },
        caption: { fontWeight: 560, lineHeight: 1.35 },
        button: { textTransform: 'none', fontWeight: 650, letterSpacing: 0, lineHeight: 1.2 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F5F4EF',
                    overscrollBehavior: 'none',
                    fontSynthesisWeight: 'none',
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },
                '::-webkit-scrollbar': { display: 'none' },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                    border: '0',
                    borderRadius: 28,
                    boxShadow: 'none',
                },
            },
        },
        MuiCardActionArea: {
            styleOverrides: {
                root: { borderRadius: 'inherit' },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 650, fontSize: 13, borderRadius: 999 },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 650,
                    textTransform: 'none',
                    fontSize: 14,
                    minHeight: 42,
                    padding: '8px 16px',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: { minHeight: 42 },
                indicator: { height: 3, borderRadius: 3 },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 700, borderRadius: 999 },
                sizeLarge: { height: 58, fontSize: 16 },
                sizeMedium: { height: 46, fontSize: 14 },
                containedPrimary: {
                    background: '#111111',
                    color: '#ffffff',
                    boxShadow: 'none',
                    '&:hover': { background: '#222222', boxShadow: 'none' },
                },
                outlinedPrimary: {
                    borderColor: 'rgba(17,17,17,0.14)',
                    color: '#111111',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { borderRadius: 999 },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(20px)',
                    height: 64,
                },
            },
        },
        MuiBottomNavigationAction: {
            styleOverrides: {
                root: {
                    color: 'rgba(17,17,17,0.42)',
                    minWidth: 'auto',
                    padding: '6px 0',
                    '&.Mui-selected': { color: '#111111' },
                },
                label: {
                    fontSize: '10px !important',
                    fontWeight: 650,
                    letterSpacing: 0,
                    '&.Mui-selected': { fontSize: '10px !important' },
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'filled' },
            styleOverrides: {
                root: {
                    '& .MuiFilledInput-root': {
                        backgroundColor: 'rgba(17,17,17,0.04)',
                        borderRadius: 18,
                        '&:hover': { backgroundColor: 'rgba(17,17,17,0.06)' },
                        '&.Mui-focused': { backgroundColor: 'rgba(17,17,17,0.06)' },
                        '&:before, &:after': { display: 'none' },
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: { fontSize: 14 },
            },
        },
        MuiSkeleton: {
            styleOverrides: {
                root: { backgroundColor: 'rgba(17,17,17,0.08)', borderRadius: 14 },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    background: '#111111',
                    color: '#ffffff',
                    boxShadow: 'none',
                    '&:hover': { background: '#222222', boxShadow: 'none' },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: 'rgba(17,17,17,0.07)' },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha('#111111', 0.1),
                    color: '#111111',
                    fontWeight: 800,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: { borderRadius: 18 },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: { borderRadius: 18 },
            },
        },
    },
});
