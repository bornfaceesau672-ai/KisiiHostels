import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Hostel, Room, Booking, MaintenanceRequest, HostelReview } from './types';
import { INITIAL_HOSTELS, INITIAL_BOOKINGS, INITIAL_MAINTENANCE } from './initialData';
import { INITIAL_REVIEWS } from './initialReviews';
import HostelCard from './components/HostelCard';
import AvailabilityGrid from './components/AvailabilityGrid';
import BookRoomModal from './components/BookRoomModal';
import MaintenanceForm from './components/MaintenanceForm';
import SophiaBot from './components/SophiaBot';
import AuthModal from './components/AuthModal';
import EditProfileModal from './components/EditProfileModal';
import { getHostelImages, getHostelYoutubeEmbed } from './utils/mediaHelper';
import { getNumericRent, formatMonthlyRent, formatSemesterRent } from './utils/rentHelper';

// Firebase core logic imports
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
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
  Trash2
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
  'Canaan'
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
      'Canaan'
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
        // Filter out any duplicate IDs that might be stored from previous sessions
        const seenIds = new Set<string>();
        const uniqueParsed: Hostel[] = [];
        for (const h of parsed) {
          if (h && h.id && h.id !== 'hostel-kisii-internal-chancellors' && !seenIds.has(h.id)) {
            seenIds.add(h.id);
            uniqueParsed.push(h);
          }
        }
        return uniqueParsed.sort(sortHostelsByEstate);
      } catch (e) {
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

  const [reviews, setReviews] = useState<HostelReview[]>(() => {
    const saved = localStorage.getItem('kisii_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
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
          const localKey = `kisii_user_profile_${firebaseUser.uid}`;
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const data = userDocSnap.data() as any;
              const syncedData = { ...data, synced: true };
              setUserProfile(syncedData);
              localStorage.setItem(localKey, JSON.stringify(syncedData));
            } else {
              // Try local cache first
              const cached = localStorage.getItem(localKey);
              if (cached) {
                setUserProfile(JSON.parse(cached));
              } else {
                setUserProfile(prev => {
                  if (prev && prev.uid === firebaseUser.uid) return prev;
                  const fallback = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Comrade Resident',
                    category: 'Student' as const,
                    createdAt: new Date().toISOString(),
                    synced: false
                  };
                  localStorage.setItem(localKey, JSON.stringify(fallback));
                  return fallback;
                });
              }
            }
          } catch (error) {
            console.warn('Firestore profile read failed, using local cache:', error);
            const cached = localStorage.getItem(localKey);
            if (cached) {
              setUserProfile(JSON.parse(cached));
            } else {
              const fallback = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Comrade Resident',
                category: 'Student' as const,
                createdAt: new Date().toISOString(),
                synced: false
              };
              localStorage.setItem(localKey, JSON.stringify(fallback));
              setUserProfile(fallback);
            }
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } finally {
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
    name: userProfile.displayName,
    regCode: userProfile.uid.substring(0, 8).toUpperCase(),
    email: userProfile.email,
    phone: userProfile.phone || '0712345678',
    gender: 'Male' as const,
    category: userProfile.category,
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
          querySnapshot.forEach((doc) => {
            loadedHostels.push(doc.data() as Hostel);
          });
          
          // Sort hostels by estate/area to maintain layout alignment consistency
          const estateOrderLocal = [
            'On-Campus', 'Mwembe', 'Nyanchwa', 'Milimani', 'Jogoo', 'Safariland', 'Nyaura', 'Canaan'
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

  useEffect(() => {
    localStorage.setItem('kisii_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kisii_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('kisii_reviews', JSON.stringify(reviews));
  }, [reviews]);

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
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings' | 'maintenance' | 'sophia' | 'admin'>('explore');
  const [currentPage, setCurrentPage] = useState<'home' | 'details'>('details');
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
  const [adminDraftHostel, setAdminDraftHostel] = useState<Hostel | null>(null);
  const [isUploadingHostelImage, setIsUploadingHostelImage] = useState(false);

  // Admin Firestore Action States
  const [isSavingHostel, setIsSavingHostel] = useState<boolean>(false);
  const [isDeletingHostel, setIsDeletingHostel] = useState<boolean>(false);

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

  // Feedback notifications
  const [alertBanner, setAlertBanner] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setAlertBanner({ text, type });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);
  };

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
    if (filterArea !== 'All' && hostel.area !== filterArea) return false;
    if (filterWifi && !hostel.hasWifi) return false;
    if (filterBorehole && !hostel.hasBorehole) return false;
    if (filterHotShower && !hostel.hasHotShower) return false;
    if (hostel.distanceMeters > maxDistance) return false;

    // Text search query filtering
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = hostel.name.toLowerCase().includes(query);
      const matchesArea = hostel.area.toLowerCase().includes(query);
      const matchesDescription = hostel.description.toLowerCase().includes(query);
      const matchesRooms = hostel.rooms.some((room) => 
        room.roomType.toLowerCase().includes(query) || 
        room.roomNumber.toLowerCase().includes(query) ||
        room.amenities.some((amenity) => amenity.toLowerCase().includes(query))
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
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      setIsAuthModalOpen(false);
      showFeedback('✓ Welcome back, Comrade! You are now signed in.', 'success');
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
      setIsAuthModalOpen(false);
      showFeedback(`✓ Welcome, ${displayNameInput}! Your account is active.`, 'success');

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
    
    // Automatically select the newly selected hostel in the listing for refresh
    const synchronizedHostel = updatedHostels.find(h => h.id === roomToBook.hostel.id);
    if (synchronizedHostel) {
      setSelectedHostel(synchronizedHostel);
    }

    setRoomToBook(null);
    showFeedback(`Awesome, Spot for Room ${roomToBook.room.roomNumber} is reserved! Standard leasing invoice created.`, 'success');
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
      'WhatsApp Video Call': `https://wa.me/254795858929?text=Hi%2C%20I%20scheduled%20a%20Hostel%20Virtual%20Tour%20online%2520for%2520${encodeURIComponent(hostel.name)}.%20Let's%2520connect%2520via%2520video%2520call!`,
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
    showFeedback(`Virtual Video Tour with ${hostel.name} Caretaker scheduled successfully! Redirecting to your bookings hub...`, 'success');
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
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Checked Out' } : b));

    // Update viewing references
    const synchronizedHostel = updatedHostels.find(h => h.id === bookingToRelease.hostelId);
    if (synchronizedHostel) {
      setSelectedHostel(synchronizedHostel);
    }

    showFeedback(`Checkout checked! Spot released for hostel ${bookingToRelease.hostelName}.`, 'warning');
  };

  // Fast trigger payment transition simulation
  const handleSimulatePayment = (bookingId: string) => {
    setBookings(bookings.map((b) => {
      if (b.id === bookingId) {
        const nextStatus = b.status === 'Pending Approval' ? 'Deposit Paid' : 'Fully Confirmed';
        showFeedback(`Transaction verified! M-PESA statement matched. Tenant status updated to ${nextStatus}.`, 'success');
        return { ...b, status: nextStatus };
      }
      return b;
    }));
  };

  const handleAdminBookingStatusChange = (bookingId: string, status: Booking['status']) => {
    setBookings(bookings.map((b) => b.id === bookingId ? { ...b, status } : b));
    showFeedback(`Admin updated booking status to ${status}.`, 'info');
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
      landlordPhone: '0712345678',
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

  const uploadHostelImageToPostImage = async (file: File) => {
    if (!adminDraftHostel || !isAdminUser) return;
    setIsUploadingHostelImage(true);
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
      setAdminDraftHostel((prev) => {
        if (!prev) return prev;
        const currentUrls = prev.imageUrls || [];
        const updatedUrls = [...currentUrls, hostedUrl];
        return {
          ...prev,
          imageUrls: updatedUrls,
          imageUrl: prev.imageUrl ? prev.imageUrl : hostedUrl
        };
      });
      showFeedback('Hostel image uploaded to PostImage. Save the hostel to keep it.', 'success');
    } catch (error: any) {
      console.error('PostImage upload failed:', error);
      showFeedback(error?.message || 'Image upload failed. Paste an image URL instead.', 'warning');
    } finally {
      setIsUploadingHostelImage(false);
    }
  };

  // Submit Maintenance Task
  const handleMaintenanceSubmit = (maintData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
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

    setMaintenance([newRequest, ...maintenance]);
    showFeedback(`Maintenance task logged! Handover scheduled with estate technicians.`, 'success');
  };

  // Trigger admin simulated mechanic update action
  const handleSimulateMaintenanceTransition = (maintId: string, action: 'In Progress' | 'Completed') => {
    const agents = ['Fundi Joseph (Plumber)', 'Electrician Mike', 'Technician Charles', 'Internet Support Caleb'];
    const chosenAgent = agents[Math.floor(Math.random() * agents.length)];

    setMaintenance(maintenance.map((m) => {
      if (m.id === maintId) {
        return {
          ...m,
          status: action,
          allocatedAgent: m.allocatedAgent || chosenAgent,
          notes: action === 'Completed' ? 'Screws tightened, hardware aligned and tested successfully.' : 'Diagnostic on back-piping underway.',
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));
    showFeedback(`Warden technician logged status update: ${action}`, 'info');
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
  const openMaintenanceCount = maintenance.filter((m) => m.status !== 'Completed').length;
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
            {/* Support Contact Helpline Pill */}
            <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 p-1 shadow-sm shrink-0">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 px-2 hidden lg:inline">Support:</span>
              <a
                href="tel:0795858929"
                className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                title="Call Support: 0795858929"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" />
              </a>
              <a
                href="https://wa.me/254795858929?text=Hi%2C%20I%20need%20support%20on%20the%20Kisii%20Hostel%20Portal."
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                title="Chat with Support on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 6.172c-2.386 0-4.321 1.934-4.321 4.32 0 .768.201 1.517.583 2.179l-.621 2.268 2.321-.609c.638.349 1.353.533 2.083.533l.001-.001c2.386 0 4.32-1.933 4.32-4.32 0-2.386-1.934-4.32-4.32-4.32zm2.531 6.13c-.104.174-.614.7-1.139.756-.376.04-.798-.057-1.391-.301-.892-.367-1.468-.962-1.884-1.378-.415-.415-1.01-1.026-1.378-1.918-.244-.593-.341-1.015-.3-1.391.056-.525.582-1.035.756-1.139.068-.041.13-.062.18-.062.115 0 .216.012.284.144l.432 1.041c.046.109.026.234-.049.317l-.234.258c-.067.074-.083.178-.04.264.205.415.524.78.932 1.188.408.408.773.727 1.188.932.086.043.19.027.264-.04l.258-.234c.083-.075.208-.095.317-.049l1.041.432c.132.068.144.169.144.284 0 .05-.021.112-.062.18zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.019 21.997c-1.805 0-3.573-.485-5.124-1.4l-.367-.217-3.804.997 1.015-3.712-.239-.381c-1.006-1.605-1.539-3.468-1.537-5.38.004-5.509 4.49-9.992 10.002-9.992 2.668 0 5.176 1.039 7.062 2.927 1.886 1.888 2.924 4.397 2.923 7.067-.004 5.511-4.49 9.991-9.998 9.991z" />
                </svg>
              </a>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-350 pr-2 pl-1 hidden md:inline">0795858929</span>
            </div>
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
              Choose an option from the menu below to instantly access room directories, file utility repair hub orders, manage invoices, or talk with Sophia active AI.
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

            {/* Preference Item 3: Repair Hub */}
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
                  {maintenance.filter(m => m.status !== 'Completed').length} Pending Issues
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                  Caretaker Repair Hub
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
                                    setBookings(bookings.map(book => book.id === b.id ? { ...book, status: 'Virtual Tour Completed' } : book));
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
              renderAuthGuard('Repair Hub', 'To submit maintenance repair requests, view resolved warden tickets, and communicate directly with carpenters or plumbers, please log in.')
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">University Repair Hub</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct communication terminal with wardens and repair fundis (plumb, electrics, carpentering).
                  </p>
                </div>
              </div>

              {/* Maintenance reporting form widget combo */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                <div className="xl:col-span-2 space-y-6">
                  <h3 className="text-sm font-mono tracking-wider text-slate-500 uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Student Issues Log ({maintenance.length} reported)
                  </h3>

                  {maintenance.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 py-16">
                      No problems logged yet. Good security, Comrade!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {maintenance.map((m) => {
                        const isHigh = m.priority === 'High';
                        const isMedium = m.priority === 'Medium';

                        return (
                          <div 
                            key={m.id}
                            id={`maint-task-${m.id}`}
                            className="bg-white rounded-2xl border border-slate-205 p-5 shadow-sm space-y-4 hover:border-slate-400 transition-colors border-slate-200"
                          >
                            {/* Urgent status header alignment details */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                                  m.status === 'Completed' 
                                    ? 'bg-emerald-500' 
                                    : m.status === 'In Progress'
                                      ? 'bg-amber-500 animate-pulse'
                                      : 'bg-rose-500 animate-ping'
                                }`} />
                                <span className="text-xs font-bold text-slate-800 font-sans capitalize">{m.status}</span>
                                
                                <span className="text-[10px] text-slate-400 font-mono">ID: {m.id}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                                  isHigh 
                                    ? 'bg-rose-50 text-rose-700 font-black' 
                                    : isMedium
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {m.priority} Priority
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 py-0.5 px-2 rounded font-mono font-bold">
                                  {m.category}
                                </span>
                              </div>
                            </div>

                            {/* Core Issue description content */}
                            <div className="space-y-1.5">
                              <h4 className="font-extrabold text-sm text-slate-900">
                                {m.hostelName} — Room {m.roomNumber}
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 rounded-xl p-3 border border-slate-100 max-h-24 overflow-y-auto">
                                {m.description}
                              </p>
                              
                              {m.allocatedAgent && (
                                <div className="text-[11px] text-indigo-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/30 flex justify-between items-center sm:flex-row flex-col gap-1.5">
                                  <span>Allocated Technician: <b>{m.allocatedAgent}</b></span>
                                  {m.notes && <span className="italic block sm:text-right text-slate-500 text-[10px]">&quot;{m.notes}&quot;</span>}
                                </div>
                              )}
                            </div>

                            {/* Dynamic administration simulator controls (for simulation) */}
                            <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-mono font-semibold text-slate-400">
                                Filed: {new Date(m.createdAt).toLocaleDateString()} @ {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>

                              <div className="flex gap-2.5">
                                {m.status === 'Reported' && (
                                  <button
                                    id={`assign-progress-btn-${m.id}`}
                                    onClick={() => handleSimulateMaintenanceTransition(m.id, 'In Progress')}
                                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-bold transition"
                                  >
                                    Assign Technician
                                  </button>
                                )}
                                {m.status === 'In Progress' && (
                                  <button
                                    id={`complete-task-btn-${m.id}`}
                                    onClick={() => handleSimulateMaintenanceTransition(m.id, 'Completed')}
                                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold transition"
                                  >
                                    Mark Solved
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="xl:col-span-1">
                  <MaintenanceForm 
                    hostels={hostels}
                    onSubmitRequest={handleMaintenanceSubmit}
                    userEmail={loggedStudent.email}
                  />
                </div>

              </div>

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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Listed Hostels', value: totalHostelsCount.toLocaleString(), detail: `${hostels.reduce((acc, h) => acc + h.rooms.length, 0)} rooms tracked`, icon: Building, tone: 'indigo' },
                  { label: 'Available Beds', value: totalBedsAvailableCount.toLocaleString(), detail: `${occupancyRate}% occupancy`, icon: TrendingUp, tone: 'emerald' },
                  { label: 'Pending Bookings', value: pendingBookingCount.toLocaleString(), detail: `${confirmedBookingCount} fully confirmed`, icon: Receipt, tone: 'amber' },
                  { label: 'Open Repairs', value: openMaintenanceCount.toLocaleString(), detail: `${maintenance.length} total tickets`, icon: AlertCircle, tone: 'rose' }
                ].map((metric) => {
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

              {adminDraftHostel && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Edit Hostel Details</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Select any hostel, update its public details, rooms, pricing, contacts, rules, and hosted image.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={adminSelectedHostelId}
                        onChange={(e) => setAdminSelectedHostelId(e.target.value)}
                        className="min-h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-3"
                        aria-label="Select hostel to edit"
                      >
                        {hostels.map((hostel) => (
                          <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                        ))}
                        {adminDraftHostel && !hostels.some(h => h.id === adminDraftHostel.id) && (
                          <option value={adminDraftHostel.id}>{adminDraftHostel.name} (Draft/New)</option>
                        )}
                      </select>
                      <button
                        onClick={handleAdminAddNewHostel}
                        disabled={isSavingHostel || isDeletingHostel}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Add New
                      </button>
                      <button
                        onClick={handleSaveAdminHostel}
                        disabled={isSavingHostel || isDeletingHostel}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isSavingHostel ? 'Saving...' : 'Save Hostel'}
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
                        {/* Upload to PostImage */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">Upload to PostImage (Adds to Gallery)</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingHostelImage}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadHostelImageToPostImage(file);
                              e.currentTarget.value = '';
                            }}
                            className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white disabled:opacity-60 cursor-pointer"
                          />
                          {isUploadingHostelImage && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">Uploading image...</p>
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
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Repair Queue</h3>
                    <div className="mt-4 space-y-3">
                      {maintenance.filter((m) => m.status !== 'Completed').slice(0, 5).map((ticket) => (
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

      {/* Floating WhatsApp button pointing to landlord / caretaker */}
      {exploreView === 'rooms' && selectedHostel && (
        <a
          href={`https://wa.me/254795858929?text=Hi%2C%20Comrade%20Caretaker.%20I%20am%20viewing%20rooms%20online%2520at%2520${encodeURIComponent(selectedHostel.name)}%252520and%2520would%2520love%2520to%2520verify%2520booking%252520allotments%252520checks.`}
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

            {/* 3. Repair Hub Tab */}
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
              <span className="font-sans text-[10px] tracking-tight">Repair Hub</span>
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

