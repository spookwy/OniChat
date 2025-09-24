const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
// Allow CORS so clients hosted on other origins (or Render static frontends) can connect.
const io = new Server(server, {
  cors: {
    origin: '*', // for public demo; consider restricting to your domain in production
    methods: ['GET', 'POST']
  }
});

// Serve static files (the front-end) from current directory
app.use(express.static(path.join(__dirname)));

// Simple request logger for debugging (Render logs will show requests)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Fallback: for any GET request not handled by static middleware, return index.html
// This is useful for single-page apps or when some hosts route differently.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let users = {}; // socketId -> { username, color }

io.on('connection', (socket) => {
  console.log('connection:', socket.id);

  socket.on('join', (payload) => {
    users[socket.id] = { username: payload.username || 'Guest', color: payload.color || 'green' };
    // notify all clients about new online count
    io.emit('online-count', Object.keys(users).length);
    // broadcast join message
    const joinTs = (payload && payload.ts) ? payload.ts : new Date().toISOString();
    io.emit('message', { type: 'system', text: `${users[socket.id].username} вошёл в чат`, ts: joinTs });
  });

  socket.on('message', (payload) => {
    const user = users[socket.id] || { username: 'Guest', color: 'green' };
    // use client-provided timestamp if present for deduplication
    const ts = payload.ts || new Date().toISOString();
    // broadcast message to everyone, include timestamp
    io.emit('message', { type: 'user', text: payload.text, username: user.username, color: user.color, ts });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    delete users[socket.id];
    io.emit('online-count', Object.keys(users).length);
    if (user) io.emit('message', { type: 'system', text: `${user.username} покинул чат`, ts: new Date().toISOString() });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port', PORT));
