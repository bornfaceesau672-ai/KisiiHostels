import { Hostel, Booking, MaintenanceRequest } from './types';

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel-nyanchwa',
    name: 'Nyanchwa Highres Apex',
    area: 'Nyanchwa',
    distanceMeters: 450,
    description: 'Set atop the scenic Nyanchwa Hills, offering breezy executive rooms, secure perimeter wall with electric fencing, and highly reliable backup power generators. Excellent quiet environment conducive for academic study.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'hilltop',
    rooms: [
      { id: 'ny-101', roomNumber: '101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Male', priceKes: 18000, isAvailable: true, amenities: ['Study Desk', 'Built-in Closet', 'Balcony'] },
      { id: 'ny-102', roomNumber: '102', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 1, genderPreference: 'Male', priceKes: 18000, isAvailable: false, amenities: ['Study Desk', 'Built-in Closet'] },
      { id: 'ny-201', roomNumber: '201', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 11500, isAvailable: true, amenities: ['Study Desk', 'Balcony', 'Mirror'] },
      { id: 'ny-202', roomNumber: '202', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 11500, isAvailable: false, amenities: ['Study Desk', 'Soft Pillows'] },
      { id: 'ny-301', roomNumber: '301', roomType: 'Single', roomFormat: 'One Bedroom', floor: 3, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 19000, isAvailable: true, amenities: ['Premium Finish', 'Study Desk', 'Balcony with Horizon View'] },
      { id: 'ny-302', roomNumber: '302', roomType: 'Double', roomFormat: 'Two Bedroom', floor: 3, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Male', priceKes: 12000, isAvailable: true, amenities: ['Balcony', 'Fitted Curtains'] }
    ]
  },
  {
    id: 'hostel-mwembe',
    name: 'Mwembe Serene Oasis',
    area: 'Mwembe',
    distanceMeters: 150,
    description: 'A student favorite located just a short 2-minute walk from the Kisii University main gate. Boasts an active community, green courtyard garden, shared student recreational hall, and highly responsive in-house technicians.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'courtyard',
    rooms: [
      { id: 'mw-101', roomNumber: '101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Male', priceKes: 9500, isAvailable: false, amenities: ['Shoe Rack', 'High-speed Wi-Fi Access'] },
      { id: 'mw-102', roomNumber: '102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 9500, isAvailable: true, amenities: ['Shoe Rack', 'Window View'] },
      { id: 'mw-201', roomNumber: '201', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Mixed', priceKes: 7000, isAvailable: true, amenities: ['Personal Lockers', 'Study Table', 'Bunk Beds'] },
      { id: 'mw-202', roomNumber: '202', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 2, currentOccupants: 4, maxOccupants: 4, genderPreference: 'Female', priceKes: 7200, isAvailable: false, amenities: ['Personal Lockers', 'Comfort Mattresses'] },
      { id: 'mw-301', roomNumber: '301', roomType: 'Double', roomFormat: 'Single Room', floor: 3, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Female', priceKes: 9800, isAvailable: true, amenities: ['Scenic Window', 'Wi-Fi Extender'] }
    ]
  },
  {
    id: 'hostel-milimani',
    name: 'Milimani Vista Suites',
    area: 'Milimani',
    distanceMeters: 800,
    description: 'Nestled in the upscale, tranquil Milimani estate. Premium suites featuring modern tiled finishes, spacious study corners, fitted sockets, and a peaceful ambiance that caters to mature or post-graduate students.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'luxury',
    rooms: [
      { id: 'ml-101', roomNumber: 'A1', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 22000, isAvailable: false, amenities: ['In-room Sink', 'Executive Chair', 'Instant Hot Water'] },
      { id: 'ml-102', roomNumber: 'A2', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 22000, isAvailable: true, amenities: ['Executive Chair', 'Smart Socket', 'Private Kitchenette'] },
      { id: 'ml-201', roomNumber: 'B1', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 14000, isAvailable: true, amenities: ['Kitchen Sink', 'Built-in Closet Desk'] },
      { id: 'ml-202', roomNumber: 'B2', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Male', priceKes: 14000, isAvailable: false, amenities: ['Built-in Bookcase', 'Balcony'] }
    ]
  },
  {
    id: 'hostel-jogoo',
    name: 'Jogoo Scholar Court',
    area: 'Jogoo',
    distanceMeters: 600,
    description: 'A vibrant complex famous for its student-friendly pricing, lively common areas, and cooperative student dining groups. Highly economical and well-guarded by experienced wardens.',
    securityRating: 3,
    hasBorehole: false,
    hasWifi: true,
    hasHotShower: false,
    imageKeyword: 'campus',
    rooms: [
      { id: 'jg-101', roomNumber: 'F1', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Female', priceKes: 8000, isAvailable: true, amenities: ['Drying Lines Access', 'Fitted Curtains'] },
      { id: 'jg-102', roomNumber: 'F2', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 3, maxOccupants: 4, genderPreference: 'Male', priceKes: 6000, isAvailable: true, amenities: ['Lockable Cabinets', 'Study Bench'] },
      { id: 'jg-201', roomNumber: 'S1', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Male', priceKes: 8000, isAvailable: false, amenities: ['Full Rugs Area'] },
      { id: 'jg-202', roomNumber: 'S2', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 2, currentOccupants: 1, maxOccupants: 4, genderPreference: 'Female', priceKes: 6200, isAvailable: true, amenities: ['Large Wardrobe', 'Shared Balcony'] }
    ]
  },
  {
    id: 'hostel-safariland',
    name: 'Safariland Heights',
    area: 'Safariland',
    distanceMeters: 350,
    description: 'Located at Safariland Commercial Area. Features instant street-access to printing facilities, local cafeterias, and cyber cafés. It offers top-quality concrete finishes and an efficient security system.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'plaza',
    rooms: [
      { id: 'sl-101', roomNumber: '101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 10000, isAvailable: true, amenities: ['Fitted Bedframes', 'Mirror', 'Study Desks'] },
      { id: 'sl-102', roomNumber: '102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 10000, isAvailable: true, amenities: ['Fitted Bedframes', 'Balcony Access'] },
      { id: 'sl-201', roomNumber: '201', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Female', priceKes: 7500, isAvailable: true, amenities: ['Separate Study Stools', 'Lockers'] }
    ]
  },
  {
    id: 'hostel-la-serena',
    name: 'La Serena Student Palace',
    area: 'Mwembe',
    distanceMeters: 130,
    description: 'One of the most modern facilities in Mwembe, just steps from the Campus Main Gate. Renowned for its secure bio-metric gates, unlimited hot shower supply, and 24/7 high-speed fiber internet.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'palace',
    rooms: [
      { id: 'ls-101', roomNumber: '101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 20000, isAvailable: true, amenities: ['Biometric Access Key', 'In-room Basin', 'Writing Desk'] },
      { id: 'ls-102', roomNumber: '102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 12500, isAvailable: true, amenities: ['Reading Lamps', 'Spacious Wardrobes'] },
      { id: 'ls-201', roomNumber: '201', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Male', priceKes: 12500, isAvailable: true, amenities: ['Balcony Overlook', 'Shoe Rack'] }
    ]
  },
  {
    id: 'hostel-elgon-view-ridge',
    name: 'Elgon View Ridge Residency',
    area: 'Nyanchwa',
    distanceMeters: 550,
    description: 'Positioned close to the high-end Elgon View block. Features stylish, spacious bedsitters, tiled laundry yards, and panoramic views of Kisii town. Perfect for students seeking high quality at student-friendly costs.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'ridge',
    rooms: [
      { id: 'ev-11', roomNumber: '11', roomType: 'Single', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 1, maxOccupants: 1, genderPreference: 'Male', priceKes: 16500, isAvailable: false, amenities: ['Custom Headboard', 'Wired Ethernet Hookup'] },
      { id: 'ev-12', roomNumber: '12', roomType: 'Double', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Male', priceKes: 10500, isAvailable: true, amenities: ['Study Table for Two', 'Mirror Box'] },
      { id: 'ev-21', roomNumber: '21', roomType: 'Double', roomFormat: 'Bedsitter', floor: 2, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 11000, isAvailable: true, amenities: ['Tiled Balcony', 'Soft Carpet Area'] }
    ]
  },
  {
    id: 'hostel-milimani-elite',
    name: 'Milimani Elite Student Towers',
    area: 'Milimani',
    distanceMeters: 750,
    description: 'An premium multi-storey luxury complex situated deep within the highly secure Milimani area. Employs armed night-watch guards, complete intercom systems, private kitchenettes, and modern fittings.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'towers',
    rooms: [
      { id: 'me-101', roomNumber: 'E-101', roomType: 'Single', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 24000, isAvailable: true, amenities: ['Kitchenette', 'Prepaid Electricity Meter', 'Modern Sink'] },
      { id: 'me-102', roomNumber: 'E-102', roomType: 'Single', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Male', priceKes: 24000, isAvailable: true, amenities: ['Kitchenette', 'Memory Foam Bed', 'Prepaid Meter'] },
      { id: 'me-201', roomNumber: 'E-201', roomType: 'Double', roomFormat: 'Bedsitter', floor: 2, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 15500, isAvailable: true, amenities: ['Spacious Lounge Area', 'Large Study Corner'] }
    ]
  },
  {
    id: 'hostel-victory-jogoo',
    name: 'Victory Student Village',
    area: 'Jogoo',
    distanceMeters: 650,
    description: 'Renowned as one of the most budget-friendly and supportive student environments near Kisii University. Features shared cooking spaces, outdoor laundry yards, and an lively student-led recreational hall.',
    securityRating: 3,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'village',
    rooms: [
      { id: 'vj-101', roomNumber: 'V-101', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 3, maxOccupants: 4, genderPreference: 'Male', priceKes: 5800, isAvailable: true, amenities: ['Ironing Station Access', 'Lockable Box Under Bed'] },
      { id: 'vj-102', roomNumber: 'V-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Female', priceKes: 5800, isAvailable: true, amenities: ['Spacious Cabinets', 'Study Desk for Four'] },
      { id: 'vj-201', roomNumber: 'V-201', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 7800, isAvailable: true, amenities: ['Shared Lounge Chair', 'Tiled Floor'] }
    ]
  },
  {
    id: 'hostel-umoja-court',
    name: 'Umoja Comrade Haven',
    area: 'Mwembe',
    distanceMeters: 220,
    description: 'Centrally positioned within the action of Mwembe, just off the main road. Popular for its affordable rent, friendly management, solar security lighting backup, and very strong community spirit.',
    securityRating: 4,
    hasBorehole: false,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'haven',
    rooms: [
      { id: 'uc-101', roomNumber: 'B-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Male', priceKes: 8800, isAvailable: false, amenities: ['Wi-Fi Extended Range', 'Shoe Cabinet'] },
      { id: 'uc-102', roomNumber: 'B-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 4, genderPreference: 'Male', priceKes: 6500, isAvailable: true, amenities: ['Individual Study Desks', 'Steel Lockers'] },
      { id: 'uc-201', roomNumber: 'B-201', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Female', priceKes: 9000, isAvailable: true, amenities: ['Clean Curtain Fittings', 'Balcony View'] }
    ]
  },
  {
    id: 'hostel-eland-castle',
    name: 'Eland Castle Residency',
    area: 'Safariland',
    distanceMeters: 380,
    description: 'A stately structure featuring thick soundproof concrete walls, great study areas, and highly reliable water supplies from a deep private borehole. Located near printing shops and quick-dining cyber hubs.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'castle',
    rooms: [
      { id: 'ec-101', roomNumber: 'C-01', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Male', priceKes: 17500, isAvailable: true, amenities: ['Luxury Finish', 'Full Storage Rack', 'Private Balcony'] },
      { id: 'ec-102', roomNumber: 'C-02', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 11000, isAvailable: true, amenities: ['Dual Study Sockets', 'Mirror Box'] }
    ]
  },
  {
    id: 'hostel-alpha-executive',
    name: 'Alpha Executive Suites',
    area: 'Jogoo',
    distanceMeters: 580,
    description: 'Presents an upscale executive living option within Jogoo. Features lovely wood-styled tiles, spacious in-built wardrobes, state-of-the-art surveillance cameras, and high-speed fiber Wi-Fi routers.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'executive',
    rooms: [
      { id: 'ax-101', roomNumber: 'X-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 18500, isAvailable: true, amenities: ['Premium Mirror Set', 'Study Office Chair', 'Keycard Lock'] },
      { id: 'ax-102', roomNumber: 'X-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 11800, isAvailable: false, amenities: ['Smart Charging USB Hubs', 'Comfy Bedding'] }
    ]
  },
  {
    id: 'hostel-manoti',
    name: 'Manoti Heights Hostel',
    area: 'Mwembe',
    distanceMeters: 180,
    description: 'Highly sought-after, popular premium hostel in Mwembe close to the main gate. Features secure gated entrance, high water storage capacity, reliable Wi-Fi, and spacious rooms with modern finishes.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'balcony',
    rooms: [
      { id: 'mn-101', roomNumber: '101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Male', priceKes: 16000, isAvailable: true, amenities: ['Custom Study Desk', 'Fitted Closet'] },
      { id: 'mn-102', roomNumber: '102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 10000, isAvailable: true, amenities: ['Book Shelf', 'Balcony Access'] }
    ]
  },
  {
    id: 'hostel-vichmas',
    name: 'Vichmas Elite Palace',
    area: 'Mwembe',
    distanceMeters: 250,
    description: 'Vichmas is a high-quality student residence in Mwembe. Famous for its ultra-clean tiled rooms, automatic power backup, instant hot shower units, and rigorous perimeter security backed by CCTV.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'modern',
    rooms: [
      { id: 'vc-101', roomNumber: 'V-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 1, genderPreference: 'Female', priceKes: 18000, isAvailable: false, amenities: ['Biometric Safe Locker', 'Preinstalled Wardrobe'] },
      { id: 'vc-102', roomNumber: 'V-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Female', priceKes: 12000, isAvailable: true, amenities: ['Reading Table Set', 'Wide Mirrors'] }
    ]
  },
  {
    id: 'hostel-saveways',
    name: 'Saveways student Residence',
    area: 'Jogoo',
    distanceMeters: 610,
    description: 'Located in the popular student area of Jogoo. Saveways is renowned for stellar safety, highly reliable borehole water supply, strong Wi-Fi hotspots, and large study halls.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'campus',
    rooms: [
      { id: 'sv-101', roomNumber: 'S-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 9000, isAvailable: true, amenities: ['Integrated Study Boards', 'Storage Cabinets'] },
      { id: 'sv-102', roomNumber: 'S-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Male', priceKes: 6800, isAvailable: true, amenities: ['Personal Bunk Beds', 'Under-bed Lockers'] }
    ]
  },
  {
    id: 'hostel-westgate',
    name: 'Westgate Comrade Villa',
    area: 'Nyanchwa',
    distanceMeters: 490,
    description: 'Convenient student outpost on the western side of the campus boundary. Delivers clean tiled floors, secure card-entry, reliable hot water, and large airy windows that face the hills.',
    securityRating: 4,
    hasBorehole: false,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'sunny',
    rooms: [
      { id: 'wg-101', roomNumber: 'W-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 14000, isAvailable: true, amenities: ['Tiled Kitchenette', 'Large Closet'] },
      { id: 'wg-102', roomNumber: 'W-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 9500, isAvailable: false, amenities: ['USB Reading Outlets', 'Comfort Foam Bed'] }
    ]
  },
  {
    id: 'hostel-inka',
    name: 'Inka Student Plaza',
    area: 'Mwembe',
    distanceMeters: 300,
    description: 'Inka Student Plaza offers a high standard of premium and quiet college living. Best for its quiet courtyard, dedicated reading library, fiber internet, and professional security patrols.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'library',
    rooms: [
      { id: 'ik-101', roomNumber: 'I-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 19500, isAvailable: true, amenities: ['Private Study Chair', 'Intercom System', 'Accent Light'] },
      { id: 'ik-102', roomNumber: 'I-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 13000, isAvailable: true, amenities: ['Study Office Table', 'Soft Window Seats'] }
    ]
  },
  {
    id: 'hostel-upperhill',
    name: 'Upperhill Breeze Suites',
    area: 'Nyanchwa',
    distanceMeters: 520,
    description: 'Perched in the high-reaching quiet Upper Nyanchwa region. Combines beautiful spacious student apartments with heavy-duty biometric access, superb cellular reception, and custom study tables.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'breeze',
    rooms: [
      { id: 'uh-101', roomNumber: 'U-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 17000, isAvailable: true, amenities: ['Bespoke Shelves', 'Hot Bath Unit', 'Prepaid Electricity Meter'] },
      { id: 'uh-102', roomNumber: 'U-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 11000, isAvailable: true, amenities: ['Study Desk Set', 'Premium Balcony View'] }
    ]
  },
  {
    id: 'hostel-stayokay',
    name: 'Stayokay Student Haven',
    area: 'Safariland',
    distanceMeters: 410,
    description: 'Stayokay delivers a highly secure and incredibly clean hostel experience. Features 24-hour security guards, high internet bandwidth, and modern instant electric showers in every single room unit.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'cozy',
    rooms: [
      { id: 'so-101', roomNumber: 'S-22', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 11500, isAvailable: true, amenities: ['Smart Powerstrip', 'Comfort Double Mattress'] },
      { id: 'so-102', roomNumber: 'S-23', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Female', priceKes: 7800, isAvailable: true, amenities: ['Security Lockers', 'Drying Rack'] }
    ]
  },
  {
    id: 'hostel-kivu',
    name: 'Kivu Palace Residency',
    area: 'Milimani',
    distanceMeters: 780,
    description: 'Exceptional executive living near the beautiful Milimani forest belt. Delivers unmatched tranquility, wide desks for intense review sessions, secure locked perimeter, and a premium student canteen.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'palace',
    rooms: [
      { id: 'kv-101', roomNumber: 'K-01', roomType: 'Single', roomFormat: 'One Bedroom', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 21000, isAvailable: true, amenities: ['Kitchenette Suite', 'Executive Chair', 'Spacious Sink Block'] },
      { id: 'kv-102', roomNumber: 'K-02', roomType: 'Double', roomFormat: 'One Bedroom', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 14500, isAvailable: false, amenities: ['Two Wardrobe Closets', 'Study Bench'] }
    ]
  },
  {
    id: 'hostel-latemi',
    name: 'Latemi Student Suites',
    area: 'Jogoo',
    distanceMeters: 590,
    description: 'Cozy and super-friendly community set in Jogoo area. Known for standard affordable rates, high capacity backup tanks, and prompt support responses from the friendly caretakers.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'towers',
    rooms: [
      { id: 'lt-101', roomNumber: 'L-11', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 8900, isAvailable: true, amenities: ['Study Desk Set', 'Curtain Rails'] },
      { id: 'lt-102', roomNumber: 'L-12', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 4, genderPreference: 'Male', priceKes: 6400, isAvailable: true, amenities: ['Security Locker', 'Hanging Racks'] }
    ]
  },
  {
    id: 'hostel-blessed-assurance',
    name: 'Blessed Assurance Residence',
    area: 'Nyaura',
    distanceMeters: 480,
    description: 'A famous, lively student complex in Nyaura near Christamarianne. High-speed Wi-Fi network coverage, clean borehole water supply, spacious well-lit rooms, and round-the-clock professional security guard patrolling.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'haven',
    rooms: [
      { id: 'ba-101', roomNumber: 'B-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 16500, isAvailable: true, amenities: ['Full Study Cabinet', 'Heavy-duty Metal Safe', 'Mirror'] },
      { id: 'ba-102', roomNumber: 'B-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 10500, isAvailable: true, amenities: ['Separate Bedside Tables', 'Cozy Balcony View'] }
    ]
  },
  {
    id: 'hostel-nyaura-springs',
    name: 'Nyaura Springs Hostel',
    area: 'Nyaura',
    distanceMeters: 350,
    description: 'Centrally situated in Nyaura, highly favored for its extremely affordable pocket-friendly rent, dedicated quiet student study room on each floor, instant water heater units, and clean tiled floors.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'courtyard',
    rooms: [
      { id: 'ns-101', roomNumber: 'N-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 8500, isAvailable: true, amenities: ['Extended Wi-Fi Antennas', 'Under-bed Storage Drawer'] },
      { id: 'ns-102', roomNumber: 'N-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Male', priceKes: 6000, isAvailable: true, amenities: ['Metal Bunk Bed Set', 'Comfy Reading Stools'] }
    ]
  },
  {
    id: 'hostel-canaan-heights',
    name: 'Canaan Heights Hostel',
    area: 'Canaan',
    distanceMeters: 550,
    description: 'An executive multi-storey hostel choice in the peaceful Canaan estate offering scenic balcony views of the Kisii landscape. Built with modern smart keycard access, bespoke study desks, and reliable utility backup.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'balcony',
    rooms: [
      { id: 'ch-101', roomNumber: 'C-201', roomType: 'Single', roomFormat: 'Bedsitter', floor: 2, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 19000, isAvailable: true, amenities: ['Smart Keycard Lock', 'Integrated Kitchenette Unit', 'Study Desk Set'] },
      { id: 'ch-102', roomNumber: 'C-202', roomType: 'Double', roomFormat: 'Bedsitter', floor: 2, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 12500, isAvailable: false, amenities: ['Scenic Balcony', 'Reading Spotlights', 'Fitted Curtains'] }
    ]
  },
  {
    id: 'hostel-canaan-gardens',
    name: 'Canaan Gardens Apartments',
    area: 'Canaan',
    distanceMeters: 620,
    description: 'Scenic student residencies located in Canaan estate featuring beautifully manicured lawn space, high security guard presence, instant hot shower units in every room, and steady borehole water system.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'modern',
    rooms: [
      { id: 'cg-101', roomNumber: 'G-101', roomType: 'Single', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 16000, rentMonthlyKes: 4000, isAvailable: true, amenities: ['Built-in wardrobes', 'Spacious Study Desk', 'Private Kitchenette'] },
      { id: 'cg-102', roomNumber: 'G-102', roomType: 'Double', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 10500, rentMonthlyKes: 2700, isAvailable: true, amenities: ['Shared Study Table', 'Shoe Racks'] }
    ]
  },
  {
    id: 'hostel-orange-house',
    name: 'Orange House Residence',
    area: 'Mwembe',
    distanceMeters: 280,
    description: 'A very famous, landmark student hostel in Mwembe offering colorful orange aesthetics. Offers extremely spacious and clean rooms, a secured gated wall with continuous daytime/nighttime guardians, ultra-reliable borehole water tank connection, and high-speed Wi-Fi internet routers.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'sunny',
    rooms: [
      { id: 'oh-101', roomNumber: 'O-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 15500, isAvailable: true, amenities: ['Bespoke Orange Accent Wall', 'Large Wardrobes', 'Comfy Study Table Set'] },
      { id: 'oh-102', roomNumber: 'O-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 10000, isAvailable: true, amenities: ['Study Desk Set', 'Ample Window Lighting'] },
      { id: 'oh-201', roomNumber: 'O-201', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Male', priceKes: 6800, isAvailable: true, amenities: ['Steel Double Bunks', 'Personal Lockers'] }
    ]
  },

  {
    id: 'hostel-venus-mars',
    name: "Venus and Mars Halls (On-Campus)",
    area: 'On-Campus',
    distanceMeters: 0,
    description: "Centrally located on-campus student residences reserved exclusively for female comrades. Comprises adjacent blocks Venus and Mars. Features high-security boundary fences, reliable lighting, serene common learning lounges, instant-access student mess halls, and active security patrol teams.",
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'campus',
    imageUrl: '/src/assets/images/kisii_oncampus_hostel_1779545601491.png',
    imageUrls: ['/src/assets/images/kisii_oncampus_hostel_1779545601491.png'],
    rooms: [
      { id: 'vm-101', roomNumber: 'Venus Block V-01', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 4, genderPreference: 'Female', priceKes: 3500, isAvailable: true, amenities: ['Comfortable Study Desks', 'University Standard Bunk Beds', 'Private Lockers'] },
      { id: 'vm-102', roomNumber: 'Mars Block M-03', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 5200, isAvailable: true, amenities: ['Private Study Table Set', 'Fitted Closets', 'Serene Landscape View'] }
    ]
  },
  {
    id: 'hostel-cz-blackhouse',
    name: "CZ and Black House (On-Campus)",
    area: 'On-Campus',
    distanceMeters: 0,
    description: "Renowned, historic on-campus student hostel blocks reserved exclusively for male comrades. Made up of the active academic blocks CZ and Black House. Well-equipped with security card turnstile access, spacious study halls, stable campus Wi-Fi connections, and close proximity to major lecture classrooms.",
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'campus',
    imageUrl: '/src/assets/images/kisii_oncampus_hostel_1779545601491.png',
    imageUrls: ['/src/assets/images/kisii_oncampus_hostel_1779545601491.png'],
    rooms: [
      { id: 'czb-101', roomNumber: 'CZ Block C-12', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Male', priceKes: 3500, isAvailable: true, amenities: ['Standard Bunk Beds', 'Under-bed Secure Lockers', 'Comrade Study Bench'] },
      { id: 'czb-102', roomNumber: 'Black House D-05', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Male', priceKes: 5000, isAvailable: true, amenities: ['Fitted Study Desk', 'Spacious Personal Wardrobe'] }
    ]
  },
  {
    id: 'hostel-kerubo-apartments',
    name: 'Kerubo Student Apartments',
    area: 'Nyaura',
    distanceMeters: 420,
    description: 'A brand-new, premium student apartment complex in Nyaura offering elegant modern finishes. Renowned for its secure high boundary wall topped with active razor wire, CCTV surveillance, unlimited clean borehole water supply, high-speed fiber Wi-Fi, and generous study balconies.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'luxury',
    imageUrl: '/src/assets/images/kerubo_hostel_1779717867692.png',
    imageUrls: ['/src/assets/images/kerubo_hostel_1779717867692.png'],
    landlordPhone: '0710748699',
    rentMonthlyKes: 4500,
    rooms: [
      { id: 'ka-101', roomNumber: '101', roomType: 'Single', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 15500, rentMonthlyKes: 4500, isAvailable: true, amenities: ['Study Desk Set', 'Spacious Closet', 'In-room Sink'] },
      { id: 'ka-102', roomNumber: '102', roomType: 'Double', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 11000, rentMonthlyKes: 2750, isAvailable: true, amenities: ['Reading Overlook Balcony', 'Individual Steel Lockers'] },
      { id: 'ka-201', roomNumber: '201', roomType: 'Double', roomFormat: 'Bedsitter', floor: 2, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Male', priceKes: 11000, rentMonthlyKes: 2750, isAvailable: true, amenities: ['Bespoke Writing Desks', 'Fitted Shoe Racks'] }
    ]
  },
  {
    id: 'hostel-opposite-blessed',
    name: 'Opposite Blessed Apartment',
    area: 'Nyaura',
    distanceMeters: 490,
    description: 'Conveniently situated directly opposite the Blessed Assurance Residence in Nyaura. This friendly, highly secure student hostel features bright tiled rooms, round-the-clock water from a dedicated borehole connection, fast Wi-Fi, separate reading desks, and key-gated secondary security layers.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'cozy',
    rooms: [
      { id: 'oba-101', roomNumber: 'A-01', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 14000, isAvailable: true, amenities: ['Study Desk Set', 'Spacious Bedside Table', 'Fitted Curtains'] },
      { id: 'oba-102', roomNumber: 'A-02', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 9500, isAvailable: true, amenities: ['Individual Storage Lockers', 'Under-bed Storage Drawer'] },
      { id: 'oba-201', roomNumber: 'B-01', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 9800, isAvailable: false, amenities: ['Cozy Windowsill Views', 'Joint Writing Desks'] }
    ]
  },
  {
    id: 'hostel-mosioma',
    name: 'Mosioma Plaza Hostel',
    area: 'Mwembe',
    distanceMeters: 220,
    description: 'A legendary and lively student residence located in Mwembe near the main gate. Features a highly-rated student social lounge, continuous borehole water availability, modern high-speed Wi-Fi, and 24/7 manned gate security.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'plaza',
    rooms: [
      { id: 'mo-101', roomNumber: 'M-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 16000, isAvailable: true, amenities: ['Study Desk Set', 'Spacious Locker', 'Bright LED Spotlights'] },
      { id: 'mo-102', roomNumber: 'M-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 10500, isAvailable: true, amenities: ['Bedside Tables', 'Wall Hanging Racks'] }
    ]
  },
  {
    id: 'hostel-saveway',
    name: 'Saveway Residence',
    area: 'Safariland',
    distanceMeters: 400,
    description: 'A highly secure and modern apartment-style hostel situated in Safariland. Offers spacious rooms with elegant floor tiles, constant water supply from a borehole, high-speed internet routers, and instant hot showers.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'luxury',
    rooms: [
      { id: 'sw-101', roomNumber: 'S-101', roomType: 'Single', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 17000, isAvailable: true, amenities: ['Comfort Study Desk', 'Private Kitchenette', 'Hot Shower Controller'] },
      { id: 'sw-102', roomNumber: 'S-102', roomType: 'Double', roomFormat: 'Bedsitter', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 11000, isAvailable: false, amenities: ['Fitted Curtains', 'Separate Reading Lights'] }
    ]
  },
  {
    id: 'hostel-riverside',
    name: 'Riverside View Hostel',
    area: 'Jogoo',
    distanceMeters: 600,
    description: 'Overlooking a scenic and peaceful stream on the boundary of Jogoo Estate. Offers students a highly serene environment away from noisy distractions, fitted with secure perimeter gates, instant hot showers, and dedicated study desks.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'breeze',
    rooms: [
      { id: 'rs-101', roomNumber: 'R-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 8800, isAvailable: true, amenities: ['River Breeze Balcony', 'Double Wardrobe'] },
      { id: 'rs-102', roomNumber: 'R-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 4, genderPreference: 'Male', priceKes: 6200, isAvailable: true, amenities: ['Steel Bunks', 'Individual Clothing Lockers'] }
    ]
  },
  {
    id: 'hostel-westgate-heights',
    name: 'Westgate Heights Hostel',
    area: 'Nyanchwa',
    distanceMeters: 500,
    description: 'A grand multi-storey residence on the western gate side of Nyanchwa. Popular for its spacious modern balconies, reliable borehole system, fast fiber internet connection, and diligent building caretaker.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'towers',
    rooms: [
      { id: 'wgh-101', roomNumber: 'W-201', roomType: 'Single', roomFormat: 'Single Room', floor: 2, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 17500, isAvailable: true, amenities: ['Fitted Study Desk', 'Private Balcony', 'Integrated Bathroom'] },
      { id: 'wgh-102', roomNumber: 'W-202', roomType: 'Double', roomFormat: 'Single Room', floor: 2, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 11200, isAvailable: true, amenities: ['Reading Spotlights', 'Ample Window Lighting'] }
    ]
  },
  {
    id: 'hostel-somoni',
    name: 'Somoni Executive Hostel',
    area: 'Nyaura',
    distanceMeters: 520,
    description: 'An premium, executive hostel choice situated in Nyaura. Built to high standards with smart security locks, continuous borehole tap water pressure, high-speed Wi-Fi, and a quiet rooftop study yard.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'executive',
    rooms: [
      { id: 'sm-101', roomNumber: 'S-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 18500, isAvailable: true, amenities: ['Executive Desk Set', 'In-room Sink Unit', 'Kitchen Counter'] },
      { id: 'sm-102', roomNumber: 'S-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 12000, isAvailable: false, amenities: ['Scenic Rooftop Access', 'Built-in Bookcase'] }
    ]
  },
  {
    id: 'hostel-upperhill-elite',
    name: 'Upperhill Elite Residences',
    area: 'Milimani',
    distanceMeters: 750,
    description: 'A quiet, exclusive student residence in Milimani Estate, offering high security, high-speed Wi-Fi internet access, stable clean borehole water tanks, and top-tier hot shower pressure.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'hilltop',
    rooms: [
      { id: 'uhe-101', roomNumber: 'U-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 20000, isAvailable: true, amenities: ['Premium Study Desk', 'Wardrobes', 'Balcony Overlook'] },
      { id: 'uhe-102', roomNumber: 'U-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 13500, isAvailable: true, amenities: ['Study Desk Set', 'Ample Closet Space'] }
    ]
  },
  {
    id: 'hostel-lena',
    name: 'Lena Student Hostel',
    area: 'Nyanchwa',
    distanceMeters: 350,
    description: 'A cozy and modern residence in Nyanchwa offering safe, affordable, and peaceful student units. Key highlights include highly secure gated entry, continuous borehole water availability, fast modern Wi-Fi routers, and spacious interior wardobes.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'cozy',
    landlordPhone: '0722100456',
    rooms: [
      { id: 'len-101', roomNumber: 'L-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 15000, isAvailable: true, amenities: ['Study Desk Set', 'Spacious Shelf Unit', 'Private Washroom'] },
      { id: 'len-102', roomNumber: 'L-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 10000, isAvailable: true, amenities: ['Wall-mounted Hangers', 'Individual Sockets'] }
    ]
  },
  {
    id: 'hostel-emmas',
    name: "Emma's Student Residences",
    area: 'Mwembe',
    distanceMeters: 280,
    description: "Centrally positioned in Mwembe near the Kisii University main gate, Emma's Residences deliver luxury yet pocket-friendly rooms. Features round-the-clock water systems, reliable fiber Wi-Fi networks, heavy perimeter gates, and direct access to local student study groups.",
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'luxury',
    landlordPhone: '0733890214',
    rooms: [
      { id: 'emm-101', roomNumber: 'E-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 16500, isAvailable: true, amenities: ['Fitted Study Desk', 'Cozy Reading Light', 'Fitted Curtains'] },
      { id: 'emm-102', roomNumber: 'E-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 10800, isAvailable: true, amenities: ['Under-bed Storage Drawers', 'Steel Lockers'] }
    ]
  },
  {
    id: 'hostel-daily-flats',
    name: 'Dally Student Flats',
    area: 'Jogoo',
    distanceMeters: 450,
    description: 'Providing premium quality flats in the Jogoo suburb for students desiring high security and a tranquil study environment. Boasts continuous borehole water supply, instant hot shower units, high-speed Wi-Fi, and a helpful on-site building caretaker.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'breeze',
    landlordPhone: '0711554433',
    rooms: [
      { id: 'day-101', roomNumber: 'D-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 9200, isAvailable: true, amenities: ['Breeze Balcony Access', 'Ample Shared Closets'] },
      { id: 'day-102', roomNumber: 'D-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Male', priceKes: 6500, isAvailable: true, amenities: ['Metal Bunkbeds', 'Four Individual Wardrobe Units'] }
    ]
  },
  {
    id: 'hostel-queens',
    name: 'Queens Heights Hostel',
    area: 'Milimani',
    distanceMeters: 600,
    description: 'An executive and outstanding student community choice nestled in Milimani. Known for smart gate locks, strict active night security guard patrol, fiber Wi-Fi, a laundry line zone, and constant water supply.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'executive',
    landlordPhone: '0799887766',
    rooms: [
      { id: 'qns-101', roomNumber: 'Q-101', roomType: 'Single', roomFormat: 'One Bedroom', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 19500, isAvailable: true, amenities: ['Executive Vanity Desk', 'Integrated Kitchenette Counter', 'Hot Shower Controller'] },
      { id: 'qns-102', roomNumber: 'Q-102', roomType: 'Double', roomFormat: 'One Bedroom', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 13000, isAvailable: true, amenities: ['Large Balcony with Sunset Vista', 'Integrated Bookcase'] }
    ]
  },
  {
    id: 'hostel-valley-ork',
    name: 'Valley Ork Hostel',
    area: 'Mwembe',
    distanceMeters: 400,
    description: 'A wonderful, highly requested student residential complex situated in a quiet valley close to campus. It boasts supreme night security guards, super reliable high-speed fiber internet, constant clean borehole water supply, and excellent hot shower systems.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'nature',
    landlordPhone: '0715334455',
    rooms: [
      { id: 'vok-101', roomNumber: 'VO-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 16000, isAvailable: true, amenities: ['Premium Study Desk', 'Spacious Closet', 'In-room Sink'] },
      { id: 'vok-102', roomNumber: 'VO-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 11000, isAvailable: true, amenities: ['Private Study Space', 'Balcony Access'] }
    ]
  },
  {
    id: 'hostel-roma',
    name: 'Roma Executive Hostel',
    area: 'Mwembe',
    distanceMeters: 200,
    description: 'A premium and modern hostel complex located within the popular Mwembe estate. Offers top-level security, ample study environments, reliable water and outstanding high speed internet.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'modern',
    landlordPhone: '0712883311',
    rooms: [
      { id: 'rm-101', roomNumber: 'RM-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 17500, isAvailable: true, amenities: ['Modern Tiled Study Desk', 'Spacious Inbuilt Wardrobe', 'Private Sink'] },
      { id: 'rm-102', roomNumber: 'RM-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 11500, isAvailable: true, amenities: ['Quiet Study Spotlights', 'Individual USB Outlets'] }
    ]
  },
  {
    id: 'hostel-galilaya',
    name: 'Galilaya Heights Hostel',
    area: 'Jogoo',
    distanceMeters: 500,
    description: 'Known for its spacious student rooms, strong student community, and high security. Galilaya Heights provides students quiet study alcoves and constant borehole water supply.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'towers',
    landlordPhone: '0722334455',
    rooms: [
      { id: 'gl-101', roomNumber: 'GL-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 9500, isAvailable: true, amenities: ['Breeze Balcony Access', 'Under-bed Storage Boxes'] },
      { id: 'gl-102', roomNumber: 'GL-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 4, genderPreference: 'Male', priceKes: 6800, isAvailable: true, amenities: ['Metal Bunk Bed Set', 'Lockable Personal Safety Closets'] }
    ]
  },
  {
    id: 'hostel-redhouse',
    name: 'Red House Comrade Mansion',
    area: 'Safariland',
    distanceMeters: 360,
    description: 'An iconic and vibrant red-accented student mansion in Safariland. Famed for its lively student-friendly ambiance, 24/7 watchman support, hot shower systems, and very stable internet connection.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'sunny',
    landlordPhone: '0701122334',
    rooms: [
      { id: 'rh-101', roomNumber: 'RH-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 16000, isAvailable: true, amenities: ['Red Accent Design Theme', 'Executive Working Chair', 'Spacious Balcony'] },
      { id: 'rh-102', roomNumber: 'RH-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 10500, isAvailable: true, amenities: ['Dual Study Tables', 'Soft Mattress Topper'] }
    ]
  },
  {
    id: 'hostel-fanta',
    name: 'Fanta Student Residences',
    area: 'Mwembe',
    distanceMeters: 150,
    description: 'A popular, student-favorite housing complex located just off the road in Mwembe. Known for secure gated compound, affordable semesters, spacious single and double rooms, and continuous borehole water.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: false,
    imageKeyword: 'courtyard',
    landlordPhone: '0733556677',
    rooms: [
      { id: 'fn-101', roomNumber: 'FN-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 8900, isAvailable: true, amenities: ['Prepaid Utility Meters', 'Convenient Balcony Hangers'] },
      { id: 'fn-102', roomNumber: 'FN-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 3, maxOccupants: 4, genderPreference: 'Mixed', priceKes: 6200, isAvailable: true, amenities: ['Shared Center Dining Table', 'Drying Rack Access'] }
    ]
  },
  {
    id: 'hostel-petub',
    name: 'Petub Premium Apartments',
    area: 'Nyanchwa',
    distanceMeters: 480,
    description: 'A elegant, highly secure multi-storey student apartment building climbing the quiet Nyanchwa hills. Delivers modern tiles, spacious balconies with town views, and individual prepaid power meters.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'luxury',
    landlordPhone: '0711993388',
    rooms: [
      { id: 'pt-101', roomNumber: 'PT-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 18500, isAvailable: true, amenities: ['Panoramic View Balcony', 'Smart Keycard Entry', 'In-room Fitted Kitchenette'] },
      { id: 'pt-102', roomNumber: 'PT-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 12000, isAvailable: true, amenities: ['Modern Tiled Finishes', 'Large Built-in Shoe Cases'] }
    ]
  },
  {
    id: 'hostel-upperhill',
    name: 'Upper Hill Comrade Haven',
    area: 'Canaan',
    distanceMeters: 600,
    description: 'A highly tranquil student retreat positioned in Canaan. Provides a magnificent panoramic view of the Kisii landscape, custom writing tables, highly secure bio-gated entries, and reliable backup water pressure.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'breeze',
    landlordPhone: '0724889900',
    rooms: [
      { id: 'uhh-101', roomNumber: 'UH-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 19000, isAvailable: true, amenities: ['Scenic Rooftop Deck Pass', 'Spacious Executive Study Area', 'Hot Bathroom Unit'] },
      { id: 'uhh-102', roomNumber: 'UH-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 12500, isAvailable: true, amenities: ['Custom Fitted Study Desks', 'Silent Dual-speed Wall Fan'] }
    ]
  },
  {
    id: 'hostel-mara',
    name: 'Mara Heights Residence',
    area: 'Nyaura',
    distanceMeters: 440,
    description: 'Tucked away in the serene Nyaura area, Mara Heights delivers modern amenities tailored for serious student academic pursuits. Fully fenced with active perimeter control, backup backup power, and steady hot showers.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'cozy',
    landlordPhone: '0791445566',
    rooms: [
      { id: 'mr-101', roomNumber: 'MR-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 15500, isAvailable: true, amenities: ['Quiet Private Study Corner', 'Quality Latex Foam Bed', 'Preinstalled Wardrobes'] },
      { id: 'mr-102', roomNumber: 'MR-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 9800, isAvailable: false, amenities: ['Dual Study Spotlights', 'Individual Sockets per Bed'] }
    ]
  },
  {
    id: 'hostel-bethel',
    name: 'Bethel Student Towers',
    area: 'Jogoo',
    distanceMeters: 550,
    description: 'A grand and faith-friendly student block in Jogoo. High security rating, continuous borehole connection, highly responsive management, and silent common study halls.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'towers',
    landlordPhone: '0722339944',
    rooms: [
      { id: 'bt-101', roomNumber: 'BT-101', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 8800, isAvailable: true, amenities: ['Silent Study Environment', 'Double Wardrobe Hookups'] },
      { id: 'bt-102', roomNumber: 'BT-102', roomType: '4-Sharing', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 4, genderPreference: 'Female', priceKes: 5900, isAvailable: true, amenities: ['Under-bed Secure Lockers', 'Study Bench Set'] }
    ]
  },
  {
    id: 'hostel-mastergamers',
    name: 'Master Gamers Comrade Plaza',
    area: 'Safariland',
    distanceMeters: 300,
    description: 'Popular with digital-first comrades, offering ultra-high bandwidth fiber internet in Safariland. Strategically close to cyber centers, quick-dining kiosks, and photocopy booths. Backed by solid water and security grids.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'plaza',
    landlordPhone: '0702667788',
    rooms: [
      { id: 'mg-101', roomNumber: 'MG-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 17500, isAvailable: true, amenities: ['Dedicated Ultra Fast Fiber Port', 'Premium Study Desk Set', 'Spacious Closet'] },
      { id: 'mg-102', roomNumber: 'MG-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 11000, isAvailable: true, amenities: ['Dual Smart USB Outlets', 'Individual Study Chairs'] }
    ]
  },
  {
    id: 'hostel-nyangweso',
    name: 'Nyangweso Scholar Court',
    area: 'Nyaura',
    distanceMeters: 420,
    description: 'A beautifully built student court located in Nyaura estate. Famous for premium security features, backup solar lighting, exceptionally clean tiled floors, and very peaceful student neighbors.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'haven',
    landlordPhone: '0714778899',
    rooms: [
      { id: 'nw-101', roomNumber: 'NW-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 16500, isAvailable: true, amenities: ['Clean Elegant Tiling', 'Solar Backup Lighting Bulbs', 'Fitted Closets'] },
      { id: 'nw-102', roomNumber: 'NW-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Female', priceKes: 10205, isAvailable: false, amenities: ['Cozy Windowsill Views', 'Joint Writing Desks'] }
    ]
  },
  {
    id: 'hostel-bomahouse',
    name: 'Boma House Residence',
    area: 'Mwembe',
    distanceMeters: 220,
    description: 'Boma House offers standard secure rooms with high water storage capacity and fast Wi-Fi networks. Excellent entry-point courtyard and a very welcoming in-house caretaker to attend to student needs.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'balcony',
    landlordPhone: '0715223344',
    rooms: [
      { id: 'bm-101', roomNumber: 'BM-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 15000, isAvailable: true, amenities: ['Large Wardrobes', 'Comfy Study Table Set'] },
      { id: 'bm-102', roomNumber: 'BM-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Male', priceKes: 9800, isAvailable: true, amenities: ['Shared Study Spotlights', 'Individual Sockets'] }
    ]
  },
  {
    id: 'hostel-eliterosewood',
    name: 'Elite Rosewood (Females Only)',
    area: 'Milimani',
    distanceMeters: 700,
    description: 'An exclusive, highly praised premium student residency for female comrades in the serene Milimani. Stresses supreme comfort, high boundary walls topped with electric fencing, backup generators, and premium private bathrooms.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'luxury',
    landlordPhone: '0711224466',
    rooms: [
      { id: 'er-101', roomNumber: 'ER-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Female', priceKes: 22000, isAvailable: true, amenities: ['Elegantly Styled Vanity Desk', 'Biometric Gate Access', 'Memory Foam Mattresses'] },
      { id: 'er-102', roomNumber: 'ER-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Female', priceKes: 14000, isAvailable: true, amenities: ['Individual Shoe Display Cabinets', 'Private Lounge Balcony'] }
    ]
  },
  {
    id: 'hostel-tokyo',
    name: 'Tokyo Palace Hostel',
    area: 'Jogoo',
    distanceMeters: 520,
    description: 'A unique, modern student palace featuring sleek Japanese-inspired layout efficiency. Offers incredibly compact, highly optimized double and single rooms, high security, and deep borehole water systems.',
    securityRating: 4,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'modern',
    landlordPhone: '0721778899',
    rooms: [
      { id: 'tk-101', roomNumber: 'TK-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 16000, isAvailable: true, amenities: ['Highly Tailored Compact Layout', 'Space-efficient Closet Fold', 'Writing Desk Set'] },
      { id: 'tk-102', roomNumber: 'TK-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 2, maxOccupants: 2, genderPreference: 'Male', priceKes: 10200, isAvailable: false, amenities: ['Sleek Wall Storage System', 'Bedside Charging Docks'] }
    ]
  },
  {
    id: 'hostel-hollywood',
    name: 'Hollywood Comrade Mansion',
    area: 'Canaan',
    distanceMeters: 580,
    description: 'A fun and extremely social student landmark in Canaan. Famed for its bright lights, great student network community, spacious sunset balconies, fast Wi-Fi routers, and 24/7 security watchmen.',
    securityRating: 5,
    hasBorehole: true,
    hasWifi: true,
    hasHotShower: true,
    imageKeyword: 'breeze',
    landlordPhone: '0729112233',
    rooms: [
      { id: 'hw-101', roomNumber: 'HW-101', roomType: 'Single', roomFormat: 'Single Room', floor: 1, currentOccupants: 0, maxOccupants: 1, genderPreference: 'Mixed', priceKes: 17000, isAvailable: true, amenities: ['Sunset View Balcony Access', 'Integrated Smart Home Sound', 'Spacious Desk Set'] },
      { id: 'hw-102', roomNumber: 'HW-102', roomType: 'Double', roomFormat: 'Single Room', floor: 1, currentOccupants: 1, maxOccupants: 2, genderPreference: 'Mixed', priceKes: 11000, isAvailable: true, amenities: ['Joint Study Tables', 'Soft Bedding Setup'] }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-sample-1',
    hostelId: 'hostel-mwembe',
    hostelName: 'Mwembe Serene Oasis',
    roomId: 'mw-102',
    roomNumber: '102',
    studentName: 'Bonface Esau',
    studentReg: 'K13/5431/25',
    studentEmail: 'esaubornface73@gmail.com',
    studentPhone: '0712345678',
    gender: 'Male',
    semester: 'Sep-Dec 2026',
    status: 'Fully Confirmed',
    bookedAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'book-sample-2',
    hostelId: 'hostel-nyanchwa',
    hostelName: 'Nyanchwa Highres Apex',
    roomId: 'ny-201',
    roomNumber: '201',
    studentName: 'Mercy Chebet',
    studentReg: 'K11/1922/25',
    studentEmail: 'mercy.chebet@student.kisii.ac.ke',
    studentPhone: '0722998877',
    gender: 'Female',
    semester: 'Sep-Dec 2026',
    status: 'Deposit Paid',
    bookedAt: '2026-05-18T14:35:00Z'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'maint-sample-1',
    bookingId: 'book-sample-1',
    hostelId: 'hostel-mwembe',
    hostelName: 'Mwembe Serene Oasis',
    roomNumber: '102',
    studentName: 'Bonface Esau',
    contactNumber: '0712345678',
    category: 'Plumbing',
    description: 'The hot shower pressure is very low, and it is dripping from the side valve causing the bathroom floor to stay wet.',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-05-20T10:15:02Z',
    updatedAt: '2026-05-22T08:30:00Z',
    allocatedAgent: 'Fundi Joseph (Plumber)',
    notes: 'Inlet pipe inspected. Replacement valve purchased; fixing scheduled for Monday morning.'
  },
  {
    id: 'maint-sample-2',
    hostelId: 'hostel-nyanchwa',
    hostelName: 'Nyanchwa Highres Apex',
    roomNumber: '201',
    studentName: 'Mercy Chebet',
    contactNumber: '0722998877',
    category: 'Wi-Fi/Network',
    description: 'Wi-Fi has been totally unreachable on the second floor since yesterday evening. The SSID is visible but fails to assign an IP address.',
    priority: 'High',
    status: 'Reported',
    createdAt: '2026-05-22T19:45:00Z',
    updatedAt: '2026-05-22T19:45:00Z'
  },
  {
    id: 'maint-sample-3',
    hostelId: 'hostel-jogoo',
    hostelName: 'Jogoo Scholar Court',
    roomNumber: 'S1',
    studentName: 'Edwin Kiprono',
    contactNumber: '0799887766',
    category: 'Electrical',
    description: 'One of the study desk sockets is sparks when standard power bricks are plugged. Need immediate replacement for safety.',
    priority: 'High',
    status: 'Completed',
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: '2026-05-12T15:00:00Z',
    allocatedAgent: 'Wekesa Electricals',
    notes: 'Rewired the backbox completely and socket plate replaced with standard MK safety switch. Verified work.'
  }
];
