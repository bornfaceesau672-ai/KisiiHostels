import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '12mb' }));

const postImageUploadAttempts = new Map<string, { count: number; resetAt: number }>();

// API: Health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: PostImage upload proxy
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

// API: Smart AI Chat Assistant
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

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

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

export default app;
