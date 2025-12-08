import { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import SongCard from './SongCard.js'
import MUIEditSongModal from './MUIEditSongModal'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CloseIcon from '@mui/icons-material/Close';
import { GlobalStoreContext } from '../store/index.js'
import AuthContext from '../auth'

function WorkspaceScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    store.history = useHistory();
    
    if (!store.currentList) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Typography variant="h5">Loading playlist...</Typography>
            </Box>
        );
    }

    let modalJSX = "";
    if (store.isEditSongModalOpen()) {
        modalJSX = <MUIEditSongModal />;
    }

    const isOwner = auth.user && store.currentList.ownerEmail === auth.user.email;
    const canEdit = !auth.isGuest && isOwner;

    function handleAddSong() {
        store.addNewSong();
    }

    function handleUndo() {
        store.undo();
    }

    function handleRedo() {
        store.redo();
    }

    function handleClose() {
        store.closeCurrentList();
    }

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Playlist Header with Title */}
            <Box sx={{ 
                p: 2, 
                bgcolor: '#e0e0e0', 
                borderBottom: '1px solid #ccc',
                flexShrink: 0
            }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {store.currentList.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    By: {store.currentList.ownerEmail}
                </Typography>
            </Box>

            {/* Toolbar Row */}
            <Box sx={{ 
                p: 1, 
                bgcolor: '#d0d0d0', 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: 1,
                flexShrink: 0
            }}>
                {canEdit && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddSong}
                        >
                            Add Song
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            startIcon={<UndoIcon />}
                            onClick={handleUndo}
                            disabled={!store.canUndo()}
                        >
                            Undo
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            startIcon={<RedoIcon />}
                            onClick={handleRedo}
                            disabled={!store.canRedo()}
                        >
                            Redo
                        </Button>
                    </>
                )}
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={handleClose}
                >
                    Close
                </Button>
            </Box>

            {/* Songs List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List 
                    id="playlist-cards" 
                    sx={{ width: '100%', bgcolor: '#8000F00F', minHeight: '100%' }}
                >
                    {store.currentList.songs.length === 0 ? (
                        <Typography sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                            No songs in this playlist. {canEdit && "Click 'Add Song' to add one!"}
                        </Typography>
                    ) : (
                        store.currentList.songs.map((song, index) => (
                            <SongCard
                                id={'playlist-song-' + (index)}
                                key={'playlist-song-' + (index)}
                                index={index}
                                song={song}
                                canEdit={canEdit}
                            />
                        ))
                    )}
                </List>            
            </Box>
            
            { modalJSX }
        </Box>
    )
}

export default WorkspaceScreen;
