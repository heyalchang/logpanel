import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Early-exit in development — we rely on Vite dev server on port 3000
if (process.env.NODE_ENV !== 'production') {
  console.log('[LogPanel] Skipping embedded server in development mode');
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Serve static assets from the Vite build output
const staticDir = path.resolve(__dirname, '../dist/public');
app.use(express.static(staticDir));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[LogPanel] Static server running at http://localhost:${PORT}`);
}); 