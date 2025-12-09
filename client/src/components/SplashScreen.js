import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const handleContinueAsGuest = () => {
        auth.continueAsGuest();
    };

    const handleLogin = () => {
        history.push('/login');
    };

    const handleRegister = () => {
        history.push('/register');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                textAlign: 'center',
                p: 3
            }}
        >
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold', color: '#8B5CF6' }}>
                Welcome to Playlister
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: '#666' }}>
                Create, share, and discover amazing playlists
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleContinueAsGuest}
                    sx={{ bgcolor: '#666' }}
                >
                    Continue as Guest
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleLogin}
                    sx={{ bgcolor: '#8B5CF6' }}
                >
                    Login
                </Button>
                <Button
                    variant="outlined"
                    size="large"
                    onClick={handleRegister}
                >
                    Create Account
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 4, color: '#999' }}>
                Copyright © Playlister 2025
            </Typography>
        </Box>
    );
}
