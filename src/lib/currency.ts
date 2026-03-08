// Currency configuration and formatting utilities

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  locale: 'en-IN',
};

/**
 * Format a number as Indian Rupees
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat(CURRENCY.locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `${CURRENCY.symbol}${formatted}` : formatted;
}

/**
 * Format a number as Indian Rupees with compact notation for large numbers
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., ₹1.2L for 120,000)
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    // Crores (1 Crore = 10 Million)
    return `${CURRENCY.symbol}${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    // Lakhs (1 Lakh = 100 Thousand)
    return `${CURRENCY.symbol}${(amount / 100000).toFixed(2)}L`;
  }
  return formatCurrency(amount);
}

/**
 * Parse a currency string to a number
 * @param value - The currency string to parse
 * @returns The parsed number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol and commas
  const cleaned = value.replace(/[₹$,]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Validate if a value is a valid price
 * @param value - The value to validate
 * @returns True if valid, false otherwise
 */
export function isValidPrice(value: string | number): boolean {
  const num = typeof value === 'string' ? parseCurrency(value) : value;
  return !isNaN(num) && num >= 0;
}
