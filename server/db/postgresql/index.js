const DatabaseManager = require('../DatabaseManager');
const { Sequelize, DataTypes } = require('sequelize');

/**
 * PostgreSQLManager - PostgreSQL implementation using Sequelize ORM
 * All Sequelize-specific code is contained within this file
 */
class PostgreSQLManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = null;
        this.User = null;
        this.Playlist = null;
    }

    /**
     * Initialize Sequelize models
     */
    initializeModels() {
        // User Model
        this.User = this.sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            tableName: 'users',
            timestamps: true
        });

        // Playlist Model
        this.Playlist = this.sequelize.define('Playlist', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ownerEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            songs: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: []
            }
        }, {
            tableName: 'playlists',
            timestamps: true
        });

        // UserPlaylist junction table for many-to-many relationship
        this.UserPlaylist = this.sequelize.define('UserPlaylist', {
            userId: {
                type: DataTypes.INTEGER,
                references: {
                    model: this.User,
                    key: 'id'
                }
            },
            playlistId: {
                type: DataTypes.INTEGER,
                references: {
                    model: this.Playlist,
                    key: 'id'
                }
            }
        }, {
            tableName: 'user_playlists',
            timestamps: false
        });

        // Define associations
        this.User.belongsToMany(this.Playlist, { through: this.UserPlaylist, foreignKey: 'userId' });
        this.Playlist.belongsToMany(this.User, { through: this.UserPlaylist, foreignKey: 'playlistId' });
    }

    /**
     * Connect to PostgreSQL
     */
    async connect(host, database, username, password, port = 5432) {
        try {
            this.sequelize = new Sequelize(database, username, password, {
                host: host,
                port: port,
                dialect: 'postgres',
                logging: false
            });

            await this.sequelize.authenticate();
            this.initializeModels();
            await this.sequelize.sync();
            console.log('PostgreSQL connected successfully');
        } catch (error) {
            console.error('PostgreSQL connection error:', error.message);
            throw error;
        }
    }

    /**
     * Disconnect from PostgreSQL
     */
    async disconnect() {
        await this.sequelize.close();
        console.log('PostgreSQL disconnected');
    }

    // ==================== USER OPERATIONS ====================

    async createUser(userData) {
        const newUser = await this.User.create(userData);
        return newUser.toJSON();
    }

    async findUserById(userId) {
        const user = await this.User.findByPk(userId);
        return user ? user.toJSON() : null;
    }

    async findUserByEmail(email) {
        const user = await this.User.findOne({ where: { email: email } });
        return user ? user.toJSON() : null;
    }

    async updateUser(userId, updateData) {
        await this.User.update(updateData, { where: { id: userId } });
        const updatedUser = await this.User.findByPk(userId);
        return updatedUser.toJSON();
    }

    async deleteUser(userId) {
        await this.User.destroy({ where: { id: userId } });
    }

    async addPlaylistToUser(userId, playlistId) {
        await this.UserPlaylist.create({
            userId: userId,
            playlistId: playlistId
        });
        const user = await this.User.findByPk(userId, {
            include: this.Playlist
        });
        return user.toJSON();
    }

    async deleteAllUsers() {
        await this.User.destroy({ where: {}, truncate: true });
    }

    // ==================== PLAYLIST OPERATIONS ====================

    async createPlaylist(playlistData) {
        const newPlaylist = await this.Playlist.create(playlistData);
        return newPlaylist.toJSON();
    }

    async findPlaylistById(playlistId) {
        const playlist = await this.Playlist.findByPk(playlistId);
        return playlist ? playlist.toJSON() : null;
    }

    async findPlaylistsByOwnerEmail(ownerEmail) {
        const playlists = await this.Playlist.findAll({
            where: { ownerEmail: ownerEmail }
        });
        return playlists.map(p => p.toJSON());
    }

    async getAllPlaylists() {
        const playlists = await this.Playlist.findAll();
        return playlists.map(p => p.toJSON());
    }

    async updatePlaylist(playlistId, updateData) {
        await this.Playlist.update(updateData, { where: { id: playlistId } });
        const updatedPlaylist = await this.Playlist.findByPk(playlistId);
        return updatedPlaylist.toJSON();
    }

    async deletePlaylist(playlistId) {
        await this.Playlist.destroy({ where: { id: playlistId } });
    }

    async deleteAllPlaylists() {
        await this.Playlist.destroy({ where: {}, truncate: true });
    }
}

module.exports = PostgreSQLManager;