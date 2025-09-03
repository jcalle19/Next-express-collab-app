/*files that will use these functions
-contexts/userState.jsx
-rooms/[id]/page.jsx
*/

//Has hostIds, canvas info, and userTokens
const roomMap = new Map();

//Has all user room for each token for easy lookup
const userMap = new Map();

const randomId = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

const socket_functions = (io) => {
    const broadcastInfo = (roomId, socket) => {
        const roomInfo = {
            members: Array.from(roomMap.get(roomId).members),
            chat: roomMap.get(roomId).chat,
            options: roomMap.get(roomId).options,
        }
        //might be being called twice, have to look further
        if (socket) {
            socket.emit('sync-with-server', roomInfo);
        }
        else {
            io.to(roomId).emit('sync-with-server', roomInfo);  
        }
    };

    io.on('connection', function (socket) {
        socket.on('create-room', (roomId, hostId, roomOptions) => {
            roomMap.set(roomId, {hostId: hostId, 
                                 options: roomOptions,
                                 admins: new Set(), 
                                 members: new Map(), 
                                 chat: [],
                                });
            if (roomMap.get(roomId)) {
                socket.emit('confirm-room-creation', true, {roomId: roomId, hostId: hostId});  
            }
            else {
                socket.emit('confirm-room-creation', false, {roomId: '', hostId: ''});
            }
        });

        socket.on('user-joined', (userObj, roomToken) => {
            if (!roomMap.get(userObj.roomId) || !roomMap.get(userObj.roomId).options.canJoin) {
                socket.emit('confirm-room-join', false, userObj.roomId, '');
            } else {
                socket.join(userObj.roomId);
                roomMap.get(userObj.roomId).members.set(roomToken, userObj);
                socket.emit('confirm-room-join', true, userObj.roomId, roomToken);
                console.log(`User ${userObj.user} joining room ${userObj.roomId}`);
                broadcastInfo(userObj.roomId, false);
            }
            
        });

        socket.on('user-left', (roomId, token) => {
            roomMap.get(roomId).members.delete(token);
            broadcastInfo(roomId, false);
        });
        
        socket.on('update-room', (userObj, token) => {
            roomMap.get(userObj.roomId).members.set(token, userObj);
            broadcastInfo(userObj.roomId, false);
        });

        socket.on('broadcast-msg', (userObj, msg) => {
            console.log(`received ${msg} from ${userObj.roomId}`);
            if (roomMap.get(userObj.roomId).options.canChat) {
                let messagesArray = roomMap.get(userObj.roomId).chat;
                messagesArray.push({key: randomId(), name: userObj.user, msg: msg});
                broadcastInfo(userObj.roomId, false);
            }
        });

        socket.on('request-sync', (roomId)=> {
            broadcastInfo(roomId, socket);
        }); 

        socket.on('check-token', (roomId, token) => {
            if (!roomMap.get(roomId).members.has(token)) {
                socket.leave(roomId);
                socket.emit('token-valid', false, '');
            } else {
                const roomInfo = {
                    members: Array.from(roomMap.get(roomId).members),
                    chat: roomMap.get(roomId).chat,
                    options: roomMap.get(roomId).options,
                }
                socket.emit('token-valid', true, roomInfo);
            }
            
        });

        socket.on('clear-room', (room) => {
            socket.leave(room);
        });

        socket.on('request-user-info', (roomToken, roomId, socketId) => {
            try {
                let userInfo = roomMap.get(roomId).members.get(roomToken);
                if (userInfo && userInfo.roomId === roomId) {
                    userInfo.socketId = socketId;
                    socket.join(roomId);
                    socket.emit('receive-user-info', true, userInfo);
                } else {
                    socket.emit('receive-user-info', false, 'error loading user info');
                }
            }
            catch (e) {
                socket.emit('receive-user-info', false, 'error loading user info');
            }
        });

        socket.on('kick-user', (socketId) => {
            io.to(socketId).emit('kick');
        });

        socket.on('toggle-drawing', (value, userSocket, roomId, token) => {
            if (roomMap.get(roomId).admins.has(token)) {
                io.to(userSocket).emit('update-drawing', value);
            }
        });

        socket.on('toggle-chat', (value, userSocket, roomId, token) => {
            if (roomMap.get(roomId).admins.has(token)) {
                io.to(userSocket).emit('update-chat', value);
            }
        });

        socket.on('toggle-admin', (value, userSocket, roomId, hostToken) => {
            if (roomMap.get(roomId).hostId === hostToken) {
                io.to(userSocket).emit('update-admin', value);
            }
        });

        socket.on('edit-admins', (roomId, token, value) => {
            if (value) {
                roomMap.get(roomId).admins.add(token);
            }
            else {
                roomMap.get(roomId).admins.delete(token);
            }
        });

        socket.on('update-options', (roomId, roomOptions, hostId)=> {
            const mapAccess = roomMap.get(roomId);
            if (mapAccess.hostId === hostId) {
                mapAccess.options = roomOptions;
                broadcastInfo(roomId, false);
            }
        });
    });
}

export default socket_functions;