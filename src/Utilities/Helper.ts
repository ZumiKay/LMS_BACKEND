import LibraryEntry from "../models/libraryentry.model";

export function getDateWithOffset(offsetInSeconds: number): Date {
  const currentDate = new Date(); // Get the current date and time
  const offsetMilliseconds = offsetInSeconds * 1000; // Convert seconds to milliseconds
  const newDate = new Date(currentDate.getTime() + offsetMilliseconds); // Add the offset
  return newDate;
}

export function GenerateRandomCode(length: number) {
  const characters = "0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export function formatDateToMMDDYYYYHHMMSS(date: Date): string {
  const pad = (n: number) => (n < 10 ? "0" + n : n); // Padding single digits with leading zero

  const month = pad(date.getMonth() + 1); // Months are zero-indexed
  const day = pad(date.getDate());
  const year = date.getFullYear();

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

export const filterDataByTimeRange = (
  data: LibraryEntry[],
  startDate: string,
  endDate: string
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter(({ createdAt }) => {
    const entryDate = new Date(createdAt);
    return entryDate >= start && entryDate <= end;
  });
};
export const filterDataBorrowByTimeRange = (
  data: Date[],
  startDate: string,
  endDate: string
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter((borrow_date) => {
    const entryDate = new Date(borrow_date);
    return entryDate >= start && entryDate <= end;
  });
};
