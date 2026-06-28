import type { VercelRequest, VercelResponse } from '@vercel/node';

type ExpressApp = (req: VercelRequest, res: VercelResponse) => void;

let server: ExpressApp | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!server) {
    const { createServer } = await import('../dist/serverless.js');
    server = await createServer();
  }
  return server!(req, res);
}
