export interface Room {
  id: string;
  roomNumber: string;
  roomType: 'Single' | 'Double' | '4-Sharing';
  roomFormat: 'Bedsitter' | 'Single Room' | 'One Bedroom' | 'Two Bedroom';
  floor: number;
  currentOccupants: number;
  maxOccupants: number;
  genderPreference: 'Male' | 'Female' | 'Mixed';
  priceKes: number; // Price in KES per semester
  rentMonthlyKes?: string | number; // Optional price in KES per month
  isAvailable: boolean;
  amenities: string[];
}

export interface Hostel {
  id: string;
  name: string;
  area: 'Nyanchwa' | 'Mwembe' | 'Milimani' | 'Jogoo' | 'Safariland' | 'Nyaura' | 'On-Campus' | 'Canaan' | 'Kisumu ndogo' | 'Fanta';
  distanceMeters: number; // Distance from Kisii University campus gate
  description: string;
  securityRating: number; // 1-5 stars
  hasBorehole: boolean; // Vital in Kisii water context!
  hasWifi: boolean;
  hasHotShower: boolean;
  imageKeyword: string; // Used to fetch an aesthetic UI color/image concept
  imageUrl?: string; // Optional URL or local path to a real image illustration
  imageUrls?: string[]; // Optional multiple uploaded image URLs
  landlordPhone?: string; // Optional landlord contact phone number
  rules?: string[]; // Standard house rules
  depositRefundable?: 'Refundable' | 'Non-refundable' | '50% Refundable' | string; // Deposit refund policy
  gateClosingTime?: string; // Gate curfew / closing time
  rentMonthlyKes?: string | number; // Optional starting monthly rent for the entire hostel
  rentSemesterKes?: string | number; // Optional starting semester rent for the entire hostel
  rooms: Room[];
  externalLink?: string;
}

export interface Booking {
  id: string;
  hostelId: string;
  hostelName: string;
  roomId: string;
  roomNumber: string;
  studentName: string;
  studentReg: string; // e.g. K13/1234/25
  studentEmail: string;
  studentPhone: string;
  gender: 'Male' | 'Female';
  semester: string; // e.g., "Jan-Apr 2026", "May-Aug 2026", "Sep-Dec 2026"
  status: 'Pending Approval' | 'Deposit Paid' | 'Fully Confirmed' | 'Checked Out' | 'Virtual Tour Scheduled' | 'Virtual Tour Completed';
  bookedAt: string;
  isVirtualTour?: boolean;
  tourTime?: string;
  tourPlatform?: string;
  tourLink?: string;
}

export interface MaintenanceRequest {
  id: string;
  bookingId?: string; // Links to student's live booking if exists
  hostelId: string;
  hostelName: string;
  roomNumber: string;
  studentName: string;
  userEmail?: string; // Links to the logged-in user who created this request
  contactNumber: string;
  category: 'Plumbing' | 'Electrical' | 'Carpentry' | 'Wi-Fi/Network' | 'Water Supply' | 'Pest Control' | 'Other';
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
  allocatedAgent?: string; // e.g. "Fundi Joseph", "Electrician Mike"
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface HostelReview {
  id: string;
  hostelId: string;
  studentName: string;
  rating: number; // 1 to 5 stars
  roomType: string; // e.g., "Single Room", "Double Room"
  stayPeriod: string; // e.g., "Jan - April 2026", "Academic Year 2025/2026"
  comment: string;
  createdAt: string;
  likes: number;
}

export interface RelocationRequest {
  id: string;
  userEmail: string;
  studentName: string;
  contactNumber: string;
  pickupHostel: string;
  destinationHostel: string;
  relocationDate: string;
  relocationTime: string;
  transportType: 'Pickup Truck' | 'Mkokoteni (Handcart)' | 'Boda-Boda Mover' | 'Closed Box Van';
  loadSize: 'Light (Suitcases/Bags)' | 'Medium (Bed + Bags)' | 'Heavy (Full Room Set)';
  status: 'Pending Dispatch' | 'Scheduled' | 'In Transit' | 'Completed';
  notes?: string;
  allocatedMover?: string;
  createdAt: string;
}

export interface NewsReply {
  id: string;
  authorName: string;
  authorInitials: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface NewsPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  likes: number;
  type?: 'Alert' | 'Info' | 'Important' | 'General';
  typeColor?: string;
  hasLiked?: boolean;
  replies?: NewsReply[];
  isPinned?: boolean;
  timestamp?: number;
}


