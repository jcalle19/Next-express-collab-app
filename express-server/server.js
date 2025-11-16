import socket_handler from './socket_handler.js';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = 5000;
app.use(cors());

socket_handler(io);

server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
})