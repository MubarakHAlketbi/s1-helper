**
 * Generates a simple pseudo-random ID.
 * @returns {string} A unique-ish ID string.
 */
export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

/**
 * Formats a number as currency (e.g., $1,234.56).
 * Handles non-number inputs gracefully.
 * @param {number|string|null|undefined} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        // console.warn(`formatCurrency received non-numeric value: ${amount}. Returning $0.00`);
        return '$0.00';
    }
    // Use Intl.NumberFormat for better localization and formatting
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numAmount);
};


/**
 * Formats a timestamp or Date object into a readable date and time string.
 * Example: Jan 1, 2024, 02:30 PM
 * @param {number|Date|null|undefined} timestamp - The timestamp (milliseconds) or Date object.
 * @returns {string} Formatted date/time string or 'N/A'.
 */
export const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Check if date is valid
    return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
};

/**
 * Formats a timestamp or Date object for use in a datetime-local input field.
 * Format: YYYY-MM-DDTHH:mm
 * @param {number|Date|null|undefined} timestamp - The timestamp (milliseconds) or Date object.
 * @returns {string} Formatted string for input value, or empty string.
 */
export const formatDateTimeForInput = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
     if (isNaN(date.getTime())) return ''; // Check if date is valid

    // Adjust for local timezone offset before converting to ISO string
    const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localDate = new Date(date.getTime() - offset);

    // Return the first 16 characters (YYYY-MM-DDTHH:mm)
    return localDate.toISOString().slice(0, 16);
};


/**
 * Calculates the time remaining until or elapsed since a given timestamp.
 * Returns more descriptive text than formatTimeDifference.
 * @param {number|null|undefined} targetTimestamp - The target timestamp (milliseconds).
 * @returns {{text: string, sortValue: number, isPast: boolean}} Object containing display text, sortable millisecond difference, and whether the time is past.
 */
export const calculateTimeRemaining = (targetTimestamp) => {
    if (!targetTimestamp) return { text: 'No target time set', sortValue: Infinity, isPast: false };
    const now = Date.now();
    const target = targetTimestamp;
    const diff = target - now; // Difference in milliseconds
    const isPast = diff <= 0;

    if (isNaN(target)) return { text: 'Invalid target time', sortValue: Infinity, isPast: false }; // Handle invalid timestamps

    if (isPast) { // Past due / Arrived / Ready
        const pastDiff = Math.abs(diff);
        const minutes = Math.floor(pastDiff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 1) return { text: `Past due by ${days}d ${hours % 24}h`, sortValue: diff, isPast: true };
        if (days === 1) return { text: `Past due by 1d ${hours % 24}h`, sortValue: diff, isPast: true };
        if (hours > 0) return { text: `Past due by ${hours}h ${minutes % 60}m`, sortValue: diff, isPast: true };
        if (minutes > 0) return { text: `Past due by ${minutes}m`, sortValue: diff, isPast: true };
        return { text: `Ready/Arrived now`, sortValue: diff, isPast: true };
    } else { // Pending
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 1) return { text: `In ${days}d ${hours % 24}h`, sortValue: diff, isPast: false };
        if (days === 1) return { text: `In 1d ${hours % 24}h`, sortValue: diff, isPast: false };
        if (hours > 0) return { text: `In ${hours}h ${minutes % 60}m`, sortValue: diff, isPast: false };
        if (minutes > 0) return { text: `In ${minutes}m ${seconds % 60}s`, sortValue: diff, isPast: false };
        if (seconds > 0) return { text: `In ${seconds}s`, sortValue: diff, isPast: false };
        return { text: `Soon...`, sortValue: diff, isPast: false };
    }
};


/**
 * Formats a time difference in milliseconds into a compact human-readable string (e.g., "2d 3h", "15m", "10s").
 * Used for grow planner status display where space might be limited.
 * @param {number} diffMillis - The time difference in milliseconds. Can be negative for past times.
 * @returns {string} Formatted time difference string.
 */
export const formatTimeDifference = (diffMillis) => {
    if (isNaN(diffMillis)) return "N/A";

    const isPast = diffMillis <= 0;
    const absDiff = Math.abs(diffMillis);

    const totalSeconds = Math.floor(absDiff / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    // Show minutes only if less than a day OR if it's the largest unit
    if (minutes > 0 && (days === 0 || parts.length === 0)) parts.push(`${minutes}m`);
    // Show seconds only if less than an hour OR if it's the largest unit and non-zero
    if (seconds > 0 && (days === 0 && hours === 0 || parts.length === 0) && totalSeconds > 0) parts.push(`${seconds}s`);

    if (parts.length === 0) {
        // If the difference was exactly 0 or very small
        return isPast ? "Now" : "Soon";
    }

    // Add prefix for past times if needed (e.g., "-10m")
    const prefix = isPast ? "-" : "";
    return prefix + parts.join(' ');
};

/**
 * Formats a duration in seconds into a human-readable string (e.g., "1h 30m 15s").
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string} Formatted duration string.
 */
export const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "0s";
    }

    const seconds = Math.floor(totalSeconds % 60);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    const days = Math.floor(hours / 24); // Added days for longer durations

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`); // Show hours remaining after days
    if (minutes > 0) parts.push(`${minutes}m`);
    // Always show seconds if duration is less than a minute or if seconds are non-zero
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s'; // Return '0s' if totalSeconds was 0
};