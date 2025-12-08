import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const handleContinueAsGuest = () => {
        auth.loginAsGuest();
    };

    const handleLogin = () => {
        history.push('/login');
    };

    const handleCreateAccount = () => {
        history.push('/register');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 64px)',
                backgroundColor: '#f5f0ff',
                padding: 4
            }}
        >
            {/* Main Card */}
            <Box
                sx={{
                    backgroundColor: '#fffef0',
                    borderRadius: 2,
                    padding: 6,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    maxWidth: 500,
                    width: '100%'
                }}
            >
                {/* Title */}
                <Typography
                    variant="h3"
                    sx={{
                        color: '#c41bf0',
                        fontWeight: 'bold',
                        marginBottom: 3
                    }}
                >
                    The Playlister
                </Typography>

                {/* Music Icon/Logo */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 4
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: '#000',
                            borderRadius: '50%',
                            width: 60,
                            height: 60,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        <MusicNoteIcon sx={{ color: '#fff', fontSize: 30 }} />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginLeft: 1,
                            gap: 0.5
                        }}
                    >
                        <Box sx={{ width: 40, height: 6, backgroundColor: '#000', borderRadius: 1 }} />
                        <Box sx={{ width: 40, height: 6, backgroundColor: '#000', borderRadius: 1 }} />
                        <Box sx={{ width: 40, height: 6, backgroundColor: '#000', borderRadius: 1 }} />
                    </Box>
                </Box>

                {/* Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleContinueAsGuest}
                        sx={{
                            backgroundColor: '#333',
                            color: '#fff',
                            textTransform: 'none',
                            padding: '10px 20px',
                            '&:hover': {
                                backgroundColor: '#555'
                            }
                        }}
                    >
                        Continue as Guest
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        sx={{
                            backgroundColor: '#333',
                            color: '#fff',
                            textTransform: 'none',
                            padding: '10px 20px',
                            '&:hover': {
                                backgroundColor: '#555'
                            }
                        }}
                    >
                        Login
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateAccount}
                        sx={{
                            backgroundColor: '#333',
                            color: '#fff',
                            textTransform: 'none',
                            padding: '10px 20px',
                            '&:hover': {
                                backgroundColor: '#555'
                            }
                        }}
                    >
                        Create Account
                    </Button>
                </Box>
            </Box>

            {/* Copyright */}
            <Typography
                variant="body2"
                sx={{
                    marginTop: 4,
                    color: '#666'
                }}
            >
                Copyright © Playlister 2025
            </Typography>
        </Box>
    );
}
