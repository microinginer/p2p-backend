const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const {createConnection, createTables} = require('./config/database');
const cors = require('cors');  // Import the cors middleware
const chatUtils = require('./utils/chat');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins (you can restrict this to specific origins if needed)
        methods: ["GET", "POST"]
    }
});


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRoutes);

io.on('connection', (socket) => {
    socket.on('join-room', async (roomId, userId, pin, username) => {
        const connection = await createConnection();

        const rows = await new Promise((resolve, reject) => {
            connection.all('SELECT secret_key, pin FROM chats WHERE id = ?', [roomId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        connection.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });


        if (rows.length === 0) {
            socket.emit('invalid-room');
            return;
        }

        const chat = rows[0];

        if (chat.pin && !pin) {
            socket.emit('require-pin');
            return;
        }

        if (chat.pin && chat.pin !== pin) {
            socket.emit('wrong-pin');
            return;
        }

        socket.join(roomId);
        socket.emit('chat-key', chat.secret_key);
        socket.to(roomId).emit('user-connected', {userId, username});

        chatUtils.addUser(roomId, {userId, username, socketId: socket.id});
        io.to(roomId).emit('update-users', chatUtils.getUsers(roomId).map(user => user.username || user.userId));

        socket.on('send-chat-message', (data) => {
            const {encryptedMessage, username} = data;
            socket.to(roomId).emit('chat-message', {encryptedMessage, username});
        });

        socket.on('disconnect', () => {
            chatUtils.removeUser(roomId, socket.id);
            io.to(roomId).emit('update-users', chatUtils.getUsers(roomId).map(user => user.username || user.userId));
            socket.to(roomId).emit('user-disconnected', userId);
        });

        // Обработка сигналов WebRTC
        socket.on('webrtc-offer', (data) => {
            socket.to(roomId).emit('webrtc-offer', data);
        });

        socket.on('webrtc-answer', (data) => {
            socket.to(roomId).emit('webrtc-answer', data);
        });

        socket.on('webrtc-candidate', (data) => {
            socket.to(roomId).emit('webrtc-candidate', data);
        });

        // Обработка уведомлений о начале и завершении трансляции видео
        socket.on('start-video', (data) => {
            socket.to(roomId).emit('start-video', data);
        });

        socket.on('stop-video', (data) => {
            socket.to(roomId).emit('stop-video', data);
        });
    });
});

createTables().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to create tables:", err);
    process.exit(1); // Exit the process if table creation fails
});
