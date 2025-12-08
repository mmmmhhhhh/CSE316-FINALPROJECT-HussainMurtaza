/**
 * Import Script for PlaylisterData.json
 * 
 * This script imports the professor's PlaylisterData into your MongoDB.
 * It transforms the data to match your schema:
 * - Splits "name" into "firstName" and "lastName"
 * - Adds a default password hash for all users (password: "aaaaaaaa")
 * - Ensures year is a number (some are strings in the data)
 * 
 * Run with: node test/data/mongo/importPlaylisterData.js
 */

const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const MongoDBManager = require('../../../db/mongodb');

// Default password hash for "aaaaaaaa" (bcrypt)
const DEFAULT_PASSWORD_HASH = "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu";

async function importPlaylisterData() {
    const dbManager = new MongoDBManager();
    const playlisterData = require("../PlaylisterData.json");
    
    console.log("===========================================");
    console.log("  Importing PlaylisterData into MongoDB");
    console.log("===========================================");
    console.log(`Found ${playlisterData.users.length} users`);
    console.log(`Found ${playlisterData.playlists.length} playlists`);
    console.log("");

    try {
        // Connect to database
        await dbManager.connect(process.env.DB_CONNECT);
        
        // Clear existing data
        console.log("Step 1: Clearing existing data...");
        await dbManager.deleteAllPlaylists();
        console.log("  ✓ Playlists cleared");
        
        await dbManager.deleteAllUsers();
        console.log("  ✓ Users cleared");
        console.log("");

        // Transform and import users
        console.log("Step 2: Importing users...");
        let usersCreated = 0;
        let userErrors = 0;

        for (let i = 0; i < playlisterData.users.length; i++) {
            const user = playlisterData.users[i];
            
            try {
                // Split name into firstName and lastName
                let firstName, lastName;
                
                if (user.name.includes(' ')) {
                    const parts = user.name.split(' ');
                    firstName = parts[0];
                    lastName = parts.slice(1).join(' ');
                } else {
                    const match = user.name.match(/^([A-Z][a-z]+)([A-Z].*)$/);
                    if (match) {
                        firstName = match[1];
                        lastName = match[2];
                    } else {
                        firstName = user.name;
                        lastName = "User";
                    }
                }

                const userData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email,
                    passwordHash: DEFAULT_PASSWORD_HASH,
                    playlists: []
                };

                await dbManager.createUser(userData);
                usersCreated++;
                
                if (usersCreated % 10 === 0) {
                    console.log(`  Created ${usersCreated} users...`);
                }
            } catch (error) {
                console.error(`  ✗ Error creating user ${user.email}: ${error.message}`);
                userErrors++;
            }
        }
        console.log(`  ✓ Created ${usersCreated} users (${userErrors} errors)`);
        console.log("");

        // Import playlists
        console.log("Step 3: Importing playlists...");
        let playlistsCreated = 0;
        let playlistErrors = 0;

        for (let i = 0; i < playlisterData.playlists.length; i++) {
            const playlist = playlisterData.playlists[i];
            
            try {
                const transformedSongs = playlist.songs.map(song => ({
                    title: song.title || "Unknown Title",
                    artist: song.artist || "Unknown Artist",
                    year: parseInt(song.year) || 2000,
                    youTubeId: song.youTubeId || ""
                }));

                const playlistData = {
                    name: playlist.name,
                    ownerEmail: playlist.ownerEmail,
                    songs: transformedSongs
                };

                await dbManager.createPlaylist(playlistData);
                playlistsCreated++;
                
                if (playlistsCreated % 50 === 0) {
                    console.log(`  Created ${playlistsCreated} playlists...`);
                }
            } catch (error) {
                console.error(`  ✗ Error creating playlist "${playlist.name}": ${error.message}`);
                playlistErrors++;
            }
        }
        console.log(`  ✓ Created ${playlistsCreated} playlists (${playlistErrors} errors)`);
        console.log("");

        console.log("===========================================");
        console.log("  Import Complete!");
        console.log("===========================================");
        console.log(`  Users: ${usersCreated} created, ${userErrors} errors`);
        console.log(`  Playlists: ${playlistsCreated} created, ${playlistErrors} errors`);
        console.log("");
        console.log("  All users have password: 'aaaaaaaa'");
        console.log("===========================================");

        process.exit(0);
    } catch (error) {
        console.error("Error importing data:", error);
        process.exit(1);
    }
}

importPlaylisterData();
