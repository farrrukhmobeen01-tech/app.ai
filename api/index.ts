import { app } from '../src/server/app.js';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    const message = err?.message || 'Serverless Execution Error';
    console.error('Vercel Serverless Invocation Exception:', message);
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}

