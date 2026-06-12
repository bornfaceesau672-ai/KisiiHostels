import React, { useState, useEffect } from 'react';
import { Hostel, Room, Booking } from '../types';
import { X, Landmark, Receipt, Sparkles, Phone, CreditCard, Mail, UserCheck } from 'lucide-react';
import { formatMonthlyRent } from '../utils/rentHelper';

interface BookRoomModalProps {
  hostel: Hostel;
  room: Room;
  onClose: () => void;
  onSubmitBooking: (bookingData: Omit<Booking, 'id' | 'bookedAt' | 'status'>) => void;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  userReg?: string;
}

export default function BookRoomModal({ hostel, room, onClose, onSubmitBooking, userEmail, userName, userPhone, userReg }: BookRoomModalProps) {
  // Prep autofills
  const [studentName, setStudentName] = useState(userName || 'Bonface Esau');
  const [studentReg, setStudentReg] = useState(userReg || 'K13/5431/25');
  const [studentEmail, setStudentEmail] = useState(userEmail || 'esaubornface73@gmail.com');
  const [studentPhone, setStudentPhone] = useState(userPhone || '0712345678');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [semester, setSemester] = useState('Sep-Dec 2026');

  // Sync state if userInfo updates
  useEffect(() => {
    if (userEmail) setStudentEmail(userEmail);
    if (userName) setStudentName(userName);
    if (userPhone) setStudentPhone(userPhone);
    if (userReg) setStudentReg(userReg);
  }, [userEmail, userName, userPhone, userReg]);

  // Pricing constants
  const cautionDeposit = 3000; // Refundable caution fee standard in Kisii
  const totalAmount = room.priceKes + cautionDeposit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentReg.trim() || !studentEmail.trim() || !studentPhone.trim()) {
      alert('Comrade, please fill in all fields to register your booking.');
      return;
    }
    if (studentPhone.length !== 10) {
      alert('Comrade, phone number must be exactly 10 digits (e.g. 0712345678).');
      return;
    }

    onSubmitBooking({
      hostelId: hostel.id,
      hostelName: hostel.name,
      roomId: room.id,
      roomNumber: room.roomNumber,
      studentName,
      studentReg,
      studentEmail,
      studentPhone,
      gender,
      semester,
    });
  };

  return (
    <div id="book-room-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div 
        id="book-room-modal" 
        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div className="bg-indigo-600 text-white p-6 relative">
          <button 
            id="close-booking-modal"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="text-xs uppercase tracking-wider font-mono bg-white/20 text-indigo-100 px-2.5 py-1 rounded-full font-medium">
            Booking Registration
          </span>
          <h3 className="text-xl font-bold font-sans mt-2">{hostel.name}</h3>
          <p className="text-indigo-100 text-xs mt-1">
            Spot reservation for Room {room.roomNumber} ({room.roomFormat} — {room.roomType} Study)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Rent Breakdown Card */}
          <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-100/50 space-y-2.5">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-500 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-indigo-500" />
              Rent & Deposit Calculations (KES)
            </h4>
            
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Semester Rent (KES):</span>
                <span className="font-mono font-semibold text-slate-900">KES {room.priceKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 -mt-1 b-0.5">
                <span>Monthly Rent Equivalent:</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {formatMonthlyRent(room.rentMonthlyKes || Math.round(room.priceKes / 4))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Caution Deposit (Refundable):
                  <span className="group relative cursor-pointer text-slate-400 font-mono text-[10px] bg-slate-100 px-1 rounded-full">?</span>
                </span>
                <span className="font-mono font-semibold text-slate-900">KES {cautionDeposit.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline mt-1.5">
                <span className="font-bold text-slate-900 text-sm">Total Initial Invoice:</span>
                <span className="font-mono font-extrabold text-indigo-600 text-base">KES {totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal pt-1 flex items-start gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Payments in Kisii hostels are settled via Lipa Na M-PESA. Paybill details will be available on confirmation.</span>
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Student Profile Credentials</h4>
            
            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Full Name
                </label>
                <input 
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Bonface Esau"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Student Reg Number
                </label>
                <input 
                  type="text"
                  required
                  value={studentReg}
                  onChange={(e) => setStudentReg(e.target.value)}
                  placeholder="e.g. K13/5431/25"
                  className="w-full text-sm uppercase border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email Address
                </label>
                <input 
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="esaubornface73@gmail.com"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Mobile Number
                </label>
                <input 
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    if (cleaned.length <= 10) {
                      setStudentPhone(cleaned);
                    }
                  }}
                  placeholder="e.g. 0712345678"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`text-xs py-2 px-3 border rounded-xl transition-all ${
                      gender === 'Male'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Male Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`text-xs py-2 px-3 border rounded-xl transition-all ${
                      gender === 'Female'
                        ? 'bg-rose-50 border-rose-600 text-rose-700 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Female Student
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Semester</label>
                <select 
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Sep-Dec 2026">Semester I (Sep-Dec 2026)</option>
                  <option value="Jan-Apr 2027">Semester II (Jan-Apr 2027)</option>
                  <option value="May-Aug 2027">Trimester III (May-Aug 2027)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guidelines warning */}
          <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-dotted border-slate-250 leading-relaxed font-sans">
            By reserving this spot, you declare that all credentials are correct. After booking is registered, a temporary lease contract holding for 48 hours is dispatched to your email for security deposit processing.
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              id="confirm-booking-submit"
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1"
            >
              <Landmark className="w-3.5 h-3.5" />
              Complete Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
