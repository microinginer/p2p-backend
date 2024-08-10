let users = {};

const addUser = (roomId, user) => {
    if (!users[roomId]) {
        users[roomId] = [];
    }
    const userExists = users[roomId].some(existingUser => existingUser.userId === user.userId);
    if (!userExists) {
        users[roomId].push(user);
    }
};

const removeUser = (roomId, socketId) => {
    if (users[roomId]) {
        users[roomId] = users[roomId].filter(user => user.socketId !== socketId);
    }
};

const getUsers = (roomId) => {
    return users[roomId] || [];
};

const clearUsers = (roomId) => {
    delete users[roomId];
};

module.exports = { addUser, removeUser, getUsers, clearUsers };
