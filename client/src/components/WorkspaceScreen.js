import { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import SongCard from './SongCard.js'
import MUIEditSongModal from './MUIEditSongModal'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
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

    return (
        <Box>
            <Box sx={{ p: 2, bgcolor: '#e0e0e0' }}>
                <Typography variant="h5">{store.currentList.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                    By: {store.currentList.ownerEmail}
                </Typography>
            </Box>

            <Box id="list-selector-list">
                <List 
                    id="playlist-cards" 
                    sx={{overflow: 'scroll', height: '70vh', width: '100%', bgcolor: '#8000F00F'}}
                >
                    {
                        store.currentList.songs.map((song, index) => (
                            <SongCard
                                id={'playlist-song-' + (index)}
                                key={'playlist-song-' + (index)}
                                index={index}
                                song={song}
                                canEdit={canEdit}
                            />
                        ))  
                    }
                </List>            
                { modalJSX }
            </Box>
        </Box>
    )
}

export default WorkspaceScreen;
