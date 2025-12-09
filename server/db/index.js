const dotenv = require('dotenv');
dotenv.config();

const databaseType = process.env.DATABASE_TYPE || 'mongodb';

let dbManager;

if (databaseType === 'mongodb') {
    const MongoDBManager = require('./mongodb');
    dbManager = new MongoDBManager();
    dbManager.connect(process.env.DB_CONNECT)
        .then(() => console.log('Using MongoDB database'))
        .catch(e => console.error('Database connection error:', e.message));
} else if (databaseType === 'postgresql') {
    const PostgreSQLManager = require('./postgresql');
    dbManager = new PostgreSQLManager();
    dbManager.connect(
        process.env.PG_HOST,
        process.env.PG_DATABASE,
        process.env.PG_USER,
        process.env.PG_PASSWORD,
        parseInt(process.env.PG_PORT)
    )
        .then(() => console.log('Using PostgreSQL database'))
        .catch(e => console.error('Database connection error:', e.message));
} else {
    throw new Error(`Unknown DATABASE_TYPE: ${databaseType}. Must be 'mongodb' or 'postgresql'`);
}

module.exports = dbManager;
