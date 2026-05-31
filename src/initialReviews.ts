import { HostelReview } from './types';

export const INITIAL_REVIEWS: HostelReview[] = [
  {
    id: 'rev-1',
    hostelId: 'hostel-kerubo-apartments',
    studentName: 'Mercy Atemba',
    rating: 5,
    roomType: 'Single Room',
    stayPeriod: 'Jan - Apr 2026',
    comment: 'Kerubo student rooms are extremely clean and quiet. The security guard at the gate is very strict, which is great for female students. The study desk is spacious and internet speed is stellar!',
    createdAt: '2026-04-15T10:30:00Z',
    likes: 24
  },
  {
    id: 'rev-2',
    hostelId: 'hostel-kerubo-apartments',
    studentName: 'Kelvin Kiprop',
    rating: 4,
    roomType: 'Double Room',
    stayPeriod: 'Sep - Dec 2025',
    comment: 'Very near the Kisii University main gate. Water supply from the borehole is continuous even during dry seasons. Highly recommended, though the curfew closing hour of 11:00 PM is strictly observed.',
    createdAt: '2025-12-10T14:45:00Z',
    likes: 18
  },
  {
    id: 'rev-3',
    hostelId: 'hostel-nyanchwa',
    studentName: 'Faith Nyaboke',
    rating: 5,
    roomType: 'Single Room',
    stayPeriod: 'Jan - Apr 2026',
    comment: 'The best hostel in Nyanchwa estate! Silent study environment, instant hot shower works perfectly, and the deposit refund process was seamless when I cleared. 10/10.',
    createdAt: '2026-04-20T08:15:00Z',
    likes: 31
  },
  {
    id: 'rev-4',
    hostelId: 'hostel-mwembe',
    studentName: 'David Omwamba',
    rating: 4,
    roomType: 'Double Room',
    stayPeriod: 'Jan - Apr 2026',
    comment: 'Convenient location in Mwembe, spacious study desks, and great roommate matching. The shared kitchen area is always clean. Good price-value ratio.',
    createdAt: '2026-04-18T16:20:00Z',
    likes: 12
  },
  {
    id: 'rev-5',
    hostelId: 'hostel-milimani',
    studentName: 'Jane Wanjiku',
    rating: 5,
    roomType: 'Single Room',
    stayPeriod: 'Sep - Dec 2025',
    comment: 'Premium rooms with an amazing view of Milimani forest. Wi-Fi here is high-speed and unlimited. The caretaker Fundi Joseph is very helpful and fixes repairs within hours!',
    createdAt: '2025-11-28T11:05:00Z',
    likes: 15
  },
  {
    id: 'rev-6',
    hostelId: 'hostel-jogoo',
    studentName: 'Brian Onyango',
    rating: 3,
    roomType: '4-Sharing',
    stayPeriod: 'Jan - Apr 2026',
    comment: 'Very affordable and spacious rooms in Jogoo, though the walk to campus is about 15 minutes. High security rating and very social environment for freshers.',
    createdAt: '2026-03-05T09:40:00Z',
    likes: 7
  }
];
