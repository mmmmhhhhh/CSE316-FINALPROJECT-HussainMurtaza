import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const history = useHistory();

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    };

    const handleLogin = () => {
        handleMenuClose();
        history.push('/login');
    };

    const handleRegister = () => {
        handleMenuClose();
        history.push('/register');
    };

    const handleEditAccount = () => {
        handleMenuClose();
        history.push('/edit-account');
    };

    const handleExitGuest = () => {
        handleMenuClose();
        auth.logoutUser();
    };

    const handleHome = () => {
        history.push('/');
    };

    const handlePlaylists = () => {
        store.loadAllPlaylists();
        history.push('/');
    };

    const handleSongsCatalog = () => {
        history.push('/songs');
    };

    // Menu for logged-in users
    const loggedInMenu = (
        <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleEditAccount}>Edit Account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    // Menu for guests
    const guestMenu = (
        <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleLogin}>Login</MenuItem>
            <MenuItem onClick={handleRegister}>Create Account</MenuItem>
            <MenuItem onClick={handleExitGuest}>Exit Guest Mode</MenuItem>
        </Menu>
    );

    // Menu for logged-out users (on splash screen)
    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleLogin}>Login</MenuItem>
            <MenuItem onClick={handleRegister}>Create Account</MenuItem>
        </Menu>
    );

    let menu = loggedOutMenu;
    if (auth.loggedIn) {
        menu = loggedInMenu;
    } else if (auth.isGuest) {
        menu = guestMenu;
    }

    // Get user initials or show Guest
    let userDisplay = "?";
    if (auth.loggedIn && auth.user) {
        userDisplay = auth.user.firstName.charAt(0) + auth.user.lastName.charAt(0);
    } else if (auth.isGuest) {
        userDisplay = "G";
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ bgcolor: '#c41bf0' }}>
                <Toolbar>
                    {/* Home Icon */}
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        onClick={handleHome}
                        sx={{ mr: 2 }}
                    >
                        <HomeIcon />
                    </IconButton>

                    {/* Navigation Buttons - show when logged in or guest */}
                    {(auth.loggedIn || auth.isGuest) && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                color="inherit"
                                startIcon={<QueueMusicIcon />}
                                onClick={handlePlaylists}
                            >
                                Playlists
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<LibraryMusicIcon />}
                                onClick={handleSongsCatalog}
                            >
                                Songs Catalog
                            </Button>
                        </Box>
                    )}

                    {/* Title - centered */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}
                    >
                        The Playlister
                    </Typography>

                    {/* User Avatar/Menu */}
                    <Box
                        onClick={handleProfileMenuOpen}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: auth.isGuest ? '#666' : '#8B5CF6',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        {userDisplay}
                    </Box>
                    {menu}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
