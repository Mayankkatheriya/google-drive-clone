// common.js

/**
 * Function to convert bytes to human-readable format with specified decimals
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default is 2)
 * @returns {string} - Human-readable size string
 */
export const changeBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Options for date conversion
const options = { timeZone: "Asia/Kolkata" };

/**
 * Function to convert seconds to a formatted date string
 * @param {number} seconds - Timestamp in seconds
 * @returns {string} - Formatted date string
 */
export const convertDates = (seconds) => {
  const date = new Date(seconds * 1000).toLocaleString("en-US", options);
  return date;
};

export function delayInRender(promise) {
  return new Promise(resolve => {
    setTimeout(resolve, 500);
  }).then(() => promise);
}