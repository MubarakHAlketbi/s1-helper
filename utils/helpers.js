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

/**
 * Generates a simple unique ID.
 * Combines timestamp with a random number.
 * Note: Not cryptographically secure, just for basic uniqueness.
 * @returns {string} A unique ID string.
 */
export function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Formats a Date object or timestamp into a readable string.
 * Example: "Apr 13, 2025, 4:30 PM"
 * @param {Date|number|string} dateInput The date to format.
 * @returns {string} The formatted date string, or "Invalid Date" if input is invalid.
 */
export function formatDateTime(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a Date object or timestamp for HTML datetime-local input fields.
 * Example: "2025-04-13T16:30"
 * @param {Date|number|string} dateInput The date to format.
 * @returns {string} The formatted string for datetime-local input, or empty string if invalid.
 */
export function formatDateTimeForInput(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "";
  }
  // Adjust for local timezone offset
  const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
}

/**
 * Calculates the time remaining between a future date and now.
 * @param {Date|number|string} futureDateInput The future date.
 * @returns {string} A human-readable string (e.g., "2h 15m remaining", "Expired", "Invalid Date").
 */
export function calculateTimeRemaining(futureDateInput) {
  const futureDate = new Date(futureDateInput);
  if (isNaN(futureDate.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffMs = futureDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Expired";
  }

  return formatTimeDifference(diffMs) + " remaining";
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 * Example: "2h 15m 30s"
 * @param {number} durationMs The duration in milliseconds.
 * @returns {string} The formatted duration string.
 */
export function formatTimeDifference(durationMs) {
  if (typeof durationMs !== 'number' || durationMs < 0) {
    return "0s";
  }

  let seconds = Math.floor(durationMs / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`); // Show seconds if it's the only unit or > 0

  return parts.join(' ');
}

/**
 * Loads data from localStorage.
 * Includes error handling for parsing issues.
 *
 * @param {string} key The localStorage key to load from.
 * @param {*} defaultValue The value to return if the key is not found or data is invalid.
 * @returns {*} The parsed data from localStorage or the defaultValue.
 */
export function loadFromLocalStorage(key, defaultValue) {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }
    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error loading data from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Saves data to localStorage.
 * Includes error handling for stringification issues.
 *
 * @param {string} key The localStorage key to save to.
 * @param {*} data The data to save (will be JSON.stringified).
 * @returns {boolean} True if save was successful, false otherwise.
 */
export function saveToLocalStorage(key, data) {
  try {
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem(key, stringifiedData);
    return true;
  } catch (error) {
    console.error(`Error saving data to localStorage key "${key}":`, error);
    return false;
  }
}