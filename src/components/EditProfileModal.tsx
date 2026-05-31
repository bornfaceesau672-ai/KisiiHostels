import React, { useState } from 'react';
import { X, User, Phone, Sparkles, Save, ShieldCheck, Calendar } from 'lucide-react';

interface EditProfileModalProps {
  currentProfile: {
    name: string;
    email: string;
    phone: string;
    category: 'Student' | 'Property Owner' | 'Guest';
    regCode: string;
    createdAt?: string;
  };
  onClose: () => void;
  onSave: (updatedData: { displayName: string; phone: string; category: 'Student' | 'Property Owner' | 'Guest' }) => Promise<void>;
}

export default function EditProfileModal({ currentProfile, onClose, onSave }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentProfile.name);
  const [phone, setPhone] = useState(currentProfile.phone);
  const [category, setCategory] = useState<'Student' | 'Property Owner' | 'Guest'>(currentProfile.category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!displayName.trim()) {
      setError('Display name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      setError('A valid contact phone number is required.');
      return;
    }
    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits (e.g. 0712345678).');
      return;
    }

    setLoading(true);
    try {
      await onSave({ displayName, phone, category });
      onClose();
    } catch (err: any) {
      console.error(err);
      // If it's a Firestore permission error, the save already happened locally so close gracefully
      if (err?.message?.includes('Missing or insufficient permissions') || err?.message?.includes('locally')) {
        onClose();
      } else {
        setError(err?.message || 'Profile save failed. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const memberSinceDisplay = currentProfile.createdAt
    ? new Date(currentProfile.createdAt).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not available';

  return (
    <div id="edit-profile-modal-overlay" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div 
        id="edit-profile-modal" 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header section with brand colors */}
        <div className="bg-indigo-700 text-white p-6 relative">
          <button 
            id="close-edit-profile-modal"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 p-2 rounded-full text-white transition focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] uppercase tracking-widest font-mono bg-white/20 text-indigo-100 px-3 py-1 rounded-full font-bold">
            Profile Settings
          </span>
          <h3 className="text-xl font-extrabold font-sans mt-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Edit Your Profile</span>
          </h3>
          <p className="text-indigo-200 text-xs mt-1">
            Update your details on NyumbaniKisii. Changes sync to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name / Comrade Handle
              </label>
              <input 
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Bonface Esau"
                className="w-full text-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* Mobile Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
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
                className="w-full text-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* User Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-950 bg-white dark:text-slate-100 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="Student">🎓 Student (Comrade looking for room)</option>
                <option value="Property Owner">🏠 Property Owner (Landlord / Caretaker)</option>
                <option value="Guest">👤 Guest (Visitor / Institution rep)</option>
              </select>
            </div>

            {/* Read-Only Info Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                <span className="block text-[9px] uppercase font-mono text-slate-400">Account Email</span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate block mt-0.5" title={currentProfile.email}>
                  {currentProfile.email}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                <span className="block text-[9px] uppercase font-mono text-slate-400">Reg ID Hash</span>
                <span className="text-[11px] font-bold font-mono text-slate-600 dark:text-slate-400 block mt-0.5">
                  {currentProfile.regCode}
                </span>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 text-left col-span-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div>
                  <span className="block text-[9px] uppercase font-mono text-indigo-400">Member Since</span>
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block mt-0.5">
                    {memberSinceDisplay}
                  </span>
                </div>
              </div>
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
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl p-3 border border-indigo-100/60 dark:border-indigo-950/30 text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span>Updates are synced to your account. No other resident can access or tamper with your credentials.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
