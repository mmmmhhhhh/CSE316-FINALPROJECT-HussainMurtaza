import { useContext, useState, useEffect } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#90EE90',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youTubeId, setYouTubeId] = useState('');

    useEffect(() => {
        if (store.currentSong) {
            setTitle(store.currentSong.title || '');
            setArtist(store.currentSong.artist || '');
            setYear(store.currentSong.year || '');
            setYouTubeId(store.currentSong.youTubeId || '');
        }
    }, [store.currentSong]);

    function handleConfirmEditSong() {
        let newSongData = {
            title: title,
            artist: artist,
            year: parseInt(year),
            youTubeId: youTubeId
        };
        store.addUpdateSongTransaction(store.currentSongIndex, newSongData);
        store.hideModals();
    }

    function handleCancelEditSong() {
        store.hideModals();
    }

    const isComplete = title.trim() !== '' && artist.trim() !== '' && 
                       year.toString().trim() !== '' && youTubeId.trim() !== '';

    return (
        <Modal open={store.currentSong !== null && store.isEditSongModalOpen()}>
            <Box sx={style}>
                <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                        bgcolor: '#228B22', 
                        color: 'white', 
                        p: 1, 
                        mb: 2,
                        mx: -4,
                        mt: -4,
                        px: 2
                    }}
                >
                    Edit Song
                </Typography>
                
                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2, bgcolor: 'white' }}
                />
                
                <TextField
                    fullWidth
                    label="Artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    sx={{ mb: 2, bgcolor: 'white' }}
                />
                
                <TextField
                    fullWidth
                    label="Year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ mb: 2, bgcolor: 'white' }}
                />
                
                <TextField
                    fullWidth
                    label="YouTube Id"
                    value={youTubeId}
                    onChange={(e) => setYouTubeId(e.target.value)}
                    sx={{ mb: 2, bgcolor: 'white' }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                        variant="contained"
                        disabled={!isComplete}
                        onClick={handleConfirmEditSong}
                        sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
                    >
                        Complete
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleCancelEditSong}
                        sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
