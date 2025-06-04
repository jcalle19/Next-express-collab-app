/*files that will use these functions
-contexts/userState.jsx
-rooms/[id]/page.jsx
*/
const socket_functions = (io) => {
    io.on('connection', function (socket) {
        socket.on('user-joined', (userObj) => {
            console.log(`User ${userObj.user} joining room ${userObj.roomId}`);
            socket.join(userObj.roomId);
            io.to(userObj.roomId).emit('add-user', userObj);
        })

        socket.on('user-left', (userObj) => {
            io.to(userObj.roomId).emit('remove-user', userObj);
        })
        
        socket.on('update-room', (userObj) => {
            console.log(userObj);
            io.to(userObj.roomId).emit('update-room', userObj);
        });
    });
}

export default socket_functions;