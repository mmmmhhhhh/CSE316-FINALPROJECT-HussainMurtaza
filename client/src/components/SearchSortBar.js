import { useContext, useState } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function SearchSortBar() {
    const { store } = useContext(GlobalStoreContext);
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const applyFilterAndSort = (text, sort) => {
        if (!store.allPlaylists || store.allPlaylists.length === 0) return;
        
        let results = [...store.allPlaylists];
        
        if (text && text.trim() !== '') {
            const searchLower = text.toLowerCase();
            results = results.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                (p.ownerEmail && p.ownerEmail.toLowerCase().includes(searchLower))
            );
        }
        
        switch (sort) {
            case 'name':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                results.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'owner':
                results.sort((a, b) => (a.ownerEmail || '').localeCompare(b.ownerEmail || ''));
                break;
            default:
                break;
        }
        
        store.setFilteredPlaylists(results);
    };

    const handleSearchChange = (event) => {
        event.stopPropagation();
        const text = event.target.value;
        setSearchText(text);
        applyFilterAndSort(text, sortBy);
    };

    const handleSortChange = (event) => {
        event.stopPropagation();
        const sort = event.target.value;
        setSortBy(sort);
        applyFilterAndSort(searchText, sort);
    };

    const handleClick = (event) => {
        event.stopPropagation();
    };

    return (
        <Box 
            onClick={handleClick}
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                padding: 2, 
                backgroundColor: '#e0e0e0',
                marginBottom: 2,
                borderRadius: 1,
                position: 'relative',
                zIndex: 10
            }}
        >
            <TextField
                label="Search playlists..."
                variant="outlined"
                size="small"
                value={searchText}
                onChange={handleSearchChange}
                onClick={handleClick}
                sx={{ flex: 1, backgroundColor: 'white' }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange}
                    onClick={handleClick}
                    sx={{ backgroundColor: 'white' }}
                >
                    <MenuItem value="name">Name (A-Z)</MenuItem>
                    <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                    <MenuItem value="owner">Owner (A-Z)</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
