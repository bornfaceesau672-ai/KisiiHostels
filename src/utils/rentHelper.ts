export const getNumericRent = (rent: string | number | undefined, fallback: number): number => {
  if (rent === undefined || rent === null || rent === '') return fallback;
  if (typeof rent === 'number') return rent;
  const match = String(rent).match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
};

export const formatMonthlyRent = (rent: string | number | undefined, period?: string): string => {
  if (rent === undefined || rent === null || rent === '') return 'N/A';
  let display: string;
  if (typeof rent === 'number') {
    display = `KES ${rent.toLocaleString()}`;
  } else {
    const clean = String(rent).trim();
    if (/^\d+$/.test(clean)) {
      display = `KES ${Number(clean).toLocaleString()}`;
    } else {
      // If it already contains KES prefix, use as-is
      display = clean.toLowerCase().includes('kes') ? clean : `KES ${clean}`;
    }
  }
  // Append period only if explicitly provided
  if (period && period.trim()) {
    display = `${display} ${period.trim()}`;
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
  if (tiers.length === 1) return formatMonthlyRent(tiers[0].amount, tiers[0].period);
  const min = getMinRentFromTiers(tiers);
  const max = getMaxRentFromTiers(tiers);
  // Check if all tiers share the same period
  const periods = [...new Set(tiers.map(t => t.period?.trim() || ''))];
  const sharedPeriod = periods.length === 1 ? periods[0] : '';
  if (min === max) {
    const p = sharedPeriod ? ` ${sharedPeriod}` : '';
    return `KES ${min.toLocaleString()}${p}`;
  }
  const p = sharedPeriod ? ` ${sharedPeriod}` : '';
  return `KES ${min.toLocaleString()} – ${max.toLocaleString()}${p}`;
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
