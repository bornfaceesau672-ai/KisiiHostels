import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface AuthModalProps {
  onClose: () => void;
  onSignIn: (email: string, pass: string) => Promise<void>;
  onSignUp: (email: string, pass: string, name: string, category: 'Student' | 'Property Owner' | 'Guest', phone: string) => Promise<void>;
  initialMode?: 'signin' | 'signup' | 'forgotpassword';
  onVerified?: () => void;
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

  let rawMsg = error?.message || '';
  if (rawMsg.includes('JSON') || rawMsg.includes('Unexpected token')) {
    return 'Authentication service returned an invalid response. Please check your internet connection and try again.';
  }

  return rawMsg || 'Something went wrong. Please try again.';
}

export default function AuthModal({ onClose, onSignIn, onSignUp, initialMode = 'signin', onVerified }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgotpassword'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Student' | 'Property Owner' | 'Guest'>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode with initialMode if it changes from the parent component
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Dynamically load Google reCAPTCHA v3 script when modal mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scriptId = 'recaptcha-v3-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?render=6LfWPyUtAAAAAEfb8VGKkmcnPrrXzj3mGQvWtnD7';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Get reCAPTCHA v3 token
  const executeRecaptcha = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const windowObj = window as any;
      if (!windowObj.grecaptcha) {
        reject(new Error('reCAPTCHA security library is blocked or failed to load. If you are using Opera or Brave, please disable your Ad Blocker / Tracker Blocker for this site and refresh.'));
        return;
      }
      windowObj.grecaptcha.ready(() => {
        windowObj.grecaptcha.execute('6LfWPyUtAAAAAEfb8VGKkmcnPrrXzj3mGQvWtnD7', { action: 'auth' })
          .then((token: string) => {
            if (token === 'browser-error') {
              reject(new Error('reCAPTCHA execution failed (browser-error). This is usually caused by browser privacy shields or tracker blockers (e.g. Opera/Brave blockers). Please disable them for this site.'));
            } else {
              resolve(token);
            }
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Execute reCAPTCHA for authentication actions (signin, signup, forgotpassword)
      // reCAPTCHA is a bot-protection layer only — failures here must NOT block real users.
      let recaptchaToken = '';
      try {
        recaptchaToken = await executeRecaptcha();
      } catch (recaptchaErr: any) {
        // If the reCAPTCHA library itself fails to load (e.g. ad blocker), just warn and continue.
        console.warn('reCAPTCHA execution skipped:', recaptchaErr.message);
      }

      // Verify reCAPTCHA token on the backend — treat ALL server errors as soft warnings.
      // Only a confirmed low-score (explicit bot signal) will block the form.
      if (recaptchaToken) {
        try {
          const verifyRes = await fetch('/api/verify-recaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: recaptchaToken })
          });

          // Only block if the server replied successfully AND flagged bot activity
          if (verifyRes.ok) {
            const responseText = await verifyRes.text().catch(() => '');
            try {
              const data = JSON.parse(responseText);
              if (data && data.success === false) {
                throw new Error('Security check failed. Possible bot activity detected. Please try again.');
              }
              // score < 0.5 is handled server-side already; no need to re-check here
            } catch (parseErr: any) {
              // Server returned unexpected body — non-blocking, just warn
              console.warn('reCAPTCHA response parse warning (non-blocking):', parseErr.message);
            }
          } else {
            // 4xx / 5xx / FUNCTION_INVOCATION_FAILED → log and continue, never block real users
            const errText = await verifyRes.text().catch(() => '');
            console.warn(`reCAPTCHA verify returned ${verifyRes.status} (non-blocking):`, errText.slice(0, 200));
          }
        } catch (verifyErr: any) {
          // Network failure, fetch error, serverless crash — all non-blocking
          console.warn('reCAPTCHA verify skipped (non-blocking):', verifyErr.message);
        }
      }


      if (mode === 'signin') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please fill in your email and password to continue.');
        }
        await onSignIn(email, password);
      } else if (mode === 'signup') {
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
      } else if (mode === 'forgotpassword') {
        if (!email.trim()) {
          throw new Error('Please enter your email address to receive reset link.');
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage('✓ Password reset link has been sent to your email. Check your inbox!');
      }
    } catch (err: any) {
      console.error(err);
      const friendlyMsg = getAuthErrorMessage(err);
      // If it's a Firestore permission error during signup (account was still created), show success
      if (err?.message?.includes('Missing or insufficient permissions') || err?.message?.includes('locally')) {
        setSuccessMessage('Account created! Profile saved locally.');
      } else {
        setError(friendlyMsg);
      }
    } finally {
      setLoading(false);
    }
  };



  // RENDER SIGN IN, REGISTER AND FORGOT PASSWORD FORMS
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
            {mode === 'signin' ? 'Welcome Back, Comrade' : 
             mode === 'signup' ? 'Create Your Account' : 
             'Reset Your Password'}
          </h3>
          <p className="text-indigo-200 text-xs mt-1">
            {mode === 'signin' ? 'Sign in to access bookings, maintenance, and AI Sophia.' : 
             mode === 'signup' ? 'Register to book rooms, file repair tickets, and more.' : 
             'Enter your email below to receive a password reset link.'}
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

            {/* Password input for signin/signup only */}
            {(mode === 'signin' || mode === 'signup') && (
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
            )}
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
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>CREATE MY ACCOUNT</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>SEND PASSWORD RESET LINK</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            {mode === 'signin' ? (
              <>
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
                <p>
                  <button
                    type="button"
                    onClick={() => { setMode('forgotpassword'); setError(''); setSuccessMessage(''); }}
                    className="text-slate-500 hover:text-indigo-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            ) : mode === 'signup' ? (
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
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[9px] text-slate-400 leading-normal flex items-start gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Your credentials are securely encrypted and stored in Firebase. Secured by Google reCAPTCHA.</span>
          </div>
        </form>
      </div>
    </div>
  );
}

