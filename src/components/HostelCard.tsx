import React from 'react';
import { Hostel } from '../types';
import { Shield, MapPin, Video, ArrowRight, BarChart2 } from 'lucide-react';
import { getHostelImages } from '../utils/mediaHelper';
import { getNumericRent, formatMonthlyRent } from '../utils/rentHelper';

interface HostelCardProps {
  key?: string;
  hostel: Hostel;
  onSelect: (hostel: Hostel) => void;
  onRequestVirtualTour: (hostel: Hostel) => void;
  isSelected: boolean;
  isCompared?: boolean;
  onToggleCompare?: (hostel: Hostel, e: React.MouseEvent) => void;
}

export default function HostelCard({ hostel, onSelect, isSelected, isCompared, onToggleCompare }: HostelCardProps) {
  // Determine standard rule fallbacks if not defined dynamically
  const depositRefundablePolicy = hostel.depositRefundable || "Fully Refundable at semester close";

  // Calculate total beds available
  const totalBedsAvailable = hostel.rooms.reduce((acc, room) => {
    return acc + (room.maxOccupants - room.currentOccupants);
  }, 0);

  // Safe pricing calculation
  const getMinMonthlyRent = () => {
    if (hostel.rentMonthlyKes !== undefined && hostel.rentMonthlyKes !== null && hostel.rentMonthlyKes !== '') {
      return hostel.rentMonthlyKes;
    }
    if (!hostel.rooms || hostel.rooms.length === 0) {
      return 4500;
    }
    const definedRents = hostel.rooms.map(r => r.rentMonthlyKes).filter(Boolean);
    if (definedRents.length > 0) {
      return definedRents.reduce((min, current) => {
        const minVal = getNumericRent(min, 999999);
        const currVal = getNumericRent(current, 999999);
        return currVal < minVal ? current : min;
      }, definedRents[0]);
    }
    return Math.min(...hostel.rooms.map(r => Math.round(r.priceKes / 4)));
  };

  const monthlyRent = getMinMonthlyRent();

  const semesterRent = hostel.rooms && hostel.rooms.length > 0
    ? Math.min(...hostel.rooms.map(r => r.priceKes))
    : 18000;

  const cardImage = getHostelImages(hostel.id, hostel.imageUrl, hostel.imageUrls)[0];

  return (
    <div 
      id={`hostel-card-${hostel.id}`}
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/5 dark:bg-indigo-950/15 shadow-md scale-[1.01]' 
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg bg-white dark:bg-slate-900'
      }`}
      onClick={() => onSelect(hostel)}
    >
      {/* 1. Hostel Image Section */}
      <div className="h-44 bg-slate-100 dark:bg-slate-950 relative overflow-hidden animate-in fade-in duration-300">
        <img 
          src={cardImage} 
          alt={hostel.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none" />
        
        {/* Quick Badges inside image */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start text-white">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] bg-indigo-600 border border-indigo-400/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-sm self-start">
              📹 Virtual Preview Ready
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            {totalBedsAvailable > 0 ? (
              <span className="text-[8px] bg-emerald-500 border border-emerald-400/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-sm">
                🟢 Vacant
              </span>
            ) : (
              <span className="text-[8px] bg-rose-500 border border-rose-400/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-sm">
                🔴 Full
              </span>
            )}
            
            {onToggleCompare && (
              <button 
                onClick={(e) => onToggleCompare(hostel, e)}
                className={`p-1.5 rounded-full backdrop-blur-md border shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center ${isCompared ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/40 hover:bg-black/60 border-white/20 text-white/90'}`}
                title={isCompared ? "Remove from Comparison" : "Add to Comparison"}
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* 2. Hostel Name & Badge */}
        <div>
          <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-slate-100 leading-snug tracking-tight transition-colors">
            {hostel.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
            Comrade Residence
          </p>
        </div>

        {/* 3. Rent Rates Section */}
        <div className="bg-gradient-to-r from-emerald-50/60 to-slate-50 dark:from-slate-950/30 dark:to-slate-900/10 border border-emerald-100/60 dark:border-emerald-950/40 rounded-2xl p-3 flex flex-col gap-1">
          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider font-extrabold">Comrade Rental Rates</span>
          <div className="grid grid-cols-2 gap-2 items-center">
            <div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Monthly Person</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none break-all">
                {formatMonthlyRent(monthlyRent)}
              </span>
            </div>
            <div className="border-l border-emerald-100 dark:border-emerald-950/40 pl-2.5">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Semester Rate</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 font-mono leading-none">
                KES {semesterRent.toLocaleString()}/sem
              </span>
            </div>
          </div>
        </div>

        {/* 4. Quick Estate & Camp Proximity Parameters */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">{hostel.area}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
            <span>🚶</span>
            <span className="truncate">{hostel.distanceMeters}M to Gate</span>
          </div>
        </div>

        {/* Room Formats available */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {Array.from(new Set(hostel.rooms.map(r => r.roomFormat))).map(format => (
            <span key={format} className="text-[9px] font-sans font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200/30 dark:border-slate-800">
              {format}
            </span>
          ))}
        </div>

        {/* 5. See Details immediate page route button */}
        <div className="pt-1">
          <button
            id={`toggle-hostel-details-btn-${hostel.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(hostel);
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-indigo-700 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition duration-200 cursor-pointer active:scale-[0.98] select-none"
          >
            <span>See Details &amp; Room Booking</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
