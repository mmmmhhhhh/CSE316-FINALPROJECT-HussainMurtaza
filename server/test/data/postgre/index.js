const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const PostgreSQLManager = require('../../../db/postgresql');

async function resetPostgre() {
    const dbManager = new PostgreSQLManager();
    const testData = require("../example-db-data.json");
    
    console.log("Resetting the PostgreSQL DB");

    try {
        // Connect to database
        await dbManager.connect(
            process.env.PG_HOST,
            process.env.PG_DATABASE,
            process.env.PG_USER,
            process.env.PG_PASSWORD,
            process.env.PG_PORT
        );

        // Clear existing data (order matters due to foreign keys)
        await dbManager.deleteAllPlaylists();
        console.log("Playlists cleared");
        
        await dbManager.deleteAllUsers();
        console.log("Users cleared");

        // Fill users first
        for (let i = 0; i < testData.users.length; i++) {
            const user = await dbManager.createUser(testData.users[i]);
            console.log(`Created user: ${user.email}`);
        }
        console.log("Users filled");

        // Fill playlists
        for (let i = 0; i < testData.playlists.length; i++) {
            const playlist = await dbManager.createPlaylist(testData.playlists[i]);
            console.log(`Created playlist: ${playlist.name}`);
            
            // Add playlist to user
            const owner = await dbManager.findUserByEmail(playlist.ownerEmail);
            if (owner) {
                await dbManager.addPlaylistToUser(owner.id, playlist.id);
            }
        }
        console.log("Playlists filled");

        console.log("PostgreSQL DB reset complete!");
        await dbManager.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error resetting PostgreSQL DB:", error);
        process.exit(1);
    }
}

resetPostgre();