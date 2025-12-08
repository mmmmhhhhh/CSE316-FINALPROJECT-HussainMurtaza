import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import YouTubePlayerModal from './YouTubePlayerModal';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [editActive, setEditActive] = useState(false);
    const [text, setText] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [playModalOpen, setPlayModalOpen] = useState(false);
    const [playlistData, setPlaylistData] = useState(null);
    const { idNamePair, selected } = props;

    function handleLoadList(event, id) {
        event.stopPropagation();
        if (!event.target.disabled) {
            if (auth.isGuest) {
                store.viewPlaylist(id);
            } else {
                store.setCurrentList(id);
            }
        }
    }

    function handleToggleEdit(event) {
        event.stopPropagation();
        if (!auth.isGuest) {
            toggleEdit();
        }
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsListNameEditActive();
        }
        setEditActive(newActive);
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        if (!auth.isGuest) {
            store.markListForDeletion(id);
        }
    }

    async function handlePlayClick(event) {
        event.stopPropagation();
        // Fetch full playlist data
        try {
            const response = await fetch(`http://localhost:4000/store/playlist/${idNamePair._id}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setPlaylistData(data.playlist);
                setPlayModalOpen(true);
            }
        } catch (error) {
            console.error("Error fetching playlist:", error);
        }
    }

    async function handleCopyClick(event) {
        event.stopPropagation();
        if (!auth.isGuest && auth.user) {
            try {
                const response = await fetch(`http://localhost:4000/store/playlist/${idNamePair._id}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    // Create a copy with new owner
                    const copyData = {
                        name: data.playlist.name + " (Copy)",
                        songs: data.playlist.songs,
                        ownerEmail: auth.user.email
                    };
                    const createResponse = await fetch('http://localhost:4000/store/playlist/', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(copyData)
                    });
                    if (createResponse.ok) {
                        store.loadIdNamePairs();
                    }
                }
            } catch (error) {
                console.error("Error copying playlist:", error);
            }
        }
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            let id = event.target.id.substring("list-".length);
            store.changeListName(id, text);
            toggleEdit();
        }
    }

    function handleUpdateText(event) {
        setText(event.target.value);
    }

    function handleExpand(event) {
        event.stopPropagation();
        setExpanded(!expanded);
    }

    const isOwner = auth.user && idNamePair.ownerEmail === auth.user.email;

    let cardElement =
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{
                marginTop: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                p: 2,
                bgcolor: '#fffff1',
                borderRadius: 2,
                boxShadow: 1
            }}
            style={{ width: '100%' }}
        >
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={(event) => handleLoadList(event, idNamePair._id)}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#8B5CF6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        {idNamePair.ownerEmail ? idNamePair.ownerEmail.charAt(0).toUpperCase() : 'P'}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {idNamePair.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {idNamePair.ownerEmail || 'Unknown Owner'}
                        </Typography>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Delete - only for owners */}
                    {!auth.isGuest && isOwner && (
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={(event) => handleDeleteList(event, idNamePair._id)}
                        >
                            Delete
                        </Button>
                    )}
                    
                    {/* Edit - only for owners */}
                    {!auth.isGuest && isOwner && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleToggleEdit}
                            sx={{ bgcolor: '#666' }}
                        >
                            Edit
                        </Button>
                    )}
                    
                    {/* Copy - for logged in users */}
                    {!auth.isGuest && auth.loggedIn && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleCopyClick}
                            sx={{ bgcolor: '#9C27B0' }}
                        >
                            Copy
                        </Button>
                    )}
                    
                    {/* Play - for everyone */}
                    <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={handlePlayClick}
                        startIcon={<PlayArrowIcon />}
                    >
                        Play
                    </Button>
                </Box>
            </Box>

            {/* YouTube Player Modal */}
            <YouTubePlayerModal
                open={playModalOpen}
                onClose={() => setPlayModalOpen(false)}
                playlist={playlistData}
            />
        </ListItem>

    if (editActive) {
        cardElement =
            <TextField
                margin="normal"
                required
                fullWidth
                id={"list-" + idNamePair._id}
                label="Playlist Name"
                name="name"
                autoComplete="Playlist Name"
                className='list-card'
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={idNamePair.name}
                inputProps={{ style: { fontSize: 48 } }}
                InputLabelProps={{ style: { fontSize: 24 } }}
                autoFocus
            />
    }

    return cardElement;
}

export default PlaylistCard;
