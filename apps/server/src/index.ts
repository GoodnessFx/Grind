import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import applyRouter from './routes/apply';
import streamsRouter from './routes/streams';
import chatRouter, { initChat } from './routes/chat';
import giftsRouter from './routes/gifts';
import http from 'http';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', applyRouter);
app.use('/api/streams', streamsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/gifts', giftsRouter);

import path from 'path';
import fs from 'fs';

app.get(['/health', '/healthcheck', '/ping'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production if built
const webDistPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

const server = http.createServer(app);
// Initialize Socket.io for real‑time chat
initChat(server);

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`[Grind Server] Running on http://${HOST}:${PORT}`);
});
