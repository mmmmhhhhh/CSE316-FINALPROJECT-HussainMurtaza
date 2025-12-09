const dbManager = require('../db');
const auth = require('../auth');

createPlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        });
    }

    try {
        const playlist = await dbManager.createPlaylist(body);
        console.log("playlist: " + JSON.stringify(playlist));

        const user = await dbManager.findUserById(req.userId);
        console.log("user found: " + JSON.stringify(user));

        const playlistId = playlist._id || playlist.id;
        await dbManager.addPlaylistToUser(req.userId, playlistId);

        return res.status(201).json({
            playlist: playlist
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        });
    }
};

deletePlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    
    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            });
        }

        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        const userId = user._id || user.id;
        
        if (userId == req.userId) {
            await dbManager.deletePlaylist(req.params.id);
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({
                errorMessage: "authentication error"
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            errorMessage: 'Error deleting playlist'
        });
    }
};

getPlaylistById = async (req, res) => {
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await dbManager.findPlaylistById(req.params.id);
        
        if (!list) {
            return res.status(404).json({ 
                success: false, 
                error: 'Playlist not found' 
            });
        }
        
        console.log("Found list: " + JSON.stringify(list));
        return res.status(200).json({ success: true, playlist: list });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'Error retrieving playlist'
        });
    }
};

getPlaylistPairs = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    
    console.log("getPlaylistPairs");
    
    try {
        const user = await dbManager.findUserById(req.userId);
        console.log("find user with id " + req.userId);
        console.log("find all Playlists owned by " + user.email);
        
        const playlists = await dbManager.findPlaylistsByOwnerEmail(user.email);
        console.log("found Playlists: " + JSON.stringify(playlists));
        
        if (!playlists || playlists.length === 0) {
            return res.status(200).json({ success: true, idNamePairs: [] });
        }
        
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            let pair = {
                _id: list._id || list.id,
                name: list.name,
                ownerEmail: list.ownerEmail
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 
            success: false, 
            error: 'Error retrieving playlists' 
        });
    }
};

getAllPlaylists = async (req, res) => {
    console.log("getAllPlaylists - public access");
    
    try {
        const playlists = await dbManager.getAllPlaylists();
        
        if (!playlists || playlists.length === 0) {
            return res.status(200).json({ success: true, playlists: [] });
        }
        
        return res.status(200).json({ success: true, playlists: playlists });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 
            success: false, 
            error: 'Error retrieving playlists' 
        });
    }
};

updatePlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    
    const body = req.body;
    console.log("updatePlaylist: " + JSON.stringify(body));

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }

    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            });
        }

        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        const userId = user._id || user.id;
        
        if (userId == req.userId) {
            const updatedPlaylist = await dbManager.updatePlaylist(
                req.params.id,
                {
                    name: body.playlist.name,
                    songs: body.playlist.songs
                }
            );
            
            return res.status(200).json({
                success: true,
                id: updatedPlaylist._id || updatedPlaylist.id,
                message: 'Playlist updated!',
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                description: "authentication error" 
            });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'Playlist not updated!',
        });
    }
};

incrementListeners = async (req, res) => {
    console.log("incrementListeners for playlist: " + req.params.id);
    
    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: 'Playlist not found'
            });
        }

        const currentListenerCount = playlist.listenerCount || 0;
        const currentListenCount = playlist.listenCount || 0;
        
        const updatedPlaylist = await dbManager.updatePlaylist(
            req.params.id,
            {
                name: playlist.name,
                songs: playlist.songs,
                listenerCount: currentListenerCount + 1,
                listenCount: currentListenCount + 1
            }
        );

        return res.status(200).json({
            success: true,
            listenerCount: currentListenerCount + 1,
            listenCount: currentListenCount + 1
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'Error updating listeners'
        });
    }
};

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getAllPlaylists,
    updatePlaylist,
    incrementListeners
};
