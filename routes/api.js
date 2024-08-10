const express = require('express');
const router = express.Router();
const { createConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

router.get('/check-chat/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    try {
        const connection = await createConnection();
        connection.get('SELECT pin FROM chats WHERE id = ?', [roomId], (err, row) => {
            if (err) {
                console.error('Error querying database:', err.message);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'Chat not found' });
                return;
            }
            res.json({ pin: !!row.pin });
        });
        connection.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/create-chat', async (req, res) => {
    try {
        const { withPin } = req.body;
        const roomId = uuidv4();
        const secretKey = uuidv4();
        let pin = null;

        if (withPin) {
            pin = crypto.randomInt(1000, 10000).toString();
        }

        const connection = await createConnection();
        connection.run(
            'INSERT INTO chats (id, secret_key, pin) VALUES (?, ?, ?)',
            [roomId, secretKey, pin],
            (err) => {
                if (err) {
                    console.error('Error inserting into database:', err.message);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }
                res.json({ roomId, pin });
            }
        );
        connection.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
