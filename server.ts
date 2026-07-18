import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { exec } from 'child_process';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { INITIAL_HOSTELS } from './src/initialData';

// Load environment variables
dotenv.config();

// Load Firebase configuration
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));

// Initialize Firebase JS SDK on Server
const firebaseApp = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Cloudflare Worker URL — always used for listing GET and admin POST sync
const CF_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'https://kisii-hostels-api.esaubornface73.workers.dev';
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

// Push updated hostels JSON to the Cloudflare Worker cache
async function syncToWorker(hostelsList: any[]) {
  console.log(`[Server Sync] POSTing ${hostelsList.length} hostels to Worker: ${CF_WORKER_URL}`);
  const headers: any = { 'Content-Type': 'application/json' };
  if (CF_API_TOKEN) headers['Authorization'] = `Bearer ${CF_API_TOKEN}`;

  const res = await fetch(CF_WORKER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(hostelsList)
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = errText;
    try { errMsg = JSON.parse(errText)?.error || errText; } catch (e) { /* ignore */ }
    throw new Error(`Worker POST failed (${res.status}): ${errMsg}`);
  }
  console.log('[Server Sync] Successfully synced to Cloudflare Worker!');
}


let gitPushTimeout: NodeJS.Timeout | null = null;
const triggerGitPush = () => {
  if (gitPushTimeout) {
    clearTimeout(gitPushTimeout);
  }
  gitPushTimeout = setTimeout(() => {
    console.log('[Git Auto-sync] Running git add, commit, and push for newly uploaded hostel images...');
    exec('git add public/hostel-images && git commit -m "Upload hostel images via admin dashboard" && git push', (error, stdout, stderr) => {
      if (error) {
        console.error('[Git Auto-sync] Failed auto git push:', error);
      } else {
        console.log('[Git Auto-sync] Auto git push completed successfully:\n', stdout);
      }
    });
  }, 5000); // Debounce to allow multiple uploads to finish before committing
};

const postImageUploadAttempts = new Map<string, { count: number; resetAt: number }>();

async function startServer() {
  const app = express();
  const PORT = 3001; // Updated to avoid port conflict

  // Middleware
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Content-Security-Policy-Report-Only', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://i.postimg.cc https://postimg.cc https://*.postimg.cc",
      "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://api.postimage.org https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://meet.google.com https://zoom.us https://www.google.com/recaptcha/ https://recaptcha.google.com/",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'"
    ].join('; '));
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });
  app.use(express.json({ limit: '12mb' }));

  // API: Health status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API: Verify reCAPTCHA token
  app.post('/api/verify-recaptcha', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'reCAPTCHA token is required.' });
      }

      const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LfWPyUtAAAAADgIgI5DOe79B0vuGweIlHPLPErm';
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
      
      const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: token
        })
      });

      const data = await response.json() as any;
      if (data && data.success) {
        const score = data.score !== undefined ? data.score : 1.0;
        if (score < 0.5) {
          return res.status(400).json({ error: 'reCAPTCHA verification failed: score too low. Bot activity suspected.' });
        }
        res.json({ success: true, score });
      } else {
        const errorCodes = data['error-codes'] ? data['error-codes'].join(', ') : 'unknown error';
        let friendlyError = `reCAPTCHA verification failed: ${errorCodes}`;
        if (errorCodes.includes('browser-error')) {
          friendlyError = 'Security check blocked by your browser settings (e.g. Opera/Brave Ad Blocker or Tracker Blocker). Please disable blocking for this site.';
        }
        res.status(400).json({ error: friendlyError });
      }
    } catch (error: any) {
      console.error('reCAPTCHA verification error:', error);
      const errMsg = error?.message || '';
      const errCode = error?.code || '';
      const isNetworkIssue = 
        errMsg.includes('fetch failed') || 
        errCode === 'ENOTFOUND' || 
        errCode === 'ECONNREFUSED' || 
        errCode === 'ETIMEDOUT' || 
        errMsg.includes('timeout') ||
        errMsg.includes('unreachable');

      if (isNetworkIssue) {
        console.warn('reCAPTCHA verification server is unreachable. Bypassing check for local/offline testing or server recovery.');
        return res.json({ 
          success: true, 
          score: 0.9, 
          warning: 'Bypassed verification due to server connection issues.' 
        });
      }
      res.status(500).json({ error: 'Failed to verify reCAPTCHA token due to server error.' });
    }
  });


  app.post('/api/postimage-upload', async (req, res) => {
    try {
      const requester = req.ip || 'local';
      const now = Date.now();
      const windowMs = 10 * 60 * 1000;
      const attempts = postImageUploadAttempts.get(requester);
      if (attempts && attempts.resetAt > now && attempts.count >= 20) {
        return res.status(429).json({ error: 'Too many image uploads. Please wait and try again.' });
      }
      postImageUploadAttempts.set(requester, {
        count: attempts && attempts.resetAt > now ? attempts.count + 1 : 1,
        resetAt: attempts && attempts.resetAt > now ? attempts.resetAt : now + windowMs
      });

      const apiKey = process.env.POSTIMAGE_API_KEY || 'f666bd030df59d51a074f72e6315dc33';
      const { image, name, type } = req.body || {};
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Missing base64 image payload.' });
      }

      const normalizedType = String(type || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(normalizedType)) {
        return res.status(400).json({ error: 'Unsupported image type.' });
      }

      // Try to save image locally first (to public/hostel-images) so they get committed to Git
      try {
        const publicDir = path.join(process.cwd(), 'public');
        const hostelImagesDir = path.join(publicDir, 'hostel-images');
        
        if (fs.existsSync(publicDir)) {
          if (!fs.existsSync(hostelImagesDir)) {
            fs.mkdirSync(hostelImagesDir, { recursive: true });
          }
          
          const cleanName = String(name || 'hostel-image')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .slice(0, 50);
          const filename = `${Date.now()}-${cleanName}.${normalizedType}`;
          const filePath = path.join(hostelImagesDir, filename);
          
          fs.writeFileSync(filePath, Buffer.from(image, 'base64'));
          console.log(`Saved image locally: /hostel-images/${filename}`);
          triggerGitPush();
          return res.json({ url: `/hostel-images/${filename}` });
        }
      } catch (localWriteErr) {
        console.warn('Failed to save image locally, falling back to PostImage:', localWriteErr);
      }

      const body = new URLSearchParams({
        key: apiKey,
        o: '2b819584285c102318568238c7d4a4c7',
        m: '59c2ad4b46b0c1e12d5703302bff0120',
        version: '1.0.1',
        portable: '1',
        name: String(name || 'hostel-image').slice(0, 80),
        type: normalizedType,
        image
      });

      const response = await fetch('https://api.postimage.org/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body
      });
      const text = await response.text();
      console.log('PostImage API raw response:', text);
      let hostedUrl = '';
      let errorMsg = '';

      if (text.trim().startsWith('{')) {
        try {
          const data = JSON.parse(text);
          hostedUrl = data?.url || data?.image?.url || data?.image?.display_url || data?.hotlink || data?.direct_url;
          errorMsg = data?.error || data?.message;
        } catch (e) {
          console.warn('PostImage response JSON parsing failed:', e);
        }
      }

      if (!hostedUrl) {
        // Fallback: Parse XML tags using regex
        const directUrlMatch = text.match(/<hotlink>(.*?)<\/hotlink>/i) || text.match(/<direct_url>(.*?)<\/direct_url>/i) || text.match(/<url>(.*?)<\/url>/i) || text.match(/<display_url>(.*?)<\/display_url>/i) || text.match(/<page>(.*?)<\/page>/i);
        if (directUrlMatch) {
          hostedUrl = directUrlMatch[1];
        } else {
          const errorMatch = text.match(/<message>(.*?)<\/message>/i) || text.match(/<error>(.*?)<\/error>/i);
          errorMsg = errorMatch ? errorMatch[1] : 'PostImage upload failed or returned XML in an unexpected format.';
        }
      }

      if (!response.ok || !hostedUrl) {
        return res.status(502).json({ error: errorMsg || 'PostImage upload failed.' });
      }
      res.json({ url: hostedUrl });
    } catch (error: any) {
      console.error('PostImage upload error:', error);
      res.status(500).json({ error: 'Image upload service failed.' });
    }
  });

  // API: Smart AI Chat Assistant (with lazy load of Gemini API Key)
  app.post('/api/gemini-chat', async (req, res) => {
    try {
      const { messages, userProfile } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const systemInstruction = `You are 'Fundi Sophia', the elite AI resident assistant and virtual warden of the Kisii Student Hostel Portal. 
Your personality is warm, helpful, knowledgeable, and distinctly Kenyan. You help Kisii University students (known as comrades) navigate accommodation, booking, and maintenance.

Key location rules and facts around Kisii University you should use:
- Areas around Kisii University:
  1. Nyanchwa Hills: Peaceful, elevated path, great breeze, quiet study environment. Safe, but walking up the hill from campus builds stamina!
  2. Mwembe Estate: Extremely close to campus main gate (2-minute walk). Popular, bustling student hubs, affordable, but comrades should watch their laptops & phones at night.
  3. Milimani Suburb: Executive, highly secure, leafy, upscale, but prices are higher (KES 20,000+ per semester). Perfect for researchers and postgraduate comrades.
  4. Jogoo area: Highly economical, strong comrade community spirit, cooperative boarding groups.
  5. Roma Estate: Bustling commercial proximity, shops, cafeterias, printing spaces below, solid borehole backup.
- Core rules: Gate curfews are strictly locked at 10:00 PM for student safety.
- Water tip: Kisii is evergreen and gets ample rain, so hostels with 'Boreholes' (like Nyanchwa Highres and Mwembe Oasis) offer uninterrupted shower water.
- Power: Comrades use shared pre-paid token meters; remind them to cooperate on electricity billing.
- Maintenance advice: High-priority requests like sparks or floor water are addressed immediately, minor Wi-Fi drops are checked within 24 hours.

If comrades talk to you, match their energy! Speak with friendly campus sheng/Kenyan terms in small doses (e.g., 'Sasa comrade', 'mambo', 'fundi', 'shwari', 'poa') to make them feel at home. Keep replies structured with bullet points.`;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        // Safe, graceful fallback response when Gemini Key is not configured yet
        console.warn('GEMINI_API_KEY is not configured. Replying with realistic local fallback agent.');
        const userQuery = messages && messages.length > 0 ? messages[messages.length - 1].text : '';
        let fallbackReply = '';

        if (userQuery.toLowerCase().includes('water') || userQuery.toLowerCase().includes('shower')) {
          fallbackReply = "Sasa comrade! Sophia here. Regarding water supply, most of our partner hostels like Nyanchwa Apex and Mwembe Oasis are fitted with reliable boreholes. In Kisii, rain is frequent but having a borehole ensures running water even during water-rationing days. Be sure to check 'Borehole' on your room filter! *(Note: Please set your GEMINI_API_KEY in the Secrets panel to activate full AI responses)*";
        } else if (userQuery.toLowerCase().includes('curfew') || userQuery.toLowerCase().includes('time') || userQuery.toLowerCase().includes('gate')) {
          fallbackReply = "Mambo comrade! Gate security is our top priority. For almost all student estates in Nyanchwa, Jogoo and Mwembe, gates are strictly locked by 10:00 PM. If you are staying on campus till late for library study, please cooperate with our hostel watchmen. *(Note: Please set your GEMINI_API_KEY in the Secrets panel to activate full AI responses)*";
        } else if (userQuery.toLowerCase().includes('nyanchwa') || userQuery.toLowerCase().includes('mwembe') || userQuery.toLowerCase().includes('milimani')) {
          fallbackReply = "Fiti sana! Let me break down these estates for you: \n\n" +
            "• **Mwembe**: Super close to Kisii Uni main gate (less than 200m). Full of energy, pocket-friendly, but keep your doors locked at night.\n" +
            "• **Nyanchwa Apex**: Incredible hilltop wind, clean and highly quiet for scholars who love studying. Walking up that hill is a daily workout!\n" +
            "• **Milimani**: Serene suburb, very secure, executive touch, but rent is a premium.\n\n" +
            "Which vibe suits your style? *(Note: Please set your GEMINI_API_KEY in the Secrets panel to activate full AI responses)*";
        } else {
          fallbackReply = `Sasa comrade! Welcome to the Kisii Hostel hub. I am Sophia, your digital warden. I'm ready to advise you on finding the perfect room in Nyanchwa, booking a double bed space in Mwembe, or submitting a repair request for your shower faucet! 

Ask me any question about curfew hours, security, price estimates, or local rules.

*(Note: Currently running in offline portal support. To unlock adaptive AI reasoning, please configure your GEMINI_API_KEY in AI Studio's Settings > Secrets)*`;
        }

        return res.json({ text: fallbackReply });
      }

      // Initialize Gemini Client Lazily inside endpoint to prevent module-load crashes
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Map messages array to Gemini formatting
      // Keep it robust in case messages format differs
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Add user profile context to prompt if available
      if (userProfile && formattedContents.length > 0) {
        const lastMsg = formattedContents[formattedContents.length - 1];
        lastMsg.parts[0].text = `[User context: Student is ${userProfile.name || 'Anonymous'}, Reg: ${userProfile.regCode || 'N/A'}, Gender: ${userProfile.gender || 'Not specified'}] \n\nQUERY: ${lastMsg.parts[0].text}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini call error:', error);
      res.status(500).json({ error: 'Failed to generate assistance response', details: error.message });
    }
  });

  // API: Proxy GET /api/hostels → Cloudflare Worker (never touch Firestore from frontend)
  app.get('/api/hostels', async (req, res) => {
    try {
      const workerRes = await fetch(CF_WORKER_URL);
      if (!workerRes.ok) throw new Error(`Worker returned ${workerRes.status}`);
      const data = await workerRes.json();
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      res.json(data);
    } catch (err: any) {
      console.error('[Hostels] Failed to fetch from Worker:', err);
      res.status(502).json({ error: 'Failed to retrieve hostels from Worker' });
    }
  });

  // API: Admin sync — read Firestore → push to Cloudflare Worker cache
  app.post('/api/admin/sync-r2', async (req, res) => {
    console.log('[Sync] Admin triggered Worker sync from Firestore...');
    try {
      // Step 1: Read from Firestore (with timeout to prevent hanging)
      console.log('[Sync] Step 1: Reading hostels from Firestore...');
      console.log('[Sync] Firebase project:', firebaseConfig.projectId);
      let querySnapshot;
      try {
        const firestoreReadPromise = getDocs(collection(db, 'hostels'));
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore read timed out after 15 seconds')), 15000)
        );
        querySnapshot = await Promise.race([firestoreReadPromise, timeoutPromise]) as any;
      } catch (firestoreErr: any) {
        console.error('[Sync] FIRESTORE READ FAILED:', firestoreErr?.message || firestoreErr);
        console.error('[Sync] Full error:', JSON.stringify(firestoreErr, Object.getOwnPropertyNames(firestoreErr || {})));
        return res.status(500).json({
          success: false,
          error: `Firestore read failed: ${firestoreErr.message || firestoreErr}`,
          stage: 'firestore-read'
        });
      }

      const loadedHostels: any[] = [];
      try {
        querySnapshot.forEach((docSnap: any) => {
          const data = docSnap.data();
          if (!data.rooms || data.rooms.length === 0) {
            const fallback = INITIAL_HOSTELS.find(ih => ih.id === data.id);
            if (fallback) data.rooms = fallback.rooms;
          }
          loadedHostels.push(data);
        });
      } catch (parseErr: any) {
        console.error('[Sync] Error processing Firestore documents:', parseErr);
        return res.status(500).json({
          success: false,
          error: `Error processing Firestore documents: ${parseErr.message}`,
          stage: 'firestore-parse'
        });
      }
      console.log(`[Sync] Step 1 complete: loaded ${loadedHostels.length} hostels from Firestore`);

      // If Firestore returned 0 documents, fall back to INITIAL_HOSTELS
      if (loadedHostels.length === 0) {
        console.warn('[Sync] Firestore returned 0 hostels — using INITIAL_HOSTELS fallback');
        loadedHostels.push(...INITIAL_HOSTELS);
      }

      const estateOrder = [
        'On-Campus', 'Mwembe', 'Nyanchwa', 'Milimani', 'Jogoo', 'Roma', 'Nyaura', 'Canaan', 'Kisumu ndogo', 'Fanta'
      ];
      const sorted = loadedHostels.sort((a, b) => {
        const orderA = estateOrder.indexOf(a.area);
        const orderB = estateOrder.indexOf(b.area);
        if ((orderA === -1 ? 999 : orderA) !== (orderB === -1 ? 999 : orderB))
          return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
        return a.name.localeCompare(b.name);
      });

      // Step 2: Push updated JSON to Cloudflare Worker cache
      console.log(`[Sync] Step 2: Pushing ${sorted.length} hostels to Cloudflare Worker...`);
      try {
        await syncToWorker(sorted);
      } catch (workerErr: any) {
        console.error('[Sync] CLOUDFLARE WORKER POST FAILED:', workerErr?.message || workerErr);
        return res.status(500).json({
          success: false,
          error: `Cloudflare Worker sync failed: ${workerErr.message || workerErr}`,
          stage: 'worker-post'
        });
      }

      console.log(`[Sync] Success! Synced ${sorted.length} hostels to Cloudflare Worker.`);
      res.json({ success: true, hostels: sorted, count: sorted.length });
    } catch (err: any) {
      console.error('[Sync] Unexpected top-level error:', err?.message || err);
      console.error('[Sync] Stack:', err?.stack);
      // Ensure we ALWAYS send a JSON response, never crash without one
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message || 'Sync failed', stage: 'unexpected' });
      }
    }
  });

  // Handle front-end code assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kisii Student Hostel Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
