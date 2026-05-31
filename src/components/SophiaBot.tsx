import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, User, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SophiaBotProps {
  userProfile?: {
    name: string;
    regCode: string;
    gender: 'Male' | 'Female';
  };
}

const STUDENT_FAQS = [
  {
    icon: '💳',
    question: 'How to pay rent?',
    prompt: 'How do I pay my hostel rent, and what is the typical deposit requirement?',
    details: 'Rent is paid per semester (4 months). Most landlords use M-Pesa Paybill numbers. Deposit is normally equal to 1 month rent and is fully refundable on exit.'
  },
  {
    icon: '🔐',
    question: 'Curfew & gate rules',
    prompt: 'What are the curfew rules, gate lock times, and penalties?',
    details: 'Gates lock strictly at 10:00 PM for private student hostels in Mwembe, Nyanchwa & Jogoo. For academic group classes or library delay extensions, coordinate with caretakers.'
  },
  {
    icon: '📶',
    question: 'Hostel Wi-Fi credentials',
    prompt: 'How do I access student Wi-Fi and what is the billing?',
    details: 'Hostels featuring Wi-Fi share logins once cleared. Caretakers share passwords at check-in. Vouchers normally cost KES 500-1000 per semester.'
  },
  {
    icon: '💧',
    question: 'Borehole & water scarcity',
    prompt: 'What if there is a water shortage or borehole maintenance at the hostel?',
    details: 'Borehole amenities guarantee continuous flow (24/7). Water is filtered and pressure is optimized in the mornings and evenings.'
  },
  {
    icon: '🔧',
    question: 'Broken room items & repair',
    prompt: 'How do I request repairs or maintenance for broken utilities in my room?',
    details: 'Go to the "Maintenance Logs" tab, specify the defect, and submit. Professional fundis will address emergency plumbing or lock issues in 24 hours.'
  },
  {
    icon: '⛰️',
    question: 'Nyanchwa safety & hills',
    prompt: 'Is Nyanchwa estate safe, and how challenging is the hill walk?',
    details: 'Nyanchwa is hilltop-located, peaceful, breezy, and very secure for late-night exams. The hiking route from Kisii campus is a 10 min cardiovascular session!'
  }
];

export default function SophiaBot({ userProfile }: SophiaBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Sasa comrade! I am **Fundi Sophia**, your digital resident expert. 🎓✨\n\nI can advise you on selecting the best room in Nyanchwa, rules on curry-gate curfews, Mwembe security tags, water-resilience, or how to check your room invoice. What is on your mind today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFaqsMobile, setShowFaqsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick topics for immediate queries (interactive chips below the message box)
  const faqPrompts = [
    { label: '🔐 Gate Curfews', text: 'What is the lock time curfew for hostels?' },
    { label: '💧 Water & Borehole', text: 'Tell me about water reliability at the hostels.' },
    { label: '⚡ Electricity Tokens', text: 'How do we pay for smart electricity tokens?' },
    { label: '🏔️ Nyanchwa Hills', text: 'What are the pros and cons of staying in Nyanchwa area?' },
    { label: '🛡️ Safety Tips', text: 'Which areas are safest and what precautions should I take?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('API communication issues.');
      }

      const resData = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: resData.text || "Pardon, comrade. I experienced a signal lag. Please ask again!",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      // Realistic mock helper response for robust user UX
      const fallbackReplies: Record<string, string> = {
        'curfew': "Gates around Mwembe, Nyanchwa, and Jogoo are locked at 10:00 PM on the dot. Comrades are advised to be inside for safety!\n\nIf you have a late lesson or group discussion, coordinate directly with your block caretaker or warden to avoid being locked out. (Offline mode helper)",
        'water': "Nyanchwa Apex, Mwembe Oasis, and several student courts feature continuous borehole water connections, meaning constant running water. Safariland Heights is also borehole-backed. (Offline mode helper)",
        'electricity': "Hostels share pre-loaded prepaid tokens. Comrades in a room coordinate to split the KPLC bill equally. (Offline mode helper)",
        'nyanchwa': "Nyanchwa is hilltop-located. Fantastic breeze and calm, quiet study atmosphere, but the hilly climb from Kisii campus is a stamina training! (Offline mode helper)",
        'pay rent': "Sasa comrade! Rent is paid per semester (4 months). Most landlords require a security deposit is paid upfront with the rent. Real-time token updates can be tracked inside the My Bookings invoice console. (Offline mode helper)",
        'rent': "Sasa comrade! Rent is paid per semester (4 months). Most landlords require a security deposit is paid upfront with the rent. Real-time token updates can be tracked inside the My Bookings invoice console. (Offline mode helper)",
        'broken': "Mambo! For broken fixtures (faucets, bulbs, locks), navigate to the 'Maintenance Logs' tab, fill the simple form, and our resident fundis will fix it in 24 hours! (Offline mode helper)",
        'maintenance': "Mambo! For broken fixtures (faucets, bulbs, locks), navigate to the 'Maintenance Logs' tab, fill the simple form, and our resident fundis will fix it in 24 hours! (Offline mode helper)",
        'wi-fi': "Mambo! High-speed optical fiber routers are pre-installed in premium hostels. Caretakers share credentials upon clearance. Split billing or voucher schemes are handled via M-Pesa. (Offline mode helper)",
        'wifi': "Mambo! High-speed optical fiber routers are pre-installed in premium hostels. Caretakers share credentials upon clearance. Split billing or voucher schemes are handled via M-Pesa. (Offline mode helper)"
      };

      // Match keywords or give general friendly advice
      const queryLower = textToSend.toLowerCase();
      let pickedReply = "Poleni! It looks like our local Gemini server is offline right now, but Fundi Sophia is still ready to help. Most Kisii hostels close doors at 10:00 PM, and hostels with Boreholes offer unlimited bathing water. Let me know if you need booking help!";
      
      for (const [key, text] of Object.entries(fallbackReplies)) {
        if (queryLower.includes(key)) {
          pickedReply = text;
          break;
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'model',
        text: pickedReply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
      {/* Left Pane: Student FAQs Section */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-auto md:h-[580px] overflow-hidden transition-colors duration-200 shrink-0">
        <button
          type="button"
          onClick={() => setShowFaqsMobile(!showFaqsMobile)}
          className="flex items-center justify-between w-full pb-1 md:pb-3 md:mb-3 md:border-b border-slate-100 dark:border-slate-800 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div className="text-left">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-sans tracking-tight">Student FAQs</h4>
              <p className="text-[10px] text-slate-500">Quick answers &amp; click-to-ask</p>
            </div>
          </div>
          {/* Collapse indicator for mobile screens */}
          <div className="md:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {showFaqsMobile ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </button>

        {/* List of FAQ Cards - Collapsible on Mobile, always expanded on Desktop */}
        <div className={`${showFaqsMobile ? 'block mt-3' : 'hidden md:flex'} flex-col flex-1 overflow-y-auto space-y-3 pr-1 py-1 scrollbar-thin scrollbar-thumb-slate-205`}>
          {STUDENT_FAQS.map((faq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleSendMessage(faq.prompt);
                if (window.innerWidth < 768) {
                  setShowFaqsMobile(false);
                }
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 dark:bg-slate-950/40 dark:hover:bg-indigo-950/25 border border-slate-100 hover:border-indigo-150 dark:border-slate-800/80 dark:hover:border-indigo-900/60 transition group cursor-pointer block"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm select-none" role="img" aria-label="emoji">{faq.icon}</span>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {faq.question}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed min-h-[30px] line-clamp-3 mb-1.5 font-normal">
                {faq.details}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-mono text-indigo-500 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 font-bold tracking-tight">
                Ask Sophia &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: AI Chat Console */}
      <div id="sophia-chatbot-widget" className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[580px] overflow-hidden transition-colors duration-200">
        {/* Bot Chat Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-indigo-100 border border-white/20">
                FS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-700 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-snug flex items-center gap-1">
                Fundi Sophia
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-bounce" />
              </h3>
              <span className="text-[10px] text-indigo-200">Kisii University Support AI Resident</span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono font-medium text-indigo-200">MODEL</span>
            <span className="text-[10px] font-mono uppercase bg-white/10 px-1.5 py-0.5 rounded font-black tracking-tight text-white">Gemini 3.5</span>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar indicator */}
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${isUser ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'}`}>
                  {isUser ? <User className="w-4 h-4" /> : 'S'}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl whitespace-pre-line text-xs md:text-sm shadow-sm leading-relaxed ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                  <span className={`text-[9px] font-mono text-slate-400 block ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm flex items-center justify-center text-xs font-bold font-mono">
                S
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 p-4 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-400 dark:text-slate-400 flex items-center gap-2">
                <span className="font-medium animate-pulse">Sophia is analyzing...</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick click chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {faqPrompts.map((faq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(faq.text)}
              className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-850 rounded-full px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition whitespace-nowrap cursor-pointer"
            >
              {faq.label}
            </button>
          ))}
        </div>

        {/* Input Form Action */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sophia anything about security, curfew, or Wi-Fi..."
            className="flex-1 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-transparent text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
          <button
            id="btn-bot-send"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2.5 transition shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
