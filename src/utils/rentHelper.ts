export const getNumericRent = (rent: string | number | undefined, fallback: number): number => {
  if (rent === undefined || rent === null || rent === '') return fallback;
  if (typeof rent === 'number') return rent;
  const match = String(rent).match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
};

export const formatMonthlyRent = (rent: string | number | undefined): string => {
  if (rent === undefined || rent === null || rent === '') return 'N/A';
  if (typeof rent === 'number') {
    return `KES ${rent.toLocaleString()}/mo`;
  }
  // If it is a string
  const clean = String(rent).trim();
  // Check if it's purely a number
  if (/^\d+$/.test(clean)) {
    return `KES ${Number(clean).toLocaleString()}/mo`;
  }
  // If it already contains currency or /mo
  let display = clean;
  if (!display.toLowerCase().includes('kes')) {
    display = `KES ${display}`;
  }
  if (!display.toLowerCase().includes('/mo') && !display.toLowerCase().includes('month')) {
    display = `${display}/mo`;
  }
  return display;
};

import type { RentTier, Hostel } from '../types';

export const getMinRentFromTiers = (tiers: RentTier[]): number => {
  if (!tiers || tiers.length === 0) return 0;
  return Math.min(...tiers.map(t => getNumericRent(t.amount, 999999)));
};

export const getMaxRentFromTiers = (tiers: RentTier[]): number => {
  if (!tiers || tiers.length === 0) return 0;
  return Math.max(...tiers.map(t => getNumericRent(t.amount, 0)));
};

export const formatRentTiers = (tiers: RentTier[]): string => {
  if (!tiers || tiers.length === 0) return 'N/A';
  if (tiers.length === 1) return formatMonthlyRent(tiers[0].amount);
  const min = getMinRentFromTiers(tiers);
  const max = getMaxRentFromTiers(tiers);
  if (min === max) return `KES ${min.toLocaleString()}/mo`;
  return `KES ${min.toLocaleString()} – ${max.toLocaleString()}/mo`;
};

export const getEffectiveMinRent = (hostel: Hostel): number | string => {
  // 1. Prefer rentTiers if present
  if (hostel.rentTiers && hostel.rentTiers.length > 0) {
    return getMinRentFromTiers(hostel.rentTiers);
  }
  // 2. Fall back to hostel-level rentMonthlyKes
  if (hostel.rentMonthlyKes !== undefined && hostel.rentMonthlyKes !== null && hostel.rentMonthlyKes !== '') {
    return hostel.rentMonthlyKes;
  }
  // 3. Fall back to room-level rents
  if (hostel.rooms && hostel.rooms.length > 0) {
    const definedRents = hostel.rooms.map(r => r.rentMonthlyKes).filter(Boolean);
    if (definedRents.length > 0) {
      return definedRents.reduce((min, current) => {
        const minVal = getNumericRent(min, 999999);
        const currVal = getNumericRent(current, 999999);
        return currVal < minVal ? current : min;
      }, definedRents[0])!;
    }
    return Math.min(...hostel.rooms.map(r => Math.round(r.priceKes / 4)));
  }
  return 4500;
};

export const getEffectiveMinRentNumeric = (hostel: Hostel): number => {
  const val = getEffectiveMinRent(hostel);
  return getNumericRent(val, 0);
};
