import {roomMap, util} from './util_functions.js';

const ROOM_TIMEOUT = 60 * 60 * 1000; // 1 hour

const socket_functions = (io) => {
    setInterval(() => {
        const now = Date.now();
        console.log(roomMap.entries());
        for (const [roomId, roomData] of roomMap.entries()) {
            console.log(roomId, now - roomMap.get(roomId).createdAt);
            if (now - roomData.createdAt >= ROOM_TIMEOUT) {

                // Perform your action:
                console.log(`Room ${roomId} has been open for 1 hour.`);

                // Example: notify host or auto-delete
                io.to(roomId).emit("room-closed");
                roomMap.delete(roomId);
            }
        }
    }, 60 * 1000); // check once per minute

    io.on('connection', function (socket) {
        socket.on('create-room', util.safe((roomId, hostId, roomOptions) => {
            util.createRoom(socket, roomId, hostId, roomOptions);
        }));

        socket.on('user-joined', util.safe((userObj, roomToken) => {
            util.userJoined(io, socket, userObj, roomToken);
        }));

        socket.on('user-left', util.safe((roomId, token) => {
            util.userLeft(io, roomId, token);
        }));
        
        socket.on('update-room', util.safe((userObj, token) => {
            util.updateRoom(io, userObj, token);
        }));

        socket.on('broadcast-msg', util.safe((userObj, msg) => {
            util.broadcastMsg(io, userObj, msg);
        }));

        socket.on('broadcast-note', util.safe((userObj, noteInfo) => {
            util.broadcastNote(io, userObj, noteInfo);
        }));

        socket.on('request-sync', util.safe((roomId)=> {
            util.broadcastInfo(io, roomId, socket, 'request-sync');
        })); 

        socket.on('draw-line', (roomId, strokeBatch)=> {
            socket.broadcast.to(roomId).emit('draw-from-server', strokeBatch);
        });

        socket.on('check-token', util.safe((roomId, token) => {
            util.checkToken(socket, roomId, token);
        }));

        socket.on('clear-room', (room) => {
            socket.leave(room);
        });

        socket.on('request-user-info', util.safe((roomToken, hostId, roomId, socketId) => {
            util.requestUserInfo(socket, roomToken, hostId, roomId, socketId);
        }));

        socket.on('kick-user', (socketId) => {
            io.to(socketId).emit('kick');
        });

        socket.on('toggle-drawing', util.safe((value, userSocket, roomId, token) => {
            util.toggleDrawing(io, value, userSocket, roomId, token);
        }));

        socket.on('toggle-chat', util.safe((value, userSocket, roomId, token) => {
            util.toggleChat(io, value, userSocket, roomId, token);
        }));

        socket.on('toggle-admin', util.safe((value, userSocket, roomId, hostToken) => {
            util.toggleAdmin(io, value, userSocket, roomId, hostToken);
        }));

        socket.on('edit-admins', util.safe((roomId, token, value) => {
            util.editAdmins(roomId, token, value);
        }));

        socket.on('update-options', util.safe((roomId, roomOptions, hostId)=> {
            util.updateOptions(io, roomId, roomOptions, hostId);
        }));

        socket.on('update-background', util.safe((roomId, background) => {
            util.updateBackground(io, roomId, background);
        }));

        socket.on('update-notes', util.safe((roomId, noteId, noteInfo) => {
            util.updateNotes(io, socket, roomId, noteId, noteInfo);
        }));

        socket.on('update-canvas', util.safe((roomId, roomToken, data) => {
            util.updateCanvas(socket, roomId, roomToken, data);
        }));

        socket.on('update-zoom', util.safe((roomId, zoom)=> {
            util.updateZoom(io, roomId, zoom);
        }));

        socket.on('delete-note', util.safe((roomId, noteId) => {
            util.deleteNote(io, roomId, noteId);
        }));
    });
}

export default socket_functions;