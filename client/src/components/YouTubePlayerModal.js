import { useContext, useState, useCallback } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import CloseIcon from '@mui/icons-material/Close';
import RepeatIcon from '@mui/icons-material/Repeat';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import YouTube from 'react-youtube';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 900,
    bgcolor: '#90EE90',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
    maxHeight: '90vh',
    overflow: 'auto'
};

export default function YouTubePlayerModal({ open, onClose, playlist }) {
    const { store } = useContext(GlobalStoreContext);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [player, setPlayer] = useState(null);

    if (!playlist || !playlist.songs || playlist.songs.length === 0) {
        return null;
    }

    const currentSong = playlist.songs[currentSongIndex];

    const onPlayerReady = (event) => {
        setPlayer(event.target);
    };

    const onPlayerStateChange = (event) => {
        // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
        if (event.data === 0) {
            // Video ended
            handleNext();
        } else if (event.data === 1) {
            setIsPlaying(true);
        } else if (event.data === 2) {
            setIsPlaying(false);
        }
    };

    const handlePlayPause = () => {
        if (player) {
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    };

    const handleNext = () => {
        let nextIndex = currentSongIndex + 1;
        if (nextIndex >= playlist.songs.length) {
            if (repeat) {
                nextIndex = 0;
            } else {
                nextIndex = playlist.songs.length - 1;
                return;
            }
        }
        setCurrentSongIndex(nextIndex);
    };

    const handlePrevious = () => {
        let prevIndex = currentSongIndex - 1;
        if (prevIndex < 0) {
            if (repeat) {
                prevIndex = playlist.songs.length - 1;
            } else {
                prevIndex = 0;
            }
        }
        setCurrentSongIndex(prevIndex);
    };

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
    };

    const handleClose = () => {
        if (player) {
            player.pauseVideo();
        }
        setCurrentSongIndex(0);
        setIsPlaying(false);
        onClose();
    };

    const opts = {
        height: '300',
        width: '100%',
        playerVars: {
            autoplay: 1,
        },
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, bgcolor: '#4CAF50', p: 1, borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Play Playlist
                    </Typography>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Playlist Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mr: 2 }}>
                        {playlist.ownerEmail?.charAt(0).toUpperCase() || 'P'}
                    </Box>
                    <Box>
                        <Typography variant="h6">{playlist.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>{playlist.ownerEmail}</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Song List */}
                    <Box sx={{ flex: 1, maxHeight: 350, overflow: 'auto', bgcolor: '#fff', borderRadius: 1, p: 1 }}>
                        <List dense>
                            {playlist.songs.map((song, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    selected={index === currentSongIndex}
                                    onClick={() => handleSongClick(index)}
                                    sx={{
                                        bgcolor: index === currentSongIndex ? '#FFD700' : 'transparent',
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&:hover': { bgcolor: index === currentSongIndex ? '#FFD700' : '#f0f0f0' }
                                    }}
                                >
                                    <ListItemText
                                        primary={`${index + 1}. ${song.title}`}
                                        secondary={`${song.artist} (${song.year})`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* YouTube Player */}
                    <Box sx={{ flex: 1 }}>
                        <YouTube
                            videoId={currentSong.youTubeId}
                            opts={opts}
                            onReady={onPlayerReady}
                            onStateChange={onPlayerStateChange}
                        />

                        {/* Now Playing Info */}
                        <Box sx={{ textAlign: 'center', mt: 1, p: 1, bgcolor: '#fff', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Now Playing:
                            </Typography>
                            <Typography variant="body1">{currentSong.title}</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {currentSong.artist} ({currentSong.year})
                            </Typography>
                        </Box>

                        {/* Controls */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
                            <IconButton onClick={handlePrevious} sx={{ bgcolor: '#fff' }}>
                                <SkipPreviousIcon />
                            </IconButton>
                            <IconButton onClick={handlePlayPause} sx={{ bgcolor: '#fff', width: 50, height: 50 }}>
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={handleNext} sx={{ bgcolor: '#fff' }}>
                                <SkipNextIcon />
                            </IconButton>
                            <IconButton onClick={() => setRepeat(!repeat)} sx={{ bgcolor: repeat ? '#FFD700' : '#fff' }}>
                                <RepeatIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
