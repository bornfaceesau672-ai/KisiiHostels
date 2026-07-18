import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_HOSTELS } from '../src/initialData';

const CF_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'https://kisii-hostels-api.esaubornface73.workers.dev';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const workerRes = await fetch(CF_WORKER_URL);
    if (workerRes.ok) {
      const data = await workerRes.json();
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      return res.status(200).json(data);
    }
  } catch (err) {
    console.warn('Worker fetch failed, serving fallback:', err);
  }

  // Fallback if Worker fails or empty
  return res.status(200).json(INITIAL_HOSTELS);
}
