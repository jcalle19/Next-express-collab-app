const socket_functions = (io) => {
    io.on('connection', function (socket) {
        console.log('a user has connected');
        socket.on('test', (msg)=>{
            console.log(msg);
        })
    });
}

export default socket_functions;