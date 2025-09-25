require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} else {
  console.log('Supabase not configured. Stats will be kept in-memory only.');
}

// Helper: read stats from Supabase (table `chat_stats` with single row id='global')
async function loadStatsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_stats')
      .select('*')
      .eq('id', 'global')
      .limit(1)
      .single();
    if (error) {
      console.error('Supabase load error:', error.message || error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase load exception:', err.message || err);
    return null;
  }
}

async function saveStatsToSupabase(statsObj) {
  if (!supabase) return false;
  try {
    // Upsert row with id='global'
    const { data, error } = await supabase
      .from('chat_stats')
      .upsert({ id: 'global', total_messages: statsObj.totalMessages, record_online: statsObj.recordOnline, total_visits: statsObj.totalVisits });
    if (error) {
      console.error('Supabase save error:', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save exception:', err.message || err);
    return false;
  }
}

// initialize in-memory holders (users and stats) early so startup loader can reference them
let users = {}; // socketId -> { username, color }
let stats = {
  totalMessages: 0,
  recordOnline: 0,
  totalVisits: 0
};

// Load stats at startup (if Supabase configured)
(async () => {
  if (supabase) {
    const remote = await loadStatsFromSupabase();
    if (remote) {
      stats.totalMessages = remote.total_messages || 0;
      stats.recordOnline = remote.record_online || 0;
      stats.totalVisits = remote.total_visits || 0;
      console.log('Loaded stats from Supabase:', stats);
    } else {
      console.log('No stats row found in Supabase — using defaults');
      // create initial row
      await saveStatsToSupabase(stats);
    }
  }
})();

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


// Small wrapper to update local stats and persist when possible
async function updateStats(newStats) {
  stats = { ...stats, ...newStats };
  io.emit('stats-update', stats);
  if (supabase) await saveStatsToSupabase(stats);
}

io.on('connection', (socket) => {
  console.log('connection:', socket.id);

  // Send current stats to connecting client
  socket.on('request-stats', () => {
    socket.emit('stats-update', stats);
  });

  // Increment total visits
  stats.totalVisits++;
  (async () => { await saveStatsToSupabase(stats); })();
  io.emit('stats-update', stats);

  socket.on('join', (payload) => {
    users[socket.id] = { username: payload.username || 'Guest', color: payload.color || 'green' };

    // Update record online if necessary
    const currentOnline = Object.keys(users).length;
    if (currentOnline > stats.recordOnline) {
      stats.recordOnline = currentOnline;
    }

    // Persist updated stats
    (async () => { await saveStatsToSupabase(stats); })();

    // Notify all clients about updated stats
    io.emit('stats-update', stats);

    // Notify all clients about new online count
    io.emit('online-count', currentOnline);

    // Broadcast join message
    const joinTs = (payload && payload.ts) ? payload.ts : new Date().toISOString();
    io.emit('message', { type: 'system', text: `${users[socket.id].username} вошёл в чат`, ts: joinTs });
  });

  socket.on('message', (payload) => {
    const user = users[socket.id] || { username: 'Guest', color: 'green' };
    const ts = payload.ts || new Date().toISOString();

    // Increment total messages
    stats.totalMessages++;
    (async () => { await saveStatsToSupabase(stats); })();
    io.emit('stats-update', stats);

    // Broadcast message to everyone
    io.emit('message', { type: 'user', text: payload.text, username: user.username, color: user.color, ts });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    delete users[socket.id];

    const currentOnline = Object.keys(users).length;
    io.emit('online-count', currentOnline);

    if (user) {
      io.emit('message', { type: 'system', text: `${user.username} покинул чат`, ts: new Date().toISOString() });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port', PORT));
