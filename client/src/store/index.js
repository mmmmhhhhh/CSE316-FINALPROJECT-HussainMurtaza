import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {jsTPS} from "jstps"
import storeRequestSender from './requests'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction'
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction'
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction'
import AuthContext from '../auth'

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    EDIT_SONG: "EDIT_SONG",
    REMOVE_SONG: "REMOVE_SONG",
    HIDE_MODALS: "HIDE_MODALS",
    LOAD_ALL_PLAYLISTS: "LOAD_ALL_PLAYLISTS",
    SET_SEARCH_RESULTS: "SET_SEARCH_RESULTS"
}

const tps = new jsTPS();

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    ERROR : "ERROR"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        currentModal : CurrentModal.NONE,
        idNamePairs: [],
        allPlaylists: [],
        currentList: null,
        currentSongIndex : -1,
        currentSong : null,
        newListCounter: 0,
        listNameActive: false,
        listIdMarkedForDeletion: null,
        listMarkedForDeletion: null,
        viewMode: 'all',
        searchText: '',
        sortBy: 'name'
    });
    const history = useHistory();

    const { auth } = useContext(AuthContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.playlist
                });
            }
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null
                });
            }
            case GlobalStoreActionType.CREATE_NEW_LIST: {                
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    currentList: payload,
                    newListCounter: store.newListCounter + 1
                });
            }
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    idNamePairs: payload,
                    currentList: null
                });
            }
            case GlobalStoreActionType.LOAD_ALL_PLAYLISTS: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    idNamePairs: payload,
                    allPlaylists: payload,
                    currentList: null
                });
            }
            case GlobalStoreActionType.SET_SEARCH_RESULTS: {
                return setStore({
                    ...store,
                    idNamePairs: payload.results,
                    viewMode: payload.viewMode,
                    searchText: payload.searchText,
                    sortBy: payload.sortBy || store.sortBy
                });
            }
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.DELETE_LIST,
                    listIdMarkedForDeletion: payload.id,
                    listMarkedForDeletion: payload.playlist
                });
            }
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    currentList: payload
                });
            }
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    listNameActive: true
                });
            }
            case GlobalStoreActionType.EDIT_SONG: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.EDIT_SONG,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong
                });
            }
            case GlobalStoreActionType.REMOVE_SONG: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong
                });
            }
            case GlobalStoreActionType.HIDE_MODALS: {
                return setStore({
                    ...store,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1,
                    currentSong: null
                });
            }
            default:
                return store;
        }
    }

    // SEARCH PLAYLISTS
    store.searchPlaylists = function (searchText, viewMode) {
        let results = [...store.allPlaylists];
        
        if (searchText && searchText.trim() !== '') {
            const searchLower = searchText.toLowerCase();
            if (viewMode === 'user') {
                results = results.filter(p => 
                    p.ownerEmail && p.ownerEmail.toLowerCase().includes(searchLower)
                );
            } else {
                results = results.filter(p => 
                    p.name.toLowerCase().includes(searchLower)
                );
            }
        }

        // Apply current sort
        results = sortResults(results, store.sortBy);

        storeReducer({
            type: GlobalStoreActionType.SET_SEARCH_RESULTS,
            payload: { results, viewMode, searchText }
        });
    }

    // SORT PLAYLISTS
    store.sortPlaylists = function (sortBy) {
        let results = sortResults([...store.idNamePairs], sortBy);
        
        storeReducer({
            type: GlobalStoreActionType.SET_SEARCH_RESULTS,
            payload: { 
                results, 
                viewMode: store.viewMode, 
                searchText: store.searchText,
                sortBy 
            }
        });
    }

    function sortResults(results, sortBy) {
        switch (sortBy) {
            case 'name':
                return results.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return results.sort((a, b) => b.name.localeCompare(a.name));
            case 'date':
                return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'date-asc':
                return results.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            case 'owner':
                return results.sort((a, b) => (a.ownerEmail || '').localeCompare(b.ownerEmail || ''));
            default:
                return results;
        }
    }

    // SET VIEW MODE
    store.setViewMode = function (viewMode) {
        if (viewMode === 'home' && auth.loggedIn) {
            store.loadIdNamePairs();
        } else {
            store.loadAllPlaylists();
        }
    }

    store.changeListName = function (id, newName) {
        async function asyncChangeListName(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.success) {
                let playlist = response.playlist;
                playlist.name = newName;
                response = await storeRequestSender.updatePlaylistById(playlist._id, playlist);
                if (response.success) {
                    response = await storeRequestSender.getPlaylistPairs();
                    if (response.success) {
                        storeReducer({
                            type: GlobalStoreActionType.CHANGE_LIST_NAME,
                            payload: {
                                idNamePairs: response.idNamePairs,
                                playlist: playlist
                            }
                        });
                        store.setCurrentList(id);
                    }
                }
            }
        }
        asyncChangeListName(id);
    }

    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
        history.push("/");
    }

    store.createNewList = async function () {
        let newListName = "Untitled" + store.newListCounter;
        const response = await storeRequestSender.createPlaylist(newListName, [], auth.user.email);
        if (response.status === 201) {
            tps.clearAllTransactions();
            let newList = response.playlist;
            storeReducer({
                type: GlobalStoreActionType.CREATE_NEW_LIST,
                payload: newList
            });
            history.push("/playlist/" + newList._id);
        }
    }

    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await storeRequestSender.getPlaylistPairs();
            if (response.success) {
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: response.idNamePairs
                });
            }
        }
        asyncLoadIdNamePairs();
    }

    store.loadAllPlaylists = function () {
        async function asyncLoadAllPlaylists() {
            const response = await storeRequestSender.getAllPlaylists();
            if (response.success) {
                let playlistsArray = response.playlists.map(playlist => ({
                    _id: playlist._id,
                    name: playlist.name,
                    ownerEmail: playlist.ownerEmail,
                    createdAt: playlist.createdAt
                }));
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ALL_PLAYLISTS,
                    payload: playlistsArray
                });
            }
        }
        asyncLoadAllPlaylists();
    }

    store.markListForDeletion = function (id) {
        async function getListToDelete(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.success) {
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: {id: id, playlist: response.playlist}
                });
            }
        }
        getListToDelete(id);
    }

    store.deleteList = function (id) {
        async function processDelete(id) {
            await storeRequestSender.deletePlaylistById(id);
            store.loadIdNamePairs();
            history.push("/");
        }
        processDelete(id);
    }

    store.deleteMarkedList = function() {
        store.deleteList(store.listIdMarkedForDeletion);
        store.hideModals();
    }

    store.showEditSongModal = (songIndex, songToEdit) => {
        storeReducer({
            type: GlobalStoreActionType.EDIT_SONG,
            payload: {currentSongIndex: songIndex, currentSong: songToEdit}
        });        
    }

    store.hideModals = () => {
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }

    store.isDeleteListModalOpen = () => {
        return store.currentModal === CurrentModal.DELETE_LIST;
    }

    store.isEditSongModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_SONG;
    }

    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.success) {
                let playlist = response.playlist;
                response = await storeRequestSender.updatePlaylistById(playlist._id, playlist);
                if (response.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: playlist
                    });
                    history.push("/playlist/" + playlist._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }

    store.viewPlaylist = function (id) {
        async function asyncViewPlaylist(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: response.playlist
                });
                history.push("/playlist/" + response.playlist._id);
            }
        }
        asyncViewPlaylist(id);
    }

    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }

    store.addNewSong = () => {
        let playlistSize = store.getPlaylistSize();
        store.addCreateSongTransaction(
            playlistSize, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }

    store.createSong = function(index, song) {
        let list = store.currentList;      
        list.songs.splice(index, 0, song);
        store.updateCurrentList();
    }

    store.moveSong = function(start, end) {
        let list = store.currentList;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        store.updateCurrentList();
    }

    store.removeSong = function(index) {
        let list = store.currentList;      
        list.songs.splice(index, 1); 
        store.updateCurrentList();
    }

    store.updateSong = function(index, songData) {
        let list = store.currentList;
        let song = list.songs[index];
        song.title = songData.title;
        song.artist = songData.artist;
        song.year = songData.year;
        song.youTubeId = songData.youTubeId;
        store.updateCurrentList();
    }

    store.addCreateSongTransaction = (index, title, artist, year, youTubeId) => {
        let song = { title, artist, year, youTubeId };
        let transaction = new CreateSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }    

    store.addMoveSongTransaction = function (start, end) {
        let transaction = new MoveSong_Transaction(store, start, end);
        tps.processTransaction(transaction);
    }

    store.addRemoveSongTransaction = (song, index) => {
        let transaction = new RemoveSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }

    store.addUpdateSongTransaction = function (index, newSongData) {
        let song = store.currentList.songs[index];
        let oldSongData = {
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        };
        let transaction = new UpdateSong_Transaction(this, index, oldSongData, newSongData);        
        tps.processTransaction(transaction);
    }

    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await storeRequestSender.updatePlaylistById(store.currentList._id, store.currentList);
            if (response.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }

    store.undo = function () { tps.undoTransaction(); }
    store.redo = function () { tps.doTransaction(); }
    store.canAddNewSong = function() { return (store.currentList !== null); }
    store.canUndo = function() { return ((store.currentList !== null) && tps.hasTransactionToUndo()); }
    store.canRedo = function() { return ((store.currentList !== null) && tps.hasTransactionToDo()); }
    store.canClose = function() { return (store.currentList !== null); }

    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    function KeyPress(event) {
        if (!store.modalOpen && event.ctrlKey){
            if(event.key === 'z') store.undo();
            if(event.key === 'y') store.redo();
        }
    }
    document.onkeydown = (event) => KeyPress(event);

    return (
        <GlobalStoreContext.Provider value={{ store }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
