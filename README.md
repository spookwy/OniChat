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

Supabase integration (optional, for persistent stats)

1. Create a new project at https://app.supabase.com.
2. In SQL Editor, run the following to create the `chat_stats` table:

```sql
create table if not exists chat_stats (
  id text primary key,
  total_messages bigint default 0,
  record_online bigint default 0,
  total_visits bigint default 0
);

-- insert a single global row
insert into chat_stats (id, total_messages, record_online, total_visits) values ('global', 0, 0, 0) on conflict (id) do nothing;
```

3. Get your project URL and a Service Role Key from Project Settings → API. Keep the service role key secret.
4. Create a `.env` file in the project root (not committed) with:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

5. Install dependencies and run the server:

```bash
npm install
npm start
```

Notes
- The server uses the Service Role Key to persist stats. Don't expose it in client code or public repos.
- This setup uses Supabase for a tiny global stats row. For per-message history or more advanced features, add a messages table and proper auth.
