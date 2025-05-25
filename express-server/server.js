const socket_handler = require('./socket_handler');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const app = express();
const socket_functions = socket_handler.default;

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = 5000;

app.use('/api', apiRoutes);
app.use(cors());

socket_functions(io);
/*
io.on('connection', function (socket) {
    console.log('a user has connected');
})
*/
server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
})