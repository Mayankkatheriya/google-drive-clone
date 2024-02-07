const options = { timeZone: "Asia/Kolkata" };
export const convertDates = (seconds) => {
  const date = new Date(seconds * 1000).toLocaleString("en-US", options);
  return date;
};
