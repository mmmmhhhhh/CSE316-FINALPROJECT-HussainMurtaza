import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:4000',
    withCredentials: true
})

// Auth requests
const getLoggedIn = () => api.get('/auth/loggedIn');
const register = (firstName, lastName, userName, email, password, passwordVerify) => {
    return api.post('/auth/register', {
        firstName,
        lastName,
        userName,
        email,
        password,
        passwordVerify
    });
}
const login = (email, password) => api.post('/auth/login', { email, password });
const logout = () => api.get('/auth/logout');

// Playlist requests
const createPlaylist = (name, songs, ownerEmail) => {
    return api.post('/store/playlist', { name, songs, ownerEmail })
        .then(response => ({ status: response.status, playlist: response.data.playlist }))
        .catch(err => ({ status: err.response?.status || 500 }));
}
const deletePlaylistById = (id) => api.delete(`/store/playlist/${id}`);
const getPlaylistById = (id) => {
    return api.get(`/store/playlist/${id}`)
        .then(response => ({ success: true, playlist: response.data.playlist }))
        .catch(err => ({ success: false }));
}
const getPlaylistPairs = () => {
    return api.get('/store/playlistpairs')
        .then(response => ({ success: true, idNamePairs: response.data.idNamePairs }))
        .catch(err => ({ success: false }));
}
const getAllPlaylists = () => {
    return api.get('/store/playlists')
        .then(response => ({ success: true, playlists: response.data.playlists }))
        .catch(err => ({ success: false }));
}
const updatePlaylistById = (id, playlist) => {
    return api.put(`/store/playlist/${id}`, { playlist })
        .then(response => ({ success: true, playlist: response.data.playlist }))
        .catch(err => ({ success: false }));
}

const storeRequestSender = {
    getLoggedIn,
    register,
    login,
    logout,
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    getAllPlaylists,
    updatePlaylistById
}

export default storeRequestSender;
