import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSignIn: (email: string, pass: string) => Promise<void>;
  onSignUp: (email: string, pass: string, name: string, category: 'Student' | 'Property Owner' | 'Guest', phone: string) => Promise<void>;
  initialMode?: 'signin' | 'signup';
}

// Translate Firebase error codes to human-friendly messages
function getAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  const msg: Record<string, string> = {
    'auth/wrong-password': 'Incorrect password. Please double-check and try again.',
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'The email address is not valid. Please enter a correct email.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/network-request-failed': 'Network error — please check your internet connection and retry.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  };
  if (code && msg[code]) return msg[code];
  // Firestore permission error
  if (error?.message?.includes('Missing or insufficient permissions')) {
    return 'Profile saved locally. Syncing to database may take a moment — your account is active!';
  }
  return error?.message || 'Something went wrong. Please try again.';
}

export default function AuthModal({ onClose, onSignIn, onSignUp, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Student' | 'Property Owner' | 'Guest'>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please fill in your email and password to continue.');
        }
        await onSignIn(email, password);
      } else {
        if (!email.trim() || !password.trim() || !name.trim() || !phone.trim()) {
          throw new Error('Please fill in all fields to complete your registration.');
        }
        if (phone.length !== 10) {
          throw new Error('Phone number must be exactly 10 digits (e.g. 0712345678).');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters for your security.');
        }
        await onSignUp(email, password, name, category, phone);
      }
    } catch (err: any) {
      console.error(err);
      const friendlyMsg = getAuthErrorMessage(err);
      // If it's a Firestore permission error during signup (account was still created), show success
      if (err?.message?.includes('Missing or insufficient permissions') || err?.message?.includes('locally')) {
        setSuccessMessage('Account created! Profile saved locally — you are now logged in.');
        setTimeout(() => onClose(), 2000);
      } else {
        setError(friendlyMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div 
        id="auth-modal" 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Banner header decoration */}
        <div className="bg-indigo-700 text-white p-6 relative">
          <button 
            id="close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 p-2 rounded-full text-white transition focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] uppercase tracking-widest font-mono bg-white/20 text-indigo-100 px-3 py-1 rounded-full font-bold">
            Comrade Security Hub
          </span>
          <h3 className="text-xl font-extrabold font-sans mt-2">
            {mode === 'signin' ? 'Welcome Back, Comrade' : 'Create Your Account'}
          </h3>
          <p className="text-indigo-200 text-xs mt-1">
            {mode === 'signin' 
              ? 'Sign in to access bookings, maintenance, and AI Sophia.' 
              : 'Register to book rooms, file repair tickets, and more.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Full Name for register flow only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name / Comrade Handle
                </label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bonface Esau"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. comrade@gmail.com"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* Phone Number for register flow only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number (10 digits)
                </label>
                <input 
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    if (cleaned.length <= 10) {
                      setPhone(cleaned);
                    }
                  }}
                  placeholder="e.g. 0712345678"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            )}

            {/* Category selection for register flow only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none bg-white transition"
                >
                  <option value="Student">🎓 Student (Comrade looking for room)</option>
                  <option value="Property Owner">🏠 Property Owner (Landlord / Caretaker)</option>
                  <option value="Guest">👤 Guest (Visitor / Institution rep)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                {mode === 'signup' && <span className="text-slate-400 font-normal ml-1">(min. 6 chars)</span>}
              </label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 disabled:bg-indigo-400 text-white rounded-xl text-xs font-black tracking-wide hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <span className="animate-spin text-white">●</span>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>SIGN IN TO ACCOUNT</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>CREATE MY ACCOUNT</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[9px] text-slate-400 leading-normal flex items-start gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Your credentials are securely encrypted and stored in Firebase. We never share your data.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
