const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = 3000;

app.use('/api', apiRoutes);
app.use(cors());

io.on('connection', function (socket) {
    console.log('a user has connected');
})

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
})