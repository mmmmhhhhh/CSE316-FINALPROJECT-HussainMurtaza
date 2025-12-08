import { useContext, useState } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

export default function SearchSortBar() {
    const { store } = useContext(GlobalStoreContext);
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('all');

    const handleSearchChange = (event) => {
        const text = event.target.value;
        setSearchText(text);
        store.searchPlaylists(text, viewMode);
    };

    const handleSortChange = (event) => {
        const sortOption = event.target.value;
        setSortBy(sortOption);
        store.sortPlaylists(sortOption);
    };

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewMode(newView);
            store.setViewMode(newView);
            setSearchText('');
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            mb: 2
        }}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewChange}
                size="small"
            >
                <ToggleButton value="home" title="My Playlists">
                    <HomeIcon />
                </ToggleButton>
                <ToggleButton value="all" title="All Playlists">
                    <GroupIcon />
                </ToggleButton>
                <ToggleButton value="user" title="Search by User">
                    <PersonIcon />
                </ToggleButton>
            </ToggleButtonGroup>

            {/* Search Field */}
            <TextField
                size="small"
                placeholder={viewMode === 'user' ? "Search by username..." : "Search playlists..."}
                value={searchText}
                onChange={handleSearchChange}
                sx={{ flex: 1, bgcolor: 'white' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Sort Dropdown */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange}
                    sx={{ bgcolor: 'white' }}
                >
                    <MenuItem value="name">Name (A-Z)</MenuItem>
                    <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                    <MenuItem value="date">Date (Newest)</MenuItem>
                    <MenuItem value="date-asc">Date (Oldest)</MenuItem>
                    <MenuItem value="owner">Owner (A-Z)</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
