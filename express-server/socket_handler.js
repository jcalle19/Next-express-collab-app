/*files that will use these functions
-contexts/userState.jsx
-rooms/[id]/page.jsx
*/

//Has hostIds, canvas info, and userTokens
const roomMap = new Map();

//Has all user room for each token for easy lookup
const tokenMap = new Map();

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
        console.log('broadcasting');
        const roomInfo = {
            members: Array.from(roomMap.get(roomId).members),
            chat: roomMap.get(roomId).chat,
        }
        //might be being called twice, havl
        if (socket) {
            socket.emit('sync-with-server', roomInfo);
        }
        else {
            io.to(roomId).emit('sync-with-server', roomInfo);  
        }
    };

    io.on('connection', function (socket) {
        socket.on('create-room', (roomId, hostId) => {
            roomMap.set(roomId, {hostId: hostId, members: new Map(), chat: []});
            if (roomMap.get(roomId)) {
                socket.emit('confirm-room-creation', true, {roomId: roomId, hostId: hostId});  
            }
            else {
                socket.emit('confirm-room-creation', false, {roomId: '', hostId: ''});
            }
        });

        socket.on('user-joined', (userObj, roomToken) => {
            console.log(roomToken);
            if (!roomMap.get(userObj.roomId)) {
                socket.emit('confirm-room-join', false, userObj.roomId, '');
            } else {
                socket.join(userObj.roomId);
                tokenMap.set(roomToken, userObj.roomId);
                roomMap.get(userObj.roomId).members.set(roomToken, userObj);
                socket.emit('confirm-room-join', true, userObj.roomId, roomToken);
                console.log(`User ${userObj.user} joining room ${userObj.roomId}`);
                broadcastInfo(userObj.roomId, false);
                console.log('from user-joined');
            }
            
        });

        socket.on('user-left', (userObj) => {
            io.to(userObj.roomId).emit('remove-user', userObj);
        });
        
        socket.on('update-room', (userObj) => {
            io.to(userObj.roomId).emit('update-room', userObj);
        });

        socket.on('broadcast-msg', (userObj, msg) => {
            console.log(`received ${msg} from ${userObj.roomId}`);
            let messagesArray = roomMap.get(userObj.roomId).chat;
            messagesArray.push({key: randomId(), name: userObj.user, msg: msg});
            broadcastInfo(userObj.roomId, false);
            console.log('from broadcast-msg');
        });

        socket.on('request-sync', (roomId)=> {
            broadcastInfo(roomId, socket);
            console.log('from request-sync');
        }); 

        socket.on('check-token', (roomId, token) => {
            if (!roomMap.get(roomId).members.has(token)) {
                socket.leave(roomId);
                socket.emit('token-valid', false);
            }
            socket.emit('token-valid', true);
        });

        socket.on('clear-room', (room) => {
            socket.leave(room);
        });

        socket.on('request-user-info', (roomToken, roomId) => {
            try {
                let userInfo = roomMap.get(roomId).members.get(roomToken);
                if (userInfo && userInfo.roomId === roomId) {
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
    });
}

export default socket_functions;