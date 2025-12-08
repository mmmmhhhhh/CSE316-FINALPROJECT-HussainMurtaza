import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [editActive, setEditActive] = useState(false);
    const [text, setText] = useState("");
    const { idNamePair, selected } = props;

    function handleLoadList(event, id) {
        console.log("handleLoadList for " + id);
        if (!event.target.disabled) {
            let _id = event.target.id;
            if (_id.indexOf('list-card-text-') >= 0)
                _id = ("" + _id).substring("list-card-text-".length);

            console.log("load " + event.target.id);

            // Use viewPlaylist for guests, setCurrentList for logged-in users
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
            let _id = event.target.id;
            _id = ("" + _id).substring("delete-list-".length);
            store.markListForDeletion(id);
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

    // Check if current user owns this playlist
    const isOwner = auth.user && idNamePair.ownerEmail === auth.user.email;

    let selectClass = "unselected-list-card";
    if (selected) {
        selectClass = "selected-list-card";
    }

    let cardStatus = false;
    if (store.isListNameEditActive) {
        cardStatus = true;
    }

    let cardElement =
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{
                marginTop: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                p: 1,
                bgcolor: '#fffff1',
                borderRadius: 2,
                boxShadow: 1
            }}
            style={{ width: '100%' }}
            button
            onClick={(event) => handleLoadList(event, idNamePair._id)}
        >
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                
                {/* Only show edit/delete for owners who are logged in */}
                {!auth.isGuest && isOwner && (
                    <Box>
                        <IconButton onClick={handleToggleEdit} aria-label='edit'>
                            <EditIcon style={{ fontSize: '24pt' }} />
                        </IconButton>
                        <IconButton onClick={(event) => handleDeleteList(event, idNamePair._id)} aria-label='delete'>
                            <DeleteIcon style={{ fontSize: '24pt' }} />
                        </IconButton>
                    </Box>
                )}
            </Box>
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

    return (
        cardElement
    );
}

export default PlaylistCard;
