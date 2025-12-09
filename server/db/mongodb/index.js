const DatabaseManager = require('../DatabaseManager');
const mongoose = require('mongoose');

/**
 * MongoDBManager - MongoDB implementation using Mongoose ODM
 * All Mongoose-specific code is contained within this file
 */
class MongoDBManager extends DatabaseManager {
    constructor() {
        super();
        this.User = null;
        this.Playlist = null;
        this.connection = null;
    }

    /**
     * Initialize Mongoose models
     */
    initializeModels() {
        const Schema = mongoose.Schema;
        const ObjectId = Schema.Types.ObjectId;

        // User Schema
        const UserSchema = new Schema(
            {
                firstName: { type: String, required: true },
                lastName: { type: String, required: true },
                userName: { type: String, required: false, default: '' },
                email: { type: String, required: true },
                passwordHash: { type: String, required: true },
                avatar: { type: String, required: false, default: '' },
                playlists: [{ type: ObjectId, ref: 'Playlist' }]
            },
            { timestamps: true }
        );

        // Playlist Schema
        const PlaylistSchema = new Schema(
            {
                name: { type: String, required: true },
                ownerEmail: { type: String, required: true },
                songs: {
                    type: [{
                        title: String,
                        artist: String,
                        year: Number,
                        youTubeId: String
                    }],
                    required: true
                },
                listeners: { type: Number, required: false, default: 0 },
                listens: { type: Number, required: false, default: 0 }
            },
            { timestamps: true }
        );

        this.User = mongoose.model('User', UserSchema);
        this.Playlist = mongoose.model('Playlist', PlaylistSchema);
    }

    /**
     * Connect to MongoDB
     */
    async connect(connectionString) {
        try {
            await mongoose.connect(connectionString, { useNewUrlParser: true });
            this.connection = mongoose.connection;
            this.initializeModels();
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            throw error;
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }

    // ==================== USER OPERATIONS ====================

    async createUser(userData) {
        const newUser = new this.User(userData);
        const savedUser = await newUser.save();
        return savedUser;
    }

    async findUserById(userId) {
        const user = await this.User.findOne({ _id: userId });
        return user;
    }

    async findUserByEmail(email) {
        const user = await this.User.findOne({ email: email });
        return user;
    }

    async updateUser(userId, updateData) {
        const updatedUser = await this.User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );
        return updatedUser;
    }

    async deleteUser(userId) {
        await this.User.findByIdAndDelete(userId);
    }

    async addPlaylistToUser(userId, playlistId) {
        const user = await this.User.findOne({ _id: userId });
        user.playlists.push(playlistId);
        await user.save();
        return user;
    }

    async deleteAllUsers() {
        await this.User.deleteMany({});
    }

    // ==================== PLAYLIST OPERATIONS ====================

    async createPlaylist(playlistData) {
        const newPlaylist = new this.Playlist(playlistData);
        const savedPlaylist = await newPlaylist.save();
        return savedPlaylist;
    }

    async findPlaylistById(playlistId) {
        const playlist = await this.Playlist.findById({ _id: playlistId });
        return playlist;
    }

    async findPlaylistsByOwnerEmail(ownerEmail) {
        const playlists = await this.Playlist.find({ ownerEmail: ownerEmail });
        return playlists;
    }

    async getAllPlaylists() {
        const playlists = await this.Playlist.find({});
        return playlists;
    }

    async updatePlaylist(playlistId, updateData) {
        const playlist = await this.Playlist.findOne({ _id: playlistId });
        if (updateData.name !== undefined) {
            playlist.name = updateData.name;
        }
        if (updateData.songs !== undefined) {
            playlist.songs = updateData.songs;
        }
        if (updateData.listeners !== undefined) {
            playlist.listeners = updateData.listeners;
        }
        if (updateData.listens !== undefined) {
            playlist.listens = updateData.listens;
        }
        await playlist.save();
        return playlist;
    }

    async deletePlaylist(playlistId) {
        await this.Playlist.findOneAndDelete({ _id: playlistId });
    }

    async deleteAllPlaylists() {
        await this.Playlist.deleteMany({});
    }
}

module.exports = MongoDBManager;
