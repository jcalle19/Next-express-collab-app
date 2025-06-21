/*files that will use these functions
-contexts/userState.jsx
-rooms/[id]/page.jsx
*/
const socket_functions = (io) => {
    io.on('connection', function (socket) {
        socket.on('user-joined', async (userObj) => {
            console.log(`User ${userObj.user} joining room ${userObj.roomId}`);
            socket.join(userObj.roomId);
            //io.to(userObj.roomId).emit('add-user', userObj);

            //get all sockets in room
            const socketIds = await io.in(userObj.roomId).allSockets();
            const firstSocketId = [...socketIds][0];

            //emit sync-request
            if (firstSocketId) {
                const firstSocket = io.sockets.sockets.get(firstSocketId);

                if (firstSocket) {
                    console.log(`syncing room ${userObj.roomId} with host`);
                    firstSocket.to(userObj.roomId).emit('add-user', userObj);
                    firstSocket.emit('sync-request', userObj); 
                }
            }
        })

        socket.on('user-left', (userObj) => {
            io.to(userObj.roomId).emit('remove-user', userObj);
        })
        
        socket.on('update-room', (userObj) => {
            io.to(userObj.roomId).emit('update-room', userObj);
        });

        socket.on('broadcast-msg', (userObj, msg) => {
            io.to(userObj.roomId).emit('new-msg', userObj, msg);
        });

        socket.on('clear-room', (room) => {
            socket.leave(room);
        });

        socket.on('sync-host-out', (roomId, roomUsersMap, chatHistory) => {
            //Send to every socket except self
            socket.to(roomId).emit('sync-host-in', roomUsersMap, chatHistory);
        });
    });
}

export default socket_functions;