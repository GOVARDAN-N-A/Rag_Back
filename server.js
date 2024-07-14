// const express = require('express');
// const http = require('http');
// const socketio = require('socket.io');

// const app = express();
// const server = http.createServer(app);

// const io = socketio(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket) => {
//   console.log('New user connected');

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });

//   socket.on('sendMessage', (message) => {
//     io.emit('message', message);
//   });
// });

// const PORT = process.env.PORT || 3002;
// server.listen(PORT, () => {
//   console.log(`Chat server is running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Your other routes and middleware

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
