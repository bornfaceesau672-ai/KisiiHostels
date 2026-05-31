/**
 * Dynamic Curated High-Quality Student Accommodation Media Engine
 * This provides gorgeous Unsplash images and YouTube walkthrough embeds
 * for Kisii University hostels and student lodges.
 */

const FACADE_IMAGES = [
  'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1564013799915-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
];

const INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80', // Cozy desk & warm lamp
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80', // Modern college room layout
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80', // Student desk set
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80', // Styled double room beds
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80', // Standard sharing bed setup
  'https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?auto=format&fit=crop&w=1000&q=80', // Inspiring study desk
  'https://images.unsplash.com/photo-1513258496099-48168024addd?auto=format&fit=crop&w=1000&q=80', // Sleek laptop desk near window
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80'  // Spacious student bedsitter style
];

const AMENITY_IMAGES = [
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80', // Shared kitchen countertop
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80', // Spotless bathroom tile
  'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1000&q=80', // Instant hot shower layout
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80', // Reading lounge common room
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80'  // Fitted interior kitchenette
];

const YOUTUBE_VIDEO_IDS = [
  'jZ_yZ5bpxG8', // Modern premium hostel room tour walkthrough
  'rVp1716P9gE', // Creative student dorm room tour
  'Ssh_bM8nSvs', // Interactive college room setup
  'p1X6_s-7F8Y'  // Fully furnished student apartment walkthrough
];

/**
 * Returns a static, deterministic set of 4 high-quality image URLs for a hostel based on its ID.
 * Automatically replaces broken/missing URLs.
 */
export function getHostelImages(hostelId: string, customImageUrl?: string): string[] {
  // If the hostel already has a valid, non-local illustrative web URL, place it at the front!
  const hasValidWebUrl = customImageUrl && customImageUrl.startsWith('http');
  
  let hash = 0;
  for (let i = 0; i < hostelId.length; i++) {
    hash += hostelId.charCodeAt(i);
  }

  const fImg = FACADE_IMAGES[hash % FACADE_IMAGES.length];
  const iImg1 = INTERIOR_IMAGES[(hash + 1) % INTERIOR_IMAGES.length];
  const iImg2 = INTERIOR_IMAGES[(hash + 3) % INTERIOR_IMAGES.length];
  const aImg = AMENITY_IMAGES[(hash + 5) % AMENITY_IMAGES.length];

  const dynamicSet = [fImg, iImg1, iImg2, aImg];
  
  if (hasValidWebUrl) {
    // Inject the custom image, and ensure the count stays at 4
    return [customImageUrl, fImg, iImg1, iImg2];
  }
  
  return dynamicSet;
}

/**
 * Returns a deterministic YouTube embed tour URL for a given hostel.
 */
export function getHostelYoutubeEmbed(hostelId: string): string {
  let hash = 0;
  for (let i = 0; i < hostelId.length; i++) {
    hash += hostelId.charCodeAt(i);
  }
  const videoId = YOUTUBE_VIDEO_IDS[hash % YOUTUBE_VIDEO_IDS.length];
  return `https://www.youtube.com/embed/${videoId}`;
}
