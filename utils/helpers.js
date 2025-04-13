/**
 * Formats a number as a currency string (USD).
 *
 * @param {number} amount The number to format.
 * @returns {string} The formatted currency string (e.g., "$1,234.56").
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    return '$0.00'; // Or handle error appropriately
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Add other helper functions here as needed