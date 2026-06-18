import React, { useState } from 'react';
import { Hostel, RelocationRequest } from '../types';
import { Truck, Calendar, Clock, User, Phone, MapPin, Package, FileText, CheckCircle2 } from 'lucide-react';
import { sanitizeInput } from '../utils/security';

interface RelocationFormProps {
  hostels: Hostel[];
  onSubmitRequest: (request: Omit<RelocationRequest, 'id' | 'createdAt' | 'status'>) => void;
  userEmail?: string;
  defaultStudentName?: string;
  defaultContactNumber?: string;
}

export default function RelocationForm({
  hostels,
  onSubmitRequest,
  userEmail = '',
  defaultStudentName = '',
  defaultContactNumber = ''
}: RelocationFormProps) {
  const [pickupHostel, setPickupHostel] = useState(hostels[0]?.name || '');
  const [destinationHostel, setDestinationHostel] = useState(hostels[1]?.name || hostels[0]?.name || '');
  const [relocationDate, setRelocationDate] = useState('');
  const [relocationTime, setRelocationTime] = useState('');
  const [transportType, setTransportType] = useState<RelocationRequest['transportType']>('Pickup Truck');
  const [loadSize, setLoadSize] = useState<RelocationRequest['loadSize']>('Medium (Bed + Bags)');
  const [studentName, setStudentName] = useState(defaultStudentName || 'Bonface Esau');
  const [contactNumber, setContactNumber] = useState(defaultContactNumber || '0712345678');
  const [notes, setNotes] = useState('');

  // Transport details dictionary with descriptions and pricing
  const transportOptions: {
    type: RelocationRequest['transportType'];
    description: string;
    rate: string;
    capacity: string;
    iconColor: string;
  }[] = [
    {
      type: 'Boda-Boda Mover',
      description: 'Single rider with luggage carrier straps.',
      rate: 'KES 200 - 500',
      capacity: 'Suitcases, bags, buckets',
      iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30'
    },
    {
      type: 'Mkokoteni (Handcart)',
      description: 'Handcart operator for localized, short moves.',
      rate: 'KES 500 - 1,000',
      capacity: 'Bed, mattress, 4 bags',
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
    },
    {
      type: 'Pickup Truck',
      description: 'Standard open pickup for complete room transfers.',
      rate: 'KES 1,500 - 3,000',
      capacity: 'Full room set, study tables, closets',
      iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      type: 'Closed Box Van',
      description: 'Weatherproof heavy-duty commercial van.',
      rate: 'KES 3,000 - 5,000',
      capacity: 'Multi-room loads, premium electronics',
      iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
    }
  ];

  const loadSizes: RelocationRequest['loadSize'][] = [
    'Light (Suitcases/Bags)',
    'Medium (Bed + Bags)',
    'Heavy (Full Room Set)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedPickup = sanitizeInput(pickupHostel);
    const sanitizedDestination = sanitizeInput(destinationHostel);
    const sanitizedDate = sanitizeInput(relocationDate);
    const sanitizedTime = sanitizeInput(relocationTime);
    const sanitizedName = sanitizeInput(studentName);
    const sanitizedContact = sanitizeInput(contactNumber);
    const sanitizedNotes = sanitizeInput(notes);

    if (!sanitizedDate || !sanitizedTime || !sanitizedName || !sanitizedContact) {
      alert('Please fill out all required booking details Comrade!');
      return;
    }

    if (sanitizedPickup === sanitizedDestination) {
      alert('Pickup and Destination hostels cannot be the same!');
      return;
    }

    onSubmitRequest({
      userEmail,
      studentName: sanitizedName,
      contactNumber: sanitizedContact,
      pickupHostel: sanitizedPickup,
      destinationHostel: sanitizedDestination,
      relocationDate: sanitizedDate,
      relocationTime: sanitizedTime,
      transportType,
      loadSize,
      notes: sanitizedNotes
    });

    // Reset notes after submit
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} id="relocation-booking-form" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6 transition duration-200">
      <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white leading-snug">
            Relocation & Transport Request
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Moving out or shifting hostels? Lock in premium, verified local campus movers at comrade-friendly rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pickup Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Pickup Location
          </label>
          <select
            value={pickupHostel}
            onChange={(e) => setPickupHostel(e.target.value)}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-slate-850 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            {hostels.map(h => (
              <option key={`pickup-${h.id}`} value={h.name}>{h.name} ({h.area})</option>
            ))}
            <option value="Other Location (Outside Portal List)">Other Location (Outside List)...</option>
          </select>
        </div>

        {/* Destination Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Destination Location
          </label>
          <select
            value={destinationHostel}
            onChange={(e) => setDestinationHostel(e.target.value)}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-slate-850 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            {hostels.map(h => (
              <option key={`dest-${h.id}`} value={h.name}>{h.name} ({h.area})</option>
            ))}
            <option value="Other Location (Outside Portal List)">Other Location (Outside List)...</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Date Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Relocation Date
          </label>
          <input
            type="date"
            required
            value={relocationDate}
            onChange={(e) => setRelocationDate(e.target.value)}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-slate-850 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Time Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Target Move Time
          </label>
          <input
            type="time"
            required
            value={relocationTime}
            onChange={(e) => setRelocationTime(e.target.value)}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-slate-850 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Load Size */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-2.5 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-slate-400" /> Estimated Load Size
        </label>
        <div className="flex flex-wrap gap-2">
          {loadSizes.map(size => (
            <button
              type="button"
              key={size}
              onClick={() => setLoadSize(size)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                loadSize === size
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Choice of Mover type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-3 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-slate-400" /> Select Transport Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {transportOptions.map(opt => {
            const isSelected = transportType === opt.type;
            return (
              <button
                type="button"
                key={opt.type}
                onClick={() => setTransportType(opt.type)}
                className={`p-3.5 rounded-2xl border text-left transition duration-200 flex flex-col justify-between space-y-2 relative cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-950 dark:text-white">{opt.type}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${opt.iconColor}`}>
                    {opt.rate}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{opt.description}</p>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Capacity: {opt.capacity}
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-2 text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="w-4 h-4 fill-indigo-100 dark:fill-indigo-950/30" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" /> Contact Name
          </label>
          <input
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Name of recipient"
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-slate-850 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Mobile
          </label>
          <input
            type="tel"
            required
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="e.g. 0712345678"
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-slate-850 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" /> Additional Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. I have a metallic double bunk bed that requires dismantling. I live on the 3rd floor..."
          className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl p-3.5 text-slate-850 dark:text-slate-250 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          id="btn-submit-relocation"
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow cursor-pointer"
        >
          <Truck className="w-4 h-4" />
          Book Relocation Mover
        </button>
      </div>
    </form>
  );
}
