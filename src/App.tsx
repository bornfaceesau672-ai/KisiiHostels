import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Hostel, Room, Booking, MaintenanceRequest, HostelReview, RelocationRequest, NewsPost, AdminChatMessage } from './types';
import { INITIAL_HOSTELS, INITIAL_BOOKINGS, INITIAL_MAINTENANCE, ClientUser, INITIAL_USERS, INITIAL_RELOCATIONS } from './initialData';
import { INITIAL_REVIEWS } from './initialReviews';
import HostelCard from './components/HostelCard';
import AvailabilityGrid from './components/AvailabilityGrid';
import BookRoomModal from './components/BookRoomModal';
import MaintenanceForm from './components/MaintenanceForm';
import RelocationForm from './components/RelocationForm';
import SophiaBot from './components/SophiaBot';
import AuthModal from './components/AuthModal';
import EditProfileModal from './components/EditProfileModal';
import EstateLandingPage from './components/EstateLandingPage';
import { getHostelImages, getHostelYoutubeEmbed } from './utils/mediaHelper';
import { getNumericRent, formatMonthlyRent, formatSemesterRent } from './utils/rentHelper';

// Firebase core logic imports
import { auth, db, handleFirestoreError, OperationType, logAnalyticsEvent } from './lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { 
  Building, 
  MapPin, 
  Droplet, 
  Wifi, 
  Flame, 
  Phone, 
  Receipt, 
  BookOpen, 
  Hammer, 
  MessageSquare, 
  CheckCircle, 
  Filter, 
  RotateCcw, 
  Sparkles, 
  User, 
  LogOut, 
  TrendingUp, 
  AlertCircle,
  Search,
  Home,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Video,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Share2,
  Settings,
  UserPlus,
  BarChart2,
  X,
  Lock,
  Key,
  Shield,
  Trash2,
  Wrench,
  AlertTriangle,
  Truck,
  Compass,
  WashingMachine,
  Newspaper,
  Heart,
  Send,
  Pin,
  PinOff,
  Flag,
  Copy,
  Check
} from 'lucide-react';


const ESTATE_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  'On-Campus': {
    label: 'On-Campus Resident Halls',
    icon: 'Campus',
    description: 'Inside the university compound, closest to lecture rooms.'
  },
  'Mwembe': {
    label: 'Mwembe (Main Gate Area)',
    icon: 'Gate',
    description: 'Highly active housing right near the main gate entrance.'
  },
  'Nyanchwa': {
    label: 'Nyanchwa Hills',
    icon: 'Hills',
    description: 'Breezy and peaceful highlands with high security guards.'
  },
  'Milimani': {
    label: 'Milimani (Executive)',
    icon: 'Executive',
    description: 'Prestige residences for graduate study or peaceful living.'
  },
  'Jogoo': {
    label: 'Jogoo Estate',
    icon: 'Home',
    description: 'Economical, social, and student-friendly residential suburb.'
  },
  'Safariland': {
    label: 'Safariland Plaza',
    icon: 'Shops',
    description: 'Closer to shops, cyber cafes, and commercial printing centers.'
  },
  'Nyaura': {
    label: 'Nyaura Outpost',
    icon: 'Green',
    description: 'Tranquil student apartments nestled along lush natural breeze.'
  },
  'Canaan': {
    label: 'Canaan Estate',
    icon: 'Quiet',
    description: 'Serene, secure, and clean environment popular for student residency.'
  },
  'Kisumu ndogo': {
    label: 'Kisumu Ndogo',
    icon: 'Quiet',
    description: 'Vibrant student neighborhood with active local business and close transport access.'
  },
  'Fanta': {
    label: 'Fanta Estate',
    icon: 'Quiet',
    description: 'Popular student area known for affordable housing and community living.'
  }
};

const ESTATE_SCHOOL_INFO: Record<string, { distance: string; walkTime: string; securityScore: string; alert: string }> = {
  'On-Campus': {
    distance: '0 - 50 meters',
    walkTime: '1 - 2 mins walk',
    securityScore: '5.0/5 (Warden Patrol)',
    alert: 'Inside the main campus compound. Strict security lockups apply at night.'
  },
  'Mwembe': {
    distance: '150 - 300 meters',
    walkTime: '3 - 6 mins walk',
    securityScore: '4.2/5 (Caretaker Armed)',
    alert: 'Highly active neighborhood right outside the main gate. Highly social, busy and accessible.'
  },
  'Nyanchwa': {
    distance: '350 - 650 meters',
    walkTime: '8 - 14 mins walk',
    securityScore: '4.6/5 (Safe Highlands)',
    alert: 'Tranquil student highlands with panoramic town and campus views. High security presence.'
  },
  'Milimani': {
    distance: '400 - 800 meters',
    walkTime: '9 - 18 mins walk',
    securityScore: '4.8/5 (Premium Guarded)',
    alert: 'Upscale residential neighborhood with top-tier quietude for intensive studying sessions.'
  },
  'Jogoo': {
    distance: '500 - 900 meters',
    walkTime: '10 - 20 mins walk',
    securityScore: '4.0/5 (Comrade Populated)',
    alert: 'Pocket friendly, highly populated student suburb. Safe walking in comrade batches after dusk.'
  },
  'Safariland': {
    distance: '300 - 550 meters',
    walkTime: '6 - 12 mins walk',
    securityScore: '4.3/5 (CCTV & Security Fenced)',
    alert: 'Perfect proximity to commercial centers, cyber cafes, copy services, and organic market stands.'
  },
  'Nyaura': {
    distance: '650 - 950 meters',
    walkTime: '12 - 22 mins walk',
    securityScore: '4.1/5 (Active Tenancy)',
    alert: 'Quiet green nature-rich valley apartments. Offers very competitive rent indexes.'
  },
  'Canaan': {
    distance: '450 - 755 meters',
    walkTime: '10 - 17 mins walk',
    securityScore: '4.4/5 (Perimeter Walled)',
    alert: 'Modern secure layout. High water consistency with backup local borehole shafts.'
  },
  'Kisumu ndogo': {
    distance: '500 - 850 meters',
    walkTime: '10 - 18 mins walk',
    securityScore: '4.3/5 (Caretaker Guarded)',
    alert: 'Vibrant student neighborhood with active local business and close transport access.'
  },
  'Fanta': {
    distance: '200 - 450 meters',
    walkTime: '5 - 10 mins walk',
    securityScore: '4.1/5 (Caretaker Guarded)',
    alert: 'Accessible neighborhood with diverse student housing options.'
  }
};

const estateOrder = [
  'On-Campus',
  'Mwembe',
  'Nyanchwa',
  'Milimani',
  'Jogoo',
  'Safariland',
  'Nyaura',
  'Canaan',
  'Kisumu ndogo',
  'Fanta'
];

const ADMIN_EMAIL = 'esaubornface73@gmail.com';

// Premium Skeleton loading card for elegant, smooth state transitions
const SkeletonCard = () => (
  <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-pulse space-y-4 p-5">
    {/* Image placeholder with absolute overlay */}
    <div className="h-44 bg-slate-200/60 dark:bg-slate-800 rounded-2xl" />
    <div className="space-y-3.5">
      {/* Title placeholder */}
      <div className="space-y-2">
        <div className="h-4.5 bg-slate-200/60 dark:bg-slate-800 rounded-md w-3/4" />
        <div className="h-3 bg-slate-200/60 dark:bg-slate-800 rounded-md w-1/3" />
      </div>
      {/* Rate placeholder */}
      <div className="h-16 bg-slate-100/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 flex flex-col gap-1.5 justify-center">
        <div className="h-2 bg-slate-200/60 dark:bg-slate-800 rounded w-1/4" />
        <div className="flex gap-4">
          <div className="h-3 bg-slate-200/60 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-200/60 dark:bg-slate-800 rounded w-1/3" style={{ borderLeftWidth: '1px' }} />
        </div>
      </div>
      {/* Location placeholder */}
      <div className="h-10 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl" />
      {/* Action button placeholder */}
      <div className="h-10 bg-slate-200/60 dark:bg-slate-800 rounded-xl" />
    </div>
  </div>
);

const getWhatsAppColor = (name: string) => {
  const colors = [
    { text: 'text-[#128c7e] dark:text-[#25d366]', bg: 'bg-[#128c7e]/10 text-[#128c7e] dark:bg-[#25d366]/10 dark:text-[#25d366]' },
    { text: 'text-[#075e54] dark:text-[#00a884]', bg: 'bg-[#075e54]/10 text-[#075e54] dark:bg-[#00a884]/10 dark:text-[#00a884]' },
    { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300' },
    { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
    { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' },
    { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' },
    { text: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300' },
    { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300' },
    { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300' },
  ];
  if (name === 'Admin') return { text: 'text-rose-600 dark:text-rose-400 font-extrabold', bg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-900' };
  if (name === 'Anonymous Comrade') return { text: 'text-slate-500 dark:text-slate-400 font-semibold', bg: 'bg-slate-105 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/40' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
};

export default function App() {
  // Local persistence states
  const [hostels, setHostels] = useState<Hostel[]>(() => {
    const estateOrderLocal = [
      'On-Campus',
      'Mwembe',
      'Nyanchwa',
      'Milimani',
      'Jogoo',
      'Safariland',
      'Nyaura',
      'Canaan',
      'Kisumu ndogo',
      'Fanta'
    ];
    const sortHostelsByEstate = (a: Hostel, b: Hostel) => {
      const indexA = estateOrderLocal.indexOf(a.area);
      const indexB = estateOrderLocal.indexOf(b.area);
      const orderA = indexA === -1 ? 999 : indexA;
      const orderB = indexB === -1 ? 999 : indexB;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    };

    const saved = localStorage.getItem('kisii_hostels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Hostel[];
        // Filter out any duplicate IDs and hostels with missing/invalid rooms arrays
        const seenIds = new Set<string>();
        const uniqueParsed: Hostel[] = [];
        for (const h of parsed) {
          if (h && h.id && h.id !== 'hostel-kisii-internal-chancellors' && !seenIds.has(h.id)) {
            // Ensure rooms is a valid array
            if (!Array.isArray(h.rooms) || (h.rooms.length === 0 && !h.externalLink)) {
              // Try to recover rooms from INITIAL_HOSTELS
              const fallback = INITIAL_HOSTELS.find(ih => ih.id === h.id);
              if (fallback && Array.isArray(fallback.rooms) && fallback.rooms.length > 0) {
                h.rooms = fallback.rooms;
              } else if (!h.externalLink) {
                continue; // Skip hostels with no rooms and no fallback
              }
            }
            seenIds.add(h.id);
            uniqueParsed.push(h);
          }
        }
        // Merge in any initial hostels that are missing from localStorage
        for (const ih of INITIAL_HOSTELS) {
          if (!seenIds.has(ih.id)) {
            seenIds.add(ih.id);
            uniqueParsed.push(ih);
          }
        }
        // If localStorage yielded no valid hostels, fall back to INITIAL_HOSTELS
        if (uniqueParsed.length === 0) {
          console.warn('LocalStorage had no valid hostels — falling back to INITIAL_HOSTELS.');
          localStorage.removeItem('kisii_hostels');
          return [...INITIAL_HOSTELS].sort(sortHostelsByEstate);
        }
        return uniqueParsed.sort(sortHostelsByEstate);
      } catch (e) {
        localStorage.removeItem('kisii_hostels');
        return [...INITIAL_HOSTELS].sort(sortHostelsByEstate);
      }
    }
    return [...INITIAL_HOSTELS].sort(sortHostelsByEstate);
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kisii_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem('kisii_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [relocations, setRelocations] = useState<RelocationRequest[]>(() => {
    const saved = localStorage.getItem('kisii_relocations');
    return saved ? JSON.parse(saved) : INITIAL_RELOCATIONS;
  });

  const [reviews, setReviews] = useState<HostelReview[]>(() => {
    const saved = localStorage.getItem('kisii_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [registeredUsers, setRegisteredUsers] = useState<ClientUser[]>(() => {
    try {
      const saved = localStorage.getItem('kisii_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((u: any) => u && typeof u === 'object' && u.uid);
        }
      }
    } catch (e) {
      console.warn('Failed to parse registered users:', e);
    }
    return INITIAL_USERS;
  });

  const [recordedStats, setRecordedStats] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kisii_recorded_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse recorded stats:', e);
    }
    return [
      { id: 'stats-1', timestamp: '2026-06-01T10:00:00Z', memo: 'Launch Day Baseline', total: 5, students: 3, owners: 1, guests: 1 },
      { id: 'stats-2', timestamp: '2026-06-08T17:00:00Z', memo: 'End of Week 1 Drive', total: 7, students: 4, owners: 2, guests: 1 }
    ];
  });

  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<{
    uid: string;
    email: string;
    displayName: string;
    category: 'Student' | 'Property Owner' | 'Guest';
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
    synced?: boolean;
  } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Listen for Firebase account session changes (with localStorage fallback)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
          logAnalyticsEvent('login', { method: 'firebase_auth', userId: firebaseUser.uid });
          
          // Force email verification (except for admin account)
          if (!firebaseUser.emailVerified && firebaseUser.email !== ADMIN_EMAIL) {
            setAuthModalMode('verification_pending');
            setIsAuthModalOpen(true);
          }

          const localKey = `kisii_user_profile_${firebaseUser.uid}`;
          
          // 1. Instantly load local cache if available (Non-blocking)
          let parsedCached = null;
          try {
            const cached = localStorage.getItem(localKey);
            if (cached) {
              parsedCached = JSON.parse(cached);
            }
          } catch (e) {
            console.warn('Failed to parse cached profile from localStorage:', e);
          }

          if (parsedCached && typeof parsedCached === 'object' && parsedCached.uid === firebaseUser.uid) {
            setUserProfile(parsedCached);
          } else {
            // Instant default profile fallback
            const fallback = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Comrade Resident',
              category: 'Student' as const,
              createdAt: new Date().toISOString(),
              synced: false
            };
            setUserProfile(fallback);
            try {
              localStorage.setItem(localKey, JSON.stringify(fallback));
            } catch (e) {
              console.warn('Failed to save default profile fallback to localStorage:', e);
            }
          }

          // 2. INSTANTLY end loading screen so the application renders right away
          setIsAuthLoading(false);

          // 3. Asynchronously fetch the latest profile from Firestore in the background
          (async () => {
            try {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const data = userDocSnap.data() as any;
                const syncedData = { ...data, synced: true };
                setUserProfile(syncedData);
                try {
                  localStorage.setItem(localKey, JSON.stringify(syncedData));
                } catch (e) {
                  console.warn('Failed to save synced profile to localStorage:', e);
                }
              }
            } catch (error) {
              console.warn('Background Firestore profile read failed, using cached profile:', error);
            }
          })();
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setIsAuthLoading(false);
        }
      } catch (e) {
        console.error('Error during auth state change:', e);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Background profile cloud synchronizer
  useEffect(() => {
    if (!currentUser || !userProfile || userProfile.synced) return;

    let active = true;
    const syncProfile = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          uid: userProfile.uid,
          email: userProfile.email,
          displayName: userProfile.displayName,
          category: userProfile.category,
          phone: userProfile.phone || '',
          createdAt: userProfile.createdAt || new Date().toISOString()
        }, { merge: true });
        
        if (active) {
          const syncedProfile = { ...userProfile, synced: true };
          setUserProfile(syncedProfile);
          const localKey = `kisii_user_profile_${currentUser.uid}`;
          localStorage.setItem(localKey, JSON.stringify(syncedProfile));
          console.log('✓ Profile successfully synced to Firestore cloud.');
        }
      } catch (err) {
        console.warn('Background Firestore sync pending (will retry):', err);
      }
    };

    syncProfile();
    const interval = setInterval(syncProfile, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentUser, userProfile?.synced]);


  // Cross-tab logout: listen for logout signal from other tabs
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'kisii_logout_signal') {
        signOut(auth).catch(() => {});
        setCurrentUser(null);
        setUserProfile(null);
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Computed current logged-in profile, or customized guest values if not authenticated
  const loggedStudent = userProfile ? {
    name: userProfile.displayName || userProfile.email?.split('@')[0] || 'Comrade Resident',
    regCode: (userProfile.uid || '').substring(0, 8).toUpperCase(),
    email: userProfile.email || '',
    phone: userProfile.phone || '0712345678',
    gender: 'Male' as const,
    category: userProfile.category || 'Student',
    createdAt: userProfile.createdAt
  } : {
    name: 'Bonface Esau',
    regCode: 'K13/5431/25',
    email: 'esaubornface73@gmail.com',
    phone: '0712345678',
    gender: 'Male' as const,
    category: 'Student' as const,
    createdAt: undefined
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kisii_hostels', JSON.stringify(hostels));
  }, [hostels]);

  // Caching & Firestore Revalidation / Seeding
  useEffect(() => {
    const fetchHostelsFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'hostels'));
        if (!querySnapshot.empty) {
          const loadedHostels: Hostel[] = [];
          // Build a lookup map from INITIAL_HOSTELS for fallback room data
          const initialHostelMap = new Map<string, Hostel>();
          for (const ih of INITIAL_HOSTELS) {
            initialHostelMap.set(ih.id, ih);
          }

          for (const docSnap of querySnapshot.docs) {
            let data = docSnap.data() as Hostel;

            // Force update on-campus hostels if they are outdated in Firestore
            if (data.id === 'hostel-venus-mars' || data.id === 'hostel-cz-blackhouse') {
              if (!data.externalLink) {
                console.log(`Outdated on-campus hostel "${data.name}" detected in Firestore. Syncing...`);
                const freshHostel = INITIAL_HOSTELS.find(h => h.id === data.id);
                if (freshHostel) {
                  try {
                    await setDoc(doc(db, 'hostels', data.id), freshHostel);
                    data = freshHostel;
                  } catch (syncErr) {
                    console.error('Failed to sync on-campus hostel to Firestore:', syncErr);
                  }
                }
              }
            }

            // Validate that the hostel has required fields and a valid rooms array
            if (data && data.id && data.name && data.area) {
              // Ensure rooms is a valid array; if missing/empty (and not externalLink), try to recover from INITIAL_HOSTELS
              if (!Array.isArray(data.rooms) || (data.rooms.length === 0 && !data.externalLink)) {
                const fallback = initialHostelMap.get(data.id);
                if (fallback && Array.isArray(fallback.rooms) && fallback.rooms.length > 0) {
                  data.rooms = fallback.rooms;
                  console.warn(`Hostel "${data.name}" had missing/empty rooms — recovered from INITIAL_HOSTELS.`);
                } else if (!data.externalLink) {
                  console.warn(`Hostel "${data.name}" has no rooms and no fallback — skipping.`);
                  continue; // Skip hostels with no rooms and no fallback
                }
              }
              loadedHostels.push(data);
            } else {
              console.warn('Skipping invalid hostel document from Firestore:', docSnap.id);
            }
          }

          if (loadedHostels.length > 0) {
            // Merge in any initial hostels that are missing from Firestore
            const seenIds = new Set(loadedHostels.map(h => h.id));
            for (const ih of INITIAL_HOSTELS) {
              if (!seenIds.has(ih.id)) {
                loadedHostels.push(ih);
              }
            }

            // Sort hostels by estate/area to maintain layout alignment consistency
            const estateOrderLocal = [
              'On-Campus', 'Mwembe', 'Nyanchwa', 'Milimani', 'Jogoo', 'Safariland', 'Nyaura', 'Canaan', 'Kisumu ndogo', 'Fanta'
            ];
            const sorted = loadedHostels.sort((a, b) => {
              const indexA = estateOrderLocal.indexOf(a.area);
              const indexB = estateOrderLocal.indexOf(b.area);
              const orderA = indexA === -1 ? 999 : indexA;
              const orderB = indexB === -1 ? 999 : indexB;
              if (orderA !== orderB) return orderA - orderB;
              return a.name.localeCompare(b.name);
            });

            setHostels(sorted);
            localStorage.setItem('kisii_hostels', JSON.stringify(sorted));
            console.log(`Successfully fetched and synced ${sorted.length} hostels from Firestore.`);
          } else {
            console.warn('All Firestore hostels were invalid — keeping local/initial data.');
          }
        } else {
          // If Firestore is empty, seed it with INITIAL_HOSTELS
          console.log('Firestore is empty. Auto-seeding default INITIAL_HOSTELS to database.');
          for (const hostel of INITIAL_HOSTELS) {
            await setDoc(doc(db, 'hostels', hostel.id), hostel);
          }
        }
      } catch (err) {
        console.warn('Firestore hostels fetch failed, using local cached copy:', err);
      }
    };

    fetchHostelsFromFirestore();
  }, []);

  // Real-time Firestore sync for Bookings
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'bookings'), async (snapshot) => {
      if (snapshot.empty) {
        console.log('Bookings is empty in Firestore. Seeding default bookings...');
        for (const b of INITIAL_BOOKINGS) {
          try {
            await setDoc(doc(db, 'bookings', b.id), b);
          } catch (e) {
            console.error('Error seeding booking:', e);
          }
        }
      } else {
        const loaded: Booking[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Booking);
        });
        setBookings(loaded);
      }
    }, (error) => {
      console.warn('Real-time bookings sync failed:', error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Real-time Firestore sync for Maintenance
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'maintenance'), async (snapshot) => {
      if (snapshot.empty) {
        console.log('Maintenance is empty in Firestore. Seeding default requests...');
        for (const m of INITIAL_MAINTENANCE) {
          try {
            await setDoc(doc(db, 'maintenance', m.id), m);
          } catch (e) {
            console.error('Error seeding maintenance:', e);
          }
        }
      } else {
        const loaded: MaintenanceRequest[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as MaintenanceRequest);
        });
        const sorted = loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMaintenance(sorted);
      }
    }, (error) => {
      console.warn('Real-time maintenance sync failed:', error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Real-time Firestore sync for Relocations
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'relocations'), async (snapshot) => {
      if (snapshot.empty) {
        console.log('Relocations is empty in Firestore. Seeding default relocations...');
        for (const r of INITIAL_RELOCATIONS) {
          try {
            await setDoc(doc(db, 'relocations', r.id), r);
          } catch (e) {
            console.error('Error seeding relocation:', e);
          }
        }
      } else {
        const loaded: RelocationRequest[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as RelocationRequest);
        });
        const sorted = loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRelocations(sorted);
      }
    }, (error) => {
      console.warn('Real-time relocations sync failed:', error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kisii_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kisii_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('kisii_relocations', JSON.stringify(relocations));
  }, [relocations]);

  useEffect(() => {
    localStorage.setItem('kisii_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kisii_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('kisii_recorded_stats', JSON.stringify(recordedStats));
  }, [recordedStats]);

  // Theme Toggle State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kisii_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('kisii_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // UI Navigation / Viewing States
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings' | 'maintenance' | 'sophia' | 'admin' | 'news'>('explore');
  const [adminSubTab, setAdminSubTab] = useState<'listings' | 'clients' | 'repairs'>('listings');
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'details'>('landing');
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPostingNews, setIsPostingNews] = useState(false);
  const [replyInputPostId, setReplyInputPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Anonymous message state for Gossip Hub
  const [postAnonymously, setPostAnonymously] = useState<boolean>(false);
  
  // State for Direct Admin Messages
  const [adminChats, setAdminChats] = useState<AdminChatMessage[]>([]);
  const [activeChatStudentEmail, setActiveChatStudentEmail] = useState<string | null>(null);
  const [newAdminMessage, setNewAdminMessage] = useState<string>('');
  const [sendChatAnonymously, setSendChatAnonymously] = useState<boolean>(false);
  const [isSendingAdminMessage, setIsSendingAdminMessage] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom when messages or active chat changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [adminChats, activeChatStudentEmail, activeTab]);

  const studentChatSummaries = useMemo(() => {
    const groups: Record<string, { email: string; lastMsg: string; timestamp: number; unreadCount: number; senderName: string }> = {};
    adminChats.forEach((msg) => {
      const studentEmail = msg.chatId;
      const isFromStudent = msg.senderEmail === studentEmail;
      const current = groups[studentEmail];
      
      let unreadIncrement = isFromStudent ? 1 : 0;
      
      if (!current) {
        groups[studentEmail] = {
          email: studentEmail,
          lastMsg: msg.text,
          timestamp: msg.timestamp,
          unreadCount: unreadIncrement,
          senderName: isFromStudent ? msg.senderName : 'Comrade'
        };
      } else {
        if (msg.timestamp > current.timestamp) {
          current.lastMsg = msg.text;
          current.timestamp = msg.timestamp;
          if (isFromStudent) {
            current.senderName = msg.senderName;
          }
        }
        if (!isFromStudent) {
          current.unreadCount = 0;
        } else {
          current.unreadCount += unreadIncrement;
        }
      }
    });
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [adminChats]);
  
  const [anonMessage, setAnonMessage] = useState<string>('');
  const [isSendingAnon, setIsSendingAnon] = useState<boolean>(false);
  const [likedPostIds_dummy, setLikedPostIds_dummy] = useState<never[]>([]); // placeholder to avoid removing next block

  // Local storage for liked news IDs to keep the "hasLiked" private to the user's browser
  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kisii_liked_news') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kisii_liked_news', JSON.stringify(likedPostIds));
  }, [likedPostIds]);

  // ── HISTORY ROUTING SYNCHRONIZATION ───────────────────────────────────────
  useEffect(() => {
    // Initialize history state on load
    if (!window.history.state) {
      window.history.replaceState({ page: currentPage }, '', '');
    } else if (window.history.state.page) {
      setCurrentPage(window.history.state.page);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Only push if the current history state is different from the new page
    if (window.history.state?.page !== currentPage) {
      window.history.pushState({ page: currentPage }, '', '');
    }
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Real-time Firestore sync for KSH Gossip
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'news'), async (snapshot) => {
      if (snapshot.empty) {
        console.log('KSH Gossip is empty in Firestore. Seeding default gossip posts...');
        const initialNews: NewsPost[] = [
          { 
            id: '1', 
            authorName: 'Admin', 
            authorInitials: 'AD', 
            content: 'Please note that the new curfew for all Kisii University internal hostels is now 10:00 PM starting this Friday. Ensure you are within the premises before the gates are locked.', 
            createdAt: 'June 20, 2026', 
            likes: 12, 
            type: 'Alert', 
            typeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
            replies: [
              { id: 'r1', authorName: 'Comrade Kevin', authorInitials: 'CK', content: '10:00 PM is too early! We have group discussions in the library until late.', createdAt: 'June 20, 2026' },
              { id: 'r2', authorName: 'Warden John', authorInitials: 'WJ', content: 'Arrangements can be made with the hostel warden for students with verified late library assignments.', createdAt: 'June 20, 2026' }
            ],
            timestamp: 1779321600000
          },
          { 
            id: '2', 
            authorName: 'Water Dept', 
            authorInitials: 'WD', 
            content: 'The main borehole pump is undergoing scheduled maintenance. Expect low water pressure on Saturday morning from 8:00 AM to 12:00 PM.', 
            createdAt: 'June 18, 2026', 
            likes: 5, 
            type: 'Info', 
            typeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            replies: [],
            timestamp: 1779148800000
          },
          { 
            id: '3', 
            authorName: 'Admin', 
            authorInitials: 'AD', 
            content: 'All students are reminded that the deadline for clearing room allocation balances for the upcoming semester is June 30th. Failure to clear will result in automatic reallocation.', 
            createdAt: 'June 15, 2026', 
            likes: 45, 
            type: 'Important', 
            typeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            replies: [
              { id: 'r3', authorName: 'Faith Mwangi', authorInitials: 'FM', content: 'Can we pay in installments or does it have to be a one-time clear?', createdAt: 'June 16, 2026' }
            ],
            timestamp: 1778889600000
          }
        ];
        for (const post of initialNews) {
          try {
            await setDoc(doc(db, 'news', post.id), post);
          } catch (e) {
            console.error('Error seeding news:', e);
          }
        }
      } else {
        const loaded: NewsPost[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as NewsPost);
        });
        
        // Sort: Pinned first, then by timestamp descending (newest first)
        const sorted = loaded.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          
          const timeA = a.timestamp || 0;
          const timeB = b.timestamp || 0;
          return timeB - timeA;
        });
        setNewsPosts(sorted);
      }
    }, (error) => {
      console.warn('Real-time news sync failed:', error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for Admin Chats
  useEffect(() => {
    if (!currentUser) {
      setAdminChats([]);
      return;
    }

    const isAdmin = (userProfile?.email || currentUser?.email || '').toLowerCase() === ADMIN_EMAIL;
    const chatsRef = collection(db, 'admin_chats');
    
    let chatsQuery;
    if (isAdmin) {
      chatsQuery = query(chatsRef);
    } else {
      chatsQuery = query(chatsRef, where('chatId', '==', currentUser.email));
    }

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const loaded: AdminChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push(docSnap.data() as AdminChatMessage);
      });
      // Sort in-memory to prevent indexing errors in Firestore
      loaded.sort((a, b) => a.timestamp - b.timestamp);
      setAdminChats(loaded);
    }, (error) => {
      console.warn('Real-time admin chats sync failed:', error);
    });

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminMessage.trim() || !currentUser) return;

    setIsSendingAdminMessage(true);
    try {
      const isSenderAdmin = (userProfile?.email || currentUser?.email || '').toLowerCase() === ADMIN_EMAIL;
      const chatId = isSenderAdmin ? activeChatStudentEmail : currentUser.email;
      if (!chatId) {
        showFeedback('No active conversation selected.', 'warning');
        return;
      }

      const messageId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
      const senderName = isSenderAdmin 
        ? 'Admin' 
        : (sendChatAnonymously ? 'Anonymous Comrade' : (userProfile?.displayName || currentUser.email?.split('@')[0] || 'Comrade Resident'));

      const newMsg: AdminChatMessage = {
        id: messageId,
        chatId: chatId,
        senderEmail: currentUser.email || '',
        senderName: senderName,
        recipientEmail: isSenderAdmin ? chatId : ADMIN_EMAIL,
        text: newAdminMessage.trim(),
        timestamp: Date.now(),
        createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      await setDoc(doc(db, 'admin_chats', messageId), newMsg);
      setNewAdminMessage('');
    } catch (err) {
      console.error('Error sending message to admin:', err);
      showFeedback('Failed to send message.', 'warning');
    } finally {
      setIsSendingAdminMessage(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alert':
      case 'Important':
        return 'bg-rose-100 text-rose-750 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/30 dark:border-rose-900/40';
      case 'Lost & Found':
        return 'bg-emerald-100 text-emerald-750 dark:bg-emerald-950/30 dark:text-[#25d366] border border-emerald-250/30 dark:border-emerald-900/40';
      case 'Water & Power':
        return 'bg-blue-100 text-blue-750 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-900/40';
      case 'Gossip':
      case 'Info':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-900/40';
      case 'Room Search':
        return 'bg-indigo-100 text-indigo-755 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-900/40';
      default:
        return 'bg-slate-100 text-slate-705 dark:bg-slate-800/80 dark:text-slate-350 border border-slate-200/30 dark:border-slate-800/40';
    }
  };

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    if (!currentUser) {
      showFeedback('Please log in to post to KSH Gossip.', 'warning');
      return;
    }
    
    setIsPostingNews(true);
    try {
      const author = userProfile?.displayName || currentUser.email?.split('@')[0] || 'Comrade Resident';
      const isAdmin = (userProfile?.email || currentUser?.email || '').toLowerCase() === ADMIN_EMAIL;
      const newPostId = Date.now().toString();
      
      const finalCategory = isAdmin ? 'Alert' : 'General';
      const newPost: NewsPost = {
        id: newPostId,
        authorName: isAdmin ? 'Admin' : 'Anonymous Comrade',
        authorInitials: isAdmin ? 'AD' : '👤',
        authorEmail: currentUser.email || undefined,
        content: newPostContent.trim(),
        createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        likes: 0,
        type: finalCategory,
        typeColor: getCategoryColor(finalCategory),
        replies: [],
        timestamp: Date.now()
      };

      await setDoc(doc(db, 'news', newPostId), newPost);
      setNewPostContent('');
      setPostAnonymously(false);
      showFeedback('✓ Gossip posted successfully!', 'success');
    } catch (err) {
      console.error('Error posting news:', err);
      showFeedback('Failed to post gossip.', 'warning');
    } finally {
      setIsPostingNews(false);
    }
  };
  
  const handleLikeNews = async (id: string) => {
    if (!currentUser) {
      showFeedback('Please log in to like KSH Gossip posts.', 'warning');
      return;
    }

    try {
      const postToLike = newsPosts.find(p => p.id === id);
      if (!postToLike) return;

      const isLiking = !likedPostIds.includes(id);
      
      if (isLiking) {
        setLikedPostIds([...likedPostIds, id]);
      } else {
        setLikedPostIds(likedPostIds.filter(pid => pid !== id));
      }

      const updatedPost = {
        ...postToLike,
        likes: Math.max(0, postToLike.likes + (isLiking ? 1 : -1))
      };
      
      delete updatedPost.hasLiked;

      await setDoc(doc(db, 'news', id), updatedPost);
    } catch (err) {
      console.error('Error liking news:', err);
    }
  };

  const handlePostReply = async (postId: string) => {
    if (!replyContent.trim()) return;
    if (!currentUser) {
      showFeedback('Please log in to reply.', 'warning');
      return;
    }
    
    try {
      const postToReply = newsPosts.find(p => p.id === postId);
      if (!postToReply) return;

      const author = userProfile?.displayName || currentUser.email?.split('@')[0] || 'Comrade Resident';
      const isAdmin = (userProfile?.email || currentUser?.email || '').toLowerCase() === ADMIN_EMAIL;
      
      const newReply = {
        id: Date.now().toString(),
        authorName: isAdmin ? 'Admin' : author,
        authorInitials: isAdmin ? 'AD' : author.substring(0, 2).toUpperCase(),
        content: replyContent.trim(),
        createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };

      const updatedPost = {
        ...postToReply,
        replies: [...(postToReply.replies || []), newReply]
      };

      delete updatedPost.hasLiked;

      await setDoc(doc(db, 'news', postId), updatedPost);
      setReplyContent('');
      setReplyInputPostId(null);
      showFeedback('✓ Reply posted successfully!', 'success');
    } catch (err) {
      console.error('Error posting reply:', err);
      showFeedback('Failed to post reply.', 'warning');
    }
  };

  const handlePinComment = async (postId: string, replyId: string) => {
    try {
      const post = newsPosts.find(p => p.id === postId);
      if (!post || !post.replies) return;

      const updatedReplies = post.replies.map(reply => {
        if (reply.id === replyId) {
          return { ...reply, isPinned: !reply.isPinned };
        }
        return reply;
      });

      const updatedPost = {
        ...post,
        replies: updatedReplies
      };
      delete updatedPost.hasLiked;

      await setDoc(doc(db, 'news', postId), updatedPost);
      showFeedback('✓ Comment pin status updated!', 'success');
    } catch (err) {
      console.error('Error pinning comment:', err);
    }
  };

  const handleDeleteComment = async (postId: string, replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const post = newsPosts.find(p => p.id === postId);
      if (!post || !post.replies) return;

      const updatedReplies = post.replies.filter(reply => reply.id !== replyId);

      const updatedPost = {
        ...post,
        replies: updatedReplies
      };
      delete updatedPost.hasLiked;

      await setDoc(doc(db, 'news', postId), updatedPost);
      showFeedback('✓ Comment deleted successfully.', 'success');
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handlePinPost = async (postId: string) => {
    try {
      const post = newsPosts.find(p => p.id === postId);
      if (!post) return;

      const updatedPost = {
        ...post,
        isPinned: !post.isPinned
      };
      delete updatedPost.hasLiked;

      await setDoc(doc(db, 'news', postId), updatedPost);
      showFeedback(updatedPost.isPinned ? '✓ Post pinned to top!' : '✓ Post unpinned.', 'success');
    } catch (err) {
      console.error('Error pinning post:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const post = newsPosts.find(p => p.id === postId);
    if (!post) return;

    const isAuthor = currentUser && post.authorEmail === currentUser.email;
    if (!isAdminUser && !isAuthor) {
      showFeedback('You do not have permission to delete this post.', 'warning');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this gossip post?')) return;

    try {
      await deleteDoc(doc(db, 'news', postId));
      showFeedback('✓ Gossip post deleted successfully.', 'success');
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleShareNews = (news: NewsPost) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?newsId=${news.id}`;
    const shareText = `[KSH Gossip] ${news.authorName}: "${news.content}"\nRead more at: ${shareUrl}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          showFeedback('✓ Gossip post link and text copied to clipboard!', 'success');
        })
        .catch(() => {
          showFeedback(`Link: ${shareUrl}`, 'info');
        });
    } else {
      showFeedback(`Link: ${shareUrl}`, 'info');
    }
  };

  // Report active presence to Firestore (for admin dashboard monitoring)
  useEffect(() => {
    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('kisii_session_id') || '';
      if (!sessionId) {
        sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('kisii_session_id', sessionId);
      }
    } catch (e) {
      // Memory fallback if sessionStorage is blocked/inaccessible
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    const presenceDocId = currentUser ? currentUser.uid : sessionId;

    const updatePresence = async () => {
      try {
        const presenceRef = doc(db, 'presence', presenceDocId);
        await setDoc(presenceRef, {
          uid: presenceDocId,
          email: currentUser?.email || 'guest@kisii.portal',
          name: userProfile?.displayName || (currentUser ? (currentUser.email?.split('@')[0] || 'Comrade Resident') : 'Guest Comrade'),
          category: userProfile?.category || (currentUser ? 'Student' : 'Guest'),
          lastActive: Date.now(),
          currentPage,
          activeTab,
        }, { merge: true });
      } catch (err) {
        console.warn('Failed to write presence to Firestore:', err);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 120000); // Keep alive every 2 minutes
    return () => clearInterval(interval);
  }, [currentUser?.uid, userProfile?.displayName, currentPage, activeTab]);

  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [showBottomBar, setShowBottomBar] = useState<boolean>(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  useEffect(() => {
    let lastScrollY = window.scrollY || window.pageYOffset;
    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset;
      
      // Calculate scroll progress percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (currentScrollY / scrollHeight) * 100 : 0;
      setScrollPercent(Math.min(100, Math.max(0, progress)));

      // Hide-on-scroll logic
      if (currentScrollY > 70 && currentScrollY > lastScrollY) {
        setShowHeader(false); // scrolling down
        setShowBottomBar(false);
      } else {
        setShowHeader(true); // scrolling up
        setShowBottomBar(true);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [exploreView, setExploreView] = useState<'catalog' | 'rooms'>('catalog');
  const [catalogScrollPos, setCatalogScrollPos] = useState<number>(0);
  const [selectedHostel, setSelectedHostel] = useState<Hostel>(hostels[0]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [roomToBook, setRoomToBook] = useState<{ hostel: Hostel; room: Room } | null>(null);

  const [compareHostels, setCompareHostels] = useState<Hostel[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [adminSelectedHostelId, setAdminSelectedHostelId] = useState<string>('');
  const [adminHostelSearchQuery, setAdminHostelSearchQuery] = useState<string>('');
  const [adminDraftHostel, setAdminDraftHostel] = useState<Hostel | null>(null);
  const [isUploadingHostelImage, setIsUploadingHostelImage] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  // Admin Maintenance Dispatch Panel States
  const [activeAssignIssueId, setActiveAssignIssueId] = useState<string | null>(null);
  const [assignFundiName, setAssignFundiName] = useState<string>('Fundi Joseph (Plumber)');
  const [assignCustomFundiName, setAssignCustomFundiName] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [activeCompleteIssueId, setActiveCompleteIssueId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [repairsFilter, setRepairsFilter] = useState<'All' | 'Reported' | 'In Progress' | 'Completed'>('All');

  // Student Services Hub tab selection
  const [repairHubTab, setRepairHubTab] = useState<'repairs' | 'relocations' | 'laundry'>('repairs');

  // Admin Relocation Dispatch Panel States
  const [activeAssignRelocId, setActiveAssignRelocId] = useState<string | null>(null);
  const [assignMoverName, setAssignMoverName] = useState<string>('Kisii Campus Movers (Pickup)');
  const [assignCustomMoverName, setAssignCustomMoverName] = useState<string>('');
  const [assignRelocNotes, setAssignRelocNotes] = useState<string>('');
  const [relocationsFilter, setRelocationsFilter] = useState<'All' | 'Pending Dispatch' | 'Scheduled' | 'In Transit' | 'Completed'>('All');
  const [adminRepairsTab, setAdminRepairsTab] = useState<'repairs' | 'relocations'>('repairs');

  // Admin Firestore Action States
  const [isSavingHostel, setIsSavingHostel] = useState<boolean>(false);
  const [isDeletingHostel, setIsDeletingHostel] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | 'Student' | 'Property Owner' | 'Guest'>('All');
  const [presenceList, setPresenceList] = useState<any[]>([]);

  const handleToggleCompare = (hostel: Hostel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareHostels((prev) => {
      const isAlready = prev.find(h => h.id === hostel.id);
      if (isAlready) {
        return prev.filter(h => h.id !== hostel.id);
      }
      if (prev.length >= 3) {
        showFeedback('You can only compare up to 3 properties at a time.', 'warning');
        return prev;
      }
      return [...prev, hostel];
    });
  };

  // Link Sharing URL Parameters check on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hId = params.get('hostelId');
    if (hId) {
      const match = hostels.find(h => h.id === hId);
      if (match) {
        setSelectedHostel(match);
        setActiveTab('explore');
        setExploreView('rooms');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hostels]);

  // Filter States for browse catalogue
  const [filterArea, setFilterArea] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterFormat, setFilterFormat] = useState<string>('All');
  const [filterWifi, setFilterWifi] = useState(false);
  const [filterBorehole, setFilterBorehole] = useState(false);
  const [filterHotShower, setFilterHotShower] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number>(25000);
  const [maxDistance, setMaxDistance] = useState<number>(1000);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Comrade Search Toggling & Skeleton Loading state handles
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsFilterLoading(true);
    const timer = setTimeout(() => {
      setIsFilterLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [filterArea, filterType, filterFormat, maxBudget, maxDistance, searchQuery]);

  // Reset active image index inside view details whenever selected hostel changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedHostel?.id]);

  const isAdminUser = (userProfile?.email || currentUser?.email || '').toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdminUser) {
      const fetchUsersFromFirestore = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          if (!querySnapshot.empty) {
            const loadedUsers: ClientUser[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              loadedUsers.push({
                uid: data.uid || doc.id,
                email: data.email || '',
                displayName: data.displayName || 'Unknown Comrade',
                category: data.category || 'Student',
                phone: data.phone || '',
                createdAt: data.createdAt || new Date().toISOString()
              });
            });
            loadedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRegisteredUsers(loadedUsers);
            console.log(`Successfully fetched ${loadedUsers.length} users from Firestore.`);
          }
        } catch (err) {
          console.warn('Firestore users fetch failed, using local fallback:', err);
        }
      };
      fetchUsersFromFirestore();
    }
  }, [isAdminUser]);

  // Listen for real-time presence/activity updates (Admin only)
  useEffect(() => {
    if (isAdminUser) {
      const presenceRef = collection(db, 'presence');
      const unsubscribe = onSnapshot(presenceRef, (querySnapshot) => {
        const loadedPresence: any[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.lastActive) {
            loadedPresence.push(data);
          }
        });
        // Sort: most recently active first
        loadedPresence.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
        setPresenceList(loadedPresence);
      }, (err) => {
        console.warn('Real-time presence listener failed:', err);
      });
      return () => unsubscribe();
    }
  }, [isAdminUser]);

  useEffect(() => {
    if (!adminSelectedHostelId && hostels.length > 0) {
      setAdminSelectedHostelId(hostels[0].id);
      setAdminDraftHostel(hostels[0]);
    }
  }, [adminSelectedHostelId, hostels]);

  useEffect(() => {
    if (!adminSelectedHostelId) return;
    const nextHostel = hostels.find((hostel) => hostel.id === adminSelectedHostelId);
    if (nextHostel) {
      setAdminDraftHostel(JSON.parse(JSON.stringify(nextHostel)));
    }
  }, [adminSelectedHostelId]);

  // Reviews submit form state
  const [reviewName, setReviewName] = useState('Bonface Esau');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewRoomType, setReviewRoomType] = useState('Single Room');
  const [reviewStayPeriod, setReviewStayPeriod] = useState('Jan - Apr 2026');
  const [reviewComment, setReviewComment] = useState('');
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  // Auto-fill reviewer name when user profile changes
  useEffect(() => {
    if (userProfile?.displayName) {
      setReviewName(userProfile.displayName);
    }
  }, [userProfile?.displayName]);

  // Close searchable dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById('admin-hostel-dropdown-container');
      if (container && !container.contains(e.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Log screen/page views to Analytics
  useEffect(() => {
    logAnalyticsEvent('screen_view', {
      screen_name: currentPage === 'home' ? 'Home' : `Details_${activeTab}`
    });
  }, [currentPage, activeTab]);

  // Feedback notifications
  const [alertBanner, setAlertBanner] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setAlertBanner({ text, type });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);
  };

  // Screenshot & Focus-loss Prevention Logic
  const [isScreenProtected, setIsScreenProtected] = useState<boolean>(false);

  useEffect(() => {
    if (isAdminUser) {
      document.body.classList.remove('no-screenshots');
      return;
    }

    document.body.classList.add('no-screenshots');

    let focusTimeout: any;

    const handleBlur = () => {
      setIsScreenProtected(true);
    };

    const handleFocus = () => {
      // Small delay before unprotecting to prevent capturing during focus transition
      focusTimeout = setTimeout(() => {
        setIsScreenProtected(false);
      }, 400);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showFeedback('Right-click copy operations are disabled for security reasons.', 'warning');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen key capture
      if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
        e.preventDefault();
        setIsScreenProtected(true);
        try {
          navigator.clipboard.writeText("Screenshots of this portal are prohibited for security purposes.");
        } catch (err) {
          // Ignore clipboard permission errors
        }
        showFeedback('Screenshots are disabled on this portal for security reasons.', 'warning');
        // Auto-clear after 3 seconds if window is in focus
        setTimeout(() => {
          if (document.hasFocus()) {
            setIsScreenProtected(false);
          }
        }, 3000);
      }

      // Prevent Ctrl+P / Cmd+P (Print Screen)
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'p') {
        e.preventDefault();
        showFeedback('Printing this portal is disabled for security reasons.', 'warning');
      }

      // Prevent Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 's') {
        e.preventDefault();
        showFeedback('Saving pages is disabled for security reasons.', 'warning');
      }

      // Prevent F12 / DevTools
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key?.toLowerCase() === 'i')) {
        e.preventDefault();
        showFeedback('Developer tools are restricted for security reasons.', 'warning');
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminUser]);

  // Dynamic DOM injection of Security Shield Overlay
  useEffect(() => {
    let overlayDiv = document.getElementById('security-shield-overlay');
    if (isScreenProtected && !isAdminUser) {
      if (!overlayDiv) {
        overlayDiv = document.createElement('div');
        overlayDiv.id = 'security-shield-overlay';
        overlayDiv.className = 'fixed inset-0 z-[99999] bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 select-none';
        overlayDiv.style.backdropFilter = 'blur(20px)';
        overlayDiv.style.webkitBackdropFilter = 'blur(20px)';
        overlayDiv.innerHTML = `
          <div class="bg-slate-900/95 border border-slate-800 rounded-[32px] p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center gap-6 text-center" style="background-color: rgb(15 23 42 / 0.95); border: 1px solid rgb(30 41 59); border-radius: 24px; padding: 2rem; max-width: 28rem; width: calc(100% - 2rem); margin: 0 1rem; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); display: flex; flex-direction: column; align-items: center; gap: 1.5rem; text-align: center;">
            <div class="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto" style="background-color: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 1rem; width: 4rem; height: 4rem; display: flex; align-items: center; justify-content: center; color: rgb(244, 63, 94); margin-left: auto; margin-right: auto;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse" style="animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8.24-2a1 1 0 0 1 .48 0l8.24 2A1 1 0 0 1 20 6z"/></svg>
            </div>
            <div class="space-y-2" style="margin-top: 0.5rem;">
              <h3 class="text-xl font-extrabold text-slate-100" style="color: #f8fafc; font-family: 'Inter', ui-sans-serif, system-ui; font-size: 1.25rem; font-weight: 800; margin: 0; line-height: 1.25;">Security Shield Active</h3>
              <p class="text-xs text-slate-400 leading-relaxed" style="color: #94a3b8; font-family: 'Inter', ui-sans-serif, system-ui; font-size: 0.75rem; margin-top: 0.5rem; line-height: 1.625;">
                For security reasons, content is hidden when the portal is not in focus to prevent unauthorized screenshots and screen recording.
              </p>
            </div>
            <div class="w-full h-[1px] bg-slate-800" style="background-color: #1e293b; height: 1px; width: 100%;"></div>
            <p class="text-[10px] text-rose-450 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center" style="color: #f43f5e; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0;">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" style="background-color: #f43f5e; width: 6px; height: 6px; border-radius: 9999px;"></span>
              Content Protected
            </p>
          </div>
        `;
        document.body.appendChild(overlayDiv);
      }
    } else {
      if (overlayDiv) {
        overlayDiv.remove();
      }
    }

    return () => {
      const el = document.getElementById('security-shield-overlay');
      if (el) el.remove();
    };
  }, [isScreenProtected, isAdminUser]);

  const renderAuthGuard = (featureName: string, description: string) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 my-8">
      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-indigo-50/50 dark:ring-indigo-950/30">
        <Lock className="w-8 h-8 stroke-[2.25]" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Secure Comrade Feature</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The <span className="font-bold text-indigo-650 dark:text-indigo-400">{featureName}</span> tab requires authentication. {description}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <button
          onClick={() => {
            setAuthModalMode('signin');
            setIsAuthModalOpen(true);
          }}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md active:scale-95 cursor-pointer"
        >
          Sign In to Portal
        </button>
        <button
          onClick={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-6 py-3 rounded-xl transition active:scale-95 cursor-pointer"
        >
          Create Free Account
        </button>
      </div>
    </div>
  );

  // Filtered Hostels mapping
  const filteredHostels = hostels.filter((hostel) => {
    // Defensive: skip hostels with missing/empty rooms arrays (unless it's an external link on-campus hostel)
    if (!hostel || !Array.isArray(hostel.rooms) || (hostel.rooms.length === 0 && !hostel.externalLink)) return false;

    if (filterArea !== 'All' && hostel.area !== filterArea) return false;

    if (hostel.externalLink) {
      // For external link hostels, bypass standard amenities/distance checks
      if (filterWifi || filterBorehole || filterHotShower) return false;
      if (filterType !== 'All' || filterFormat !== 'All') return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (hostel.name || '').toLowerCase().includes(query);
        const matchesArea = (hostel.area || '').toLowerCase().includes(query);
        if (!matchesName && !matchesArea) return false;
      }
      return true;
    }

    if (filterWifi && !hostel.hasWifi) return false;
    if (filterBorehole && !hostel.hasBorehole) return false;
    if (filterHotShower && !hostel.hasHotShower) return false;
    if (hostel.distanceMeters > maxDistance) return false;

    // Text search query filtering
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = (hostel.name || '').toLowerCase().includes(query);
      const matchesArea = (hostel.area || '').toLowerCase().includes(query);
      const matchesDescription = (hostel.description || '').toLowerCase().includes(query);
      const matchesRooms = hostel.rooms.some((room) => 
        (room.roomType || '').toLowerCase().includes(query) || 
        (room.roomNumber || '').toLowerCase().includes(query) ||
        (Array.isArray(room.amenities) ? room.amenities : []).some((amenity) => (amenity || '').toLowerCase().includes(query))
      );
      if (!matchesName && !matchesArea && !matchesDescription && !matchesRooms) {
        return false;
      }
    }

    // Check if any room matches budget, type, and format criteria
    const hasMatchingRoom = hostel.rooms.some((room) => {
      if (room.priceKes > maxBudget) return false;
      if (filterType !== 'All' && room.roomType !== filterType) return false;
      if (filterFormat !== 'All' && room.roomFormat !== filterFormat) return false;
      return true;
    });

    return hasMatchingRoom;
  });

  // Reset Filters
  const handleResetFilters = () => {
    setFilterArea('All');
    setFilterType('All');
    setFilterFormat('All');
    setFilterWifi(false);
    setFilterBorehole(false);
    setFilterHotShower(false);
    setMaxBudget(25000);
    setMaxDistance(1000);
    setSearchInput('');
    setSearchQuery('');
    showFeedback('Search criteria reset completely Comrade', 'info');
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // Profile edit save handler matching ownership rules
  const handleEditProfileSave = async (updatedData: {
    displayName: string;
    phone: string;
    category: 'Student' | 'Property Owner' | 'Guest';
  }) => {
    if (!auth.currentUser) {
      throw new Error('No active session. Please sign in first.');
    }
    const updatedPayload = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      displayName: updatedData.displayName,
      phone: updatedData.phone,
      category: updatedData.category,
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Always save locally first — ensures UI reflects changes immediately
    const localKey = `kisii_user_profile_${auth.currentUser.uid}`;
    localStorage.setItem(localKey, JSON.stringify(updatedPayload));
    setUserProfile(updatedPayload);

    // Attempt Firestore write — if it fails, local cache keeps data safe
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, updatedPayload, { merge: true });
      showFeedback('✓ Profile saved and synced successfully!', 'success');
    } catch (err: any) {
      console.warn('Firestore profile write failed, saved locally:', err);
      showFeedback('✓ Profile saved locally! Will sync when connection allows.', 'success');
    }
  };

  // Email and Password Sign in handler
  const handleEmailSignIn = async (emailInput: string, passwordInput: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      const user = userCredential.user;
      
      if (user && !user.emailVerified && user.email !== ADMIN_EMAIL) {
        setAuthModalMode('verification_pending');
        setIsAuthModalOpen(true);
        showFeedback('Email verification required. Please check your inbox.', 'warning');
      } else {
        setIsAuthModalOpen(false);
        showFeedback('✓ Welcome back, Comrade! You are now signed in.', 'success');
      }
      logAnalyticsEvent('sign_in_success', { email: emailInput });
    } catch (error: any) {
      console.error(error);
      const code = error?.code || '';
      const errorMessages: Record<string, string> = {
        'auth/wrong-password': 'Incorrect password. Please double-check and try again.',
        'auth/user-not-found': 'No account found with this email. Please register first.',
        'auth/invalid-credential': 'Incorrect email or password. Please try again.',
        'auth/invalid-email': 'The email address is not valid.',
        'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes.',
        'auth/network-request-failed': 'Network error — check your internet connection.',
      };
      throw new Error(errorMessages[code] || error?.message || 'Login failed. Please verify your credentials.');
    }
  };

  // Email/Password register with Firestore user profile creation & confirm auto-login
  const handleEmailSignUp = async (
    emailInput: string,
    passwordInput: string,
    displayNameInput: string,
    categoryInput: 'Student' | 'Property Owner' | 'Guest',
    phoneInput: string
  ) => {
    let createdUser: any = null;
    try {
      // 1. Create account via Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      createdUser = userCredential.user;

      if (!createdUser || !createdUser.uid) {
        throw new Error('Could not establish an authorized session with Firebase.');
      }

      // Send verification email
      try {
        await sendEmailVerification(createdUser);
      } catch (verificationErr) {
        console.warn('Initial verification email send failed:', verificationErr);
      }

      // 2. Build profile payload
      const profilePayload = {
        uid: createdUser.uid,
        email: emailInput,
        displayName: displayNameInput,
        category: categoryInput,
        phone: phoneInput || '',
        createdAt: new Date().toISOString()
      };

      // 3. Always save locally FIRST — ensures profile available even if Firestore fails
      const localKey = `kisii_user_profile_${createdUser.uid}`;
      localStorage.setItem(localKey, JSON.stringify(profilePayload));
      setUserProfile(profilePayload);
      setRegisteredUsers(prev => [profilePayload, ...prev.filter(u => u.uid !== profilePayload.uid)]);
      
      // Instead of closing the modal, set mode to verification_pending
      setAuthModalMode('verification_pending');
      setIsAuthModalOpen(true);
      showFeedback(`✓ Welcome, ${displayNameInput}! Verification link sent to ${emailInput}.`, 'success');
      logAnalyticsEvent('sign_up_success', { category: categoryInput, email: emailInput });

      // 4. Try Firestore write — silent failure if permissions not set
      try {
        await setDoc(doc(db, 'users', createdUser.uid), profilePayload);
      } catch (firestoreErr: any) {
        console.warn('Firestore profile create failed, saved locally:', firestoreErr);
        // Already saved locally above — no further action needed
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error?.code && error.code.startsWith('auth/')) {
        const code = error.code;
        const authErrors: Record<string, string> = {
          'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
          'auth/invalid-email': 'The email address is not valid.',
          'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
          'auth/network-request-failed': 'Network error — check your internet connection.',
        };
        throw new Error(authErrors[code] || error?.message || 'Registration failed.');
      }
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      // Emit cross-tab logout signal so other open tabs also log out
      localStorage.setItem('kisii_logout_signal', Date.now().toString());
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      showFeedback('You have been signed out. See you soon, Comrade! 👋', 'info');
    } catch (error: any) {
      console.error(error);
      showFeedback('Sign out failed. Please try again.', 'warning');
    }
  };

  const handleVerificationSuccess = () => {
    if (auth.currentUser) {
      setCurrentUser({ ...auth.currentUser });
      setIsAuthModalOpen(false);
      showFeedback('✓ Email verified! Welcome back, Comrade.', 'success');
    }
  };


  // Copy direct link of hostel to clipboard with query parameter Deep Link
  const handleShareHostel = (hostel: Hostel) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?hostelId=${hostel.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showFeedback('✓ Direct Comrade Link copied to clipboard! Share it with friends.', 'success');
        })
        .catch(() => {
          showFeedback(`Link: ${shareUrl}`, 'info');
        });
    } else {
      showFeedback(`Link: ${shareUrl}`, 'info');
    }
  };

  // Process Room Booking Action
  const handleRoomBookingSubmit = (bookingData: Omit<Booking, 'id' | 'bookedAt' | 'status'>) => {
    if (!roomToBook) return;

    const newBookingId = `book-${Date.now()}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newBookingId,
      status: 'Pending Approval',
      bookedAt: new Date().toISOString()
    };

    // Update Room current occupancy in hostels matrix
    const updatedHostels = hostels.map((hostel) => {
      if (hostel.id === roomToBook.hostel.id) {
        return {
          ...hostel,
          rooms: hostel.rooms.map((room) => {
            if (room.id === roomToBook.room.id) {
              return {
                ...room,
                currentOccupants: room.currentOccupants + 1,
                isAvailable: room.currentOccupants + 1 < room.maxOccupants ? true : false
              };
            }
            return room;
          })
        };
      }
      return hostel;
    });

    setHostels(updatedHostels);
    setBookings([newBooking, ...bookings]);

    (async () => {
      try {
        await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
        const updatedHostel = updatedHostels.find(h => h.id === roomToBook.hostel.id);
        if (updatedHostel) {
          await setDoc(doc(db, 'hostels', roomToBook.hostel.id), updatedHostel);
        }
      } catch (err) {
        console.warn('Failed to sync booking or hostel to Firestore:', err);
      }
    })();
    
    // Automatically select the newly selected hostel in the listing for refresh
    const synchronizedHostel = updatedHostels.find(h => h.id === roomToBook.hostel.id);
    if (synchronizedHostel) {
      setSelectedHostel(synchronizedHostel);
    }

    setRoomToBook(null);
    showFeedback(`Awesome, Spot for Room ${roomToBook.room.roomNumber} is reserved! Standard leasing invoice created.`, 'success');
    logAnalyticsEvent('room_booking', {
      hostelId: roomToBook.hostel.id,
      hostelName: roomToBook.hostel.name,
      roomNumber: roomToBook.room.roomNumber,
      rentSemesterKes: roomToBook.room.priceKes
    });
    setActiveTab('bookings');
    setCurrentPage('details');
  };

  // Process Virtual Tour Booking Action
  const handleRequestVirtualTour = (hostel: Hostel) => {
    if (!currentUser) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      showFeedback('Please sign in or create an account to schedule virtual tours Comrade', 'info');
      return;
    }
    const tourId = `tour-${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM tomorrow
    
    const formattedDate = tomorrow.toLocaleDateString('en-KE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const scheduledTimeStr = `${formattedDate} at 2:00 PM (EAT)`;

    // Choose random platform for simulation variety
    const platforms = ['Google Meet', 'WhatsApp Video Call', 'Zoom Meeting'];
    const chosenPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    
    // Custom links
    const mockLinks: Record<string, string> = {
      'Google Meet': 'https://meet.google.com/abc-defg-hij',
      'WhatsApp Video Call': `https://wa.me/254795858929?text=Hi%2C%20I%20scheduled%20a%20Hostel%20Virtual%20Tour%20online%20for%20${encodeURIComponent(hostel.name)}.%20Let's%20connect%20via%20video%20call!`,
      'Zoom Meeting': `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`
    };

    const newBooking: Booking = {
      id: tourId,
      hostelId: hostel.id,
      hostelName: hostel.name,
      roomId: 'virtual-tour-slot',
      roomNumber: 'Landlord Video Call',
      studentName: loggedStudent.name,
      studentReg: loggedStudent.regCode,
      studentEmail: loggedStudent.email,
      studentPhone: loggedStudent.phone,
      gender: 'Male',
      semester: 'Immediate Tour',
      status: 'Virtual Tour Scheduled',
      bookedAt: new Date().toISOString(),
      isVirtualTour: true,
      tourTime: scheduledTimeStr,
      tourPlatform: chosenPlatform,
      tourLink: mockLinks[chosenPlatform] || 'https://meet.google.com/abc-defg-hij'
    };

    setBookings([newBooking, ...bookings]);
    (async () => {
      try {
        await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
      } catch (err) {
        console.warn('Failed to save virtual tour booking to Firestore:', err);
      }
    })();
    showFeedback(`Virtual Video Tour with ${hostel.name} Caretaker scheduled successfully! Redirecting to your bookings hub...`, 'success');
    logAnalyticsEvent('request_virtual_tour', {
      hostelId: hostel.id,
      hostelName: hostel.name,
      platform: chosenPlatform
    });
    setActiveTab('bookings');
    setCurrentPage('details');
  };

  // Process Checkout
  const handleCheckoutBooking = (bookingId: string) => {
    const bookingToRelease = bookings.find((b) => b.id === bookingId);
    if (!bookingToRelease) return;

    if (!confirm(`Comrade, are you sure you want to trigger check out from room ${bookingToRelease.roomNumber}? This releases your reserved bed space.`)) {
      return;
    }

    // Free occupant quota in Room
    const updatedHostels = hostels.map((hostel) => {
      if (hostel.id === bookingToRelease.hostelId) {
        return {
          ...hostel,
          rooms: hostel.rooms.map((room) => {
            if (room.id === bookingToRelease.roomId) {
              return {
                ...room,
                currentOccupants: Math.max(0, room.currentOccupants - 1),
                isAvailable: true
              };
            }
            return room;
          })
        };
      }
      return hostel;
    });

    setHostels(updatedHostels);

    // Filter out or toggle status to Checked Out
    const nextBookings = bookings.map(b => b.id === bookingId ? { ...b, status: 'Checked Out' as const } : b);
    setBookings(nextBookings);

    (async () => {
      try {
        const updatedBk = nextBookings.find(b => b.id === bookingId);
        if (updatedBk) {
          await setDoc(doc(db, 'bookings', bookingId), updatedBk);
        }
        const updatedHostel = updatedHostels.find(h => h.id === bookingToRelease.hostelId);
        if (updatedHostel) {
          await setDoc(doc(db, 'hostels', bookingToRelease.hostelId), updatedHostel);
        }
      } catch (err) {
        console.warn('Failed to sync checkout updates to Firestore:', err);
      }
    })();

    // Update viewing references
    const synchronizedHostel = updatedHostels.find(h => h.id === bookingToRelease.hostelId);
    if (synchronizedHostel) {
      setSelectedHostel(synchronizedHostel);
    }

    showFeedback(`Checkout checked! Spot released for hostel ${bookingToRelease.hostelName}.`, 'warning');
  };

  // Fast trigger payment transition simulation
  const handleSimulatePayment = (bookingId: string) => {
    let updatedBooking: Booking | null = null;
    const nextBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        const nextStatus = b.status === 'Pending Approval' ? 'Deposit Paid' : 'Fully Confirmed';
        showFeedback(`Transaction verified! M-PESA statement matched. Tenant status updated to ${nextStatus}.`, 'success');
        updatedBooking = { ...b, status: nextStatus };
        return updatedBooking;
      }
      return b;
    });
    setBookings(nextBookings);
    if (updatedBooking) {
      (async () => {
        try {
          await setDoc(doc(db, 'bookings', bookingId), updatedBooking!);
        } catch (err) {
          console.warn('Failed to update booking status in Firestore:', err);
        }
      })();
    }
  };

  const handleAdminBookingStatusChange = (bookingId: string, status: Booking['status']) => {
    const nextBookings = bookings.map((b) => b.id === bookingId ? { ...b, status } : b);
    setBookings(nextBookings);
    const updated = nextBookings.find(b => b.id === bookingId);
    if (updated) {
      (async () => {
        try {
          await setDoc(doc(db, 'bookings', bookingId), updated);
        } catch (err) {
          console.warn('Failed to update booking status in Firestore:', err);
        }
      })();
    }
    showFeedback(`Admin updated booking status to ${status}.`, 'info');
  };

  const handleRecordStatsSnapshot = (memo: string) => {
    const studentsCount = registeredUsers.filter(u => u.category === 'Student').length;
    const ownersCount = registeredUsers.filter(u => u.category === 'Property Owner').length;
    const guestsCount = registeredUsers.filter(u => u.category === 'Guest').length;
    const newSnapshot = {
      id: `stats-${Date.now()}`,
      timestamp: new Date().toISOString(),
      memo: memo.trim() || `Snapshot #${recordedStats.length + 1}`,
      total: registeredUsers.length,
      students: studentsCount,
      owners: ownersCount,
      guests: guestsCount
    };
    setRecordedStats(prev => [newSnapshot, ...prev]);
    showFeedback('✓ Registration statistics snapshot recorded successfully!', 'success');
  };

  const handleDeleteStatsSnapshot = (id: string) => {
    setRecordedStats(prev => prev.filter(s => s.id !== id));
    showFeedback('Snapshot deleted.', 'info');
  };

  const handleSaveAdminHostel = async () => {
    if (!adminDraftHostel || !isAdminUser) return;
    setIsSavingHostel(true);
    
    const exists = hostels.some(h => h.id === adminDraftHostel.id);
    let updatedHostels: Hostel[];
    if (exists) {
      updatedHostels = hostels.map((hostel) => hostel.id === adminDraftHostel.id ? adminDraftHostel : hostel);
    } else {
      updatedHostels = [...hostels, adminDraftHostel];
    }
    
    // Save to local state and localStorage immediately
    setHostels(updatedHostels);
    if (selectedHostel?.id === adminDraftHostel.id) {
      setSelectedHostel(adminDraftHostel);
    }
    setAdminSelectedHostelId(adminDraftHostel.id);
    localStorage.setItem('kisii_hostels', JSON.stringify(updatedHostels));

    try {
      // Write to Firestore to sync
      await setDoc(doc(db, 'hostels', adminDraftHostel.id), adminDraftHostel);
      if (exists) {
        showFeedback(`${adminDraftHostel.name} details saved successfully and synced to Firebase.`, 'success');
      } else {
        showFeedback(`${adminDraftHostel.name} created successfully and synced to Firebase.`, 'success');
      }
    } catch (error: any) {
      console.error('Firestore save failed:', error);
      if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('denied')) {
        let claimsEmail = 'unknown';
        try {
          const tokenResult = await auth.currentUser?.getIdTokenResult(true);
          claimsEmail = (tokenResult?.claims?.email as string) || 'not found in token';
        } catch (e) {
          console.error('Failed to get token claims:', e);
        }
        showFeedback(`Saved locally! Warning: Permission denied by Firebase security rules. Logged in as: ${auth.currentUser?.email || 'Not logged in'} (Token email: "${claimsEmail}"). Only esaubornface73@gmail.com is authorized to write to hostels.`, 'warning');
      } else {
        showFeedback(`Saved locally! Warning: Failed to sync with Firebase (${error?.message || 'Please check your connection'}).`, 'warning');
      }
    } finally {
      setIsSavingHostel(false);
    }
  };

  const handleAdminAddNewHostel = () => {
    if (!isAdminUser) return;
    const newHostelId = `hostel-${Date.now()}`;
    const newHostel: Hostel = {
      id: newHostelId,
      name: 'New Student Hostel',
      area: 'Mwembe',
      distanceMeters: 250,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      imageUrls: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
      imageKeyword: 'modern',
      securityRating: 5,
      hasWifi: true,
      hasBorehole: true,
      hasHotShower: true,
      description: 'A beautiful newly listed student hostel lodging option situated close to Kisii University gate.',
      landlordPhone: '0795858929',
      rentMonthlyKes: 4500,
      rentSemesterKes: 18000,
      rooms: [
        {
          id: `${newHostelId.replace('hostel-', '')}-${Date.now()}`,
          roomNumber: '101',
          roomType: 'Single',
          roomFormat: 'Single Room',
          floor: 1,
          currentOccupants: 0,
          maxOccupants: 1,
          genderPreference: 'Mixed',
          priceKes: 18000,
          rentMonthlyKes: 4500,
          isAvailable: true,
          amenities: ['Study Desk']
        }
      ]
    };
    setAdminSelectedHostelId(newHostelId);
    setAdminDraftHostel(newHostel);
    showFeedback('Initialized a new hostel. Fill details and save to confirm.', 'info');
  };

  const handleAdminDeleteHostel = async () => {
    if (!adminSelectedHostelId || !isAdminUser) return;
    if (hostels.length <= 1) {
      showFeedback('At least one hostel listing must remain in the catalog.', 'warning');
      return;
    }
    if (!confirm('Are you sure you want to delete this hostel? This action will sync to Firebase.')) {
      return;
    }

    setIsDeletingHostel(true);
    const remainingHostels = hostels.filter(h => h.id !== adminSelectedHostelId);
    
    // Save to local state and localStorage immediately
    setHostels(remainingHostels);
    if (remainingHostels.length > 0) {
      setAdminSelectedHostelId(remainingHostels[0].id);
      const nextHostel = remainingHostels[0];
      setAdminDraftHostel(JSON.parse(JSON.stringify(nextHostel)));
      if (selectedHostel?.id === adminSelectedHostelId) {
        setSelectedHostel(nextHostel);
      }
    } else {
      setAdminSelectedHostelId('');
      setAdminDraftHostel(null);
      setSelectedHostel(null as any);
    }
    localStorage.setItem('kisii_hostels', JSON.stringify(remainingHostels));

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'hostels', adminSelectedHostelId));
      showFeedback('Hostel deleted successfully and synced to Firebase.', 'success');
    } catch (error: any) {
      console.error('Firestore delete failed:', error);
      if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('denied')) {
        let claimsEmail = 'unknown';
        try {
          const tokenResult = await auth.currentUser?.getIdTokenResult(true);
          claimsEmail = (tokenResult?.claims?.email as string) || 'not found in token';
        } catch (e) {
          console.error('Failed to get token claims:', e);
        }
        showFeedback(`Deleted locally! Warning: Permission denied by Firebase security rules. Logged in as: ${auth.currentUser?.email || 'Not logged in'} (Token email: "${claimsEmail}"). Only esaubornface73@gmail.com is authorized to delete hostels.`, 'warning');
      } else {
        showFeedback(`Deleted locally! Warning: Failed to sync deletion with Firebase (${error?.message || 'Please check your connection'}).`, 'warning');
      }
    } finally {
      setIsDeletingHostel(false);
    }
  };

  const handleAdminHostelFieldChange = <K extends keyof Hostel>(field: K, value: Hostel[K]) => {
    setAdminDraftHostel((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleAdminRoomFieldChange = <K extends keyof Room>(roomId: string, field: K, value: Room[K]) => {
    setAdminDraftHostel((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map((room) => room.id === roomId ? { ...room, [field]: value } : room)
      };
    });
  };

  const handleAdminAddRoom = () => {
    setAdminDraftHostel((prev) => {
      if (!prev) return prev;
      const nextNumber = prev.rooms.length + 1;
      const newRoom: Room = {
        id: `${prev.id.replace('hostel-', '')}-${Date.now()}`,
        roomNumber: `NEW-${nextNumber}`,
        roomType: 'Single',
        roomFormat: 'Single Room',
        floor: 1,
        currentOccupants: 0,
        maxOccupants: 1,
        genderPreference: 'Mixed',
        priceKes: 12000,
        rentMonthlyKes: 3000,
        isAvailable: true,
        amenities: ['Study Desk']
      };
      return { ...prev, rooms: [...prev.rooms, newRoom] };
    });
  };

  const handleAdminRemoveRoom = (roomId: string) => {
    setAdminDraftHostel((prev) => prev ? { ...prev, rooms: prev.rooms.filter((room) => room.id !== roomId) } : prev);
  };

  const uploadHostelImagesToPostImage = async (files: FileList | File[]) => {
    if (!adminDraftHostel || !isAdminUser) return;
    setIsUploadingHostelImage(true);
    const uploadedUrls: string[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Compress the image client-side before uploading (prevents Payload Too Large errors and speeds up upload)
        const compressed: { base64: string; type: string } = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 900;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round((height * MAX_WIDTH) / width);
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round((width * MAX_HEIGHT) / height);
                  height = MAX_HEIGHT;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Failed to get canvas 2D context for compression.'));
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              
              // Export as compressed JPEG at 0.7 quality
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              const base64 = dataUrl.split(',')[1] || '';
              resolve({ base64, type: 'jpeg' });
            };
            img.onerror = () => reject(new Error('Failed to load image element for compression.'));
            img.src = event.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Could not read selected image file.'));
          reader.readAsDataURL(file);
        });

        const response = await fetch('/api/postimage-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: compressed.base64,
            name: file.name.replace(/\.[^.]+$/, '') || adminDraftHostel.name,
            type: compressed.type
          })
        });

        // Safely read response as text first, then parse to avoid cryptic parser crashes
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonErr) {
          throw new Error(responseText.slice(0, 150) || `Server error: Status code ${response.status}`);
        }

        const hostedUrl = data?.url;
        if (!response.ok || !hostedUrl) {
          throw new Error(data?.error || data?.message || 'PostImage did not return a hosted image URL.');
        }
        uploadedUrls.push(hostedUrl);
        successCount++;
      } catch (error: any) {
        console.error(`PostImage upload failed for ${file.name}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      setAdminDraftHostel((prev) => {
        if (!prev) return prev;
        const currentUrls = prev.imageUrls || [];
        const updatedUrls = [...currentUrls, ...uploadedUrls];
        return {
          ...prev,
          imageUrls: updatedUrls,
          imageUrl: prev.imageUrl ? prev.imageUrl : uploadedUrls[0]
        };
      });
      showFeedback(`Successfully uploaded ${successCount} image(s).${failCount > 0 ? ` Failed to upload ${failCount} image(s).` : ''} Save changes to keep them.`, 'success');
    } else if (failCount > 0) {
      showFeedback(`Failed to upload ${failCount} image(s). Please check your connection or file format.`, 'warning');
    }
    setIsUploadingHostelImage(false);
  };

  // Submit Maintenance Task
  const handleMaintenanceSubmit = async (maintData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!currentUser) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      showFeedback('Please sign in to submit maintenance requests Comrade', 'info');
      return;
    }
    const newRequest: MaintenanceRequest = {
      ...maintData,
      id: `maint-${Date.now()}`,
      status: 'Reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'maintenance', newRequest.id), newRequest);
      setMaintenance([newRequest, ...maintenance]);
      showFeedback(`Maintenance task logged! Handover scheduled with estate technicians.`, 'success');
    } catch (err: any) {
      console.error('Failed to save maintenance request to Firestore:', err);
      showFeedback(`Failed to sync maintenance request to database: ${err.message || 'Permission Denied'}. Please verify your Firestore rules.`, 'warning');
    }
  };

  // Trigger admin simulated mechanic update action
  const handleSimulateMaintenanceTransition = (maintId: string, action: 'In Progress' | 'Completed') => {
    const agents = ['Fundi Joseph (Plumber)', 'Electrician Mike', 'Technician Charles', 'Internet Support Caleb'];
    const chosenAgent = agents[Math.floor(Math.random() * agents.length)];

    let updatedMaint: MaintenanceRequest | null = null;
    const nextMaintenance = maintenance.map((m) => {
      if (m.id === maintId) {
        updatedMaint = {
          ...m,
          status: action,
          allocatedAgent: m.allocatedAgent || chosenAgent,
          notes: action === 'Completed' ? 'Screws tightened, hardware aligned and tested successfully.' : 'Diagnostic on back-piping underway.',
          updatedAt: new Date().toISOString()
        };
        return updatedMaint;
      }
      return m;
    });

    setMaintenance(nextMaintenance);
    if (updatedMaint) {
      (async () => {
        try {
          await setDoc(doc(db, 'maintenance', maintId), updatedMaint!);
        } catch (err) {
          console.warn('Failed to update maintenance status in Firestore:', err);
        }
      })();
    }
    showFeedback(`Warden technician logged status update: ${action}`, 'info');
  };

  // Dispatch maintenance request to custom fundi
  const handleDispatchMaintenance = (maintId: string, fundi: string, notes: string) => {
    let updatedMaint: MaintenanceRequest | null = null;
    const nextMaintenance = maintenance.map((m) => {
      if (m.id === maintId) {
        updatedMaint = {
          ...m,
          status: 'In Progress',
          allocatedAgent: fundi,
          notes: notes || 'Technician dispatched for diagnostics.',
          updatedAt: new Date().toISOString()
        };
        return updatedMaint;
      }
      return m;
    });

    setMaintenance(nextMaintenance);
    if (updatedMaint) {
      (async () => {
        try {
          await setDoc(doc(db, 'maintenance', maintId), updatedMaint!);
        } catch (err) {
          console.warn('Failed to update maintenance dispatch in Firestore:', err);
        }
      })();
    }
    showFeedback(`Successfully dispatched ${fundi} to address the issue.`, 'success');
    setActiveAssignIssueId(null);
    setAssignNotes('');
    setAssignCustomFundiName('');
  };

  // Mark maintenance request as completed/cleared
  const handleClearMaintenance = (maintId: string, notes: string) => {
    let updatedMaint: MaintenanceRequest | null = null;
    const nextMaintenance = maintenance.map((m) => {
      if (m.id === maintId) {
        updatedMaint = {
          ...m,
          status: 'Completed',
          notes: notes || 'Issue resolved successfully and cleared.',
          updatedAt: new Date().toISOString()
        };
        return updatedMaint;
      }
      return m;
    });

    setMaintenance(nextMaintenance);
    if (updatedMaint) {
      (async () => {
        try {
          await setDoc(doc(db, 'maintenance', maintId), updatedMaint!);
        } catch (err) {
          console.warn('Failed to resolve maintenance request in Firestore:', err);
        }
      })();
    }
    showFeedback(`Maintenance request marked as resolved and cleared.`, 'success');
    setActiveCompleteIssueId(null);
    setCompletionNotes('');
  };

  // Submit student relocation booking
  const handleRelocationSubmit = async (relocData: Omit<RelocationRequest, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      showFeedback('Please sign in to book relocation services Comrade', 'info');
      return;
    }
    const newRequest: RelocationRequest = {
      ...relocData,
      id: `reloc-${Date.now()}`,
      status: 'Pending Dispatch',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'relocations', newRequest.id), newRequest);
      setRelocations([newRequest, ...relocations]);
      showFeedback(`Relocation booking submitted! Check dispatch updates below Comrade.`, 'success');
    } catch (err: any) {
      console.error('Failed to save relocation request to Firestore:', err);
      showFeedback(`Failed to submit relocation booking: ${err.message || 'Permission Denied'}. Please verify your Firestore rules.`, 'warning');
    }
  };

  // Dispatch relocation booking to driver/mover
  const handleDispatchRelocation = (relocId: string, mover: string, notes: string) => {
    let updatedReloc: RelocationRequest | null = null;
    const nextRelocations = relocations.map((r) => {
      if (r.id === relocId) {
        updatedReloc = {
          ...r,
          status: 'Scheduled',
          allocatedMover: mover,
          notes: notes || 'Mover scheduled and dispatched.'
        };
        return updatedReloc;
      }
      return r;
    });

    setRelocations(nextRelocations);
    if (updatedReloc) {
      (async () => {
        try {
          await setDoc(doc(db, 'relocations', relocId), updatedReloc!);
        } catch (err) {
          console.warn('Failed to update relocation dispatch in Firestore:', err);
        }
      })();
    }
    showFeedback(`Successfully scheduled ${mover} for the relocation.`, 'success');
    setActiveAssignRelocId(null);
    setAssignRelocNotes('');
    setAssignCustomMoverName('');
  };

  // Transition relocation status (In Transit / Completed)
  const handleUpdateRelocationStatus = (relocId: string, nextStatus: RelocationRequest['status']) => {
    let updatedReloc: RelocationRequest | null = null;
    const nextRelocations = relocations.map((r) => {
      if (r.id === relocId) {
        updatedReloc = {
          ...r,
          status: nextStatus
        };
        return updatedReloc;
      }
      return r;
    });

    setRelocations(nextRelocations);
    if (updatedReloc) {
      (async () => {
        try {
          await setDoc(doc(db, 'relocations', relocId), updatedReloc!);
        } catch (err) {
          console.warn('Failed to update relocation status in Firestore:', err);
        }
      })();
    }
    showFeedback(`Relocation status updated to: ${nextStatus}`, 'success');
  };

  // Helper to render responsive grid of hostel cards for each estate
  const renderHostelGrid = (estateKey: string, hostelsList: Hostel[], info: { label: string; icon: string; description: string }) => {
    return (
      <div key={estateKey} className="space-y-4 bg-slate-50/40 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans tracking-tight">
                {info.label}
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full font-mono border border-indigo-100/10">
                  {hostelsList.length} {hostelsList.length === 1 ? 'hostel' : 'hostels'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{info.description}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hostelsList.map((hostel) => (
            <HostelCard 
              key={hostel.id}
              hostel={hostel}
              onSelect={(h) => {
                setCatalogScrollPos(window.scrollY);
                setSelectedHostel(h);
                setExploreView('rooms');
                window.scrollTo({ top: 0, behavior: 'auto' });
              }}
              onRequestVirtualTour={handleRequestVirtualTour}
              isSelected={selectedHostel?.id === hostel.id}
              isCompared={compareHostels.some(ch => ch.id === hostel.id)}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
      </div>
    );
  };

  // Stats Counters
  const totalHostelsCount = hostels.length;
  const totalBedsAvailableCount = hostels.reduce((acc, hostel) => {
    return acc + hostel.rooms.reduce((rAcc, r) => rAcc + (r.maxOccupants - r.currentOccupants), 0);
  }, 0);

  const activeUserBookings = bookings.filter((b) => b.status !== 'Checked Out');
  const totalBedsCount = hostels.reduce((acc, hostel) => {
    return acc + hostel.rooms.reduce((rAcc, r) => rAcc + r.maxOccupants, 0);
  }, 0);
  const occupiedBedsCount = hostels.reduce((acc, hostel) => {
    return acc + hostel.rooms.reduce((rAcc, r) => rAcc + r.currentOccupants, 0);
  }, 0);
  const occupancyRate = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;
  const visibleMaintenance = isAdminUser 
    ? maintenance 
    : currentUser 
      ? maintenance.filter((m) => m.userEmail === currentUser.email || m.studentName === currentUser.name)
      : [];
  const openMaintenanceCount = visibleMaintenance.filter((m) => m.status !== 'Completed').length;
  const pendingBookingCount = bookings.filter((b) => b.status === 'Pending Approval').length;
  const confirmedBookingCount = bookings.filter((b) => b.status === 'Fully Confirmed').length;
  const adminHostelRows = hostels.map((hostel) => {
    const totalBeds = hostel.rooms.reduce((acc, room) => acc + room.maxOccupants, 0);
    const occupiedBeds = hostel.rooms.reduce((acc, room) => acc + room.currentOccupants, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const getMinSemesterRent = () => {
      if (hostel.rentSemesterKes !== undefined && hostel.rentSemesterKes !== null && hostel.rentSemesterKes !== '') {
        const parsed = typeof hostel.rentSemesterKes === 'number' ? hostel.rentSemesterKes : parseInt(String(hostel.rentSemesterKes).match(/\d+/)?.[0] || '0', 10);
        return parsed || 0;
      }
      return hostel.rooms.length > 0 ? Math.min(...hostel.rooms.map((room) => room.priceKes)) : 0;
    };
    const minRent = getMinSemesterRent();
    return {
      hostel,
      totalBeds,
      occupiedBeds,
      availableBeds,
      minRent,
      occupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
    };
  }).sort((a, b) => b.occupancy - a.occupancy);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(registeredUsers)) return [];
    return registeredUsers.filter((user) => {
      if (!user) return false;
      const displayName = user.displayName || '';
      const email = user.email || '';
      const phone = user.phone || '';
      
      const matchesSearch = 
        displayName.toLowerCase().includes((userSearchQuery || '').toLowerCase()) ||
        email.toLowerCase().includes((userSearchQuery || '').toLowerCase()) ||
        phone.includes(userSearchQuery || '');
      
      const matchesRole = 
        userRoleFilter === 'All' || 
        user.category === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [registeredUsers, userSearchQuery, userRoleFilter]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <main id="main-content" tabIndex={-1} aria-label="Loading Portal Session" className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-14 h-14 bg-gradient-to-tr from-indigo-700 via-indigo-650 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20 animate-pulse">
            <Home className="w-7 h-7 text-white stroke-[2.25] drop-shadow-sm" />
          </div>
          <div className="space-y-1 mt-2">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase font-sans">
              Nyumbani<span className="text-indigo-600 dark:text-indigo-400">Kisii</span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-widest font-bold mt-1">
              Synchronizing Session...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-2"></div>
        </main>
      </div>
    );
  }

  const totalUsersCount = Array.isArray(registeredUsers) ? registeredUsers.length : 0;
  const studentsCount = Array.isArray(registeredUsers) ? registeredUsers.filter(u => u && u.category === 'Student').length : 0;
  const ownersCount = Array.isArray(registeredUsers) ? registeredUsers.filter(u => u && u.category === 'Property Owner').length : 0;
  const guestsCount = Array.isArray(registeredUsers) ? registeredUsers.filter(u => u && u.category === 'Guest').length : 0;

  // ── LANDING PAGE (blue estate overview, shown first for all users) ──────────
  if (currentPage === 'landing') {
    return (
      <>
        <EstateLandingPage
          hostels={hostels}
          currentUser={currentUser}
          onSignInClick={() => {
            setAuthModalMode('signin');
            setIsAuthModalOpen(true);
          }}
          onEnterPortal={() => {
            if (!currentUser) {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
            } else {
              setCurrentPage('details');
              setActiveTab('explore');
              setExploreView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onViewEstate={(estate: string) => {
            if (!currentUser) {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
              return;
            }
            setCurrentPage('details');
            setActiveTab('explore');
            setExploreView('catalog');
            setFilterArea(estate);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onViewHostel={(hostel: Hostel) => {
            if (!currentUser) {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
              return;
            }
            setCurrentPage('details');
            setActiveTab('explore');
            setExploreView('rooms');
            setSelectedHostel(hostel);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onSignIn={async (email, pass) => {
              await handleEmailSignIn(email, pass);
              setCurrentPage('details');
            }}
            onSignUp={handleEmailSignUp}
            initialMode={authModalMode}
            onVerified={handleVerificationSuccess}
          />
        )}
      </>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        {/* accessibility-audit: main landmark even on auth screen */}
        <main id="main-content" tabIndex={-1} aria-label="Authentication">
          {renderAuthGuard('Kisii Student Hostel Portal', 'Only registered users can access the portal.')}
        </main>

        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onSignIn={handleEmailSignIn}
            onSignUp={handleEmailSignUp}
            initialMode={authModalMode}
            onVerified={handleVerificationSuccess}
          />
        )}
      </div>
    );
  }
  return (
    <div id="kisii-hostel-hub-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 pb-12 antialiased transition-colors duration-200">

      {/* accessibility-audit: ARIA live region announces dynamic status changes to screen readers */}
      {/* WCAG 4.1.3 — Status Messages */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="global-sr-announcer"
      >
        {alertBanner?.text}
      </div>

      {/* Dynamic Alerts notification toast banner — role=alert for urgent messages */}
      {alertBanner && (
        <div
          id="global-alert-banner"
          role={alertBanner.type === 'warning' ? 'alert' : 'status'}
          aria-live={alertBanner.type === 'warning' ? 'assertive' : 'polite'}
          aria-atomic="true"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce duration-300"
        >
          <div className={`shadow-lg rounded-2xl p-4 flex items-center gap-3 border text-xs sm:text-sm font-semibold max-w-md ${
            alertBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : alertBanner.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
          }`}>
            <span className="text-xl" aria-hidden="true">
              {alertBanner.type === 'success' ? '✅' : alertBanner.type === 'warning' ? '⚠�?' : 'ℹ�?'}
            </span>
            <span>{alertBanner.text}</span>
          </div>
        </div>
      )}
      {/* Modern High Contrast Header Bar */}
      {/* accessibility-audit: banner landmark */}
      <header
        role="banner"
        aria-label="NyumbaniKisii site header"
        className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-all duration-300 transform ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-3.5 flex items-center justify-between gap-4 w-full">
          
          <div className="flex items-center gap-2">
            {/* Brand Icon & Title */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-100/30 border border-indigo-400/20 active:scale-95 transition-all">
                <Home className="w-5 h-5 text-white stroke-[2.25] drop-shadow-sm" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-sm border border-white">
                  <GraduationCap className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                </div>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                  Nyumbani<span className="text-indigo-600 dark:text-indigo-400">Kisii</span>
                </h1>
                <p className="text-[9px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-1">
                  Student Portal
                </p>
              </div>
            </div>

          </div>

          {/* Theme toggle + Search + Student profile on the SAME row right after the title */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search toggler button */}
            {currentPage === 'details' && (
              <button
                id="header-search-toggle-link"
                onClick={() => {
                  setActiveTab('explore');
                  setExploreView('catalog');
                  const nextSearchState = !isSearchOpen;
                  setIsSearchOpen(nextSearchState);
                  if (nextSearchState) {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 50);
                  }
                  showFeedback(nextSearchState ? 'Comrade search & filters opened! Tap anywhere to select estates.' : 'Closing Search & Filter controls', 'info');
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-2xl border transition-all active:scale-95 cursor-pointer shadow-sm ${
                  isSearchOpen 
                    ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                }`}
                title="Search and Filter Hostel Lodges"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Theme Toggle Button — accessibility-audit: aria-label on icon-only button */}
            <button
              id="theme-toggle-btn"
              onClick={() => {
                const nextTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(nextTheme);
                showFeedback(`Switched to ${nextTheme === 'light' ? 'Light comfort mode' : 'Eye-friendly Dark comfort mode'}!`, 'info');
              }}
              className="flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light'
                ? <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
                : <Sun className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />}
            </button>

            {/* Interactive User Profile Icon Dropdown / Sign-In */}
            {currentUser ? (
              <div className="relative" id="profile-icon-dropdown-container">
                {/* accessibility-audit: aria-expanded communicates dropdown state to screen readers */}
                <button
                  id="profile-dropdown-trigger"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-expanded={showProfileDropdown}
                  aria-controls="profile-dropdown"
                  aria-haspopup="true"
                  aria-label={`${loggedStudent.name} profile menu`}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-sm active:scale-95 animate-in fade-in"
                  title="View Comrade Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-inner" aria-hidden="true">
                    {loggedStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hidden md:inline">
                    Profile
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                
                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowProfileDropdown(false)} />
                    <div 
                      id="profile-dropdown"
                      className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 rounded-2xl text-left animate-in fade-in slide-in-from-top-3 duration-200"
                    >
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md cursor-default">
                          {loggedStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-none">{loggedStudent.name}</h4>
                          <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1.5">{loggedStudent.category}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[11px] font-semibold leading-relaxed text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase">Email</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[125px]">{loggedStudent.email}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase">Phone</span>
                          <span className="font-bold text-slate-800 dark:text-slate-205 font-mono">{loggedStudent.phone}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase">Reg Code</span>
                          <span className="font-bold font-mono text-slate-800 dark:text-slate-205">{loggedStudent.regCode}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase">Member Since</span>
                          <span className="font-bold font-mono text-slate-800 dark:text-slate-205">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setIsEditProfileOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 px-3 mb-2 border border-indigo-200 text-indigo-600 bg-indigo-50/45 hover:bg-indigo-100/60 dark:border-indigo-900/60 dark:text-indigo-400 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>EDIT MY PROFILE</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 px-3 border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>LOG OUT ACCOUNT</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2" id="header-auth-buttons">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Sign In with email & password"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wide transition-all active:scale-95 cursor-pointer shadow-md"
                  title="Create a new Comrade Account"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Semester Booking Live Banner - placed on top before the navigation menu */}
      {currentPage === 'home' && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-920 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none font-black text-9xl uppercase font-sans">
              Kisii
            </div>
            
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 py-1 px-3 rounded-full font-bold uppercase tracking-widest inline-block select-none animate-pulse">
                Semesters Booking Live 🟢
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Find Comfort, Excel Academically.</h2>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
                Secure standard rooms and executive student studios near Kisii University campus gate. Backed with borehole plumbing, high-speed Wi-Fi, and 24/7 watchmen security.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Rendering between Front Page and Details Backpage */}
      {currentPage === 'home' && (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center max-w-md mx-auto space-y-1.5 pb-2">
            <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-700 dark:text-indigo-400 uppercase">
              SELECT YOUR SERVICE PREFERENCE
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Choose an option from the menu below to instantly access room directories, file utility services hub orders, manage invoices, or talk with Sophia active AI.
            </p>
          </div>

          {/* Interactive Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Preference Item 1: Explore Hostels */}
            <div 
              id="pref-explore"
              onClick={() => {
                setActiveTab('explore');
                setCurrentPage('details');
              }}
              className="bg-white dark:bg-slate-900 p-7 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-[6px_6px_14px_#cbd5e1,-6px_-6px_14px_#ffffff] dark:shadow-[6px_6px_14px_#020617,-6px_-6px_14px_#1e293b] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#020617,-10px_-10px_20px_#111827] active:scale-[0.985] transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/55 rounded-2xl flex items-center justify-center border border-indigo-100/60 dark:border-indigo-900/60 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 transition-colors duration-200">
                  <Building className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full font-mono">
                  {totalHostelsCount} Hostels Online
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                  Explore & Book Hostels
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Browse modern lodges in Kisii Estates (Mwembe, Nyanchwa, Canaan, Jogoo). Apply area & budget filters to reserve a premium room instantly.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                Open Directory Catalog →
              </div>
            </div>

            {/* Preference Item 2: My Bookings */}
            <div 
              id="pref-bookings"
              onClick={() => {
                setActiveTab('bookings');
                setCurrentPage('details');
              }}
              className="bg-white dark:bg-slate-900 p-7 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-[6px_6px_14px_#cbd5e1,-6px_-6px_14px_#ffffff] dark:shadow-[6px_6px_14px_#020617,-6px_-6px_14px_#1e293b] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#020617,-10px_-10px_20px_#111827] active:scale-[0.985] transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/55 rounded-2xl flex items-center justify-center border border-indigo-100/60 dark:border-indigo-900/60 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 transition-colors duration-200">
                  <Receipt className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white transition-colors duration-200" />
                </div>
                {activeUserBookings.length > 0 ? (
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 animate-pulse">
                    🟢 Active Reservation
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2.5 py-0.5 rounded-full font-mono">
                    No active bookings
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                  My Bookings & Invoices
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Access your reserved bed space data, check rent payment token balances, verify receipts, view virtual tour links, and rate landlords.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                View Rent Invoices →
              </div>
            </div>

            {/* Preference Item 3: Services Hub */}
            <div 
              id="pref-maintenance"
              onClick={() => {
                setActiveTab('maintenance');
                setCurrentPage('details');
              }}
              className="bg-white dark:bg-slate-900 p-7 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-[6px_6px_14px_#cbd5e1,-6px_-6px_14px_#ffffff] dark:shadow-[6px_6px_14px_#020617,-6px_-6px_14px_#1e293b] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#020617,-10px_-10px_20px_#111827] active:scale-[0.985] transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/55 rounded-2xl flex items-center justify-center border border-indigo-100/60 dark:border-indigo-900/60 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 transition-colors duration-200">
                  <Hammer className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {openMaintenanceCount} Pending Issues
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                  Caretaker Services Hub
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Log plumbing leaks, socket shorts, or lock malfunctions inside your apartment. Real-time logging coordinates direct tasks to local on-site fundis.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                File Repair Ticket →
              </div>
            </div>

            {/* Preference Item 4: AI Fundi Sophia */}
            <div 
              id="pref-sophia"
              onClick={() => {
                setActiveTab('sophia');
                setCurrentPage('details');
              }}
              className="bg-white dark:bg-slate-900 p-7 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-[6px_6px_14px_#cbd5e1,-6px_-6px_14px_#ffffff] dark:shadow-[6px_6px_14px_#020617,-6px_-6px_14px_#1e293b] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#020617,-10px_-10px_20px_#111827] active:scale-[0.985] transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/55 rounded-2xl flex items-center justify-center border border-indigo-100/60 dark:border-indigo-900/60 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 transition-colors duration-200">
                  <MessageSquare className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="text-[10px] font-mono font-black tracking-wider uppercase px-2 py-0.5 bg-amber-300 text-indigo-950 rounded-full select-none">
                  Sophia AI Bot
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                  AI Fundi Sophia Assistant
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Got tenancy disputes, questions on local water hours, curfew lock limits, or hostel rules? Chat directly with Sophia for tailored guidelines.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                Start Chat Session →
              </div>
            </div>

            {/* Preference Item 5: Admin Dashboard */}
            <div 
              id="pref-admin"
              onClick={() => {
                setActiveTab('admin');
                setCurrentPage('details');
              }}
              className="bg-white dark:bg-slate-900 p-7 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-[6px_6px_14px_#cbd5e1,-6px_-6px_14px_#ffffff] dark:shadow-[6px_6px_14px_#020617,-6px_-6px_14px_#1e293b] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#020617,-10px_-10px_20px_#111827] active:scale-[0.985] transition-all cursor-pointer group space-y-4 md:col-span-2 xl:col-span-1"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/55 rounded-2xl flex items-center justify-center border border-indigo-100/60 dark:border-indigo-900/60 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 transition-colors duration-200">
                  <BarChart2 className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="text-[10px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold px-2.5 py-0.5 rounded-full font-mono">
                  {occupancyRate}% Occupied
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                  Admin Dashboard
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Monitor bookings, room occupancy, pending invoices, and maintenance queues across all listed Kisii student hostels.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                Open Admin Control Center â†’
              </div>
            </div>

          </div>
        </main>
      )}

       {/* Conditional Detailed Backpage - display when active currentPage is 'details' */}
      {currentPage === 'details' && (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full animate-in fade-in duration-300">
        
        {/* If in rooms explorer view, show active hostel description inline at the top of the rooms section */}
        {activeTab === 'explore' && exploreView === 'rooms' && selectedHostel && (
          <div className="mb-6 bg-gradient-to-r from-indigo-50/60 to-slate-50/50 dark:from-indigo-950/20 dark:to-slate-900/10 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-none">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-normal">�?�</span>
              <div>
                <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{selectedHostel.name}</h5>
                <span className="text-[9px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-950 px-1.5 py-0.5 rounded">Active Rooms Directory</span>
              </div>
            </div>
            <button
              onClick={() => {
                setExploreView('catalog');
                setTimeout(() => {
                  window.scrollTo({ top: catalogScrollPos, behavior: 'auto' });
                }, 10);
              }}
              className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition px-3 py-1.5 rounded-xl block cursor-pointer"
            >
              �? Back to All Hostels
            </button>
          </div>
        )}

        {/* Dynamic Display Screen Workspace (Right Pane) */}
        <section className="w-full space-y-8 min-w-0">
          
          {/* TAB 1: Explore & Book Hostels catalog */}
          {/* TAB 1: Explore & Book Hostels catalog */}
          {activeTab === 'explore' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {exploreView === 'catalog' ? (
                <>
                  {/* Unified Search & Filter Control Station */}
                  {isSearchOpen && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#020617,-6px_-6px_12px_#111827] space-y-4 transition-all duration-300">
                      
                      {/* Top row: Input search term + primary trigger button (sharing the row responsively) */}
                    <div className="flex flex-row gap-2 items-center w-full">
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
                        <input
                          id="hostel-text-search"
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setSearchQuery(searchInput);
                            }
                          }}
                          placeholder="Search hostels..."
                          className="w-full pl-9 pr-14 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800 dark:text-slate-100 shadow-inner"
                        />
                        {searchInput && (
                          <button
                            id="search-clear-btn"
                            onClick={() => {
                              setSearchInput('');
                              setSearchQuery('');
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-600 px-2 py-0.5 rounded-lg font-bold transition font-mono shadow-sm cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <button
                        id="search-action-btn"
                        onClick={() => setSearchQuery(searchInput)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-2xl transition-all shadow-sm active:scale-95 duration-150 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Search</span>
                      </button>
                    </div>

                    {/* Filter label just above the filter row */}
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono select-none mt-1">
                      Filter
                    </div>

                    {/* Bottom row: Non-wrapping horizontal filter select dropdowns in one clean row with scroll assistance */}
                    <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-2.5 flex items-center justify-between gap-3 w-full select-none">
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        
                        {/* Estate Area Filter Dropdown */}
                        <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
                           <span className="text-slate-500 text-[10px]">�?</span>
                          <select 
                            value={filterArea}
                            onChange={(e) => {
                              setFilterArea(e.target.value);
                              setExploreView('catalog');
                            }}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="All" className="dark:bg-slate-900">All Estates (Kisii)</option>
                            <option value="On-Campus" className="dark:bg-slate-900">On-Campus Halls</option>
                            <option value="Nyanchwa" className="dark:bg-slate-900">Nyanchwa Hills</option>
                            <option value="Mwembe" className="dark:bg-slate-900">Mwembe (Main Gate)</option>
                            <option value="Milimani" className="dark:bg-slate-900">Milimani (Executive)</option>
                            <option value="Jogoo" className="dark:bg-slate-900">Jogoo Estate</option>
                            <option value="Safariland" className="dark:bg-slate-900">Safariland Plaza</option>
                            <option value="Nyaura" className="dark:bg-slate-900">Nyaura Outpost</option>
                            <option value="Canaan" className="dark:bg-slate-900">Canaan Estate</option>
                            <option value="Kisumu ndogo" className="dark:bg-slate-900">Kisumu Ndogo</option>
                            <option value="Fanta" className="dark:bg-slate-900">Fanta Estate</option>
                          </select>
                        </div>

                        {/* Room Type/Format Filter Dropdown */}
                        <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
                          <span className="text-slate-500 text-[10px]">🛌</span>
                          <select 
                            value={filterType}
                            onChange={(e) => {
                              setFilterType(e.target.value);
                              setExploreView('catalog');
                            }}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="All" className="dark:bg-slate-900">All Formats</option>
                            <option value="Single" className="dark:bg-slate-900">Single Room</option>
                            <option value="Double" className="dark:bg-slate-900">Double Room</option>
                            <option value="4-Sharing" className="dark:bg-slate-900">4-Sharing Room</option>
                          </select>
                        </div>

                        {/* Room Layout Filter Dropdown */}
                        <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
                          <span className="text-slate-500 text-[10px]">🏠</span>
                          <select 
                            value={filterFormat}
                            onChange={(e) => {
                              setFilterFormat(e.target.value);
                              setExploreView('catalog');
                            }}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="All" className="dark:bg-slate-900">All Layouts</option>
                            <option value="Bedsitter" className="dark:bg-slate-900">Bedsitter</option>
                            <option value="Single Room" className="dark:bg-slate-900">Single Room</option>
                            <option value="One Bedroom" className="dark:bg-slate-900">One Bedroom</option>
                            <option value="Two Bedroom" className="dark:bg-slate-900">Two Bedroom</option>
                          </select>
                        </div>

                        {/* Budget Limit Filter Dropdown */}
                        <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
                          <span className="text-slate-500 text-[10px]">💰</span>
                          <select 
                            value={maxBudget}
                            onChange={(e) => {
                              setMaxBudget(parseInt(e.target.value));
                              setExploreView('catalog');
                            }}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="25000" className="dark:bg-slate-900">Any Budget</option>
                            <option value="20000" className="dark:bg-slate-900">Under KES 20K/sem</option>
                            <option value="15000" className="dark:bg-slate-900">Under KES 15K/sem</option>
                            <option value="10000" className="dark:bg-slate-900">Under KES 10K/sem</option>
                            <option value="6000" className="dark:bg-slate-900">Under KES 6K/sem</option>
                          </select>
                        </div>

                        {/* Distance Filter Dropdown */}
                        <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
                          <span className="text-slate-500 text-[10px]">🚶</span>
                          <select 
                            value={maxDistance}
                            onChange={(e) => {
                              setMaxDistance(parseInt(e.target.value));
                              setExploreView('catalog');
                            }}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="1000" className="dark:bg-slate-900">Any Distance</option>
                            <option value="800" className="dark:bg-slate-900">Under 800m</option>
                            <option value="500" className="dark:bg-slate-900">Under 500m</option>
                            <option value="250" className="dark:bg-slate-900">Under 250m</option>
                            <option value="100" className="dark:bg-slate-900">Under 100m</option>
                          </select>
                        </div>

                        {/* Amenities Filter Dropdown */}
                        <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
                          <span className="text-slate-500 text-[10px]">✨</span>
                          <select 
                            value={
                              filterWifi && filterBorehole && filterHotShower ? 'All' :
                              filterWifi ? 'Wifi' :
                              filterBorehole ? 'Borehole' :
                              filterHotShower ? 'HotShower' : 'Any'
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'All') {
                                setFilterWifi(true);
                                setFilterBorehole(true);
                                setFilterHotShower(true);
                              } else if (val === 'Wifi') {
                                setFilterWifi(true);
                                setFilterBorehole(false);
                                setFilterHotShower(false);
                              } else if (val === 'Borehole') {
                                setFilterWifi(false);
                                setFilterBorehole(true);
                                setFilterHotShower(false);
                              } else if (val === 'HotShower') {
                                setFilterWifi(false);
                                setFilterBorehole(false);
                                setFilterHotShower(true);
                              } else {
                                setFilterWifi(false);
                                setFilterBorehole(false);
                                setFilterHotShower(false);
                              }
                              setExploreView('catalog');
                            }}
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="Any" className="dark:bg-slate-900">Any Amenity</option>
                            <option value="Wifi" className="dark:bg-slate-900">Wi-Fi</option>
                            <option value="Borehole" className="dark:bg-slate-900">Borehole</option>
                            <option value="HotShower" className="dark:bg-slate-900">Hot Shower</option>
                            <option value="All" className="dark:bg-slate-900">All Premium</option>
                          </select>
                        </div>

                      </div>

                      {/* Reset Action Trigger */}
                      <button 
                        id="reset-filter-link"
                        onClick={() => {
                          handleResetFilters();
                          setExploreView('catalog');
                        }}
                        className="shrink-0 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1 focus:outline-none cursor-pointer border border-slate-200/60 dark:border-transparent"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Reset</span>
                      </button>
                    </div>

                    {/* Show remaining hostels counter banner at bottom of filter control */}
                    <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Showing <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredHostels.length}</strong> matching Comrade {filteredHostels.length === 1 ? 'hostel' : 'hostels'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                        Catalog Size: {hostels.length}
                      </span>
                    </div>

                  </div>
                )}

                  {/* Specific Estate Proximity Insight Block */}
                  {filterArea !== 'All' && ESTATE_SCHOOL_INFO[filterArea] && (() => {
                    const estateInfo = ESTATE_LABELS[filterArea];
                    const proximity = ESTATE_SCHOOL_INFO[filterArea];
                    return (
                      <div className="bg-gradient-to-r from-amber-50/40 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/20 border border-amber-200/60 dark:border-indigo-900/40 p-5 rounded-3xl space-y-3 shadow-sm animate-in slide-in-from-top-3 duration-300">
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-0.5" role="img" aria-label="insight">💡</span>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase font-mono">
                                {estateInfo?.label || filterArea} – Proximity & Transit Analysis
                              </h4>
                              <span className="text-[9px] bg-indigo-600 dark:bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                Estate Insight
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                              {estateInfo?.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-semibold">
                          <div className="bg-white/95 dark:bg-slate-900 p-2.5 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-mono">Distance to Campus:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{proximity.distance}</span>
                          </div>
                          <div className="bg-white/95 dark:bg-slate-900 p-2.5 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-mono">Walk Duration:</span>
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{proximity.walkTime}</span>
                          </div>
                          <div className="bg-white/95 dark:bg-slate-900 p-2.5 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-mono">Transit Security:</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{proximity.securityScore}</span>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-amber-800 dark:text-amber-400 leading-relaxed bg-amber-50/60 dark:bg-amber-950/15 p-2.5 rounded-xl border border-amber-100/40 dark:border-transparent mt-1">
                          <strong>Comrade Safety & Lodging Advice:</strong> {proximity.alert}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Partner Hostels list grouped and rearranged by estate */}
                  {isFilterLoading ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <h3 className="text-xs font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase font-black flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-500 animate-pulse" />
                          Step 1: Choose Hostel Campus
                        </h3>
                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-slate-500 font-bold self-start sm:self-auto animate-pulse">
                          Comrade searching rentals...
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const groupedHostels = filteredHostels.reduce((acc, hostel) => {
                        const area = hostel.area;
                        if (!acc[area]) {
                          acc[area] = [];
                        }
                        acc[area].push(hostel);
                        return acc;
                      }, {} as Record<string, Hostel[]>);

                      return (
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <h3 className="text-xs font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase font-black flex items-center gap-2">
                              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              Step 1: Choose Hostel Campus
                            </h3>
                            <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-full text-indigo-700 dark:text-indigo-400 font-bold self-start sm:self-auto shadow-sm transition-colors duration-200">
                              Remaining: <strong className="text-emerald-600 dark:text-emerald-500 font-black">{filteredHostels.length}</strong> / {hostels.length} available
                            </span>
                          </div>

                          {filteredHostels.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 py-16 space-y-3">
                              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">No hostels matched your filters, Comrade.</p>
                              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Try lowering your amenity constraints or sliding your budget limit higher in the search controls to match Kisii rentals.
                              </p>
                              <button 
                                onClick={handleResetFilters}
                                className="text-xs bg-indigo-600 text-indigo-600 font-bold border border-indigo-200 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition inline-block mt-2"
                              >
                                Reset All Filters
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-10">
                              {estateOrder.map((estateKey) => {
                                const hostelsInEstate = groupedHostels[estateKey];
                                if (!hostelsInEstate || hostelsInEstate.length === 0) return null;
                                
                                const info = ESTATE_LABELS[estateKey] || { label: estateKey, icon: '�?', description: 'Cozy campus selection.' };
                                return renderHostelGrid(estateKey, hostelsInEstate, info);
                              })}

                              {/* Fallback for any other areas not defined in our priority order */}
                              {Object.keys(groupedHostels).map((estateKey) => {
                                if (estateOrder.includes(estateKey)) return null;
                                const hostelsInEstate = groupedHostels[estateKey];
                                if (!hostelsInEstate || hostelsInEstate.length === 0) return null;

                                const info = { label: `${estateKey} Estates`, icon: '�?', description: 'Student community apartments.' };
                                return renderHostelGrid(estateKey, hostelsInEstate, info);
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </>
              ) : (
                // DEDICATED ROOM EXPLORER & HOUSE TOUR PAGE FOR SELECTED HOSTEL
                selectedHostel.externalLink ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Action Nav header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setExploreView('catalog');
                            setTimeout(() => {
                              window.scrollTo({ top: catalogScrollPos, behavior: 'auto' });
                            }, 10);
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200/80 font-mono tracking-wider cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4 text-slate-600" />
                          BACK TO ALL HOSTELS
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] uppercase font-mono tracking-wider font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        🏢 On-Campus Resident Halls
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 md:p-8 space-y-6 max-w-2xl mx-auto text-center">
                      <div className="relative h-64 md:h-80 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850">
                        <img
                          src={getHostelImages(selectedHostel.id, selectedHostel.imageUrl, selectedHostel.imageUrls)[0]}
                          alt={selectedHostel.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                        <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                          <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight">
                            {selectedHostel.name}
                          </h2>
                          <span className="text-xs text-indigo-300 font-mono font-bold uppercase tracking-widest mt-1 inline-block">
                            Official On-Campus Accommodation
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                          All rooms, reservations, and payment details for on-campus student resident halls are managed directly through the official university portal.
                        </p>
                        
                        <div className="pt-2">
                          <a
                            href={selectedHostel.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 text-sm font-bold py-3 px-6 rounded-2xl border border-indigo-700 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition duration-200 cursor-pointer active:scale-98"
                          >
                            <span>Open Official Accommodation Link</span>
                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Action Nav header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setExploreView('catalog');
                            setTimeout(() => {
                              window.scrollTo({ top: catalogScrollPos, behavior: 'auto' });
                            }, 10);
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200/80 font-mono tracking-wider cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4 text-slate-600" />
                          BACK TO ALL HOSTELS
                        </button>

                      {selectedHostel && (
                        <button
                          onClick={() => handleShareHostel(selectedHostel)}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition bg-indigo-50 px-3.5 py-2.5 rounded-xl border border-indigo-100/60 cursor-pointer"
                          title="Share Direct Link for this Hostel"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>SHARE WEBSITE</span>
                        </button>
                      )}
                    </div>
                    
                    {selectedHostel && (
                      <div className="flex items-center gap-2 text-[10.5px] uppercase font-mono tracking-wider font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        �? {selectedHostel.area} Estate • {selectedHostel.distanceMeters}M from Campus Gate
                      </div>
                    )}
                  </div>

                  {/* Profile and Landlord detail card */}
                  {selectedHostel && (() => {
                    const getMinMonthlyRent = () => {
                      if (selectedHostel.rentMonthlyKes !== undefined && selectedHostel.rentMonthlyKes !== null && selectedHostel.rentMonthlyKes !== '') {
                        return selectedHostel.rentMonthlyKes;
                      }
                      if (!selectedHostel.rooms || selectedHostel.rooms.length === 0) {
                        return 4500;
                      }
                      const definedRents = selectedHostel.rooms.map(r => r.rentMonthlyKes).filter(Boolean);
                      if (definedRents.length > 0) {
                        return definedRents.reduce((min, current) => {
                          const minVal = getNumericRent(min, 999999);
                          const currVal = getNumericRent(current, 999999);
                          return currVal < minVal ? current : min;
                        }, definedRents[0]);
                      }
                      return Math.min(...selectedHostel.rooms.map(r => Math.round(r.priceKes / 4)));
                    };

                    const monthlyRent = getMinMonthlyRent();

                    const getMinSemesterRent = () => {
                      if (selectedHostel.rentSemesterKes !== undefined && selectedHostel.rentSemesterKes !== null && selectedHostel.rentSemesterKes !== '') {
                        return selectedHostel.rentSemesterKes;
                      }
                      if (!selectedHostel.rooms || selectedHostel.rooms.length === 0) {
                        return 18000;
                      }
                      return Math.min(...selectedHostel.rooms.map(r => r.priceKes));
                    };

                    const semesterRent = getMinSemesterRent();

                    const detailedRules = selectedHostel.rules && selectedHostel.rules.length > 0 ? selectedHostel.rules : [
                      "No loud speakers or subwoofer sound systems after 10:00 PM",
                      "Keep all shared restrooms and laundry bays clean and dry",
                      "All overnight guests must be logged at the warden caretaker desk"
                    ];

                    const detailedDeposit = selectedHostel.depositRefundable || "Fully refundable on check-out";
                    const detailedCurfew = selectedHostel.gateClosingTime || "11:00 PM curfew limit";

                    const detailImages = getHostelImages(selectedHostel.id, selectedHostel.imageUrl, selectedHostel.imageUrls);
                    const totalImages = detailImages.length;
                    const safeActiveIdx = activeImageIndex >= totalImages ? 0 : activeImageIndex;

                    return (
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-805 overflow-hidden shadow-sm space-y-0">
                        {/* 1. Interactive Multi-Media Showcase (Gallery + YouTube Walkthrough) */}
                        <div className="p-5 md:p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Left: Dynamic Multi-Image Gallery */}
                            <div className="space-y-3">
                              <div className="relative h-64 md:h-80 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img
                                  src={detailImages[safeActiveIdx]}
                                  alt={`${selectedHostel.name} View ${safeActiveIdx + 1}`}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                                
                                <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                                  <span className="text-[9px] bg-indigo-605/95 border border-indigo-400/40 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono shadow-sm">
                                    📸 Space View {safeActiveIdx + 1} of {totalImages}
                                  </span>
                                  <span className="text-[9px] bg-emerald-500 border border-emerald-400/40 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono shadow-sm flex items-center gap-1">
                                    ✓ Verified Shoot
                                  </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 text-white p-1">
                                  <span className="text-[8px] font-mono uppercase bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10 inline-block mb-1">
                                    {['Exterior Facade', 'Room Interior', 'Study Suite', 'Amenities & Utilities'][safeActiveIdx] || `Additional Space Photo ${safeActiveIdx - 3}`}
                                  </span>
                                  <h2 className="text-lg md:text-xl font-black font-sans tracking-tight">
                                    {selectedHostel.name}
                                  </h2>
                                </div>
                              </div>

                              {/* Thumbnail Selector Row */}
                              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                {detailImages.map((imgUrl, idx) => {
                                  const thumbnailLabels = ['Facade', 'Interior', 'Study', 'Amenity'];
                                  const label = thumbnailLabels[idx] || `View ${idx + 1}`;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setActiveImageIndex(idx)}
                                      className={`relative rounded-xl overflow-hidden aspect-[4/3] w-20 shrink-0 border transition-all duration-200 focus:outline-none cursor-pointer ${
                                        safeActiveIdx === idx
                                          ? 'border-indigo-600 ring-2 ring-indigo-500/25 opacity-100 scale-102'
                                          : 'border-slate-300 dark:border-slate-700 opacity-90 hover:opacity-100 hover:border-slate-400'
                                      }`}
                                    >
                                      <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white font-mono py-0.5 text-center truncate">
                                        {label}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Right: Embedded YouTube Room Tour Walkthrough */}
                            <div className="flex flex-col h-full justify-between">
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono font-extrabold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 px-2.5 py-1 rounded border border-indigo-200/50 dark:border-indigo-900/65">
                                    📹 Walkthrough Tour
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-500 font-mono tracking-wider font-extrabold flex items-center gap-0.5">
                                    �? VIRTUAL PREVIEW
                                  </span>
                                </div>
                                <h3 className="text-xs md:text-sm font-black text-slate-805 dark:text-slate-200 font-sans tracking-tight leading-snug">
                                  {selectedHostel.name} Video Walkthrough
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                                  Explore real spatial dimensions, room windows, standard lockers, and community balconies in motion.
                                </p>
                              </div>

                              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner flex-1 min-h-[160px] md:min-h-[220px]">
                                <iframe
                                  src={getHostelYoutubeEmbed(selectedHostel.id)}
                                  title={`${selectedHostel.name} Video Tour`}
                                  className="absolute top-0 left-0 w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Details content panel */}
                        <div className="p-6 md:p-8 space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            
                            {/* Left-center main data: Name, Proximity, Rates, Rules */}
                            <div className="lg:col-span-2 space-y-6">
                              
                              {/* Descriptive tagline */}
                              <div>
                                <h4 className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">Property Description & Highlights</h4>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal mt-2">
                                  {selectedHostel.description}
                                </p>
                              </div>

                              {/* Rates Grid Block: price (per month per person/per semester) */}
                              <div className="bg-gradient-to-br from-emerald-50/60 to-slate-50 border border-emerald-100/80 rounded-2xl p-4 space-y-2">
                                <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-800 uppercase block">
                                  💰 Active Rent & Pricing Schedule (Approved)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-white border border-emerald-50 p-3 rounded-xl">
                                    <span className="text-[10px] text-slate-500 block font-sans">Monthly Rate (Per Person)</span>
                                    <span className="text-lg font-black text-emerald-600 font-mono break-all">{formatMonthlyRent(monthlyRent)}</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Electricity and water inclusive</span>
                                  </div>
                                  <div className="bg-white border border-slate-100 p-3 rounded-xl">
                                    <span className="text-[10px] text-slate-500 block font-sans">Full Academic Semester</span>
                                    <span className="text-lg font-extrabold text-slate-800 font-mono break-all">{formatSemesterRent(semesterRent)}</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Guarantees bed space for 4 months</span>
                                  </div>
                                </div>
                              </div>

                              {/* Location & approximate distance from school */}
                              <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-mono font-bold text-indigo-800 uppercase tracking-wider">�? Campus Proximity Parameters</h4>
                                <div className="flex flex-col sm:flex-row gap-4 text-xs font-semibold text-slate-700">
                                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 flex-1">
                                    <span className="text-base">�?</span>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-mono block">ESTATE LOCATION</span>
                                      <span className="text-slate-800">{selectedHostel.area} Estate, Kisii</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 flex-1">
                                    <span className="text-base">🚶</span>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-mono block">APPROXIMATE DISTANCE</span>
                                      <span className="text-slate-800">{selectedHostel.distanceMeters} Meters from school gate</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 6. Rules including deposits, curfews and roommate policies */}
                              <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                                <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                  📋 Official House Rules & Curfew Information
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-1">
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Security Gate Closing Time</span>
                                    <p className="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                                      🔒 {detailedCurfew}
                                    </p>
                                    <p className="text-[9.5px] text-slate-500 font-normal leading-normal">
                                      Gate is locked securely for peace of mind. Key card access disabled during late hours.
                                    </p>
                                  </div>

                                  <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-1">
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Deposit Refund Policy</span>
                                    <p className="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                                      💰 {detailedDeposit}
                                    </p>
                                    <p className="text-[9.5px] text-slate-500 font-normal leading-normal">
                                      Your deposit secures the room and is returned smoothly upon normal lease exit.
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-200/70">
                                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold block">Tenancy Code of Conduct</span>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                    {detailedRules.map((r, i) => (
                                      <li key={i} className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100/70">
                                        <span className="text-indigo-600 font-bold"># {i + 1}</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                    <li className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100/70">
                                      <span className="text-indigo-600 font-bold"># {detailedRules.length + 1}</span>
                                      <span>Observe standard university guidelines</span>
                                    </li>
                                  </ul>
                                </div>

                              </div>

                            </div>

                            {/* Right Hotline caretaker Card with WhatsApp Action */}
                            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 self-stretch justify-between">
                              <div className="space-y-3">
                                <span className="text-[9px] font-mono text-indigo-700 font-extrabold uppercase tracking-widest bg-indigo-50 border border-indigo-150 rounded px-2 py-0.5 inline-block">
                                  Care Desk Hotline
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 leading-normal">Hostel Representative Contact</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                  Direct contact for live virtual room tour video streams, immediate key allocation, or physical room booking queries.
                                </p>
                                <div className="text-xs font-mono py-2 px-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 space-y-1">
                                  <div>Phone: +254 795 858929</div>
                                  <div className="text-[10px] text-emerald-600 font-normal">✓ WhatsApp Available</div>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <a 
                                  href="tel:0795858929"
                                  className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 border border-slate-950 text-white transition-all text-center"
                                >
                                  <Phone className="w-3.5 h-3.5" /> Call Key Allocator
                                </a>
                                
                                <a 
                                  href={`https://wa.me/254795858929?text=Hi%2C%20Comrade%20Caretaker.%20I%20am%20interested%20in%20allotting%20a%20spot%20at%20${encodeURIComponent(selectedHostel.name)}.%20Please%20verify%20room%20availability%20checks.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-center"
                                >
                                  📨 WhatsApp Landlord
                                </a>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Room Matrix Inside Page Context */}
                  {selectedHostel && (
                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                      <AvailabilityGrid 
                        hostel={selectedHostel}
                        activeBookingRoomId={roomToBook?.room.id}
                        onSelectBookRoom={(room) => {
                          if (!currentUser) {
                            setAuthModalMode('signin');
                            setIsAuthModalOpen(true);
                            showFeedback('Please sign in or create an account to book spaces Comrade', 'info');
                            return;
                          }
                          setRoomToBook({ hostel: selectedHostel, room });
                          // Instantly scroll/focus to modal overlay for premium booking popup selection trigger
                          const element = document.getElementById('book-room-modal-overlay');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    </div>
                  )}

                  {/* Student Reviews & Accommodation Feedback */}
                  {selectedHostel && (() => {
                    const hostelReviews = reviews.filter(r => r.hostelId === selectedHostel.id);
                    const avgRating = hostelReviews.length > 0 
                      ? (hostelReviews.reduce((sum, r) => sum + r.rating, 0) / hostelReviews.length).toFixed(1)
                      : '5.0';

                    const handleLikeReview = (reviewId: string) => {
                      setReviews(prev => prev.map(r => {
                        if (r.id === reviewId) {
                          return { ...r, likes: r.likes + 1 };
                        }
                        return r;
                      }));
                    };

                    const handleReviewSubmit = (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!reviewComment.trim()) {
                        setAlertBanner({ text: 'Please type your review experience before submitting.', type: 'warning' });
                        return;
                      }

                      const newReview: HostelReview = {
                        id: `rev-${Date.now()}`,
                        hostelId: selectedHostel.id,
                        studentName: reviewName.trim() || 'Anonymous Comrade',
                        rating: reviewRating,
                        roomType: reviewRoomType,
                        stayPeriod: reviewStayPeriod,
                        comment: reviewComment.trim(),
                        createdAt: new Date().toISOString(),
                        likes: 0
                      };

                      setReviews(prev => [newReview, ...prev]);
                      setReviewComment('');
                      setAlertBanner({ text: 'Review published successfully! Thank you for supporting fellow Kisii Comrades.', type: 'success' });
                    };

                    return (
                      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-3 py-1 rounded-full uppercase">
                              Comrade Feedback Hub
                            </span>
                            <h3 className="text-xl font-bold font-sans text-slate-900">
                              Student Reviews & Hostels Experience
                            </h3>
                            <p className="text-xs text-slate-500 font-normal">
                              Read authentic feedback left by verified checked out students who stayed at {selectedHostel.name}.
                            </p>
                          </div>

                          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
                            <div className="text-center font-mono pl-1">
                              <span className="text-2xl font-black text-slate-800">{avgRating}</span>
                              <span className="text-[10px] text-slate-500 block uppercase font-sans tracking-tight">Average</span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-200" />
                            <div className="space-y-1">
                              <div className="flex gap-0.5 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-500 block">{hostelReviews.length} Student reviews left</span>
                            </div>
                          </div>
                        </div>

                        {/* Reviews Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* List of Reviews (Left 2/3 column) */}
                          <div className="lg:col-span-2 space-y-4">
                            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
                              Recent Student Testimonials ({hostelReviews.length})
                            </h4>

                            {hostelReviews.length === 0 ? (
  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center space-y-3">
    <span className="text-3xl">?</span>

    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-700">
        No student reviews yet for {selectedHostel.name}.
      </p>

      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Be the very first Comrade to share your experience about deposit refunds,
        curfew time satisfaction, borehole water, or rooms space!
      </p>
    </div>
  </div>
) : (
  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 divide-y divide-slate-100">
    {hostelReviews.map((rev, idx) => (
      <div
        key={rev.id}
        className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-2`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 font-mono">
              {rev.studentName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">
                  {rev.studentName}
                </span>

                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">
                  ✓ Verified Comrade
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 font-mono">
                  Stayed:{' '}
                  <strong className="text-slate-700 font-semibold">
                    {rev.roomType}
                  </strong>{' '}
                  • {rev.stayPeriod}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < rev.rating
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-200'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pl-10.5 antialiased">
          "{rev.comment}"
        </p>

        <div className="flex justify-between items-center pl-10.5 pt-1">
          <button
            onClick={() => handleLikeReview(rev.id)}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg px-2.5 py-1 transition cursor-pointer"
          >
            ? Helpful ({rev.likes})
          </button>

          <span className="text-[9px] text-slate-400 font-mono">
            Kisii Student Accommodation Standards
          </span>
        </div>
      </div>
    ))}
  </div>
)}
                            </div>
<div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 self-start relative overflow-hidden">
  {!currentUser ? (
    <div className="space-y-4 py-4 text-center">
      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6 stroke-[2]" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Review Portal Locked
        </h4>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          To protect reviews from spam and misuse, please sign in with your student account.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
          showFeedback('Please sign in to write reviews Comrade', 'info');
        }}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
      >
        Sign In to Review
      </button>
    </div>
  ) : (
    <>
      <div className="space-y-1">
        <span className="text-[9px] font-mono text-indigo-700 font-extrabold uppercase bg-indigo-50 border border-indigo-200 rounded px-2.5 py-0.5 inline-block">
          Student Feedback Form
        </span>

        <h4 className="text-sm font-bold text-slate-900 leading-snug font-sans">
          Share Your Experience
        </h4>

        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
          Recently stayed or checked this hostel? Help comrades know about landlord deposit rules, curfews, and amenities.
        </p>
      </div>

      <form onSubmit={handleReviewSubmit} className="space-y-4">
        {/* Student Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
            Your Full Name
          </label>

          <input
            type="text"
            required
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            placeholder="e.g. Bonface Esau"
            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Interactive Rating Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
            Select Rating Star
          </label>

          <div className="flex gap-1 items-center">
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingValue = i + 1;

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setReviewRating(ratingValue)}
                  onMouseEnter={() => setRatingHover(ratingValue)}
                  onMouseLeave={() => setRatingHover(null)}
                  className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                >
                  <svg
                    className={`w-6 h-6 transition-colors duration-150 ${
                      ratingValue <= (ratingHover ?? reviewRating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              );
            })}

            <span className="text-[11px] font-mono font-bold text-slate-500 ml-1.5">
              ({reviewRating} / 5)
            </span>
          </div>
        </div>

        {/* Room Type and Stay Period */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
              Room Type
            </label>

            <select
              value={reviewRoomType}
              onChange={(e) => setReviewRoomType(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="4-Sharing">4-Sharing</option>
              <option value="Executive Studio">Executive Studio</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
              Stay Period
            </label>

            <input
              type="text"
              required
              value={reviewStayPeriod}
              onChange={(e) => setReviewStayPeriod(e.target.value)}
              placeholder="Jan - Apr 2026"
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Review Comment */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
            Your Review Experience
          </label>

          <textarea
            required
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Comment on deposit conditions, curfew feedback water, security fundi fixes..."
            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none leading-normal"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-slate-900 border border-slate-950 text-white transition-all text-center cursor-pointer select-none font-sans"
        >
          🌟 Publish Review
        </button>
      </form>
    </>
  )}
    </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              )
            )}
            </div>
          )}

          {/* TAB 2: Bookings Logs & Lipa Na M-PESA Invoice Receipts */}
          {activeTab === 'bookings' && (
            !currentUser ? (
              renderAuthGuard('Bookings & Invoices', 'To view your registered room reservations, generate official M-PESA payment receipts, and manage active tenancies, please log in.')
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">Your Hostel Bookings & Invoices</h2>
                  <p className="text-xs text-slate-500 text-slate-500 mt-1">
                    Direct access to official tenancy receipts, payment paybill gateways, and safe checkout releases.
                  </p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-dashed border-slate-300 py-16 space-y-4">
                  <Receipt className="w-12 h-12 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-lg font-bold">You have no active hostel bookings registered.</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Browse standard campus lodges on the Explore tab to submit a reservation and generate initial invoice tallies.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTab('explore');
                      setCurrentPage('details');
                    }}
                    className="bg-indigo-600 text-white font-bold text-xs py-3 px-5 rounded-xl transition hover:bg-indigo-700 cursor-pointer"
                  >
                    Browse Hostels Now
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((b) => {
                    const cautionDeposit = 3000;
                    // Find actual rent from matched hostel or local storage
                    const associatedHostel = hostels.find(h => h.id === b.hostelId);
                    const associatedRoom = associatedHostel?.rooms.find(r => r.id === b.roomId);
                    const rentAmount = associatedRoom ? associatedRoom.priceKes : 9500;
                    const combinedInvoiced = rentAmount + cautionDeposit;

                    const isCheckedOut = b.status === 'Checked Out';

                    if (b.isVirtualTour) {
                      const isCompleted = b.status === 'Virtual Tour Completed';

                      return (
                        <div 
                          key={b.id}
                          id={`booking-panel-${b.id}`}
                          className={`bg-white rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start transition-all cursor-default ${
                            isCompleted 
                              ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                              : 'border-indigo-200 ring-2 ring-indigo-500/5 shadow-sm'
                          }`}
                        >
                          {/* Lease Details block */}
                          <div className="space-y-4 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded">
                                📹 VIRTUAL TOUR RESERVATION
                              </span>
                              
                              <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded ${
                                isCompleted
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-indigo-100 text-indigo-800 animate-pulse'
                              }`}>
                                {b.status}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-sans font-extrabold text-xl text-slate-900 leading-snug flex items-center gap-2">
                                <span>{b.hostelName}</span>
                                <span className="text-sm font-normal text-slate-400">• Online Video Walkthrough</span>
                              </h3>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                <p className="flex items-center gap-1.5">
                                  <span>📅</span> Scheduled Date: <b className="text-slate-900 font-bold">{b.tourTime || 'Tomorrow at 2:00 PM (EAT)'}</b>
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <span>?</span> Platform: <b className="text-slate-900 font-bold">{b.tourPlatform}</b>
                                </p>
                                <p className="flex items-center gap-1.5 font-mono">
                                  👤 Contact Caretaker: <b className="text-slate-900 font-bold">{associatedHostel?.landlordPhone || '+254795858929'}</b>
                                </p>
                              </div>
                            </div>

                            {!isCompleted && (
                              <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100/60 p-4 rounded-2xl space-y-2">
                                <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-indigo-800 flex items-center gap-1.5">
                                  <Video className="w-4 h-4 text-indigo-600" />
                                  Ready to join your Live walk?
                                </h4>
                                <p className="text-[11px] text-indigo-700 leading-normal">
                                  Your Comrade Landlord caretaker has scheduled this automated walkthrough tour. Click the direct link below to start/join the live stream.
                                </p>
                                <div className="pt-1 flex flex-wrap gap-2">
                                  <a 
                                    href={b.tourLink} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition active:scale-95 cursor-pointer"
                                  >
                                    <span>Join Video Call Now 🚀</span>
                                  </a>
                                  
                                  <a 
                                    href={`https://wa.me/${(associatedHostel?.landlordPhone || '254795858929').replace(/[^0-9]/g, '')}?text=Hi%2C%20Landlord.%20I%20have%20scheduled%20a%20hostel%20virtual%20tour%20for%20${encodeURIComponent(b.hostelName)}%20tomorrow.%20Let's%20connect.`}
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                                  >
                                    <span>Chat on WhatsApp</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Invoice details & actions */}
                          <div className="w-full md:w-64 bg-slate-50 p-5 rounded-2xl border border-slate-300 flex flex-col justify-between self-stretch gap-4">
                            <div className="space-y-2.5">
                              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-500 flex items-center gap-1 pb-1 border-b border-slate-200">
                                Walkthrough Status
                              </h4>
                              
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {!isCompleted 
                                  ? "This tour is active and scheduled. You can mark it completed when your landlord guides you through the hostel video stream."
                                  : "This virtual walkthrough session was marked as completed. Happy house hunting Comrade!"
                                }
                              </p>
                            </div>

                            {!isCompleted ? (
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    const updatedBk = { ...b, status: 'Virtual Tour Completed' as const };
                                    setBookings(bookings.map(book => book.id === b.id ? updatedBk : book));
                                    (async () => {
                                      try {
                                        await setDoc(doc(db, 'bookings', b.id), updatedBk);
                                      } catch (err) {
                                        console.warn('Failed to update virtual tour booking in Firestore:', err);
                                      }
                                    })();
                                    showFeedback(`Awesome! Virtual walkthrough marked as completed for ${b.hostelName}.`, 'success');
                                  }}
                                  className="w-full text-center text-[11px] font-bold py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                                >
                                  Mark as Completed
                                </button>

                                <button
                                  onClick={() => {
                                    if(confirm("Comrade, are you sure you want to cancel this scheduled virtual tour?")) {
                                      setBookings(bookings.filter(book => book.id !== b.id));
                                      (async () => {
                                        try {
                                          await deleteDoc(doc(db, 'bookings', b.id));
                                        } catch (err) {
                                          console.warn('Failed to delete virtual tour booking in Firestore:', err);
                                        }
                                      })();
                                      showFeedback("Virtual walkthrough tour cancelled.", "info");
                                    }
                                  }}
                                  className="w-full text-center text-[10px] font-semibold py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition active:scale-95 cursor-pointer"
                                >
                                  Cancel Virtual Tour
                                </button>
                              </div>
                            ) : (
                              <span className="text-center text-[11px] font-mono text-slate-400 block uppercase font-bold">
                                Session Finished
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={b.id}
                        id={`booking-panel-${b.id}`}
                        className={`bg-white rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start transition-all cursor-default ${
                          isCheckedOut 
                            ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                            : 'border-slate-200 hover:border-slate-400 shadow-sm'
                        }`}
                      >
                        {/* Lease Details block */}
                        <div className="space-y-4 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                              BOOKING ID: {b.id.toUpperCase()}
                            </span>
                            
                            <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded ${
                              b.status === 'Fully Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'Deposit Paid'
                                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                                  : b.status === 'Checked Out'
                                    ? 'bg-slate-200 text-slate-600'
                                    : 'bg-amber-100 text-amber-805 text-amber-800 animate-pulse'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-sans font-extrabold text-xl text-slate-900 leading-snug">
                              {b.hostelName} — Room {b.roomNumber}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-2 text-xs text-slate-600">
                              <p className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Target Term: <b className="text-slate-900">{b.semester}</b>
                              </p>
                              <p className="flex items-center gap-1 font-mono">
                                📞 Contact Student: <b className="text-slate-900">{b.studentPhone}</b>
                              </p>
                              <p className="flex items-center gap-1">
                                👤 Registered Tenant: <b className="text-slate-900">{b.studentName} ({b.studentReg})</b>
                              </p>
                              <p className="flex items-center gap-1 font-mono text-[10px]">
                                📅 Booked Date: {new Date(b.bookedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* MPESA Payment paybill instruction */}
                          {!isCheckedOut && b.status !== 'Fully Confirmed' && (
                            <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl space-y-2">
                              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-emerald-800 flex items-center gap-1">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                M-PESA lipa na paybill process (LNM)
                              </h4>
                              <p className="text-[11px] text-emerald-700 leading-normal">
                                1. Go to your M-PESA Mobile Menu.<br />
                                2. Select Paybill, enter business number <b>403020</b> (Kisii Student Accommodation Board).<br />
                                3. Enter Reference Account: <b>{b.roomNumber}-{b.studentReg.split('/')[1] || 'ROOM'}</b><br />
                                4. Settle amount: <b>KES {combinedInvoiced.toLocaleString()}</b>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Invoice details & actions */}
                        <div className="w-full md:w-64 bg-slate-50 p-5 rounded-2xl border border-slate-300 flex flex-col justify-between self-stretch gap-4">
                          <div className="space-y-2.5">
                            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-500 flex items-center gap-1 pb-1 border-b border-slate-200">
                              Official Bill Statement
                            </h4>
                            
                            <div className="space-y-1.5 text-xs text-slate-600">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Semester Rent:</span>
                                <span className="font-mono font-semibold text-slate-900">KES {rentAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Caution Fee:</span>
                                <span className="font-mono font-semibold text-slate-900">KES {cautionDeposit.toLocaleString()}</span>
                              </div>
                              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold mt-1.5">
                                <span className="text-slate-800">Total Invoice:</span>
                                <span className="font-mono text-slate-900">KES {combinedInvoiced.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {!isCheckedOut && (
                            <div className="space-y-2">
                              {b.status !== 'Fully Confirmed' && (
                                <button
                                  id={`pay-simulation-btn-${b.id}`}
                                  onClick={() => handleSimulatePayment(b.id)}
                                  className="w-full text-center text-[11px] font-bold py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                >
                                  {b.status === 'Pending Approval' ? 'Simulate M-PESA Deposit' : 'Confirm Full Settlement'}
                                </button>
                              )}

                              <button
                                id={`checkout-simulation-btn-${b.id}`}
                                onClick={() => handleCheckoutBooking(b.id)}
                                className="w-full text-center text-[10px] font-semibold py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-rose-600 transition"
                              >
                                Request Check-Out
                              </button>
                            </div>
                          )}

                          {isCheckedOut && (
                            <span className="text-center text-[11px] font-mono text-slate-500 block uppercase font-bold text-slate-400">
                              Spot Released
                            </span>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )
          )}

          {/* TAB 3: Maintenance File & Dispatch Operations */}
          {activeTab === 'maintenance' && (
            !currentUser ? (
              renderAuthGuard('Services Hub', 'To submit maintenance repair requests, view resolved warden tickets, and communicate directly with carpenters or plumbers, please log in.')
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">University Services Hub</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Direct communication terminal with wardens, repair fundis, and transport movers.
                  </p>
                </div>
                
                {/* Switcher tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-auto">
                  <button
                    onClick={() => setRepairHubTab('repairs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${repairHubTab === 'repairs' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    Utility Repairs
                  </button>
                  <button
                    onClick={() => setRepairHubTab('relocations')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${repairHubTab === 'relocations' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Transport & Relocation
                  </button>
                  <button
                    onClick={() => setRepairHubTab('laundry')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${repairHubTab === 'laundry' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                  >
                    <WashingMachine className="w-3.5 h-3.5" />
                    Laundry Services
                  </button>
                </div>
              </div>

              {repairHubTab === 'repairs' && (
                <div className="max-w-3xl mx-auto">
                  <MaintenanceForm 
                    hostels={hostels}
                    onSubmitRequest={handleMaintenanceSubmit}
                    userEmail={loggedStudent.email}
                    defaultStudentName={loggedStudent.name}
                    defaultContactNumber={loggedStudent.phone}
                  />
                </div>
              )}
              {repairHubTab === 'relocations' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-7">
                    <RelocationForm
                      hostels={hostels}
                      onSubmitRequest={handleRelocationSubmit}
                      userEmail={loggedStudent.email}
                      defaultStudentName={loggedStudent.name}
                      defaultContactNumber={loggedStudent.phone}
                    />
                  </div>

                  {/* Right Column: Movers Directory & Student Bookings */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Local Movers Directory */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Compass className="w-4 h-4 text-indigo-500" />
                          Certified Local Movers Directory
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">Verified campus service providers available for quick booking or calls.</p>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { name: 'Kisii Campus Movers (Pickup)', phone: '0701234567', rate: 'KES 1,500 - 3,000', capacity: 'Full Room Set' },
                          { name: 'Mkokoteni Express (Handcart)', phone: '0722000111', rate: 'KES 500 - 1,000', capacity: 'Bed + Bags' },
                          { name: 'Boda Movers (Comrade Boda)', phone: '0733888999', rate: 'KES 200 - 500', capacity: 'Bags & Suitcases' },
                          { name: 'Rainproof Box Van', phone: '0799444555', rate: 'KES 3,000 - 5,000', capacity: 'Heavy-duty Closed Load' }
                        ].map((mover) => (
                          <div key={mover.phone} className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-slate-850 dark:text-slate-200">{mover.name}</h5>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                <span>Cap: <b>{mover.capacity}</b></span>
                                <span>•</span>
                                <span>Rate: <b className="text-slate-600 dark:text-slate-350">{mover.rate}</b></span>
                              </div>
                            </div>
                            
                            <a
                              href={`tel:${mover.phone}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-[10px] font-black transition whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 animate-pulse" />
                              Call Mover
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Student Relocation Requests */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-500" />
                          My Relocation Bookings
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">Real-time status updates of your moving tickets.</p>
                      </div>

                      <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                        {relocations
                          .filter(r => r.userEmail === loggedStudent.email)
                          .map((r) => {
                            const isPending = r.status === 'Pending Dispatch';
                            const isScheduled = r.status === 'Scheduled';
                            const isInTransit = r.status === 'In Transit';
                            const isCompleted = r.status === 'Completed';
                            
                            return (
                              <div key={r.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                    isCompleted
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                      : isInTransit
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                        : isScheduled
                                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                  }`}>
                                    {r.status}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">{r.relocationDate} • {r.relocationTime}</span>
                                </div>

                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Route:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[180px]">
                                      {r.pickupHostel} ➔ {r.destinationHostel}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Load size:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-350">{r.loadSize}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Mover mode:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-350">{r.transportType}</span>
                                  </div>
                                </div>

                                {r.allocatedMover && (
                                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/35 dark:border-indigo-900/30 rounded-xl space-y-1">
                                    <div className="text-[10px] text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
                                      <span>Assigned Mover: <b>{r.allocatedMover}</b></span>
                                    </div>
                                    {r.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug">&quot;{r.notes}&quot;</p>}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {relocations.filter(r => r.userEmail === loggedStudent.email).length === 0 && (
                          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                            <Truck className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto stroke-[1.25] mb-2" />
                            <p className="text-xs text-slate-400 italic">No relocations requested yet Comrade.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {repairHubTab === 'laundry' && (
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <WashingMachine className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Laundry Services</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed pb-4">
                    We're partnering with premium local laundromats to bring you seamless pick-up and drop-off laundry services right at your doorstep.
                  </p>
                  <button className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                    Notify me when live
                  </button>
                </div>
              )}

              </div>
            )
          )}

          {/* TAB 4: Admin Control Center */}
          {activeTab === 'admin' && (
            !isAdminUser ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 my-8">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50/50 dark:ring-rose-950/20">
                  <Shield className="w-8 h-8 stroke-[2.25]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Admin Access Restricted</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Only <span className="font-bold text-slate-900 dark:text-slate-100">{ADMIN_EMAIL}</span> can open the admin dashboard and edit hostel data.
                  </p>
                </div>
              </div>
            ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100 tracking-tight">Admin Dashboard</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Operations view for hostel capacity, booking approvals, payments, and maintenance dispatch.
                  </p>
                </div>
                
                {/* Admin Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    <button
                      onClick={() => setAdminSubTab('listings')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminSubTab === 'listings' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'}`}
                    >
                      Listings
                    </button>
                    <button
                      onClick={() => setAdminSubTab('clients')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminSubTab === 'clients' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'}`}
                    >
                      Client Statistics
                    </button>
                    <button
                      onClick={() => setAdminSubTab('repairs')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminSubTab === 'repairs' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'}`}
                    >
                      Repairs & Dispatch
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('explore');
                      setExploreView('catalog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-black transition active:scale-95 cursor-pointer"
                  >
                    <Building className="w-4 h-4" />
                    Review Listings
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {(adminSubTab === 'listings' ? [
                  { label: 'Listed Hostels', value: totalHostelsCount.toLocaleString(), detail: `${hostels.reduce((acc, h) => acc + h.rooms.length, 0)} rooms tracked`, icon: Building, tone: 'indigo' },
                  { label: 'Available Beds', value: totalBedsAvailableCount.toLocaleString(), detail: `${occupancyRate}% occupancy`, icon: TrendingUp, tone: 'emerald' },
                  { label: 'Pending Bookings', value: pendingBookingCount.toLocaleString(), detail: `${confirmedBookingCount} fully confirmed`, icon: Receipt, tone: 'amber' },
                  { label: 'Open Repairs', value: openMaintenanceCount.toLocaleString(), detail: `${maintenance.length} total tickets`, icon: AlertCircle, tone: 'rose' }
                ] : adminSubTab === 'clients' ? [
                  { label: 'Total Registered', value: totalUsersCount.toLocaleString(), detail: 'All active roles', icon: User, tone: 'indigo' },
                  { label: 'Students', value: studentsCount.toLocaleString(), detail: `${Math.round(totalUsersCount > 0 ? (studentsCount/totalUsersCount)*100 : 0)}% of clients`, icon: GraduationCap, tone: 'emerald' },
                  { label: 'Property Owners', value: ownersCount.toLocaleString(), detail: `${Math.round(totalUsersCount > 0 ? (ownersCount/totalUsersCount)*100 : 0)}% of clients`, icon: Building, tone: 'amber' },
                  { label: 'Guests', value: guestsCount.toLocaleString(), detail: `${Math.round(totalUsersCount > 0 ? (guestsCount/totalUsersCount)*100 : 0)}% of clients`, icon: UserPlus, tone: 'rose' }
                ] : [
                  { label: 'Total Logs', value: maintenance.length.toLocaleString(), detail: 'All logged repairs', icon: Hammer, tone: 'indigo' },
                  { label: 'Reported Issues', value: maintenance.filter(m => m.status === 'Reported').length.toLocaleString(), detail: 'Needs dispatcher action', icon: AlertTriangle, tone: 'rose' },
                  { label: 'In Progress', value: maintenance.filter(m => m.status === 'In Progress').length.toLocaleString(), detail: 'Technicians on site', icon: Wrench, tone: 'amber' },
                  { label: 'Resolved & Cleared', value: maintenance.filter(m => m.status === 'Completed').length.toLocaleString(), detail: 'Fixed and verified', icon: CheckCircle, tone: 'emerald' }
                ]).map((metric) => {
                  const Icon = metric.icon;
                  const toneClass = metric.tone === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : metric.tone === 'amber'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                      : metric.tone === 'rose'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300';
                  return (
                    <div key={metric.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{metric.label}</span>
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClass}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{metric.value}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{metric.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {adminSubTab === 'listings' && adminDraftHostel && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Edit Hostel Details</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Select any hostel, update its public details, rooms, pricing, contacts, rules, and hosted image.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative inline-block text-left" id="admin-hostel-dropdown-container">
                        <button
                          type="button"
                          onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                          className="min-h-11 inline-flex items-center justify-between gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-2 cursor-pointer w-48 md:w-56"
                        >
                          <span className="truncate">
                            {(() => {
                              const selectedHostel = hostels.find(h => h.id === adminSelectedHostelId);
                              if (selectedHostel) return selectedHostel.name;
                              if (adminDraftHostel && adminDraftHostel.id === adminSelectedHostelId) return `${adminDraftHostel.name} (Draft/New)`;
                              return 'Select Hostel...';
                            })()}
                          </span>
                          <span className="text-slate-400">▼</span>
                        </button>
                        
                        {isAdminDropdownOpen && (
                          <div className="absolute right-0 mt-1.5 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-2.5 space-y-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="🔍 Search hostel..."
                              value={adminHostelSearchQuery}
                              onChange={(e) => setAdminHostelSearchQuery(e.target.value)}
                              className="w-full min-h-9 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                            />
                            
                            <div className="max-h-60 overflow-y-auto space-y-0.5">
                              {(() => {
                                const filteredHostels = hostels.filter((hostel) => 
                                  hostel.name.toLowerCase().includes(adminHostelSearchQuery.toLowerCase())
                                );
                                
                                return (
                                  <>
                                    {filteredHostels.map((hostel) => (
                                      <button
                                        type="button"
                                        key={hostel.id}
                                        onClick={() => {
                                          setAdminSelectedHostelId(hostel.id);
                                          setIsAdminDropdownOpen(false);
                                          setAdminHostelSearchQuery('');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-100 flex items-center justify-between cursor-pointer ${
                                          hostel.id === adminSelectedHostelId 
                                            ? 'bg-indigo-500 text-white' 
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <span className="truncate">{hostel.name}</span>
                                        {hostel.id === adminSelectedHostelId && <span>✓</span>}
                                      </button>
                                    ))}
                                    
                                    {adminDraftHostel && !hostels.some(h => h.id === adminDraftHostel.id) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAdminSelectedHostelId(adminDraftHostel.id);
                                          setIsAdminDropdownOpen(false);
                                          setAdminHostelSearchQuery('');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-100 flex items-center justify-between cursor-pointer ${
                                          adminDraftHostel.id === adminSelectedHostelId 
                                            ? 'bg-indigo-500 text-white' 
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <span className="truncate">{adminDraftHostel.name} (Draft/New)</span>
                                        {adminDraftHostel.id === adminSelectedHostelId && <span>✓</span>}
                                      </button>
                                    )}
                                    
                                    {filteredHostels.length === 0 && (!adminDraftHostel || hostels.some(h => h.id === adminDraftHostel.id)) && (
                                      <div className="text-center py-4 text-xs text-slate-400 font-medium">
                                        No hostels found
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleAdminAddNewHostel}
                        disabled={isSavingHostel || isDeletingHostel}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Add New
                      </button>
                      <button
                        onClick={handleSaveAdminHostel}
                        disabled={isSavingHostel || isDeletingHostel || isUploadingHostelImage}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isUploadingHostelImage 
                          ? 'Waiting for Image...' 
                          : isSavingHostel 
                            ? 'Saving...' 
                            : adminDraftHostel && hostels.some(h => h.id === adminDraftHostel.id)
                              ? 'Save Changes' 
                              : 'Save Hostel'}
                      </button>
                      <button
                        onClick={handleAdminDeleteHostel}
                        disabled={isSavingHostel || isDeletingHostel}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isDeletingHostel ? 'Deleting...' : 'Delete Hostel'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="space-y-4">
                      {/* Cover Image Preview */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                        <img
                          src={adminDraftHostel.imageUrl || getHostelImages(adminDraftHostel.id, adminDraftHostel.imageUrl, adminDraftHostel.imageUrls)[0]}
                          alt={adminDraftHostel.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border border-white/10">
                          ★ Cover/Primary Image
                        </div>
                      </div>

                      {/* Gallery grid of custom images */}
                      {(() => {
                        const customImages = [
                          ...(adminDraftHostel.imageUrls || []),
                          ...(adminDraftHostel.imageUrl ? [adminDraftHostel.imageUrl] : [])
                        ].filter((url, idx, self) => url && (url.startsWith('http') || url.startsWith('/src/')) && self.indexOf(url) === idx);

                        return (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                              Hostel Gallery ({customImages.length} images)
                            </span>
                            {customImages.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                {customImages.map((imgUrl, idx) => {
                                  const isPrimary = adminDraftHostel.imageUrl === imgUrl;
                                  return (
                                    <div key={idx} className={`relative aspect-[4/3] rounded-xl overflow-hidden border group ${isPrimary ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}>
                                      <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      {/* Action buttons on hover */}
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                                        {!isPrimary && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleAdminHostelFieldChange('imageUrl', imgUrl);
                                            }}
                                            className="px-1.5 py-0.5 bg-white text-slate-900 hover:bg-indigo-50 rounded text-[9px] font-bold shadow transition active:scale-95"
                                          >
                                            Cover
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedUrls = customImages.filter(u => u !== imgUrl);
                                            let newPrimary = adminDraftHostel.imageUrl;
                                            if (isPrimary) {
                                              newPrimary = updatedUrls[0] || '';
                                            }
                                            setAdminDraftHostel(prev => prev ? {
                                              ...prev,
                                              imageUrls: updatedUrls,
                                              imageUrl: newPrimary
                                            } : prev);
                                            showFeedback('Image removed from gallery.', 'info');
                                          }}
                                          className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition active:scale-95"
                                          title="Delete image"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      {isPrimary && (
                                        <div className="absolute top-1 right-1 bg-indigo-650 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow leading-none font-mono">
                                          Cover
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No custom images added yet. Using system-generated placeholders.</p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Image Source Inputs */}
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {/* Upload to Project Assets / GitHub */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">Upload Images (Saved to Project & Git)</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isUploadingHostelImage}
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) uploadHostelImagesToPostImage(files);
                              e.currentTarget.value = '';
                            }}
                            className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white disabled:opacity-60 cursor-pointer"
                          />
                          {isUploadingHostelImage && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">Uploading image(s)...</p>
                          )}
                        </div>

                        {/* Add image URL manually */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">Or Add Image URL Manually</span>
                          <div className="flex gap-2">
                            <input
                              id="custom-image-url-input"
                              type="text"
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = document.getElementById('custom-image-url-input') as HTMLInputElement;
                                  if (input && input.value.trim().startsWith('http')) {
                                    const url = input.value.trim();
                                    const currentUrls = adminDraftHostel.imageUrls || [];
                                    if (!currentUrls.includes(url)) {
                                      const updatedUrls = [...currentUrls, url];
                                      setAdminDraftHostel(prev => prev ? {
                                        ...prev,
                                        imageUrls: updatedUrls,
                                        imageUrl: prev.imageUrl ? prev.imageUrl : url
                                      } : prev);
                                      showFeedback('Image URL added to gallery.', 'success');
                                      input.value = '';
                                    } else {
                                      showFeedback('Image URL already exists.', 'warning');
                                    }
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('custom-image-url-input') as HTMLInputElement;
                                if (input && input.value.trim().startsWith('http')) {
                                  const url = input.value.trim();
                                  const currentUrls = adminDraftHostel.imageUrls || [];
                                  if (!currentUrls.includes(url)) {
                                    const updatedUrls = [...currentUrls, url];
                                    setAdminDraftHostel(prev => prev ? {
                                      ...prev,
                                      imageUrls: updatedUrls,
                                      imageUrl: prev.imageUrl ? prev.imageUrl : url
                                    } : prev);
                                    showFeedback('Image URL added to gallery.', 'success');
                                    input.value = '';
                                  } else {
                                    showFeedback('Image URL already exists.', 'warning');
                                  }
                                } else {
                                  showFeedback('Please enter a valid URL starting with http.', 'warning');
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Hostel Name</span>
                        <input value={adminDraftHostel.name} onChange={(e) => handleAdminHostelFieldChange('name', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Area</span>
                        <select value={adminDraftHostel.area} onChange={(e) => handleAdminHostelFieldChange('area', e.target.value as Hostel['area'])} className="w-full min-h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                          {estateOrder.map((area) => <option key={area} value={area}>{area}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Distance to Gate</span>
                        <input type="number" value={adminDraftHostel.distanceMeters} onChange={(e) => handleAdminHostelFieldChange('distanceMeters', Number(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Security Rating</span>
                        <input type="number" min={1} max={5} value={adminDraftHostel.securityRating} onChange={(e) => handleAdminHostelFieldChange('securityRating', Number(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Caretaker Phone</span>
                        <input value={adminDraftHostel.landlordPhone || ''} onChange={(e) => handleAdminHostelFieldChange('landlordPhone', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Monthly Rent From</span>
                        <input type="text" value={adminDraftHostel.rentMonthlyKes || ''} onChange={(e) => handleAdminHostelFieldChange('rentMonthlyKes', e.target.value || undefined)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Semester Rent From</span>
                        <input type="text" value={adminDraftHostel.rentSemesterKes || ''} onChange={(e) => handleAdminHostelFieldChange('rentSemesterKes', e.target.value || undefined)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100" />
                      </label>
                      <label className="space-y-1 md:col-span-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Description</span>
                        <textarea value={adminDraftHostel.description} onChange={(e) => handleAdminHostelFieldChange('description', e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100" />
                      </label>
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          ['hasWifi', 'Wi-Fi'],
                          ['hasBorehole', 'Borehole'],
                          ['hasHotShower', 'Hot Shower']
                        ].map(([field, label]) => (
                          <label key={field} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <input type="checkbox" checked={Boolean(adminDraftHostel[field as keyof Hostel])} onChange={(e) => handleAdminHostelFieldChange(field as keyof Hostel, e.target.checked as never)} />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">Rooms</h4>
                      <button onClick={handleAdminAddRoom} className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-[10px] font-black cursor-pointer">Add Room</button>
                    </div>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {/* Header Row for Room Inputs (Visible on Desktop) */}
                      {adminDraftHostel.rooms.length > 0 && (
                        <div className="hidden lg:grid grid-cols-9 gap-2 px-3 text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">
                          <div>Room No.</div>
                          <div>Type</div>
                          <div>Format</div>
                          <div>Floor</div>
                          <div>Occupants</div>
                          <div>Max Occ.</div>
                          <div>Semester Rent</div>
                          <div>Monthly Rent</div>
                          <div>Action</div>
                        </div>
                      )}
                      {adminDraftHostel.rooms.map((room) => (
                        <div key={room.id} className="grid grid-cols-2 lg:grid-cols-9 gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                          <input aria-label="Room number" value={room.roomNumber} onChange={(e) => handleAdminRoomFieldChange(room.id, 'roomNumber', e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100" />
                          <select aria-label="Room type" value={room.roomType} onChange={(e) => handleAdminRoomFieldChange(room.id, 'roomType', e.target.value as Room['roomType'])} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                            <option>Single</option><option>Double</option><option>4-Sharing</option>
                          </select>
                          <select aria-label="Room layout format" value={room.roomFormat || 'Single Room'} onChange={(e) => handleAdminRoomFieldChange(room.id, 'roomFormat', e.target.value as Room['roomFormat'])} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                            <option value="Single Room">Single Room</option>
                            <option value="Bedsitter">Bedsitter</option>
                            <option value="One Bedroom">One Bedroom</option>
                            <option value="Two Bedroom">Two Bedroom</option>
                          </select>
                          <input aria-label="Floor" type="number" value={room.floor} onChange={(e) => handleAdminRoomFieldChange(room.id, 'floor', Number(e.target.value))} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100" />
                          <input aria-label="Occupants" type="number" value={room.currentOccupants} onChange={(e) => handleAdminRoomFieldChange(room.id, 'currentOccupants', Number(e.target.value))} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100" />
                          <input aria-label="Max occupants" type="number" value={room.maxOccupants} onChange={(e) => handleAdminRoomFieldChange(room.id, 'maxOccupants', Number(e.target.value))} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100" />
                          <input aria-label="Semester rent" type="number" value={room.priceKes} onChange={(e) => handleAdminRoomFieldChange(room.id, 'priceKes', Number(e.target.value))} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100" />
                          <input aria-label="Monthly rent" type="text" value={room.rentMonthlyKes || ''} onChange={(e) => handleAdminRoomFieldChange(room.id, 'rentMonthlyKes', e.target.value || undefined)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-100" />
                          <button onClick={() => handleAdminRemoveRoom(room.id)} className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-[10px] font-black hover:bg-rose-100 cursor-pointer">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'listings' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Hostel Occupancy</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Capacity and lowest semester rent by property.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                      {occupiedBedsCount}/{totalBedsCount} beds filled
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                    {adminHostelRows.map(({ hostel, availableBeds, totalBeds, minRent, occupancy }) => (
                      <div key={hostel.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{hostel.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{hostel.area} • {hostel.distanceMeters}m from campus • KES {minRent.toLocaleString()} from</p>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{availableBeds} / {totalBeds} beds open</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${occupancy > 80 ? 'bg-rose-500' : occupancy > 55 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Recent Bookings</h3>
                    <div className="mt-4 space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{booking.studentName}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{booking.hostelName} • Room {booking.roomNumber}</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">{new Date(booking.bookedAt).toLocaleDateString()}</span>
                          </div>
                          <select
                            value={booking.status}
                            onChange={(e) => handleAdminBookingStatusChange(booking.id, e.target.value as Booking['status'])}
                            className="w-full min-h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-2"
                            aria-label={`Update status for ${booking.studentName}`}
                          >
                            <option>Pending Approval</option>
                            <option>Deposit Paid</option>
                            <option>Fully Confirmed</option>
                            <option>Checked Out</option>
                            <option>Virtual Tour Scheduled</option>
                            <option>Virtual Tour Completed</option>
                          </select>
                        </div>
                      ))}
                      {bookings.length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">No bookings yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Repair Queue ({visibleMaintenance.filter((m) => m.status !== 'Completed').length} active)</h3>
                    <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {visibleMaintenance.filter((m) => m.status !== 'Completed').map((ticket) => (
                        <div key={ticket.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{ticket.category} • {ticket.priority}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{ticket.hostelName} Room {ticket.roomNumber}</p>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">{ticket.status}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {ticket.status === 'Reported' && (
                              <button
                                onClick={() => handleSimulateMaintenanceTransition(ticket.id, 'In Progress')}
                                className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black hover:bg-amber-200 transition cursor-pointer"
                              >
                                Assign
                              </button>
                            )}
                            {ticket.status === 'In Progress' && (
                              <button
                                onClick={() => handleSimulateMaintenanceTransition(ticket.id, 'Completed')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black hover:bg-emerald-200 transition cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {openMaintenanceCount === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">No open repair tickets.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminSubTab === 'clients' && (
              <div className="space-y-6">
                  {/* Real-time Visitor & Active Session Activity Tracker */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Live Website Activity Monitor</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time status of users currently active on the Kisii Student Portal.</p>
                      </div>
                      
                      <div className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-350 font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {presenceList.filter(p => Date.now() - (p.lastActive || 0) <= 5 * 60 * 1000).length} Comrade(s) Online
                      </div>
                    </div>

                    {/* Timeline Activity Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between animate-in fade-in duration-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Active Now</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-850 dark:text-slate-100">
                            {presenceList.filter(p => Date.now() - (p.lastActive || 0) <= 5 * 60 * 1000).length}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">Live</span>
                        </div>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 leading-none">Last 5 minutes</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between animate-in fade-in duration-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">30 Mins Ago</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-850 dark:text-slate-100">
                            {presenceList.filter(p => {
                              const diff = Date.now() - (p.lastActive || 0);
                              return diff > 5 * 60 * 1000 && diff <= 30 * 60 * 1000;
                            }).length}
                          </span>
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">Idle</span>
                        </div>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 leading-none font-sans">5m to 30m ago</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between animate-in fade-in duration-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight font-sans">1 Hour Ago</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-850 dark:text-slate-100">
                            {presenceList.filter(p => {
                              const diff = Date.now() - (p.lastActive || 0);
                              return diff > 30 * 60 * 1000 && diff <= 60 * 60 * 1000;
                            }).length}
                          </span>
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">Recent</span>
                        </div>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 leading-none font-sans">30m to 1h ago</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between animate-in fade-in duration-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight font-sans">Active Today</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-850 dark:text-slate-100">
                            {presenceList.filter(p => Date.now() - (p.lastActive || 0) <= 24 * 60 * 60 * 1000).length}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">24h</span>
                        </div>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 leading-none font-sans">Unique visitors today</span>
                      </div>
                    </div>

                    {/* Active Sessions List */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-800 font-mono font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                            <th className="p-3">Session Visitor</th>
                            <th className="p-3">Current Location / Activity</th>
                            <th className="p-3">Role / category</th>
                            <th className="p-3">Last Active Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presenceList.map((p) => {
                            const isOnline = Date.now() - (p.lastActive || 0) <= 5 * 60 * 1000;
                            const isIdle = !isOnline && Date.now() - (p.lastActive || 0) <= 30 * 60 * 1000;
                            
                            const roleColor = p.category === 'Student'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : p.category === 'Property Owner'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
                            
                            const displayName = p.name;
                            const displayEmail = p.email;
                            
                            const getFormattedLocation = (loc: any) => {
                              if (loc.currentPage === 'home') return 'Home Landing Page';
                              switch (loc.activeTab) {
                                case 'explore': return 'Exploring Hostel Listings';
                                case 'bookings': return 'My Bookings Portal';
                                case 'maintenance': return 'Maintenance Logs';
                                case 'sophia': return 'Chatting with Sophia AI';
                                case 'admin': return 'Admin Control Center';
                                default: return 'Browsing Portal';
                              }
                            };

                            const getFormattedTime = (lastActive: number) => {
                              const diffMs = Date.now() - lastActive;
                              const diffMins = Math.floor(diffMs / (60 * 1000));
                              const diffHours = Math.floor(diffMins / 60);

                              if (diffMins < 1) return 'Active now';
                              if (diffMins < 5) return 'Active just now';
                              if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
                              if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
                              return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) === 1 ? '' : 's'} ago`;
                            };

                            return (
                              <tr key={p.uid} className="border-b border-slate-150/40 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-sans">
                                <td className="p-3 flex items-center gap-2.5">
                                  <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-350 font-bold text-[10px] flex items-center justify-center shadow-sm">
                                      {displayName.split(' ').map((n: string) => n ? n[0] : '').filter(Boolean).join('').substring(0, 2).toUpperCase() || 'GC'}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500 animate-pulse' : isIdle ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                  </div>
                                  <div>
                                    <span className="block font-extrabold text-slate-850 dark:text-slate-100">{displayName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{displayEmail}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-semibold text-slate-705 dark:text-slate-300">
                                  {getFormattedLocation(p)}
                                </td>
                                <td className="p-3">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${roleColor}`}>
                                    {p.category}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-[10px] font-bold">
                                  <span className={isOnline ? 'text-emerald-600 dark:text-emerald-400' : isIdle ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}>
                                    {getFormattedTime(p.lastActive)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}

                          {presenceList.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                No activity recorded. Live visitor session records are offline.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 1. Snapshot Recorder & History Logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Take snapshot */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Take Statistics Record</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Capture a snapshot of registration figures for reporting & tracking.</p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 border border-slate-150 dark:border-slate-850 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Total Users:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-250">{totalUsersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Students:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-250">{studentsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Owners:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-250">{ownersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Guests:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-250">{guestsCount}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">Record Note / Memo</span>
                        <input
                          id="stats-memo-input"
                          type="text"
                          placeholder="e.g. End of June registration drive"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = document.getElementById('stats-memo-input') as HTMLInputElement;
                              if (input) {
                                handleRecordStatsSnapshot(input.value);
                                input.value = '';
                              }
                            }
                          }}
                        />
                      </div>

                      <button
                        onClick={() => {
                          const input = document.getElementById('stats-memo-input') as HTMLInputElement;
                          if (input) {
                            handleRecordStatsSnapshot(input.value);
                            input.value = '';
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Record Snapshot
                      </button>
                    </div>

                    {/* Right: Snapshots Log */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Recorded Statistics History</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Saved snapshots of active client statistics taken over time.</p>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-2">
                        {(recordedStats || []).map((snap) => {
                          if (!snap) return null;
                          const snapDate = snap.timestamp ? new Date(snap.timestamp) : new Date();
                          const isSnapDateValid = !isNaN(snapDate.getTime());
                          return (
                            <div key={snap.id} className="border border-slate-150 dark:border-slate-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-950/20">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs text-slate-850 dark:text-slate-150">{snap.memo}</span>
                                  <span className="text-[9px] bg-indigo-50 text-indigo-750 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                                    {snap.total} total
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-550 dark:text-slate-400 font-mono mt-1">
                                  {isSnapDateValid ? `${snapDate.toLocaleDateString()} @ ${snapDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                  <div>
                                    <span className="block font-mono font-bold text-slate-855 dark:text-slate-200">{snap.students}</span>
                                    <span className="text-[8px] text-slate-400 uppercase">Studs</span>
                                  </div>
                                  <div>
                                    <span className="block font-mono font-bold text-slate-855 dark:text-slate-200">{snap.owners}</span>
                                    <span className="text-[8px] text-slate-400 uppercase">Landl</span>
                                  </div>
                                  <div>
                                    <span className="block font-mono font-bold text-slate-855 dark:text-slate-200">{snap.guests}</span>
                                    <span className="text-[8px] text-slate-400 uppercase">Gues</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteStatsSnapshot(snap.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-200 dark:border-slate-800 text-slate-450 hover:text-rose-600 dark:hover:text-rose-450 transition active:scale-95 cursor-pointer"
                                  title="Delete Snapshot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {recordedStats.length === 0 && (
                          <div className="text-center py-8 text-xs text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            No snapshots recorded yet. Capture registry figures using the recorder.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Join Logs / Directory */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Client Registry Logs</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time listing of registered client users on Kisii Student Portal.</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search bar */}
                        <div className="relative min-w-44">
                          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search by name/email..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                          />
                        </div>

                        {/* Category filter */}
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value as any)}
                          className="min-h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-205 px-2"
                          aria-label="Filter registry logs by category role"
                        >
                          <option value="All">All Categories</option>
                          <option value="Student">Students Only</option>
                          <option value="Property Owner">Landlords Only</option>
                          <option value="Guest">Guests Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-800 font-mono font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                            <th className="p-3">Client User</th>
                            <th className="p-3">Contact Details</th>
                            <th className="p-3">Role / category</th>
                            <th className="p-3">Joined timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const initials = (user.displayName || 'Unknown').split(' ').map(n => n ? n[0] : '').filter(Boolean).join('').substring(0, 2).toUpperCase() || 'UC';
                            const joinedDate = user.createdAt ? new Date(user.createdAt) : new Date();
                            const isValidDate = !isNaN(joinedDate.getTime());
                            const roleColor = user.category === 'Student'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : user.category === 'Property Owner'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
                            
                            return (
                              <tr key={user.uid} className="border-b border-slate-150/40 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-sans">
                                <td className="p-3 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-750 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                                    {initials}
                                  </div>
                                  <div>
                                    <span className="block font-extrabold text-slate-850 dark:text-slate-100">{user.displayName || 'Unknown Comrade'}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">UID: {(user.uid || '').substring(0, 12)}...</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="block font-bold text-slate-755 dark:text-slate-350">{user.email}</span>
                                  <span className="text-[10px] text-slate-450 font-mono">{user.phone || 'No phone set'}</span>
                                </td>
                                <td className="p-3">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${roleColor}`}>
                                    {user.category}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500 font-mono text-[10px]">
                                  {isValidDate ? `${joinedDate.toLocaleDateString()} @ ${joinedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'N/A'}
                                </td>
                              </tr>
                            );
                          })}

                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                No clients found matching the search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4.3: Repairs & Dispatch Panel */}
              {adminSubTab === 'repairs' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Sub-tab Selection */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-auto inline-flex">
                    <button
                      onClick={() => setAdminRepairsTab('repairs')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${adminRepairsTab === 'repairs' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      Maintenance Repairs Queue ({maintenance.filter(m => m.status !== 'Completed').length} active)
                    </button>
                    <button
                      onClick={() => setAdminRepairsTab('relocations')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${adminRepairsTab === 'relocations' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Student Relocations ({relocations.filter(r => r.status !== 'Completed').length} active)
                    </button>
                  </div>

                  {adminRepairsTab === 'repairs' ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Maintenance & Dispatch Center</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Review reported issues, assign certified wardens/fundis, and clear resolved requests.</p>
                        </div>
                        
                        {/* Filter Controls */}
                        <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
                          {(['All', 'Reported', 'In Progress', 'Completed'] as const).map((filter) => {
                            const count = filter === 'All' 
                              ? maintenance.length 
                              : maintenance.filter(m => m.status === filter).length;
                            return (
                              <button
                                type="button"
                                key={filter}
                                onClick={() => setRepairsFilter(filter)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  repairsFilter === filter 
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
                                }`}
                              >
                                {filter} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {maintenance
                          .filter(m => repairsFilter === 'All' || m.status === repairsFilter)
                          .map((ticket) => {
                            const isHigh = ticket.priority === 'High';
                            const isMedium = ticket.priority === 'Medium';
                            const isAssigning = activeAssignIssueId === ticket.id;
                            const isCompleting = activeCompleteIssueId === ticket.id;

                            return (
                              <div 
                                key={ticket.id}
                                className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                              >
                                {/* Header info */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${
                                      ticket.status === 'Completed'
                                        ? 'bg-emerald-500'
                                        : ticket.status === 'In Progress'
                                          ? 'bg-amber-500 animate-pulse'
                                          : 'bg-rose-500 animate-ping'
                                    }`} />
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">{ticket.status}</span>
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                                    isHigh 
                                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 font-black' 
                                      : isMedium
                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {ticket.priority}
                                  </span>
                                </div>

                                {/* Complainant details */}
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{ticket.hostelName} • Room {ticket.roomNumber}</h4>
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-400 font-mono">
                                    <span>Reporter: <b>{ticket.studentName}</b></span>
                                    <span>•</span>
                                    <span>Phone: <b>{ticket.contactNumber}</b></span>
                                  </div>
                                  <p className="text-[11px] bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-xl p-3 text-slate-600 dark:text-slate-350 leading-relaxed max-h-24 overflow-y-auto mt-2">
                                    {ticket.description}
                                  </p>
                                </div>

                                {/* Technician dispatch status */}
                                {ticket.allocatedAgent && (
                                  <div className="text-[10px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 p-2.5 rounded-xl space-y-1">
                                    <div className="flex justify-between text-indigo-700 dark:text-indigo-400">
                                      <span>Fundi: <b>{ticket.allocatedAgent}</b></span>
                                    </div>
                                    {ticket.notes && <p className="text-slate-500 dark:text-slate-400 italic font-medium">&quot;{ticket.notes}&quot;</p>}
                                  </div>
                                )}

                                {/* Interactive assignment drawer inline */}
                                {isAssigning && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                                    <div>
                                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Select Technician</label>
                                      <select
                                        value={assignFundiName}
                                        onChange={(e) => setAssignFundiName(e.target.value)}
                                        className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                      >
                                        <option value="Fundi Joseph (Plumber)">Fundi Joseph (Plumber)</option>
                                        <option value="Electrician Mike">Electrician Mike</option>
                                        <option value="Technician Charles (Carpenter)">Technician Charles (Carpenter)</option>
                                        <option value="Internet Support Caleb">Internet Support Caleb</option>
                                        <option value="Custom">Custom Fundi...</option>
                                      </select>
                                    </div>

                                    {assignFundiName === 'Custom' && (
                                      <div>
                                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Enter Fundi Name & Skill</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Fundi John (Painter)"
                                          value={assignCustomFundiName}
                                          onChange={(e) => setAssignCustomFundiName(e.target.value)}
                                          className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Dispatch Instruction Notes</label>
                                      <textarea
                                        rows={2}
                                        placeholder="e.g. Bring extra 3/4 inch washers..."
                                        value={assignNotes}
                                        onChange={(e) => setAssignNotes(e.target.value)}
                                        className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                      />
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setActiveAssignIssueId(null)}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const finalFundi = assignFundiName === 'Custom' ? assignCustomFundiName : assignFundiName;
                                          handleDispatchMaintenance(ticket.id, finalFundi || 'Assigned Fundi', assignNotes);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer"
                                      >
                                        Confirm Dispatch
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Interactive clearance notes drawer inline */}
                                {isCompleting && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                                    <div>
                                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Resolution Clearance Details</label>
                                      <textarea
                                        rows={2}
                                        placeholder="e.g. Cracked pipe threads sealed and pressure tested. No leaks..."
                                        value={completionNotes}
                                        onChange={(e) => setCompletionNotes(e.target.value)}
                                        className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                      />
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setActiveCompleteIssueId(null)}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleClearMaintenance(ticket.id, completionNotes)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                      >
                                        Mark Cleared
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Card Actions */}
                                {!isAssigning && !isCompleting && (
                                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                      <span>Filed: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                      <span>ID: {ticket.id}</span>
                                    </div>
                                    
                                    {ticket.status !== 'Completed' && (
                                      <div className="flex gap-2">
                                        {ticket.status === 'Reported' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveAssignIssueId(ticket.id);
                                              setAssignFundiName('Fundi Joseph (Plumber)');
                                            }}
                                            className="flex-1 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <Wrench className="w-3.5 h-3.5" />
                                            Dispatch Fundi
                                          </button>
                                        )}
                                        {ticket.status === 'In Progress' && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveAssignIssueId(ticket.id);
                                                setAssignFundiName(ticket.allocatedAgent || 'Fundi Joseph (Plumber)');
                                              }}
                                              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                              title="Reassign Fundi"
                                            >
                                              <Wrench className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveCompleteIssueId(ticket.id);
                                              }}
                                              className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              Mark Cleared
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        
                        {maintenance.filter(m => repairsFilter === 'All' || m.status === repairsFilter).length === 0 && (
                          <div className="md:col-span-2 xl:col-span-3 text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto stroke-[1.5] mb-2" />
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Tickets Found</h4>
                            <p className="text-xs text-slate-400 mt-1">All maintenance requests matching this category are cleared!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Transport & Relocation Dispatch Center</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage student relocation requests, allocate movers, and update transport statuses.</p>
                        </div>
                        
                        {/* Relocations Filter Controls */}
                        <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
                          {(['All', 'Pending Dispatch', 'Scheduled', 'In Transit', 'Completed'] as const).map((filter) => {
                            const count = filter === 'All' 
                              ? relocations.length 
                              : relocations.filter(r => r.status === filter).length;
                            return (
                              <button
                                type="button"
                                key={filter}
                                onClick={() => setRelocationsFilter(filter)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  relocationsFilter === filter 
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
                                }`}
                              >
                                {filter} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {relocations
                          .filter(r => relocationsFilter === 'All' || r.status === relocationsFilter)
                          .map((ticket) => {
                            const isPending = ticket.status === 'Pending Dispatch';
                            const isScheduled = ticket.status === 'Scheduled';
                            const isInTransit = ticket.status === 'In Transit';
                            const isCompleted = ticket.status === 'Completed';
                            const isAssigning = activeAssignRelocId === ticket.id;

                            return (
                              <div 
                                key={ticket.id}
                                className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                              >
                                {/* Header info */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${
                                      isCompleted
                                        ? 'bg-emerald-500'
                                        : isInTransit
                                          ? 'bg-blue-500 animate-pulse'
                                          : isScheduled
                                            ? 'bg-indigo-500'
                                            : 'bg-rose-500 animate-ping'
                                    }`} />
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">{ticket.status}</span>
                                  </div>
                                  <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-md font-mono">
                                    {ticket.relocationDate} • {ticket.relocationTime}
                                  </span>
                                </div>

                                {/* Booking details */}
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                                    {ticket.pickupHostel} ➔ {ticket.destinationHostel}
                                  </h4>
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-400 font-mono">
                                    <span>Comrade: <b>{ticket.studentName}</b></span>
                                    <span>•</span>
                                    <span>Phone: <b>{ticket.contactNumber}</b></span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-400 font-mono mt-1">
                                    <span>Load: <b>{ticket.loadSize}</b></span>
                                    <span>•</span>
                                    <span>Mode: <b>{ticket.transportType}</b></span>
                                  </div>
                                  {ticket.notes && (
                                    <p className="text-[11px] bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-xl p-3 text-slate-600 dark:text-slate-350 leading-relaxed max-h-20 overflow-y-auto mt-2 italic">
                                      &quot;{ticket.notes}&quot;
                                    </p>
                                  )}
                                </div>

                                {/* Mover dispatch status */}
                                {ticket.allocatedMover && (
                                  <div className="text-[10px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 p-2.5 rounded-xl space-y-1">
                                    <div className="flex justify-between text-indigo-700 dark:text-indigo-400">
                                      <span>Mover: <b>{ticket.allocatedMover}</b></span>
                                    </div>
                                    {ticket.notes && isCompleted && <p className="text-slate-500 dark:text-slate-400 italic font-medium">&quot;{ticket.notes}&quot;</p>}
                                  </div>
                                )}

                                {/* Interactive assignment drawer inline */}
                                {isAssigning && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                                    <div>
                                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Select Mover Provider</label>
                                      <select
                                        value={assignMoverName}
                                        onChange={(e) => setAssignMoverName(e.target.value)}
                                        className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                      >
                                        <option value="Kisii Campus Movers (Pickup)">Kisii Campus Movers (Pickup)</option>
                                        <option value="Mkokoteni Express (Handcart)">Mkokoteni Express (Handcart)</option>
                                        <option value="Boda Movers (Comrade Boda)">Boda Movers (Comrade Boda)</option>
                                        <option value="Rainproof Box Van">Rainproof Box Van</option>
                                        <option value="Custom">Custom Mover...</option>
                                      </select>
                                    </div>

                                    {assignMoverName === 'Custom' && (
                                      <div>
                                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Enter Custom Mover Name</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Nyanchwa Handcart Association"
                                          value={assignCustomMoverName}
                                          onChange={(e) => setAssignCustomMoverName(e.target.value)}
                                          className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Mover Instructions & Notes</label>
                                      <textarea
                                        rows={2}
                                        placeholder="e.g. Price set at KES 1,000. Driver Albert will call on arrival."
                                        value={assignRelocNotes}
                                        onChange={(e) => setAssignRelocNotes(e.target.value)}
                                        className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 focus:outline-none"
                                      />
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setActiveAssignRelocId(null)}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const finalMover = assignMoverName === 'Custom' ? assignCustomMoverName : assignMoverName;
                                          handleDispatchRelocation(ticket.id, finalMover || 'Assigned Mover', assignRelocNotes);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer"
                                      >
                                        Schedule Mover
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Card Actions */}
                                {!isAssigning && !isCompleted && (
                                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                      <span>Booked: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                      <span>ID: {ticket.id}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveAssignRelocId(ticket.id);
                                            setAssignMoverName('Kisii Campus Movers (Pickup)');
                                          }}
                                          className="flex-1 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Truck className="w-3.5 h-3.5" />
                                          Dispatch Mover
                                        </button>
                                      )}
                                      {isScheduled && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveAssignRelocId(ticket.id);
                                              setAssignMoverName(ticket.allocatedMover || 'Kisii Campus Movers (Pickup)');
                                            }}
                                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                            title="Reassign Mover"
                                          >
                                            <Truck className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateRelocationStatus(ticket.id, 'In Transit')}
                                            className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <Compass className="w-3.5 h-3.5 animate-pulse" />
                                            Start Transit
                                          </button>
                                        </>
                                      )}
                                      {isInTransit && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateRelocationStatus(ticket.id, 'Completed')}
                                          className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          Mark Completed
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        
                        {relocations.filter(r => relocationsFilter === 'All' || r.status === relocationsFilter).length === 0 && (
                          <div className="md:col-span-2 xl:col-span-3 text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Truck className="w-8 h-8 text-emerald-500 mx-auto stroke-[1.5] mb-2" />
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Relocation Tickets Found</h4>
                            <p className="text-xs text-slate-400 mt-1">All relocation requests matching this category are fully cleared!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )
          )}

          {/* TAB 5: Smart support chatbot console with Sophia */}
          {activeTab === 'sophia' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">AI Warden Assistant Terminal</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Talk to Fundi Sophia, our smart AI responder tailored specifically for Kisii University student life, hostels, security parameters, and curfew regulations.
                  </p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <SophiaBot userProfile={{
                  name: loggedStudent.name,
                  regCode: loggedStudent.regCode,
                  gender: loggedStudent.gender
                }} />
              </div>

            </div>
          )}

          {/* TAB 6: KSH Gossip */}
          {activeTab === 'news' && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Gossip Wall */}
                <div className="lg:col-span-2 space-y-6">
              
              {/* Header Section */}
              <div className="bg-gradient-to-br from-[#FAF9F5] via-[#FCFBF9] to-[#F5F2EB] dark:from-[#141312] dark:via-[#191817] dark:to-[#171614] p-6 rounded-[28px] border border-[#e8e2d5] dark:border-[#2d2b28] shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold font-sans text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    <span>KSH Gossip & Whispers</span>
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                  </h2>
                  <span className="flex items-center gap-1.5 text-[9px] bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-[#25d366] border border-emerald-200/30 dark:border-emerald-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-extrabold shadow-sm animate-pulse">
                    ● Anonymous Board
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A safe, private wall for Kisii University comrades to share rumors, alerts, and anonymous thoughts. Post what's on your mind.
                </p>
              </div>

              {/* Input Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[28px] p-5 shadow-sm">
                <form onSubmit={handlePostNews} className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                      👤
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value.substring(0, 350))}
                        placeholder="Write an anonymous message to all comrades..."
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-[#111b21] dark:text-[#e9edef] min-h-[90px]"
                        rows={3}
                      />
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1">
                          🔒 Messages are shared completely anonymously.
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-400">
                            {newPostContent.length}/350
                          </span>
                          <button
                            type="submit"
                            disabled={!newPostContent.trim() || isPostingNews}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#128c7e] hover:bg-[#075e54] dark:bg-[#005c4b] dark:hover:bg-[#00a884] dark:text-white disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            {isPostingNews ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-800/30 dark:border-t-slate-800 rounded-full animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Share Whisper
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Feed Content */}
              <div className="space-y-4">
                {newsPosts.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-650 mx-auto mb-2" />
                    <p className="text-xs text-slate-550 dark:text-slate-400 font-bold">No whispers shared yet</p>
                    <p className="text-[10px] text-slate-400 mt-1">Be the first to post something on the hub!</p>
                  </div>
                ) : (
                  newsPosts.map((news) => {
                    const isUserPostAuthor = currentUser && news.authorEmail === currentUser.email;
                    const displayAuthor = news.authorName === 'Admin' ? 'Admin 👑' : 'Anonymous Comrade';
                    const displayInitials = news.authorName === 'Admin' ? 'AD' : '👤';
                    
                    return (
                      <div
                        key={news.id}
                        className={`bg-white dark:bg-slate-900 border rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-200 ${
                          news.isPinned
                            ? 'border-amber-300/70 dark:border-amber-900/50 shadow-md ring-1 ring-amber-50/50 dark:ring-amber-950/20'
                            : 'border-slate-200 dark:border-slate-800/80'
                        }`}
                      >
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border border-slate-200/50 dark:border-slate-800/40 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {displayInitials}
                            </div>
                            <div>
                              <h3 className="font-bold flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                <span>{displayAuthor}</span>
                                {news.isPinned && (
                                  <span className="flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 uppercase tracking-wider">
                                    <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                                  </span>
                                )}
                              </h3>
                              <span className="text-[10px] font-medium text-slate-400 font-mono">{news.createdAt}</span>
                            </div>
                          </div>

                          {/* Admin controls */}
                          <div className="flex items-center gap-1.5">
                            {isAdminUser && (
                              <button
                                onClick={() => handlePinPost(news.id)}
                                title={news.isPinned ? "Unpin Post" : "Pin Post"}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  news.isPinned
                                    ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                                }`}
                              >
                                {news.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {(isAdminUser || isUserPostAuthor) && (
                              <button
                                onClick={() => handleDeletePost(news.id)}
                                title="Delete Post"
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-rose-950/20 dark:hover:border-rose-900/55 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="ml-0 sm:ml-[52px] mb-4">
                          <p className="text-xs sm:text-sm text-[#111b21] dark:text-[#e9edef] leading-relaxed whitespace-pre-line">
                            {news.content}
                          </p>
                        </div>

                        {/* Actions bar */}
                        <div className="flex items-center gap-4 ml-0 sm:ml-[52px] border-t border-[#f2ece2] dark:border-slate-800/40 pt-3">
                          <button
                            onClick={() => handleLikeNews(news.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                              likedPostIds.includes(news.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedPostIds.includes(news.id) ? 'fill-current' : ''}`} />
                            {news.likes > 0 && <span>{news.likes}</span>}
                          </button>

                          <button
                            onClick={() => {
                              if (replyInputPostId === news.id) {
                                setReplyInputPostId(null);
                                setReplyContent('');
                              } else {
                                setReplyInputPostId(news.id);
                                setReplyContent('');
                              }
                            }}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                              replyInputPostId === news.id ? 'text-[#128c7e] dark:text-[#00a884]' : 'text-slate-400 hover:text-emerald-500'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Reply</span>
                            {news.replies && news.replies.length > 0 && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full text-[10px]">
                                {news.replies.length}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => handleShareNews(news)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors ml-auto cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>

                        {/* Nested Replies Section */}
                        {(replyInputPostId === news.id || (news.replies && news.replies.length > 0)) && (
                          <div className="ml-0 sm:ml-[52px] mt-4 pt-4 border-t border-[#f2ece2] dark:border-slate-800/40 space-y-4 relative">
                            {news.replies && news.replies.length > 0 && (
                              <div className="absolute left-3.5 top-5 bottom-8 w-0.5 bg-slate-200/60 dark:bg-slate-800/60 hidden sm:block" />
                            )}

                            {news.replies && news.replies.length > 0 && (() => {
                              const sortedReplies = [...news.replies].sort((a, b) => {
                                if (a.isPinned && !b.isPinned) return -1;
                                if (!a.isPinned && b.isPinned) return 1;
                                const valA = parseInt(a.id) || 0;
                                const valB = parseInt(b.id) || 0;
                                return valA - valB;
                              });
                              return (
                                <div className="space-y-3 pl-0 sm:pl-8">
                                  {sortedReplies.map((reply) => {
                                    const displayReplyAuthor = reply.authorName === 'Admin' ? 'Admin 👑' : 'Anonymous Reply';
                                    const displayReplyInitials = reply.authorName === 'Admin' ? 'AD' : '👤';
                                    return (
                                      <div
                                        key={reply.id}
                                        className={`rounded-xl p-3 border transition-all duration-200 animate-in fade-in duration-200 ${
                                          reply.isPinned
                                            ? 'border-indigo-150 bg-indigo-50/20 dark:border-indigo-900/35 dark:bg-indigo-950/15'
                                            : 'bg-slate-50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800/40'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between mb-1.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border border-slate-200/40 dark:border-slate-800/20 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                              {displayReplyInitials}
                                            </div>
                                            <div className="flex flex-col">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                  {displayReplyAuthor}
                                                </span>
                                                {reply.isPinned && (
                                                  <span className="flex items-center gap-0.5 text-[7px] font-bold px-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded">
                                                    <Pin className="w-2 h-2 fill-current" /> Pinned
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[8px] text-slate-400 font-mono">{reply.createdAt}</span>
                                            </div>
                                          </div>
                                          {isAdminUser && (
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => handlePinComment(news.id, reply.id)}
                                                title={reply.isPinned ? "Unpin Comment" : "Pin Comment"}
                                                className={`p-1 rounded transition-colors cursor-pointer ${
                                                  reply.isPinned
                                                    ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                              >
                                                {reply.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                                              </button>
                                              <button
                                                onClick={() => handleDeleteComment(news.id, reply.id)}
                                                title="Delete Comment"
                                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs text-[#111b21] dark:text-[#e9edef] pl-8 leading-relaxed">
                                          {reply.content}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}

                            {replyInputPostId === news.id && (
                              <form
                                onSubmit={(e) => { e.preventDefault(); handlePostReply(news.id); }}
                                className="flex gap-3 items-start mt-2 pl-0 sm:pl-8"
                              >
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-600 dark:text-slate-400 shrink-0 border border-slate-200/50 dark:border-slate-800/50">
                                  👤
                                </div>
                                <div className="flex-1 space-y-2">
                                  <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value.substring(0, 250))}
                                    placeholder="Write an anonymous reply..."
                                    rows={2}
                                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-[#111b21] dark:text-[#e9edef]"
                                  />
                                  <div className="flex justify-end gap-2 items-center">
                                    <span className="text-[9px] text-slate-400 font-mono mr-auto">{replyContent.length}/250</span>
                                    <button
                                      type="button"
                                      onClick={() => { setReplyInputPostId(null); setReplyContent(''); }}
                                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-200/40 dark:border-slate-800"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={!replyContent.trim()}
                                      className="px-3.5 py-1 bg-[#128c7e] hover:bg-[#075e54] dark:bg-[#005c4b] dark:hover:bg-[#00a884] disabled:opacity-50 text-white dark:text-[#111b21] text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Direct Message Admin Column (Right 1 column on desktop) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-sm flex flex-col h-[600px] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/20 px-5 py-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0 shadow-inner">
                      👑
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5">
                        <span>Direct Line to Admin</span>
                      </h3>
                      <p className="text-[10px] text-slate-505 dark:text-slate-400 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active Support
                      </p>
                    </div>
                  </div>
                  
                  {/* Back button for Admin detailed chat */}
                  {isAdminUser && activeChatStudentEmail && (
                    <button
                      onClick={() => setActiveChatStudentEmail(null)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-lg transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-800"
                    >
                      ← Inbox
                    </button>
                  )}
                </div>

                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
                  {!currentUser ? (
                    /* Logged Out State */
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                        <Lock className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Secure Direct Message</h4>
                        <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                          Sign in to text the Admin directly. Keep your questions and booking queries completely private.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setAuthModalMode('signin');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#128c7e] hover:bg-[#075e54] text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        Sign In to Chat
                      </button>
                    </div>
                  ) : isAdminUser ? (
                    /* Admin User View */
                    !activeChatStudentEmail ? (
                      /* Admin Inbox List */
                      studentChatSummaries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 mt-12">
                          <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Your inbox is empty</p>
                          <p className="text-[10px] text-slate-400 max-w-[180px]">When students message you, they will appear here in real-time.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {studentChatSummaries.map((chat) => {
                            const initials = chat.senderName === 'Anonymous Comrade' ? '👤' : chat.email.substring(0, 2).toUpperCase();
                            return (
                              <button
                                key={chat.email}
                                type="button"
                                onClick={() => {
                                  setActiveChatStudentEmail(chat.email);
                                }}
                                className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/80 p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-sm animate-in fade-in duration-200"
                              >
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100/30 dark:border-indigo-900/30">
                                  {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                      {chat.senderName}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-4">
                                    {chat.lastMsg}
                                  </p>
                                </div>
                                {chat.unreadCount > 0 && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-sm animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      /* Admin Chat Detail View */
                      (() => {
                        const chatMessages = adminChats.filter(m => m.chatId === activeChatStudentEmail);
                        return (
                          <div className="space-y-3.5">
                            <div className="text-center py-1">
                              <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded-full">
                                Chatting with: {activeChatStudentEmail}
                              </span>
                            </div>
                            {chatMessages.map((msg) => {
                              const isAdminMsg = msg.senderEmail === ADMIN_EMAIL;
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[85%] ${isAdminMsg ? 'ml-auto items-end' : 'mr-auto items-start'} animate-in fade-in duration-200`}
                                >
                                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                    isAdminMsg
                                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                                  }`}>
                                    <div className="font-bold text-[9px] text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">
                                      {msg.senderName}
                                    </div>
                                    <p className="whitespace-pre-line break-words">{msg.text}</p>
                                  </div>
                                  <span className="text-[8px] text-slate-400 mt-1 font-mono">{msg.createdAt}</span>
                                </div>
                              );
                            })}
                            <div ref={chatEndRef} />
                          </div>
                        );
                      })()
                    )
                  ) : (
                    /* Regular Student Chat Detail View */
                    <div className="space-y-3.5">
                      {adminChats.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 mt-12">
                          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Start a chat with Admin</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                            Type a message below to text the administrator. Your inquiries are strictly confidential.
                          </p>
                        </div>
                      ) : (
                        adminChats.map((msg) => {
                          const isMe = msg.senderEmail === currentUser.email;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'} animate-in fade-in duration-200`}
                            >
                              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                              }`}>
                                <div className="font-bold text-[9px] text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">
                                  {msg.senderName}
                                </div>
                                <p className="whitespace-pre-line break-words">{msg.text}</p>
                              </div>
                              <span className="text-[8px] text-slate-400 mt-1 font-mono">{msg.createdAt}</span>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Chat Footer Input Area */}
                {currentUser && (!isAdminUser || activeChatStudentEmail) && (
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSendAdminMessage} className="space-y-2">
                      <div className="flex gap-2">
                        <textarea
                          value={newAdminMessage}
                          onChange={(e) => setNewAdminMessage(e.target.value.substring(0, 500))}
                          placeholder="Type a message..."
                          rows={1}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 resize-none h-9"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendAdminMessage(e);
                            }
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!newAdminMessage.trim() || isSendingAdminMessage}
                          className="px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      {/* Anonymity toggle for students */}
                      {!isAdminUser && (
                        <div className="flex items-center gap-1.5 pl-1">
                          <input
                            type="checkbox"
                            id="send-anon"
                            checked={sendChatAnonymously}
                            onChange={(e) => setSendChatAnonymously(e.target.checked)}
                            className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-offset-0 focus:outline-none cursor-pointer"
                          />
                          <label htmlFor="send-anon" className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                            Hide my identity (send anonymously)
                          </label>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
        </section>

      </main>
      )}

      {/* Book Room Modal sliding Overlay */}
      {roomToBook && (
        <BookRoomModal 
          hostel={roomToBook.hostel}
          room={roomToBook.room}
          userEmail={loggedStudent.email}
          userName={loggedStudent.name}
          userPhone={loggedStudent.phone}
          userReg={loggedStudent.regCode}
          onClose={() => setRoomToBook(null)}
          onSubmitBooking={handleRoomBookingSubmit}
        />
      )}

      {/* Modern Firebase Authentication Overlay */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onSignIn={handleEmailSignIn}
          onSignUp={handleEmailSignUp}
          initialMode={authModalMode}
          onVerified={handleVerificationSuccess}
        />
      )}

      {/* Edit Profile Settings Overlay */}
      {isEditProfileOpen && (
        <EditProfileModal 
          currentProfile={loggedStudent}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleEditProfileSave}
        />
      )}



      {/* Aesthetic high quality footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20 pt-8 pb-32 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-600 dark:text-slate-400">
          Kisii University Student Hostel Hub &copy; {new Date().getFullYear()} — All Rights Reserved.
        </p>
        <p className="max-w-md mx-auto px-4 font-light text-slate-400 dark:text-slate-500 leading-relaxed">
          Authorized partner portal registered under Kisii Student Accommodation standards. For physical support, visit the Central Warden Desk situated at Kisii campus Main Administration building block. For direct inquiries, reach our helpline at <a href="tel:0795858929" className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline">0795858929</a>.
        </p>
      </footer>

      {/* Global Support FAB */}
      <a
        href="https://wa.me/254795858929?text=Hi%2C%20I%20need%20support%20on%20the%20Kisii%20Hostel%20Portal."
        target="_blank"
        rel="noreferrer"
        aria-label="Contact Support on WhatsApp"
        className="fixed bottom-6 left-4 z-40 flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-indigo-400 bg-indigo-500 text-white shadow-xl shadow-indigo-900/20 transition-all duration-200 hover:bg-indigo-600 hover:border-white active:scale-95 sm:h-auto sm:w-auto sm:px-4 sm:py-3"
        id="global-support-floating-cta"
      >
        <span className="relative hidden h-2 w-2 sm:flex" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <svg className="w-5 h-5 fill-white sm:w-4 sm:h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.031 6.172c-2.386 0-4.321 1.934-4.321 4.32 0 .768.201 1.517.583 2.179l-.621 2.268 2.321-.609c.638.349 1.353.533 2.083.533l.001-.001c2.386 0 4.32-1.933 4.32-4.32 0-2.386-1.934-4.32-4.32-4.32zm2.531 6.13c-.104.174-.614.7-1.139.756-.376.04-.798-.057-1.391-.301-.892-.367-1.468-.962-1.884-1.378-.415-.415-1.01-1.026-1.378-1.918-.244-.593-.341-1.015-.3-1.391.056-.525.582-1.035.756-1.139.068-.041.13-.062.18-.062.115 0 .216.012.284.144l.432 1.041c.046.109.026.234-.049.317l-.234.258c-.067.074-.083.178-.04.264.205.415.524.78.932 1.188.408.408.773.727 1.188.932.086.043.19.027.264-.04l.258-.234c.083-.075.208-.095.317-.049l1.041.432c.132.068.144.169.144.284 0 .05-.021.112-.062.18zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.019 21.997c-1.805 0-3.573-.485-5.124-1.4l-.367-.217-3.804.997 1.015-3.712-.239-.381c-1.006-1.605-1.539-3.468-1.537-5.38.004-5.509 4.49-9.992 10.002-9.992 2.668 0 5.176 1.039 7.062 2.927 1.886 1.888 2.924 4.397 2.923 7.067-.004 5.511-4.49 9.991-9.998 9.991z" />
        </svg>
        <span className="hidden font-mono uppercase font-bold text-[11px] tracking-wider sm:inline">Support</span>
      </a>

      {/* Floating WhatsApp button pointing to landlord / caretaker */}
      {exploreView === 'rooms' && selectedHostel && !selectedHostel.externalLink && (
        <a
          href={`https://wa.me/254795858929?text=Hi%2C%20Comrade%20Caretaker.%20I%20am%20viewing%20rooms%20online%20at%20${encodeURIComponent(selectedHostel.name)}%20and%20would%20love%20to%20verify%20booking%20allotments%20checks.`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Contact caretaker for ${selectedHostel.name} on WhatsApp`}
          className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-emerald-400 bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 transition-all duration-200 hover:bg-emerald-600 hover:border-white active:scale-95 sm:bottom-6 sm:h-auto sm:w-auto sm:px-4 sm:py-3"
          id="global-whatsapp-landlord-floating-cta"
        >
          <span className="relative hidden h-2 w-2 sm:flex" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <svg className="w-5 h-5 fill-white sm:w-4 sm:h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.031 6.172c-2.386 0-4.321 1.934-4.321 4.32 0 .768.201 1.517.583 2.179l-.621 2.268 2.321-.609c.638.349 1.353.533 2.083.533l.001-.001c2.386 0 4.32-1.933 4.32-4.32 0-2.386-1.934-4.32-4.32-4.32zm2.531 6.13c-.104.174-.614.7-1.139.756-.376.04-.798-.057-1.391-.301-.892-.367-1.468-.962-1.884-1.378-.415-.415-1.01-1.026-1.378-1.918-.244-.593-.341-1.015-.3-1.391.056-.525.582-1.035.756-1.139.068-.041.13-.062.18-.062.115 0 .216.012.284.144l.432 1.041c.046.109.026.234-.049.317l-.234.258c-.067.074-.083.178-.04.264.205.415.524.78.932 1.188.408.408.773.727 1.188.932.086.043.19.027.264-.04l.258-.234c.083-.075.208-.095.317-.049l1.041.432c.132.068.144.169.144.284 0 .05-.021.112-.062.18zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.019 21.997c-1.805 0-3.573-.485-5.124-1.4l-.367-.217-3.804.997 1.015-3.712-.239-.381c-1.006-1.605-1.539-3.468-1.537-5.38.004-5.509 4.49-9.992 10.002-9.992 2.668 0 5.176 1.039 7.062 2.927 1.886 1.888 2.924 4.397 2.923 7.067-.004 5.511-4.49 9.991-9.998 9.991z" />
          </svg>
          <span className="hidden font-mono uppercase font-bold text-[11px] tracking-wider sm:inline">Caretaker Contact</span>
        </a>
      )}

      {/* Comparison Drawer Trigger */}
      {compareHostels.length > 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-55 px-4 animate-in slide-in-from-bottom-8 fade-in">
          <button 
            onClick={() => setShowCompareModal(true)}
            className="bg-indigo-900 border border-indigo-700 text-white shadow-xl shadow-indigo-900/20 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 tracking-wide cursor-pointer hover:bg-indigo-800 transition-all active:scale-95"
          >
            <BarChart2 className="w-4 h-4" />
            Compare {compareHostels.length} {compareHostels.length === 1 ? 'Hostel' : 'Hostels'}
            {compareHostels.length >= 2 && <span className="bg-indigo-600 px-2 py-0.5 rounded-full text-[10px] ml-1">Ready</span>}
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex-none p-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCompareModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Hostel Comparison</h2>
            </div>
            <button 
              onClick={() => {
                setCompareHostels([]);
                setShowCompareModal(false);
              }}
              className="text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 px-4 py-2 rounded-xl transition hover:bg-rose-100"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto overflow-x-auto pb-8">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-1/4"></th>
                    {compareHostels.map(hostel => (
                      <th key={hostel.id} className="p-4 border-b border-slate-200 dark:border-slate-800 w-1/3 min-w-[200px]">
                        <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
                          <img src={getHostelImages(hostel.id, hostel.imageUrl, hostel.imageUrls)[0]} alt={hostel.name} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => {
                                const newHostels = compareHostels.filter(h => h.id !== hostel.id);
                                setCompareHostels(newHostels);
                                if (newHostels.length === 0) setShowCompareModal(false);
                            }}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-rose-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> 
                          </button>
                        </div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">{hostel.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-rose-500" /> {hostel.area}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-wider text-xs">Rent Starting At</td>
                    {compareHostels.map(hostel => {
                      const getMinSemesterRent = () => {
                        if (hostel.rentSemesterKes !== undefined && hostel.rentSemesterKes !== null && hostel.rentSemesterKes !== '') {
                          return hostel.rentSemesterKes;
                        }
                        if (!hostel.rooms || hostel.rooms.length === 0) {
                          return 18000;
                        }
                        return Math.min(...hostel.rooms.map(r => r.priceKes));
                      };
                      const rent = getMinSemesterRent();
                      return <td key={hostel.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-black text-emerald-600 text-lg break-all">{formatSemesterRent(rent)}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-wider text-xs">Distance to Gate</td>
                    {compareHostels.map(hostel => (
                      <td key={hostel.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-800 dark:text-slate-200">{hostel.distanceMeters} Meters</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-wider text-xs">Security</td>
                    {compareHostels.map(hostel => (
                      <td key={hostel.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-semibold text-slate-700 dark:text-slate-300"><Shield className="w-4 h-4 inline-block mr-1 text-indigo-500" /> {hostel.hasSecurity ? '24/7 Guarded' : 'Basic Security'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-wider text-xs">WiFi Info</td>
                    {compareHostels.map(hostel => (
                      <td key={hostel.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300">
                        {hostel.hasWifi ? <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400"><Wifi className="w-4 h-4" /> Available</span> : <span className="text-slate-400 font-medium">Not Included</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-wider text-xs">Water Supply</td>
                    {compareHostels.map(hostel => (
                      <td key={hostel.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300">
                        {hostel.hasBorehole ? <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400"><Droplet className="w-4 h-4" /> Backup Borehole</span> : <span className="text-slate-800 dark:text-slate-200 font-medium">County Water</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-wider text-xs">Hot Shower</td>
                    {compareHostels.map(hostel => (
                      <td key={hostel.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300">
                        {hostel.hasHotShower ? <span className="flex items-center gap-1 font-bold text-rose-500"><Flame className="w-4 h-4" /> Instant Shower</span> : <span className="text-slate-400 font-medium">Standard</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs rounded-bl-3xl">Action</td>
                    {compareHostels.map(hostel => (
                      <td key={hostel.id} className="p-4">
                        <button 
                          onClick={() => {
                            setShowCompareModal(false);
                            setSelectedHostel(hostel);
                            setExploreView('rooms');
                            window.scrollTo({ top: 0, behavior: 'auto' });
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition cursor-pointer"
                        >
                          View Rooms
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Floating Bottom Navigation Menu (Gen-Z Neumorphic style with bounce interaction) */}
      {currentPage === 'details' && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-1 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent pointer-events-none flex justify-center transition-all duration-300 transform ${showBottomBar ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
          {/* accessibility-audit: nav landmark with aria-label distinguishes from header nav */}
          <nav
            aria-label="Main navigation"
            className="pointer-events-auto flex items-center justify-between gap-1.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-2 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_12px_36px_rgba(30,41,59,0.12)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.5)] max-w-lg w-full">
            
            {/* 1. Explore Tab — accessibility-audit: aria-current marks active tab */}
            <button
              id="bottom-tab-explore"
              onClick={() => {
                setActiveTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={activeTab === 'explore' ? 'page' : undefined}
              aria-label="Explore hostels"
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm scale-110 -translate-y-1'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <div className="relative" aria-hidden="true">
                <Building className="w-5 h-5 stroke-[2.25]" />
              </div>
              <span className="font-sans text-[10px] tracking-tight">Explore</span>
            </button>

            {/* 2. Bookings Tab */}
            <button
              id="bottom-tab-bookings"
              onClick={() => {
                setActiveTab('bookings');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={activeTab === 'bookings' ? 'page' : undefined}
              aria-label="My bookings"
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm scale-110 -translate-y-1'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <div className="relative" aria-hidden="true">
                <Receipt className="w-5 h-5 stroke-[2.25]" />
                {activeUserBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                )}
              </div>
              <span className="font-sans text-[10px] tracking-tight">Bookings</span>
            </button>

            {/* 3. Services Hub Tab */}
            <button
              id="bottom-tab-maintenance"
              onClick={() => {
                setActiveTab('maintenance');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'maintenance'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm scale-110 -translate-y-1'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <div className="relative">
                <Hammer className="w-5 h-5 stroke-[2.25]" />
              </div>
              <span className="font-sans text-[10px] tracking-tight">Services Hub</span>
            </button>

            {/* 4. Admin Tab */}
            {isAdminUser && (
              <button
                id="bottom-tab-admin"
                onClick={() => {
                  setActiveTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-current={activeTab === 'admin' ? 'page' : undefined}
                aria-label="Admin dashboard"
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm scale-110 -translate-y-1'
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
                }`}
              >
                <div className="relative" aria-hidden="true">
                  <BarChart2 className="w-5 h-5 stroke-[2.25]" />
                  {(pendingBookingCount > 0 || openMaintenanceCount > 0) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                  )}
                </div>
                <span className="font-sans text-[10px] tracking-tight">Admin</span>
              </button>
            )}

            {/* 5. AI Sophia Tab */}
            <button
              id="bottom-tab-sophia"
              onClick={() => {
                setActiveTab('sophia');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={activeTab === 'sophia' ? 'page' : undefined}
              aria-label="Sophia AI assistant"
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'sophia'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm scale-110 -translate-y-1'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <div className="relative" aria-hidden="true">
                <MessageSquare className="w-5 h-5 stroke-[2.25] text-indigo-600 dark:text-indigo-400" />
                <span className="absolute -top-1 right-0.5 px-1 py-0.2 bg-amber-400 dark:bg-amber-500 text-slate-950 text-[7px] font-black tracking-tighter rounded-md uppercase animate-bounce scale-90">
                  AI
                </span>
              </div>
              <span className="font-sans text-[10px] tracking-tight">Sophia</span>
            </button>

            {/* 6. KSH Gossip Tab */}
            <button
              id="bottom-tab-news"
              onClick={() => {
                setActiveTab('news');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={activeTab === 'news' ? 'page' : undefined}
              aria-label="KSH Gossip"
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm scale-110 -translate-y-1'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <div className="relative">
                <Newspaper className="w-5 h-5 stroke-[2.25]" />
              </div>
              <span className="font-sans text-[10px] tracking-tight">KSH Gossip</span>
            </button>

          </nav>
        </div>
      )}

      {/* Floating scroll progress Back to top button — accessibility-audit: aria-label on icon-only button */}
      {scrollPercent > 4 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          className={`fixed right-5 sm:right-8 z-55 flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-[0_6px_24px_rgba(30,41,59,0.15)] dark:shadow-[0_6px_30px_rgba(0,0,0,0.6)] text-indigo-600 dark:text-indigo-400 group active:scale-95 transition-all duration-300 border border-slate-100 dark:border-slate-800 cursor-pointer ${
            currentPage === 'details' && showBottomBar
              ? 'bottom-24 sm:bottom-28'
              : 'bottom-6 sm:bottom-8'
          }`}
          title="Scroll Back To Top"
          style={{ zIndex: 99 }}
        >
          {/* Circular progress SVG — aria-hidden: decorative */}
          <svg className="absolute -rotate-90 w-11 h-11" viewBox="0 0 44 44" aria-hidden="true">
            <circle
              cx="22"
              cy="22"
              r="20"
              className="stroke-slate-200/50 dark:stroke-slate-800/40 fill-none"
              strokeWidth="2.5"
            />
            <circle
              cx="22"
              cy="22"
              r="20"
              className="stroke-indigo-600 dark:stroke-indigo-400 fill-none transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray="125.66"
              strokeDashoffset={125.66 - (scrollPercent / 100) * 125.66}
              strokeLinecap="round"
            />
          </svg>
          <ArrowUp className="w-5 h-5 absolute group-hover:-translate-y-0.5 transition-transform stroke-[2.75]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

