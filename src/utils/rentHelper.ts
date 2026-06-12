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

export const formatSemesterRent = (rent: string | number | undefined): string => {
  if (rent === undefined || rent === null || rent === '') return 'N/A';
  if (typeof rent === 'number') {
    return `KES ${rent.toLocaleString()}/sem`;
  }
  // If it is a string
  const clean = String(rent).trim();
  // Check if it's purely a number
  if (/^\d+$/.test(clean)) {
    return `KES ${Number(clean).toLocaleString()}/sem`;
  }
  // If it already contains currency or /sem
  let display = clean;
  if (!display.toLowerCase().includes('kes')) {
    display = `KES ${display}`;
  }
  if (!display.toLowerCase().includes('/sem') && !display.toLowerCase().includes('semester')) {
    display = `${display}/sem`;
  }
  return display;
};

