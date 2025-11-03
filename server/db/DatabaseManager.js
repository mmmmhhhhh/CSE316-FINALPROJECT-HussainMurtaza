/**
 * DatabaseManager - Base class defining the interface for database operations.
 * This class should be extended by specific database implementations (MongoDB, PostgreSQL, etc.)
 * 
 * All database-specific code should be contained within the implementations, not in controllers.
 */

class DatabaseManager {
    constructor() {
        if (this.constructor === DatabaseManager) {
            throw new Error("DatabaseManager is an abstract class and cannot be instantiated directly");
        }
    }

    /**
     * Initialize and connect to the database
     * @returns {Promise<void>}
     */
    async connect() {
        throw new Error("Method 'connect()' must be implemented");
    }

    /**
     * Close the database connection
     * @returns {Promise<void>}
     */
    async disconnect() {
        throw new Error("Method 'disconnect()' must be implemented");
    }

    // ==================== USER OPERATIONS ====================

    /**
     * Create a new user
     * @param {Object} userData - User data (firstName, lastName, email, passwordHash)
     * @returns {Promise<Object>} Created user object
     */
    async createUser(userData) {
        throw new Error("Method 'createUser()' must be implemented");
    }

    /**
     * Find a user by ID
     * @param {String} userId - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findUserById(userId) {
        throw new Error("Method 'findUserById()' must be implemented");
    }

    /**
     * Find a user by email
     * @param {String} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    async findUserByEmail(email) {
        throw new Error("Method 'findUserByEmail()' must be implemented");
    }

    /**
     * Update a user
     * @param {String} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user object
     */
    async updateUser(userId, updateData) {
        throw new Error("Method 'updateUser()' must be implemented");
    }

    /**
     * Delete a user
     * @param {String} userId - User ID
     * @returns {Promise<void>}
     */
    async deleteUser(userId) {
        throw new Error("Method 'deleteUser()' must be implemented");
    }

    /**
     * Add a playlist to a user's playlist array
     * @param {String} userId - User ID
     * @param {String} playlistId - Playlist ID
     * @returns {Promise<Object>} Updated user object
     */
    async addPlaylistToUser(userId, playlistId) {
        throw new Error("Method 'addPlaylistToUser()' must be implemented");
    }

    /**
     * Delete all users (for testing/reset purposes)
     * @returns {Promise<void>}
     */
    async deleteAllUsers() {
        throw new Error("Method 'deleteAllUsers()' must be implemented");
    }

    // ==================== PLAYLIST OPERATIONS ====================

    /**
     * Create a new playlist
     * @param {Object} playlistData - Playlist data (name, ownerEmail, songs)
     * @returns {Promise<Object>} Created playlist object
     */
    async createPlaylist(playlistData) {
        throw new Error("Method 'createPlaylist()' must be implemented");
    }

    /**
     * Find a playlist by ID
     * @param {String} playlistId - Playlist ID
     * @returns {Promise<Object|null>} Playlist object or null
     */
    async findPlaylistById(playlistId) {
        throw new Error("Method 'findPlaylistById()' must be implemented");
    }

    /**
     * Find all playlists by owner email
     * @param {String} ownerEmail - Owner's email
     * @returns {Promise<Array>} Array of playlist objects
     */
    async findPlaylistsByOwnerEmail(ownerEmail) {
        throw new Error("Method 'findPlaylistsByOwnerEmail()' must be implemented");
    }

    /**
     * Get all playlists
     * @returns {Promise<Array>} Array of all playlist objects
     */
    async getAllPlaylists() {
        throw new Error("Method 'getAllPlaylists()' must be implemented");
    }

    /**
     * Update a playlist
     * @param {String} playlistId - Playlist ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated playlist object
     */
    async updatePlaylist(playlistId, updateData) {
        throw new Error("Method 'updatePlaylist()' must be implemented");
    }

    /**
     * Delete a playlist
     * @param {String} playlistId - Playlist ID
     * @returns {Promise<void>}
     */
    async deletePlaylist(playlistId) {
        throw new Error("Method 'deletePlaylist()' must be implemented");
    }

    /**
     * Delete all playlists (for testing/reset purposes)
     * @returns {Promise<void>}
     */
    async deleteAllPlaylists() {
        throw new Error("Method 'deleteAllPlaylists()' must be implemented");
    }
}

module.exports = DatabaseManager;