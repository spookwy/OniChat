# XD HTML Chat

Simple real-time anonymous chat using Socket.IO. Frontend is static HTML/CSS/JS and a Node.js server (`server.js`) uses Socket.IO to broadcast messages.

How to run locally

1. Install Node.js (v16+ recommended).
2. In the project folder run:

```bash
npm install
npm start
```

3. Open `http://localhost:3000` in multiple tabs/devices to test chat.

Deploy to Render (quick)

1. Push this repo to GitHub.
2. Create a new Web Service on Render, connect the GitHub repo.
3. Set the build command: `npm install` and the start command: `npm start`.
4. Render will provide a public URL. Open it and test.

Notes
- The server currently allows CORS from all origins (for demo). Lock it down for production.
- If you want persistent message history, add a DB (e.g., SQLite, Postgres) and store messages on server.
