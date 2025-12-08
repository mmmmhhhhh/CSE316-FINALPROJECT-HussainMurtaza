import { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import SongCard from './SongCard.js'
import MUIEditSongModal from './MUIEditSongModal'
import EditToolbar from './EditToolbar'
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
        <Box>
            {/* Playlist Header */}
            <Box sx={{ p: 2, bgcolor: '#e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5">{store.currentList.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        By: {store.currentList.ownerEmail}
                    </Typography>
                </Box>
                
                {/* Edit Toolbar - only show for owners */}
                {canEdit && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddSong}
                        >
                            Add Song
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<UndoIcon />}
                            onClick={handleUndo}
                            disabled={!store.canUndo()}
                        >
                            Undo
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<RedoIcon />}
                            onClick={handleRedo}
                            disabled={!store.canRedo()}
                        >
                            Redo
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    </Box>
                )}

                {/* Close button for non-owners/guests */}
                {!canEdit && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={handleClose}
                    >
                        Close
                    </Button>
                )}
            </Box>

            {/* Songs List */}
            <Box id="list-selector-list">
                <List 
                    id="playlist-cards" 
                    sx={{overflow: 'scroll', height: '70vh', width: '100%', bgcolor: '#8000F00F'}}
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
                { modalJSX }
            </Box>
        </Box>
    )
}

export default WorkspaceScreen;
