import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import Copyright from './Copyright';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Alert from '@mui/material/Alert';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        firstName: auth.user?.firstName || '',
        lastName: auth.user?.lastName || '',
        userName: auth.user?.userName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords if trying to change
        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword.length < 8) {
                setError('New password must be at least 8 characters');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }
            if (!formData.currentPassword) {
                setError('Please enter your current password to change it');
                return;
            }
        }

        try {
            const response = await fetch('http://localhost:4000/auth/update', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    userName: formData.userName,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setSuccess('Account updated successfully!');
                // Update auth context
                auth.getLoggedIn();
                setTimeout(() => {
                    history.push('/');
                }, 1500);
            } else {
                setError(data.errorMessage || 'Failed to update account');
            }
        } catch (err) {
            setError('Failed to update account. Please try again.');
        }
    };

    const handleCancel = () => {
        history.push('/');
    };

    if (!auth.loggedIn || !auth.user) {
        history.push('/login');
        return null;
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <AccountCircleIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Edit Account
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {auth.user.email} (cannot be changed)
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                        {success}
                    </Alert>
                )}

                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="firstName"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="userName"
                                label="User Name"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666' }}>
                                Change Password (optional)
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="currentPassword"
                                label="Current Password"
                                type="password"
                                id="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="newPassword"
                                label="New Password"
                                type="password"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                helperText="Must be at least 8 characters"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="confirmPassword"
                                label="Confirm New Password"
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    );
}
