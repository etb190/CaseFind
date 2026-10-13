import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchCases, getCaseById, getCourts } from './src/data/searchLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // GET /api/search?q=&court_type=&year_from=&year_to=&page=
  app.get('/api/search', (req, res) => {
    const { q, court_type, year_from, year_to, page } = req.query;
    const searchResult = searchCases({
      q: typeof q === 'string' ? q : undefined,
      court_type: typeof court_type === 'string' ? court_type : undefined,
      year_from: typeof year_from === 'string' ? year_from : undefined,
      year_to: typeof year_to === 'string' ? year_to : undefined,
      page: typeof page === 'string' ? page : undefined,
    });
    res.json(searchResult);
  });

  // GET /api/case/:id
  app.get('/api/case/:id', (req, res) => {
    const { id } = req.params;
    const caseRecord = getCaseById(id);
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseRecord);
  });

  // GET /api/courts
  app.get('/api/courts', (_req, res) => {
    const courts = getCourts();
    res.json(courts);
  });

  // Serve SPA in development with Vite middleware, or in production from dist
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JurisSearch running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
