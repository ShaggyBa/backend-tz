// * Import modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { apiRouter } from './routes';

// * Init server
export const app = express();

// * Config server
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API
app.use('/api', apiRouter);

// 404
app.use((_req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// central error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err);
	res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// * Start server