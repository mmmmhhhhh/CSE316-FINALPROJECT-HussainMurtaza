const express = require('express')
const StoreController = require('../controllers/store-controller')
const router = express.Router()
const auth = require('../auth')

// Protected routes (require login)
router.post('/playlist', auth.verify, StoreController.createPlaylist)
router.delete('/playlist/:id', auth.verify, StoreController.deletePlaylist)
router.put('/playlist/:id', auth.verify, StoreController.updatePlaylist)
router.get('/playlistpairs', auth.verify, StoreController.getPlaylistPairs)

// Public routes (guests can access)
router.get('/playlists', StoreController.getAllPlaylists)
router.get('/playlist/:id', StoreController.getPlaylistById)

module.exports = router
