import { Hostel, Room } from '../types';
import { User, Users, Compass, Phone, BedDouble, CheckCircle2 } from 'lucide-react';
import { formatMonthlyRent } from '../utils/rentHelper';
import { getHostelImages } from '../utils/mediaHelper';

interface AvailabilityGridProps {
  hostel: Hostel;
  onSelectBookRoom: (room: Room) => void;
  activeBookingRoomId?: string;
}

export default function AvailabilityGrid({ hostel, onSelectBookRoom, activeBookingRoomId }: AvailabilityGridProps) {
  // Group rooms by floor levels
  const floors = Array.from(new Set(hostel.rooms.map((room) => room.floor))).sort((a, b) => a - b);
  const totalBeds = hostel.rooms.reduce((sum, room) => sum + room.maxOccupants, 0);
  const openBeds = hostel.rooms.reduce((sum, room) => sum + Math.max(0, room.maxOccupants - room.currentOccupants), 0);

  // Gender colors
  const getGenderColor = (pref: 'Male' | 'Female' | 'Mixed') => {
    switch (pref) {
      case 'Male':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Female':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getRoomTypeIcon = (type: 'Single' | 'Double' | '4-Sharing') => {
    switch (type) {
      case 'Single':
        return <User className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const hasCustomImages = (hostel.imageUrls && hostel.imageUrls.length > 0) || (hostel.imageUrl && hostel.imageUrl.trim() !== '');
  const primaryImage = hasCustomImages ? getHostelImages(hostel.id, hostel.imageUrl, hostel.imageUrls)[0] : undefined;

  return (
    <div id={`availability-grid-${hostel.id}`} className="space-y-6">
      {primaryImage && (
        <div className="relative h-48 md:h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-sm watermarked-image-container">
          <img 
            src={primaryImage} 
            alt={hostel.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/10" />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <span className="text-[9px] font-mono tracking-wider uppercase bg-emerald-600 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              Official Kisii University Residence
            </span>
            <h1 className="text-2xl font-black font-sans mt-1.5 leading-tight tracking-tight">{hostel.name}</h1>
            <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed font-medium">
              {hostel.description}
            </p>
          </div>
        </div>
      )}

      {/* Fallback description when there is no cover image */}
      {!primaryImage && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono tracking-wider uppercase bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-bold text-[9px]">
            About {hostel.name}
          </span>
          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
            {hostel.description}
          </p>
        </div>
      )}
      {/* Caretaker Contact Info Section (Static, No Direct Call/WhatsApp buttons) */}
      {hostel.landlordPhone && (
        <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Phone className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hostel Caretaker Contact</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                For room allocation inquiries, keys, and physical tenancy assistance, coordinate with the caretaker:
              </p>
            </div>
          </div>
          <a
            href={(() => {
              let clean = String(hostel.landlordPhone || '254795858929').replace(/[^0-9]/g, '');
              if (clean.startsWith('0')) {
                clean = '254' + clean.substring(1);
              }
              const msg = `Hello NyumbaniKisii admin, I am viewing rooms online at '${hostel.name}' and would love to verify booking allotments checks`;
              return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
            })()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900/60 px-4 py-2.5 rounded-xl text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 shadow-sm shrink-0 transition active:scale-98 cursor-pointer select-none"
            title="Chat on WhatsApp"
          >
            <span>💬 Chat: {hostel.landlordPhone}</span>
          </a>
        </div>
      )}



      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700">
            <BedDouble className="h-3.5 w-3.5" />
            Active rooms directory
          </span>
          <h2 className="mt-2 text-xl font-black text-slate-950 tracking-tight">
            Choose a bed space in {hostel.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Compare occupancy, rent, and in-room amenities before reserving a space.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center">
          <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 font-bold text-emerald-700">
            {openBeds} open beds
          </span>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-600">
            {totalBeds} total beds
          </span>
          <span className="col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            open
            <span className="ml-2 h-2.5 w-2.5 rounded-full bg-slate-300" />
            taken
          </span>
        </div>
      </div>

      {floors.map((floor) => {
        const floorRooms = hostel.rooms.filter((r) => r.floor === floor);

        return (
          <section key={floor} className="space-y-3" aria-labelledby={`floor-${floor}-${hostel.id}`}>
            <h3 id={`floor-${floor}-${hostel.id}`} className="text-xs font-mono tracking-wider text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Floor {floor === 0 ? 'Ground Floor' : `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : 'rd'} Floor`}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {floorRooms.map((room) => {
                const spotsAvailable = room.maxOccupants - room.currentOccupants;
                const isFullyBooked = spotsAvailable <= 0;
                const selected = activeBookingRoomId === room.id;
                
                // Array to map visual dots for spots
                const spotRepresentation = Array.from({ length: room.maxOccupants }, (_, index) => {
                  return index < room.currentOccupants; // true = occupied, false = free
                });

                return (
                  <article
                    key={room.id}
                    className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 ${
                      selected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : isFullyBooked
                          ? 'border-slate-200 bg-slate-50/70 opacity-80'
                          : 'border-slate-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    {selected && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-indigo-600" />
                    )}

                    {/* Header: Room Number & Type */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block truncate text-base font-black font-mono text-slate-900">Room {room.roomNumber}</span>
                        <div className="mt-1 flex flex-col gap-1 items-start">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold px-1.5 py-0.5 rounded">
                            {room.roomFormat}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                            {getRoomTypeIcon(room.roomType)}
                            <span>{room.roomType} Study</span>
                          </div>
                        </div>
                      </div>
                      
                      <span className={`shrink-0 text-[10px] font-black tracking-tight uppercase px-2.5 py-1 rounded-full border ${getGenderColor(room.genderPreference)}`}>
                        {room.genderPreference} Only
                      </span>
                    </div>

                    {/* Occupancy dots representation */}
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Beds Layout</span>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          {spotRepresentation.map((isOccupied, idx) => (
                            <span 
                              key={idx} 
                              className={`w-3.5 h-3.5 rounded-full transition-colors ${
                                isOccupied 
                                  ? 'bg-slate-300 border border-slate-400'
                                  : 'bg-emerald-500 ring-2 ring-emerald-100 border border-emerald-600'
                              }`} 
                              title={isOccupied ? 'Occupied Bed' : 'Available Bed Space'}
                            />
                          ))}
                          <span className="font-mono text-xs text-slate-500 font-medium ml-1">
                            {room.currentOccupants}/{room.maxOccupants} taken
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold ml-auto block">Monthly/Sem Rent</span>
                        <span className="text-sm font-black font-mono text-emerald-600 leading-none block break-all">
                          {formatMonthlyRent(room.rentMonthlyKes || Math.round(room.priceKes / 4))}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium mt-1 block">
                          KES {room.priceKes.toLocaleString()}/sem
                        </span>
                      </div>
                    </div>

                    {/* In-room Amenities */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {room.amenities.map((am, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">
                          {am}
                        </span>
                      ))}
                    </div>

                    {/* Booking Selector Button */}
                    <div className="mt-4">
                      {isFullyBooked ? (
                        <button
                          disabled
                          className="w-full min-h-11 text-center text-xs font-semibold py-2 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed uppercase tracking-wider"
                        >
                          Room Complete
                        </button>
                      ) : (
                        <button
                          id={`book-space-btn-${room.id}`}
                          onClick={() => onSelectBookRoom(room)}
                          aria-pressed={selected}
                          className={`w-full min-h-11 text-center text-sm font-black py-2.5 rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 ${
                            selected
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          }`}
                        >
                          {selected && <CheckCircle2 className="h-4 w-4" />}
                          {selected ? 'Selection Ready' : 'Book Bed Space'}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
