const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../db.sqlite');

const createConnection = () => {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        }
    });
};

const createTables = () => {
    return new Promise((resolve, reject) => {
        const connection = createConnection();
        connection.serialize(() => {
            connection.run(`
                CREATE TABLE IF NOT EXISTS chats (
                    id TEXT PRIMARY KEY,
                    secret_key TEXT,
                    pin TEXT
                );
            `, (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                    reject(err);
                    return;
                }
                connection.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    });
};

module.exports = { createConnection, createTables };
