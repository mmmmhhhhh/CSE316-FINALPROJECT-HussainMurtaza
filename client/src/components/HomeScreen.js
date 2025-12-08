import { useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import PlaylistCard from './PlaylistCard.js'
import MUIDeleteModal from './MUIDeleteModal'
import SearchSortBar from './SearchSortBar'
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab'
import List from '@mui/material/List';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.isGuest || auth.loggedIn) {
            store.loadAllPlaylists();
        }
    }, [auth.isGuest, auth.loggedIn]);

    function handleCreateNewList() {
        store.createNewList();
    }

    return (
        <Box sx={{ padding: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {!auth.isGuest && auth.loggedIn && (
                    <Fab
                        color="primary" 
                        aria-label="add"
                        size="medium"
                        onClick={handleCreateNewList}
                        sx={{ mr: 2 }}
                    >
                        <AddIcon />
                    </Fab>
                )}
                <Typography variant="h5">
                    {auth.isGuest ? "All Playlists (Guest)" : "Playlists"}
                </Typography>
            </Box>
            
            {/* Search and Sort Bar */}
            <SearchSortBar />
            
            {/* Playlist List */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                {store.idNamePairs && store.idNamePairs.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                        {store.idNamePairs.map((pair) => (
                            <PlaylistCard
                                key={pair._id}
                                idNamePair={pair}
                                selected={false}
                            />
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                        No playlists found
                    </Typography>
                )}
                <MUIDeleteModal />
            </Box>
        </Box>
    )
}

export default HomeScreen;
