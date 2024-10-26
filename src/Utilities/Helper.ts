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

type QueryType = "int" | "boolean" | "string";

export function convertQueryParams<T extends Record<string, any>>(
  query: Record<string, string | undefined>,
  types: Record<keyof T, QueryType>
): T {
  const result = {} as T;

  for (const key in types) {
    const value = query[key];
    const type = types[key];

    if (value === undefined) {
      result[key] = undefined as any;
      continue;
    }

    switch (type) {
      case "int":
        const parsedInt = parseInt(value, 10);
        result[key] = isNaN(parsedInt) ? undefined : (parsedInt as any);
        break;
      case "boolean":
        result[key] = (value.toLowerCase() === "true") as any;
        break;
      case "string":
        result[key] = value as any;
        break;
      default:
        result[key] = value as any;
    }
  }

  return result;
}

export function paginateArray<T>(
  array: T[],
  page: number,
  pageSize: number
): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}

export function countVisitsByTimeRange(entries: Date[]) {
  const now = new Date();
  const past1months = new Date();
  past1months.setMonth(now.getMonth() - 1);
  const past6Months = new Date();
  past6Months.setMonth(now.getMonth() - 6);

  let visitsBy6months = 0;
  let result;
  entries.forEach((date) => {
    if (date >= past6Months && date >= past1months && date <= now) {
      visitsBy6months++;
    }
  });

  if (visitsBy6months > 0) {
    result = `${visitsBy6months} time(s) for the past years`;
  } else {
    result = "No Entry";
  }

  return result;
}

export function countNonEmptySubArrays(datesArray: Date[][]) {
  let count = 0;
  datesArray.map((i) => {
    if (i.length > 0) {
      count += 1;
    }
  });
  return count;
}

export function filterDatesArrayByRange(
  datesArray: Date[][],
  startDate: Date,
  endDate: Date
) {
  return datesArray
    .map((subArray) =>
      subArray
        .filter((date) => {
          const currentDate = new Date(date);
          return currentDate >= startDate && currentDate <= endDate;
        })
        .sort((a, b) => a.getTime() - b.getTime())
    )
    .filter((subArray) => subArray.length > 0);
}
