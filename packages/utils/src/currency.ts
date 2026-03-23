/**
 * Format paise amount to INR display string.
 * Example: 249900 -> "2,499.00"
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format paise to INR with currency symbol.
 * Example: 249900 -> "₹2,499.00"
 */
export function formatINRWithSymbol(paise: number): string {
  return `₹${formatINR(paise)}`;
}

/**
 * Convert rupees string to paise integer.
 * Example: "2499.00" -> 249900
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees number.
 * Example: 249900 -> 2499.00
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
