const BASE_URL = 'http://localhost:4000/store';

const fetchWithCredentials = async (url, options = {}) => {
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };
    const response = await fetch(url, config);
    return response.json();
};

export const createPlaylist = (newListName, newSongs, userEmail) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/`, {
        method: 'POST',
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    });
};

export const deletePlaylistById = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`, {
        method: 'DELETE'
    });
};

export const getPlaylistById = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`);
};

export const getPlaylistPairs = () => {
    return fetchWithCredentials(`${BASE_URL}/playlistpairs/`);
};

export const getAllPlaylists = () => {
    return fetchWithCredentials(`${BASE_URL}/playlists/`);
};

export const updatePlaylistById = (id, playlist) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            playlist: playlist
        })
    });
};

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    getAllPlaylists,
    updatePlaylistById
};

export default apis;
