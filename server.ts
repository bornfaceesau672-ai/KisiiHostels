import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });
  app.use(express.json());

  // API: Health status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
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
  5. Safariland Area: Bustling commercial proximity, shops, cafeterias, printing spaces below, solid borehole backup.
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
