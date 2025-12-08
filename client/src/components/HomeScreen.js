import { useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import PlaylistCard from './PlaylistCard.js'
import MUIDeleteModal from './MUIDeleteModal'
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
            // Guest users see all playlists
            store.loadAllPlaylists();
        } else {
            // Logged in users see their playlists
            store.loadIdNamePairs();
        }
    }, [auth.isGuest]);

    function handleCreateNewList() {
        store.createNewList();
    }

    let listCard = "";
    if (store) {
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

    // Determine the heading text
    let headingText = auth.isGuest ? "All Playlists" : "Your Playlists";

    return (
        <div id="playlist-selector">
            <div id="list-selector-heading">
                {/* Only show Add button for logged-in users */}
                {!auth.isGuest && (
                    <Fab sx={{transform:"translate(-20%, 0%)"}}
                        color="primary" 
                        aria-label="add"
                        id="add-list-button"
                        onClick={handleCreateNewList}
                    >
                        <AddIcon />
                    </Fab>
                )}
                <Typography variant="h5" sx={{ marginLeft: auth.isGuest ? 2 : 0 }}>
                    {headingText}
                </Typography>
                {auth.isGuest && (
                    <Typography variant="body2" sx={{ marginLeft: 2, color: '#666' }}>
                        (Viewing as Guest - Login to create playlists)
                    </Typography>
                )}
            </div>
            <Box sx={{bgcolor:"background.paper"}} id="list-selector-list">
                {listCard}
                <MUIDeleteModal />
            </Box>
        </div>
    )
}

export default HomeScreen;
