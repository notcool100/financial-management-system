/**
 * Format a number as Nepali currency
 * @param value The number to format
 * @param minimumFractionDigits Minimum fraction digits (default: 0)
 * @param maximumFractionDigits Maximum fraction digits (default: 0)
 * @returns Formatted currency string
 */
export function formatNepaliCurrency(value?: number | null, minimumFractionDigits = 0, maximumFractionDigits = 0): string {
  // Handle undefined or null values
  if (value === undefined || value === null) {
    return 'रू 0';
  }
  
  // Format the number with commas for thousands
  const formattedValue = value.toLocaleString("ne-NP", {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  // Add the Nepali Rupee symbol
  return `रू ${formattedValue}`
}
