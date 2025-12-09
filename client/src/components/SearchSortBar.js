import { useState, useContext, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchSortBar() {
    const { store } = useContext(GlobalStoreContext);
    
    // Search fields
    const [playlistName, setPlaylistName] = useState('');
    const [userName, setUserName] = useState('');
    const [songTitle, setSongTitle] = useState('');
    const [songArtist, setSongArtist] = useState('');
    const [songYear, setSongYear] = useState('');
    
    // Sort
    const [sortBy, setSortBy] = useState('name-asc');

    useEffect(() => {
        applyFilterAndSort();
    }, [sortBy]);

    const handleSearch = () => {
        applyFilterAndSort();
    };

    const handleClear = () => {
        setPlaylistName('');
        setUserName('');
        setSongTitle('');
        setSongArtist('');
        setSongYear('');
        
        // Reset to show all playlists
        if (store.allPlaylists) {
            store.setFilteredPlaylists(store.allPlaylists);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const applyFilterAndSort = () => {
        if (!store.allPlaylists) return;

        let filtered = [...store.allPlaylists];

        // Filter by playlist name
        if (playlistName.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(playlistName.toLowerCase())
            );
        }

        // Filter by user name (owner email)
        if (userName.trim()) {
            filtered = filtered.filter(p =>
                p.ownerEmail.toLowerCase().includes(userName.toLowerCase())
            );
        }

        // Filter by song title
        if (songTitle.trim()) {
            filtered = filtered.filter(p =>
                p.songs && p.songs.some(s =>
                    s.title.toLowerCase().includes(songTitle.toLowerCase())
                )
            );
        }

        // Filter by song artist
        if (songArtist.trim()) {
            filtered = filtered.filter(p =>
                p.songs && p.songs.some(s =>
                    s.artist.toLowerCase().includes(songArtist.toLowerCase())
                )
            );
        }

        // Filter by song year
        if (songYear.trim()) {
            filtered = filtered.filter(p =>
                p.songs && p.songs.some(s =>
                    s.year.toString().includes(songYear)
                )
            );
        }

        // Sort
        switch (sortBy) {
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'owner-asc':
                filtered.sort((a, b) => a.ownerEmail.localeCompare(b.ownerEmail));
                break;
            case 'owner-desc':
                filtered.sort((a, b) => b.ownerEmail.localeCompare(a.ownerEmail));
                break;
            case 'listeners-desc':
                filtered.sort((a, b) => (b.listeners || 0) - (a.listeners || 0));
                break;
            case 'listeners-asc':
                filtered.sort((a, b) => (a.listeners || 0) - (b.listeners || 0));
                break;
            default:
                break;
        }

        store.setFilteredPlaylists(filtered);
    };

    return (
        <Box sx={{ p: 2, bgcolor: '#e0e0e0', borderRadius: 1, mb: 2 }}>
            {/* Search Fields Row 1 */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    label="Playlist Name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ bgcolor: 'white', minWidth: 150, flex: 1 }}
                />
                <TextField
                    size="small"
                    label="User Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ bgcolor: 'white', minWidth: 150, flex: 1 }}
                />
                <TextField
                    size="small"
                    label="Song Title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ bgcolor: 'white', minWidth: 150, flex: 1 }}
                />
            </Box>

            {/* Search Fields Row 2 */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    label="Song Artist"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ bgcolor: 'white', minWidth: 150, flex: 1 }}
                />
                <TextField
                    size="small"
                    label="Song Year"
                    value={songYear}
                    onChange={(e) => setSongYear(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ bgcolor: 'white', minWidth: 100, flex: 0.5 }}
                />
                
                {/* Sort Dropdown */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                    >
                        <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                        <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                        <MenuItem value="owner-asc">Owner (A-Z)</MenuItem>
                        <MenuItem value="owner-desc">Owner (Z-A)</MenuItem>
                        <MenuItem value="listeners-desc">Listeners (Hi-Lo)</MenuItem>
                        <MenuItem value="listeners-asc">Listeners (Lo-Hi)</MenuItem>
                    </Select>
                </FormControl>

                {/* Buttons */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                >
                    Search
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                >
                    Clear
                </Button>
            </Box>
        </Box>
    );
}
