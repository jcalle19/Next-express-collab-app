const express = require('express');
const cors = require('cors');
const io = require('socket.io')(http);

const apiRoutes = require('./routes/api');
const app = express();
const PORT = 3000;

app.use('/api', apiRoutes);
app.use(cors());

io.on('connection', function (socket) {
    console.log('a user has connected');
})

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
})