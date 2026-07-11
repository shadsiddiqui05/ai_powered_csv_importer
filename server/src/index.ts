import express from 'express';
import cors from 'cors';
import { config } from './config';
import importRoutes from './routes/import.routes';

const app = express();

// ── Middleware ──
app.use(
  cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());

// ── Routes ──
app.use('/api/import', importRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handling ──
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);

    if (err.message === 'Only CSV files are allowed') {
      res.status(400).json({ success: false, error: err.message });
      return;
    }

    if (err.message?.includes('File too large')) {
      res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
);

// ── Start server ──
app.listen(config.port, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │                                         │
  │   🚀 GrowEasy CSV Importer API         │
  │   Running on port ${config.port}               │
  │   Client URL: ${config.clientUrl}  │
  │                                         │
  └─────────────────────────────────────────┘
  `);
});

export default app;
