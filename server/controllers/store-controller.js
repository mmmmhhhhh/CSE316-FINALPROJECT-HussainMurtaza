const dbManager = require('../db');
const auth = require('../auth');

/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/

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

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        const userId = user._id || user.id;
        
        console.log("user id: " + userId);
        console.log("req.userId: " + req.userId);
        
        if (userId == req.userId) {
            console.log("correct user!");
            await dbManager.deletePlaylist(req.params.id);
            return res.status(200).json({});
        } else {
            console.log("incorrect user!");
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
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await dbManager.findPlaylistById(req.params.id);
        
        if (!list) {
            return res.status(400).json({ 
                success: false, 
                error: 'Playlist not found' 
            });
        }
        
        console.log("Found list: " + JSON.stringify(list));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(list.ownerEmail);
        const userId = user._id || user.id;
        
        console.log("user id: " + userId);
        console.log("req.userId: " + req.userId);
        
        if (userId == req.userId) {
            console.log("correct user!");
            return res.status(200).json({ success: true, playlist: list });
        } else {
            console.log("incorrect user!");
            return res.status(400).json({ 
                success: false, 
                description: "authentication error" 
            });
        }
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
            console.log("!playlists.length");
            return res
                .status(404)
                .json({ success: false, error: 'Playlists not found' });
        }
        
        console.log("Send the Playlist pairs");
        // PUT ALL THE LISTS INTO ID, NAME PAIRS
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            let pair = {
                _id: list._id || list.id,
                name: list.name
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

getPlaylists = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }
    
    try {
        const playlists = await dbManager.getAllPlaylists();
        
        if (!playlists || playlists.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` });
        }
        
        return res.status(200).json({ success: true, data: playlists });
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
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }

    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            });
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        const userId = user._id || user.id;
        
        console.log("user id: " + userId);
        console.log("req.userId: " + req.userId);
        
        if (userId == req.userId) {
            console.log("correct user!");
            console.log("req.body.name: " + req.body.name);

            const updatedPlaylist = await dbManager.updatePlaylist(
                req.params.id,
                {
                    name: body.playlist.name,
                    songs: body.playlist.songs
                }
            );
            
            console.log("SUCCESS!!!");
            return res.status(200).json({
                success: true,
                id: updatedPlaylist._id || updatedPlaylist.id,
                message: 'Playlist updated!',
            });
        } else {
            console.log("incorrect user!");
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

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
};