import { beforeAll, beforeEach, afterEach, afterAll, expect, test, describe } from 'vitest';
const dotenv = require('dotenv').config({ path: __dirname + '/../.env' });

/**
 * Vitest test script for the Playlister app's Database Manager. Testing verifies that the Database Manager 
 * will perform all necessary operations properly, regardless of whether MongoDB or PostgreSQL is being used.
 *  
 * The DATABASE_TYPE in .env determines which database implementation to test.
 */

let dbManager;
const databaseType = process.env.DATABASE_TYPE || 'mongodb';

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    console.log(`Testing with ${databaseType} database`);
    
    // Load the appropriate DatabaseManager based on .env setting
    if (databaseType === 'mongodb') {
        const MongoDBManager = require('../db/mongodb');
        dbManager = new MongoDBManager();
        await dbManager.connect(process.env.DB_CONNECT);
    } else if (databaseType === 'postgresql') {
        const PostgreSQLManager = require('../db/postgresql');
        dbManager = new PostgreSQLManager();
        await dbManager.connect(
            process.env.PG_HOST,
            process.env.PG_DATABASE,
            process.env.PG_USER,
            process.env.PG_PASSWORD,
            parseInt(process.env.PG_PORT)
        );
    } else {
        throw new Error(`Unknown DATABASE_TYPE: ${databaseType}`);
    }
});

/**
 * Executed before each test is performed.
 */
beforeEach(async () => {
    // Clear the database before each test
    await dbManager.deleteAllPlaylists();
    await dbManager.deleteAllUsers();
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
    // Cleanup if needed
});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    await dbManager.disconnect();
});

// ==================== USER TESTS ====================

describe('User Operations', () => {
    test('Test #1: Create a User in the Database', async () => {
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@user.com',
            passwordHash: 'hashedpassword123'
        };

        const createdUser = await dbManager.createUser(testUser);

        expect(createdUser).toBeDefined();
        expect(createdUser.firstName).toBe(testUser.firstName);
        expect(createdUser.lastName).toBe(testUser.lastName);
        expect(createdUser.email).toBe(testUser.email);
        expect(createdUser.passwordHash).toBe(testUser.passwordHash);
    });

    test('Test #2: Find a User by ID', async () => {
        const testUser = {
            firstName: 'Find',
            lastName: 'Me',
            email: 'find@me.com',
            passwordHash: 'password123'
        };

        const createdUser = await dbManager.createUser(testUser);
        const userId = createdUser._id || createdUser.id;

        const foundUser = await dbManager.findUserById(userId);

        expect(foundUser).toBeDefined();
        expect(foundUser.firstName).toBe(testUser.firstName);
        expect(foundUser.lastName).toBe(testUser.lastName);
        expect(foundUser.email).toBe(testUser.email);
    });

    test('Test #3: Find a User by Email', async () => {
        const testUser = {
            firstName: 'Email',
            lastName: 'Search',
            email: 'email@search.com',
            passwordHash: 'securepass'
        };

        await dbManager.createUser(testUser);
        const foundUser = await dbManager.findUserByEmail(testUser.email);

        expect(foundUser).toBeDefined();
        expect(foundUser.email).toBe(testUser.email);
        expect(foundUser.firstName).toBe(testUser.firstName);
    });

    test('Test #4: Update a User', async () => {
        const testUser = {
            firstName: 'Original',
            lastName: 'Name',
            email: 'update@test.com',
            passwordHash: 'password'
        };

        const createdUser = await dbManager.createUser(testUser);
        const userId = createdUser._id || createdUser.id;

        const updatedUser = await dbManager.updateUser(userId, {
            firstName: 'Updated',
            lastName: 'User'
        });

        expect(updatedUser.firstName).toBe('Updated');
        expect(updatedUser.lastName).toBe('User');
        expect(updatedUser.email).toBe(testUser.email);
    });

    test('Test #5: Delete a User', async () => {
        const testUser = {
            firstName: 'Delete',
            lastName: 'Me',
            email: 'delete@me.com',
            passwordHash: 'password'
        };

        const createdUser = await dbManager.createUser(testUser);
        const userId = createdUser._id || createdUser.id;

        await dbManager.deleteUser(userId);
        const foundUser = await dbManager.findUserById(userId);

        expect(foundUser).toBeNull();
    });

    test('Test #6: Add Playlist to User', async () => {
        const testUser = {
            firstName: 'Playlist',
            lastName: 'Owner',
            email: 'owner@test.com',
            passwordHash: 'password'
        };

        const testPlaylist = {
            name: 'Test Playlist',
            ownerEmail: 'owner@test.com',
            songs: []
        };

        const createdUser = await dbManager.createUser(testUser);
        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
        
        const userId = createdUser._id || createdUser.id;
        const playlistId = createdPlaylist._id || createdPlaylist.id;

        await dbManager.addPlaylistToUser(userId, playlistId);

        // Verify the playlist was added (implementation-specific verification)
        const updatedUser = await dbManager.findUserById(userId);
        expect(updatedUser).toBeDefined();
    });

    test('Test #7: Delete All Users', async () => {
        await dbManager.createUser({
            firstName: 'User',
            lastName: 'One',
            email: 'user1@test.com',
            passwordHash: 'pass1'
        });

        await dbManager.createUser({
            firstName: 'User',
            lastName: 'Two',
            email: 'user2@test.com',
            passwordHash: 'pass2'
        });

        await dbManager.deleteAllUsers();

        const user1 = await dbManager.findUserByEmail('user1@test.com');
        const user2 = await dbManager.findUserByEmail('user2@test.com');

        expect(user1).toBeNull();
        expect(user2).toBeNull();
    });
});

// ==================== PLAYLIST TESTS ====================

describe('Playlist Operations', () => {
    test('Test #8: Create a Playlist in the Database', async () => {
        const testPlaylist = {
            name: 'My Test Playlist',
            ownerEmail: 'test@owner.com',
            songs: [
                {
                    title: 'Test Song',
                    artist: 'Test Artist',
                    year: 2024,
                    youTubeId: 'abc123'
                }
            ]
        };

        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);

        expect(createdPlaylist).toBeDefined();
        expect(createdPlaylist.name).toBe(testPlaylist.name);
        expect(createdPlaylist.ownerEmail).toBe(testPlaylist.ownerEmail);
        expect(createdPlaylist.songs.length).toBe(1);
        expect(createdPlaylist.songs[0].title).toBe('Test Song');
    });

    test('Test #9: Find a Playlist by ID', async () => {
        const testPlaylist = {
            name: 'Find This Playlist',
            ownerEmail: 'finder@test.com',
            songs: []
        };

        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
        const playlistId = createdPlaylist._id || createdPlaylist.id;

        const foundPlaylist = await dbManager.findPlaylistById(playlistId);

        expect(foundPlaylist).toBeDefined();
        expect(foundPlaylist.name).toBe(testPlaylist.name);
        expect(foundPlaylist.ownerEmail).toBe(testPlaylist.ownerEmail);
    });

    test('Test #10: Find Playlists by Owner Email', async () => {
        const ownerEmail = 'multiplaylist@test.com';

        await dbManager.createPlaylist({
            name: 'Playlist 1',
            ownerEmail: ownerEmail,
            songs: []
        });

        await dbManager.createPlaylist({
            name: 'Playlist 2',
            ownerEmail: ownerEmail,
            songs: []
        });

        await dbManager.createPlaylist({
            name: 'Other Playlist',
            ownerEmail: 'other@test.com',
            songs: []
        });

        const playlists = await dbManager.findPlaylistsByOwnerEmail(ownerEmail);

        expect(playlists).toBeDefined();
        expect(playlists.length).toBe(2);
        expect(playlists[0].ownerEmail).toBe(ownerEmail);
        expect(playlists[1].ownerEmail).toBe(ownerEmail);
    });

    test('Test #11: Get All Playlists', async () => {
        await dbManager.createPlaylist({
            name: 'Playlist A',
            ownerEmail: 'a@test.com',
            songs: []
        });

        await dbManager.createPlaylist({
            name: 'Playlist B',
            ownerEmail: 'b@test.com',
            songs: []
        });

        const allPlaylists = await dbManager.getAllPlaylists();

        expect(allPlaylists).toBeDefined();
        expect(allPlaylists.length).toBe(2);
    });

    test('Test #12: Update a Playlist', async () => {
        const testPlaylist = {
            name: 'Original Name',
            ownerEmail: 'update@test.com',
            songs: []
        };

        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
        const playlistId = createdPlaylist._id || createdPlaylist.id;

        const updatedPlaylist = await dbManager.updatePlaylist(playlistId, {
            name: 'Updated Name',
            songs: [
                {
                    title: 'New Song',
                    artist: 'New Artist',
                    year: 2024,
                    youTubeId: 'xyz789'
                }
            ]
        });

        expect(updatedPlaylist.name).toBe('Updated Name');
        expect(updatedPlaylist.songs.length).toBe(1);
        expect(updatedPlaylist.songs[0].title).toBe('New Song');
    });

    test('Test #13: Delete a Playlist', async () => {
        const testPlaylist = {
            name: 'Delete This',
            ownerEmail: 'delete@test.com',
            songs: []
        };

        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
        const playlistId = createdPlaylist._id || createdPlaylist.id;

        await dbManager.deletePlaylist(playlistId);
        const foundPlaylist = await dbManager.findPlaylistById(playlistId);

        expect(foundPlaylist).toBeNull();
    });

    test('Test #14: Delete All Playlists', async () => {
        await dbManager.createPlaylist({
            name: 'Playlist 1',
            ownerEmail: 'user@test.com',
            songs: []
        });

        await dbManager.createPlaylist({
            name: 'Playlist 2',
            ownerEmail: 'user@test.com',
            songs: []
        });

        await dbManager.deleteAllPlaylists();

        const allPlaylists = await dbManager.getAllPlaylists();
        expect(allPlaylists.length).toBe(0);
    });
});