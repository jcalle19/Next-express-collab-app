/*This file has all the socket event functions and util functions */

//Has hostIds, canvas info, and userTokens
export const roomMap = new Map();

const randomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const safe = (handler) => {
    return async (...args) => {
        try {
            await handler(...args);
        } catch (err) {
            console.error('Socket handler error:', err);
        }
    };
}

//this socket function is redundant and can be replaced simply by emitting 'sync-with-server'
const broadcastInfo = (io, roomId, socket, event) => {
    console.log(`broadcast source: ${roomId}, ${event}`);
    const roomInfo = {
        members: Array.from(roomMap.get(roomId).members),
        chat: roomMap.get(roomId).chat,
        notes: Array.from(roomMap.get(roomId).notes),
        options: roomMap.get(roomId).options,
        background: roomMap.get(roomId).background,
        canvases: Array.from(roomMap.get(roomId).canvases),
        zoom: roomMap.get(roomId).zoom,
    }
    //might be being called twice, have to look further
    if (socket) {
        socket.emit('sync-with-server', roomInfo);
    }
    else {
        io.to(roomId).emit('sync-with-server', roomInfo);  
    }
}

const createRoom = (socket, roomId, hostId, roomOptions) => {
    roomMap.set(roomId, {hostId: hostId, 
                                 createdAt: Date.now(),
                                 options: roomOptions,
                                 admins: new Set(), 
                                 members: new Map(), 
                                 canvases: new Map(), //for temporarily holding the canvas on refresh
                                 notes: new Map(),
                                 chat: [],
                                 background: '',
                                 zoom: 100,
                                });
    if (roomMap.get(roomId)) {
        socket.emit('confirm-room-creation', true, {roomId: roomId, hostId: hostId});  
    }
    else {
         socket.emit('confirm-room-creation', false, {roomId: '', hostId: ''});
    }
}

const userJoined = (io, socket, userObj, roomToken) => {
    if (!roomMap.get(userObj.roomId) || !roomMap.get(userObj.roomId).options.canJoin) {
        socket.emit('confirm-room-join', false, userObj.roomId, '');
    } else {
        socket.join(userObj.roomId);
        roomMap.get(userObj.roomId).members.set(roomToken, userObj);
        socket.emit('confirm-room-join', true, userObj.roomId, roomToken);
        console.log(`User ${userObj.user} joining room ${userObj.roomId}`);
        broadcastInfo(io, userObj.roomId, false, 'user-joined');
    }
}

const userLeft = (io, roomId, token) => {
    roomMap.get(roomId).members.delete(token);
    if (roomMap.get(roomId).members.size === 0) {
        io.to(roomId).emit("room-closed");
    } else {
        broadcastInfo(io, roomId, false, 'user-left');
    }
}

const updateRoom = (io, userObj, token) => {
    roomMap.get(userObj.roomId).members.set(token, userObj);
    broadcastInfo(io, userObj.roomId, false, 'update-room');
}

const broadcastMsg = (io, userObj, msg) => {
    console.log(`received ${msg} from ${userObj.roomId}`);
    if (roomMap.get(userObj.roomId).options.canChat || userObj.isHost) {
        let messagesArray = roomMap.get(userObj.roomId).chat;
        messagesArray.push({key: randomId(), id: userObj.id, name: userObj.user, msg: msg});
        broadcastInfo(io, userObj.roomId, false, 'broadcast-msg');
    }
}

const broadcastNote = (io, userObj, noteInfo) => {
    console.log(`received ${noteInfo} from ${userObj.user}`);
    if (roomMap.get(userObj.roomId).options.canChat || userObj.isHost) {
        roomMap.get(userObj.roomId).notes.set(randomId(), noteInfo);
        broadcastInfo(io, userObj.roomId, false, 'broadcast-note');
    }
}

const checkToken = (socket, roomId, token) => {
    if (!roomMap.get(roomId).members.has(token)) {
        socket.leave(roomId);
        socket.emit('token-valid', false, '');
    } else {
        //can probably replace with broadcast info
        const roomInfo = {
            members: Array.from(roomMap.get(roomId).members),
            chat: roomMap.get(roomId).chat,
            notes: Array.from(roomMap.get(roomId).notes),
            options: roomMap.get(roomId).options,
            background: roomMap.get(roomId).background,
            canvases: Array.from(roomMap.get(roomId).canvases),
            zoom: roomMap.get(roomId).zoom,
        }
    socket.emit('token-valid', true, roomInfo);
    }
}

const requestUserInfo = (socket, roomToken, hostId, roomId, socketId) => {
    if (roomMap.has(roomId)) {
        let userInfo = roomMap.get(roomId).members.get(roomToken);
        if (userInfo && userInfo.roomId === roomId) {
            if (hostId === roomMap.get(roomId).hostId) userInfo.isHost = true;
            userInfo.socketId = socketId;
            socket.join(roomId);
            socket.emit('receive-user-info', true, userInfo);
        } else {
            socket.emit('receive-user-info', false, 'error loading user info');
        }
    }
    else {
        socket.emit('receive-user-info', false, 'error: room does not exist');
    }
    
}

const toggleDrawing = (io, value, userSocket, roomId, token) => {
    if (roomMap.get(roomId).admins.has(token)) {
        io.to(userSocket).emit('update-drawing', value);
    }
}

const toggleChat = (io, value, userSocket, roomId, token) => {
    if (roomMap.get(roomId).admins.has(token)) {
        io.to(userSocket).emit('update-chat', value);
    }
}

const toggleAdmin = (io, value, userSocket, roomId, hostToken) => {
    if (roomMap.get(roomId).hostId === hostToken) {
        io.to(userSocket).emit('update-admin', value);
    }
}

const editAdmins = (roomId, token, value) => {
    if (value) {
        roomMap.get(roomId).admins.add(token);
    }
    else {
        roomMap.get(roomId).admins.delete(token);
    }   
}
const updateOptions = (io, roomId, roomOptions, hostId) => {
     const mapAccess = roomMap.get(roomId);
    if (mapAccess.hostId === hostId) {
        mapAccess.options = roomOptions;
        broadcastInfo(io, roomId, false, 'update-options');
    }
}

const updateBackground = (io, roomId, background) =>{
    roomMap.get(roomId).background = background;
    broadcastInfo(io, roomId, false, 'update-background');
}

const updateNotes = (io, socket, roomId, noteId, noteInfo) => {
    roomMap.get(roomId).notes.set(noteId, noteInfo);
    broadcastInfo(io, roomId, socket, 'update-notes');
}

const updateCanvas = (socket, roomId, roomToken, data) => {
    if (!roomMap.get(roomId).members.has(roomToken)) {
        socket.leave(roomId);
        socket.emit('token-valid', false, '');
    } else {
        const canvasAccess = roomMap.get(roomId).canvases;
        canvasAccess.set(roomToken, data);
    }
}

const updateZoom = (io, roomId, zoom) => {
    roomMap.get(roomId).zoom = zoom;
    broadcastInfo(io, roomId, false, 'update-zoom');
}

const deleteNote = (io, roomId, noteId) => {
    roomMap.get(roomId).notes.delete(noteId);
    broadcastInfo(io, roomId, false, 'update-notes');
}

export const util = {
    safe,
    broadcastInfo,
    createRoom,
    userJoined,
    userLeft,
    updateRoom,
    broadcastMsg,
    broadcastNote,
    checkToken,
    requestUserInfo,
    toggleDrawing,
    toggleChat,
    toggleAdmin,
    editAdmins,
    updateOptions,
    updateBackground,
    updateNotes,
    updateCanvas,
    updateZoom,
    deleteNote,
}

