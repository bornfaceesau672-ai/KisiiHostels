import React, { useState } from 'react';
import { Hostel, MaintenanceRequest } from '../types';
import { AlertTriangle, Hammer, HelpCircle, User, Phone, CheckSquare, PlusCircle } from 'lucide-react';
import { sanitizeInput } from '../utils/security';

interface MaintenanceFormProps {
  hostels: Hostel[];
  onSubmitRequest: (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  userEmail?: string;
}

export default function MaintenanceForm({ hostels, onSubmitRequest, userEmail }: MaintenanceFormProps) {
  const [selectedHostelId, setSelectedHostelId] = useState(hostels[0]?.id || '');
  const [roomNumber, setRoomNumber] = useState('102');
  const [studentName, setStudentName] = useState('Bonface Esau');
  const [contactNumber, setContactNumber] = useState('0712345678');
  const [category, setCategory] = useState<MaintenanceRequest['category']>('Plumbing');
  const [priority, setPriority] = useState<MaintenanceRequest['priority']>('Medium');
  const [description, setDescription] = useState('');
  
  // Custom room blueprint zone selector
  const [blueprintSpot, setBlueprintSpot] = useState<string>('Bathroom');

  const categories: MaintenanceRequest['category'][] = [
    'Plumbing', 'Electrical', 'Carpentry', 'Wi-Fi/Network', 'Water Supply', 'Pest Control', 'Other'
  ];

  const blueprintZones = [
    { name: 'Bathroom', coords: 'top-left', label: '🚿 Shower / Taps' },
    { name: 'Study Desk', coords: 'bottom-left', label: '🔌 Desks / Plugs' },
    { name: 'Bed Frame', coords: 'bottom-right', label: '🛏️ Bed & Mattresses' },
    { name: 'Entrance Lock', coords: 'top-right', label: '🚪 Door & Keys' },
    { name: 'Window/Balcony', coords: 'middle-edge', label: '🪟 Windows & Glass' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize user inputs first
    const sanitizedRoom = sanitizeInput(roomNumber);
    const sanitizedName = sanitizeInput(studentName);
    const sanitizedContact = sanitizeInput(contactNumber);
    const sanitizedDescriptionText = sanitizeInput(description);

    if (!sanitizedDescriptionText.trim() || !sanitizedRoom.trim() || !sanitizedName.trim() || !sanitizedContact.trim()) {
      alert('Please fill out all contact details and description comrade!');
      return;
    }

    const hostel = hostels.find(h => h.id === selectedHostelId);
    const hostelName = hostel ? hostel.name : 'Unknown Hostel';

    // Compile descriptive report joining selected blueprint section
    const decoratedDescription = `[Issue Location: ${blueprintSpot}] - ${sanitizedDescriptionText}`;

    onSubmitRequest({
      hostelId: selectedHostelId,
      hostelName,
      roomNumber: sanitizedRoom,
      studentName: sanitizedName,
      userEmail,
      contactNumber: sanitizedContact,
      category,
      priority,
      description: decoratedDescription
    });

    // Reset description
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} id="maintenance-register-form" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Hammer className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-900 leading-snug">
            File Maintenance Issue
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Encountering water issues or power sparks? Pinpoint the problem on the map and alert warden craftsmen.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Fields Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Hostel</label>
              <select 
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:border-indigo-500 focus:outline-none"
              >
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
              <input 
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 102"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" /> Reporter Name
              </label>
              <input 
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Name"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> Phone Mobile
              </label>
              <input 
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Mobile e.g. 0712345678"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Problem Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                    category === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as MaintenanceRequest['priority'][]).map(pri => (
                <button
                  type="button"
                  key={pri}
                  onClick={() => setPriority(pri)}
                  className={`text-xs py-2 px-3 border rounded-xl font-bold transition ${
                    priority === pri
                      ? pri === 'Low'
                        ? 'bg-slate-100 border-slate-500 text-slate-700'
                        : pri === 'Medium'
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  {pri} Priority
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Room Blueprint Diagnostic Diagnostic Blueprint */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interactive Room Diagnostic blueprint
            </label>
            <p className="text-[10px] text-slate-400">
              Tap the visual schematics zone representing the breakdown sector.
            </p>
          </div>

          <div className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 h-60 flex flex-col justify-between overflow-hidden">
            {/* Outline Room Wall layout representation */}
            <div className="absolute inset-4 border border-indigo-300/30 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest opacity-35">Room Area Map</span>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10 h-full">
              {blueprintZones.map(zone => (
                <button
                  type="button"
                  key={zone.name}
                  onClick={() => setBlueprintSpot(zone.name)}
                  className={`p-2 rounded-xl border text-left text-xs transition duration-200 flex flex-col justify-between ${
                    blueprintSpot === zone.name
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">{zone.label}</span>
                  <span className={`text-[9px] font-mono mt-0.5 block ${blueprintSpot === zone.name ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {blueprintSpot === zone.name ? '● PINPOINT SELECTED' : 'Click to flag'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description and Trigger */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Detailed Issue Report</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Wi-Fi keeps authentication timeout error or shower nozzle has cracked threads spilling water on walls..."
          className="w-full text-xs sm:text-sm border border-slate-200 rounded-2xl p-3.5 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end pt-2">
        <button
          id="btn-submit-maintenance"
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl flex items-center gap-1.5 transition shadow"
        >
          <PlusCircle className="w-4 h-4" />
          Log Maintenance Request
        </button>
      </div>
    </form>
  );
}
