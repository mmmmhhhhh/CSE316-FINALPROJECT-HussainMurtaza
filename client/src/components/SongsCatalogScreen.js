import { useContext, useState, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function SongsCatalogScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [songs, setSongs] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newSong, setNewSong] = useState({ title: '', artist: '', year: '', youTubeId: '' });

    // Load all songs from all playlists
    useEffect(() => {
        loadAllSongs();
    }, []);

    const loadAllSongs = async () => {
        try {
            const response = await fetch('http://localhost:4000/store/playlists', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                // Extract all unique songs from all playlists
                const allSongs = [];
                const songMap = new Map();
                
                data.playlists.forEach(playlist => {
                    if (playlist.songs) {
                        playlist.songs.forEach(song => {
                            const key = `${song.title}-${song.artist}-${song.year}`;
                            if (!songMap.has(key)) {
                                songMap.set(key, {
                                    ...song,
                                    playlistCount: 1,
                                    playlists: [playlist.name]
                                });
                            } else {
                                const existing = songMap.get(key);
                                existing.playlistCount++;
                                existing.playlists.push(playlist.name);
                            }
                        });
                    }
                });
                
                setSongs(Array.from(songMap.values()));
                setFilteredSongs(Array.from(songMap.values()));
            }
        } catch (error) {
            console.error("Error loading songs:", error);
        }
    };

    const handleSearch = (e) => {
        const text = e.target.value.toLowerCase();
        setSearchText(text);
        
        if (text === '') {
            setFilteredSongs(songs);
        } else {
            const filtered = songs.filter(song =>
                song.title.toLowerCase().includes(text) ||
                song.artist.toLowerCase().includes(text) ||
                song.year.toString().includes(text)
            );
            setFilteredSongs(filtered);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewSong({ title: '', artist: '', year: '', youTubeId: '' });
    };

    const handleAddSong = () => {
        // Add the song to the catalog (in this case, we'll just add to local state)
        const song = {
            ...newSong,
            year: parseInt(newSong.year),
            playlistCount: 0,
            playlists: []
        };
        setSongs([...songs, song]);
        setFilteredSongs([...filteredSongs, song]);
        handleCloseDialog();
    };

    const handlePlaySong = (youTubeId) => {
        window.open(`https://www.youtube.com/watch?v=${youTubeId}`, '_blank');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Songs Catalog</Typography>
                {auth.loggedIn && !auth.isGuest && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        New Song
                    </Button>
                )}
            </Box>

            {/* Search */}
            <TextField
                fullWidth
                label="Search songs by title, artist, or year..."
                value={searchText}
                onChange={handleSearch}
                sx={{ mb: 3, bgcolor: 'white' }}
            />

            {/* Songs List */}
            <List sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
                {filteredSongs.length === 0 ? (
                    <Typography sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                        No songs found
                    </Typography>
                ) : (
                    filteredSongs.map((song, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                bgcolor: 'white',
                                mb: 1,
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                        >
                            <ListItemText
                                primary={`${song.title} (${song.year})`}
                                secondary={`By ${song.artist} • In ${song.playlistCount} playlist(s)`}
                            />
                            <Box>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => handlePlaySong(song.youTubeId)}
                                >
                                    Play
                                </Button>
                            </Box>
                        </ListItem>
                    ))
                )}
            </List>

            {/* Add Song Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Add New Song to Catalog</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={newSong.title}
                        onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Artist"
                        value={newSong.artist}
                        onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={newSong.year}
                        onChange={(e) => setNewSong({ ...newSong, year: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="YouTube ID"
                        value={newSong.youTubeId}
                        onChange={(e) => setNewSong({ ...newSong, youTubeId: e.target.value })}
                        helperText="The ID from a YouTube URL (e.g., dQw4w9WgXcQ)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleAddSong}
                        variant="contained"
                        disabled={!newSong.title || !newSong.artist || !newSong.year || !newSong.youTubeId}
                    >
                        Add Song
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
