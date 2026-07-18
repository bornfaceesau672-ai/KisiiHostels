import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_HOSTELS } from '../../src/initialData';

const CF_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'https://kisii-hostels-api.esaubornface73.workers.dev';
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let hostelsToSync: any[] = [];

    // Priority 1: Request body
    if (req.body) {
      if (Array.isArray(req.body.hostels) && req.body.hostels.length > 0) {
        hostelsToSync = req.body.hostels;
      } else if (Array.isArray(req.body) && req.body.length > 0) {
        hostelsToSync = req.body;
      }
    }

    // Priority 2: INITIAL_HOSTELS fallback
    if (hostelsToSync.length === 0) {
      hostelsToSync = [...INITIAL_HOSTELS];
    }

    // Sort hostels cleanly
    const estateOrder = [
      'On-Campus', 'Mwembe', 'Nyanchwa', 'Milimani', 'Jogoo', 'Roma', 'Nyaura', 'Canaan', 'Kisumu ndogo', 'Fanta'
    ];
    const sorted = hostelsToSync.sort((a, b) => {
      const areaA = String(a?.area || '');
      const areaB = String(b?.area || '');
      const orderA = estateOrder.indexOf(areaA);
      const orderB = estateOrder.indexOf(areaB);
      if ((orderA === -1 ? 999 : orderA) !== (orderB === -1 ? 999 : orderB))
        return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
      return String(a?.name || '').localeCompare(String(b?.name || ''));
    });

    // POST to Cloudflare Worker
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (CF_API_TOKEN) headers['Authorization'] = `Bearer ${CF_API_TOKEN}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const workerRes = await fetch(CF_WORKER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(sorted),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!workerRes.ok) {
        const text = await workerRes.text();
        return res.status(500).json({ success: false, error: `Cloudflare Worker error (${workerRes.status}): ${text}` });
      }

      return res.status(200).json({ success: true, count: sorted.length, hostels: sorted });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      return res.status(500).json({ success: false, error: `Worker fetch failed: ${fetchErr.message || fetchErr}` });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Worker sync failed' });
  }
}
