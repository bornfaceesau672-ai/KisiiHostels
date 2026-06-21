import React, { useState, useEffect, useRef } from 'react';
import { Hostel } from '../types';
import {
  MapPin,
  Building,
  ArrowRight,
  ChevronRight,
  Star,
  Wifi,
  Droplet,
  Flame,
  GraduationCap,
  Home,
  Shield,
  Zap,
  Clock,
  Users,
  Sparkles,
  Search,
  Menu,
  X,
  Eye
} from 'lucide-react';

interface EstateLandingPageProps {
  hostels: Hostel[];
  onViewEstate: (estate: string) => void;
  onViewHostel: (hostel: Hostel) => void;
  onEnterPortal: () => void;
  currentUser: any;
  onSignInClick: () => void;
}

const ESTATE_META: Record<string, {
  label: string;
  icon: string;
  gradient: string;
  accentColor: string;
  description: string;
  badge: string;
  emoji: string;
}> = {
  'On-Campus': {
    label: 'On-Campus',
    icon: 'GraduationCap',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    accentColor: 'bg-violet-500',
    description: 'Inside the university compound. Closest to lecture rooms & all facilities.',
    badge: 'Best Convenience',
    emoji: '🎓',
  },
  'Mwembe': {
    label: 'Mwembe',
    icon: 'Door',
    gradient: 'from-blue-600 via-cyan-600 to-sky-700',
    accentColor: 'bg-blue-500',
    description: 'Highly active housing right near the main gate entrance.',
    badge: 'Most Popular',
    emoji: '🚪',
  },
  'Nyanchwa': {
    label: 'Nyanchwa Hills',
    icon: 'Mountain',
    gradient: 'from-teal-600 via-emerald-600 to-green-700',
    accentColor: 'bg-teal-500',
    description: 'Breezy, peaceful highlands with panoramic views & high security.',
    badge: 'Most Scenic',
    emoji: '⛰️',
  },
  'Milimani': {
    label: 'Milimani',
    icon: 'Diamond',
    gradient: 'from-indigo-600 via-blue-700 to-sky-800',
    accentColor: 'bg-indigo-500',
    description: 'Upscale residences — prestige, quiet & ideal for intensive study.',
    badge: 'Premium Class',
    emoji: '💎',
  },
  'Jogoo': {
    label: 'Jogoo Estate',
    icon: 'Home',
    gradient: 'from-sky-600 via-blue-600 to-cyan-700',
    accentColor: 'bg-sky-500',
    description: 'Economical, social, and student-friendly residential suburb.',
    badge: 'Best Value',
    emoji: '🏘️',
  },
  'Safariland': {
    label: 'Safariland',
    icon: 'Shop',
    gradient: 'from-cyan-600 via-teal-600 to-blue-700',
    accentColor: 'bg-cyan-500',
    description: 'Closer to shops, cyber cafes, and commercial printing centers.',
    badge: 'Commercial Hub',
    emoji: '🛒',
  },
  'Nyaura': {
    label: 'Nyaura Outpost',
    icon: 'Tree',
    gradient: 'from-blue-700 via-indigo-600 to-violet-700',
    accentColor: 'bg-blue-600',
    description: 'Tranquil student apartments nestled along lush natural breeze.',
    badge: 'Nature-Rich',
    emoji: '🌳',
  },
  'Canaan': {
    label: 'Canaan Estate',
    icon: 'Building',
    gradient: 'from-sky-700 via-blue-700 to-indigo-700',
    accentColor: 'bg-sky-600',
    description: 'Serene, secure & clean environment popular for student residency.',
    badge: 'Most Secure',
    emoji: '🏛️',
  },
};

const ESTATE_ORDER = ['On-Campus', 'Mwembe', 'Nyanchwa', 'Milimani', 'Jogoo', 'Safariland', 'Nyaura', 'Canaan'];

const EstateLandingPage: React.FC<EstateLandingPageProps> = ({
  hostels,
  onViewEstate,
  onViewHostel,
  onEnterPortal,
  currentUser,
  onSignInClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEstate, setHoveredEstate] = useState<string | null>(null);
  const [expandedEstate, setExpandedEstate] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [counters, setCounters] = useState({ hostels: 0, estates: 0, beds: 0 });

  // Animate counters on mount
  useEffect(() => {
    const totalHostels = hostels.length;
    const totalEstates = ESTATE_ORDER.filter(e => hostels.some(h => h.area === e)).length;
    const totalBeds = hostels.reduce((acc, h) => acc + h.rooms.reduce((ra, r) => ra + r.maxOccupants, 0), 0);

    const duration = 1800;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounters({
        hostels: Math.floor(eased * totalHostels),
        estates: Math.floor(eased * totalEstates),
        beds: Math.floor(eased * totalBeds),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), 600);
    return () => clearTimeout(timer);
  }, [hostels]);

  // Scroll header shadow
  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Group hostels by estate
  const hostelsByEstate = ESTATE_ORDER.reduce((acc, estate) => {
    const filtered = hostels.filter((h) => h.area === estate);
    if (filtered.length > 0) acc[estate] = filtered;
    return acc;
  }, {} as Record<string, Hostel[]>);

  // Filter estates based on search
  const filteredEstates = Object.entries(hostelsByEstate).filter(([estate, estateHostels]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      estate.toLowerCase().includes(q) ||
      estateHostels.some((h) => h.name.toLowerCase().includes(q))
    );
  });

  const totalAvailableBeds = hostels.reduce(
    (acc, h) => acc + h.rooms.filter((r) => r.isAvailable).reduce((ra, r) => ra + (r.maxOccupants - r.currentOccupants), 0),
    0
  );

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 4 + (i % 5) * 2,
    x: (i * 17 + 5) % 100,
    y: (i * 23 + 10) % 100,
    duration: 4 + (i % 4),
    delay: (i % 5) * 0.8,
    opacity: 0.05 + (i % 4) * 0.04,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #1a5276 60%, #0d2137 100%)',
      overflowX: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>

      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map((p) => (
          <div key={p.id} style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#60a5fa',
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `lp-float ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }} />
        ))}
        <div style={{ position: 'absolute', top: '20%', left: '-8rem', width: '24rem', height: '24rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '-8rem', width: '20rem', height: '20rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40rem', height: '40rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* HEADER */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: headerScrolled ? 'rgba(15, 23, 42, 0.92)' : 'transparent',
        backdropFilter: headerScrolled ? 'blur(16px)' : 'none',
        borderBottom: headerScrolled ? '1px solid rgba(59,130,246,0.15)' : 'none',
        boxShadow: headerScrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}>
              <Home style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Nyumbani<span style={{ color: '#60a5fa' }}>Kisii</span>
              </div>
              <div style={{ fontSize: '0.6rem', color: '#93c5fd', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>
                Student Hostel Portal
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!currentUser && (
              <button onClick={onSignInClick} id="landing-sign-in-btn" style={{
                padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700,
                color: '#93c5fd', border: '1px solid rgba(147,197,253,0.3)', background: 'transparent',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Sign In
              </button>
            )}
            <button onClick={onEnterPortal} id="landing-header-enter-portal-btn" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800,
              color: 'white', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {currentUser ? 'Enter Portal' : 'Browse Portal'}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 10, paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center', padding: '8rem 1rem 4rem' }}>
        {/* Pill badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem', borderRadius: '9999px',
          background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(147,197,253,0.25)',
          color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}>
          <Sparkles style={{ width: 14, height: 14, color: '#fbbf24' }} />
          Kisii University Student Housing Hub 2026
          <Sparkles style={{ width: 14, height: 14, color: '#fbbf24' }} />
        </div>

        <h2 style={{
          fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, color: 'white',
          lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem',
          textShadow: '0 4px 24px rgba(59,130,246,0.4)',
        }}>
          Find Your Perfect<br />
          <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Student Hostel
          </span>
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'rgba(147,197,253,0.85)', maxWidth: '42rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Explore housing across <strong style={{ color: 'white' }}>{Object.keys(hostelsByEstate).length} estates</strong> near Kisii University — 
          compare amenities, pricing, and availability in one student-built platform.
        </p>

        {/* Search */}
        <div style={{ maxWidth: '30rem', margin: '0 auto 3rem', position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem',
            borderRadius: '1rem', border: '1px solid rgba(147,197,253,0.2)',
            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)',
          }}>
            <Search style={{ width: 16, height: 16, color: '#93c5fd', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search estate or hostel name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="landing-search-input"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.875rem', color: 'white', fontWeight: 500,
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(147,197,253,0.6)', padding: 0 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem' }}>
          {[
            { label: 'Listed Hostels', value: counters.hostels, suffix: '+' },
            { label: 'Estates Covered', value: counters.estates, suffix: '' },
            { label: 'Beds Available', value: totalAvailableBeds, suffix: '+' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(147,197,253,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scroll indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: '0.65rem', color: 'rgba(147,197,253,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Scroll to Explore</div>
        <div style={{ width: 20, height: 32, borderRadius: '9999px', border: '1.5px solid rgba(147,197,253,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0.25rem' }}>
          <div style={{ width: 4, height: 8, borderRadius: '9999px', background: '#60a5fa', animation: 'lp-scroll 1.8s ease-in-out infinite' }} />
        </div>
      </div>

      {/* ESTATE GRID */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 1rem 5rem', maxWidth: '80rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>🏘️ Browse by Estate</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(147,197,253,0.65)' }}>
            Click <strong style={{ color: '#93c5fd' }}>Show Hostels</strong> to see names, or <strong style={{ color: '#93c5fd' }}>View</strong> to go straight into full details.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '1.5rem' }}>
          {filteredEstates.map(([estate, estateHostels], idx) => {
            const meta = ESTATE_META[estate] || {
              label: estate, emoji: '🏠', gradient: 'from-blue-600 to-indigo-700',
              description: 'Student housing estate.', badge: '', accentColor: 'bg-blue-500',
            };
            const isExpanded = expandedEstate === estate;
            const isHovered = hoveredEstate === estate;
            const availableRooms = estateHostels.reduce((acc, h) => acc + h.rooms.filter((r) => r.isAvailable).length, 0);
            const cheapest = Math.min(...estateHostels.flatMap((h) => h.rooms.map((r) => r.priceKes)));

            // Map gradient string to actual colors
            const gradientMap: Record<string, string> = {
              'On-Campus': 'linear-gradient(135deg, #7c3aed, #9333ea, #4338ca)',
              'Mwembe': 'linear-gradient(135deg, #2563eb, #0891b2, #0369a1)',
              'Nyanchwa': 'linear-gradient(135deg, #0d9488, #059669, #15803d)',
              'Milimani': 'linear-gradient(135deg, #4338ca, #1d4ed8, #0369a1)',
              'Jogoo': 'linear-gradient(135deg, #0284c7, #2563eb, #0891b2)',
              'Safariland': 'linear-gradient(135deg, #0891b2, #0d9488, #1d4ed8)',
              'Nyaura': 'linear-gradient(135deg, #1d4ed8, #4338ca, #6d28d9)',
              'Canaan': 'linear-gradient(135deg, #0369a1, #1d4ed8, #3730a3)',
            };

            return (
              <div
                key={estate}
                id={`estate-card-${estate.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  position: 'relative', overflow: 'hidden', borderRadius: '1.5rem',
                  background: gradientMap[estate] || 'linear-gradient(135deg, #2563eb, #4338ca)',
                  boxShadow: isHovered ? '0 24px 60px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.25)' : '0 8px 32px rgba(0,0,0,0.45)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  animationDelay: `${idx * 80}ms`,
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredEstate(estate)}
                onMouseLeave={() => setHoveredEstate(null)}
              >
                {/* Dot pattern overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.5,
                }} />
                {/* Sheen */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)',
                  opacity: isHovered ? 1 : 0, transition: 'opacity 0.4s',
                }} />

                <div style={{ position: 'relative', padding: '1.5rem' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}>
                        {meta.emoji}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>{meta.label}</h4>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 2 }}>
                          {estateHostels.length} hostel{estateHostels.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {meta.badge && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: '9999px',
                        color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        whiteSpace: 'nowrap',
                      }}>
                        ✦ {meta.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                    {meta.description}
                  </p>

                  {/* Quick stats chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem' }}>
                      <Shield style={{ width: 12, height: 12 }} />
                      {availableRooms} rooms available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem' }}>
                      <Zap style={{ width: 12, height: 12, color: '#fcd34d' }} />
                      From KES {cheapest.toLocaleString()}/sem
                    </div>
                  </div>

                  {/* Amenity icons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
                    {estateHostels.some((h) => h.hasWifi) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                        <Wifi style={{ width: 10, height: 10, color: '#93c5fd' }} /> Wi-Fi
                      </div>
                    )}
                    {estateHostels.some((h) => h.hasBorehole) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                        <Droplet style={{ width: 10, height: 10, color: '#67e8f9' }} /> Borehole
                      </div>
                    )}
                    {estateHostels.some((h) => h.hasHotShower) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                        <Flame style={{ width: 10, height: 10, color: '#fdba74' }} /> Hot Shower
                      </div>
                    )}
                    {estateHostels.some((h) => (h.securityRating || 0) >= 4) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                        <Star style={{ width: 10, height: 10, color: '#fde68a' }} /> High Security
                      </div>
                    )}
                  </div>

                  {/* Expandable hostel list */}
                  <div style={{
                    overflow: 'hidden', transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
                    maxHeight: isExpanded ? '1000px' : '0px', opacity: isExpanded ? 1 : 0,
                    marginBottom: isExpanded ? '1rem' : 0,
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '1rem',
                      border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                    }}>
                      <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                        Hostels in {meta.label}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {estateHostels.map((h) => {
                          const availRooms = h.rooms.filter((r) => r.isAvailable).length;
                          return (
                            <button
                              key={h.id}
                              onClick={() => onViewHostel(h)}
                              id={`hostel-select-btn-${h.id}`}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
                                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Building style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.55)' }} />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{h.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px',
                                  background: availRooms > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                                  color: availRooms > 0 ? '#6ee7b7' : '#fca5a5',
                                  border: `1px solid ${availRooms > 0 ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'}`,
                                }}>
                                  {availRooms > 0 ? `${availRooms} free` : 'Full'}
                                </span>
                                <ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)' }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    {/* Show/Hide Hostels button */}
                    <button
                      onClick={() => setExpandedEstate(isExpanded ? null : estate)}
                      id={`estate-expand-btn-${estate.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.625rem 0.875rem', borderRadius: '0.75rem',
                        fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.08)',
                        cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                    >
                      {isExpanded ? <><X style={{ width: 13, height: 13 }} /> Hide</> : <><Eye style={{ width: 13, height: 13 }} /> Show {estateHostels.length} Hostel{estateHostels.length !== 1 ? 's' : ''}</>}
                    </button>

                    {/* View Estate — PRIMARY CTA */}
                    <button
                      onClick={() => onViewEstate(estate)}
                      id={`estate-view-btn-${estate.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.625rem 1rem', borderRadius: '0.75rem',
                        fontSize: '0.8rem', fontWeight: 900, color: 'white',
                        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.35)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      View Estate
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEstates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>No estates found</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(147,197,253,0.6)' }}>Try a different search.</p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.85rem',
                fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(147,197,253,0.3)', cursor: 'pointer',
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* CTA FOOTER */}
      <section style={{
        position: 'relative', zIndex: 10, padding: '4rem 1rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))',
        borderTop: '1px solid rgba(59,130,246,0.15)',
      }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: 'white', marginBottom: '0.75rem', lineHeight: 1.25 }}>
            Ready to Book Your Room?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(147,197,253,0.75)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join thousands of Kisii University students who found their perfect hostel through NyumbaniKisii. 
            Sign in to explore all rooms, compare prices, and book instantly.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={onEnterPortal}
              id="landing-cta-enter-portal"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.875rem 2rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 900,
                color: 'white', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.55)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)'; }}
            >
              <GraduationCap style={{ width: 16, height: 16 }} />
              Enter Full Portal
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            {!currentUser && (
              <button
                onClick={onSignInClick}
                id="landing-cta-sign-in"
                style={{
                  padding: '0.875rem 2rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700,
                  color: '#93c5fd', border: '1px solid rgba(147,197,253,0.35)', background: 'transparent',
                  cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Sign In / Register
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              { icon: Shield, text: 'Secure & Verified' },
              { icon: Clock, text: 'Real-Time Availability' },
              { icon: Star, text: 'Student Reviewed' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(147,197,253,0.5)' }}>
                <Icon style={{ width: 14, height: 14, color: 'rgba(96,165,250,0.6)' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes lp-float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-18px) scale(1.12); }
        }
        @keyframes lp-scroll {
          0% { transform: translateY(0); opacity: 1; }
          70% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        #landing-search-input::placeholder { color: rgba(147,197,253,0.45); }
        #landing-search-input:focus { outline: none; }
      `}</style>
    </div>
  );
};

export default EstateLandingPage;
