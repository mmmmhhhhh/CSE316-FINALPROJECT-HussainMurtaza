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
        if (auth.isGuest) {
            store.loadAllPlaylists();
        } else if (auth.loggedIn) {
            store.loadAllPlaylists();
        }
    }, [auth.isGuest, auth.loggedIn]);

    function handleCreateNewList() {
        store.createNewList();
    }

    let listCard = "";
    if (store && store.idNamePairs) {
        listCard = 
            <List sx={{width: '100%', bgcolor: 'background.paper', mb:"20px" }}>
            {
                store.idNamePairs.map((pair) => (
                    <PlaylistCard
                        key={pair._id}
                        idNamePair={pair}
                        selected={false}
                    />
                ))
            }
            </List>;
    }

    return (
        <div id="playlist-selector">
            <div id="list-selector-heading">
                {!auth.isGuest && auth.loggedIn && (
                    <Fab sx={{transform:"translate(-20%, 0%)"}}
                        color="primary" 
                        aria-label="add"
                        id="add-list-button"
                        onClick={handleCreateNewList}
                    >
                        <AddIcon />
                    </Fab>
                )}
                <Typography variant="h5" sx={{ marginLeft: (!auth.isGuest && auth.loggedIn) ? 0 : 2 }}>
                    {auth.isGuest ? "All Playlists (Guest)" : "Playlists"}
                </Typography>
            </div>
            
            {/* Search and Sort Bar */}
            <SearchSortBar />
            
            <Box sx={{bgcolor:"background.paper"}} id="list-selector-list">
                {store.idNamePairs && store.idNamePairs.length > 0 ? (
                    listCard
                ) : (
                    <Typography sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                        No playlists found
                    </Typography>
                )}
                <MUIDeleteModal />
            </Box>
        </div>
    )
}

export default HomeScreen;
