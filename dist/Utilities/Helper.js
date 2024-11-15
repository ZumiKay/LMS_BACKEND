"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDataBorrowByTimeRange = exports.filterDataByTimeRange = void 0;
exports.getDateWithOffset = getDateWithOffset;
exports.GenerateRandomCode = GenerateRandomCode;
exports.formatDateToMMDDYYYYHHMMSS = formatDateToMMDDYYYYHHMMSS;
exports.convertQueryParams = convertQueryParams;
exports.paginateArray = paginateArray;
exports.countVisitsByTimeRange = countVisitsByTimeRange;
exports.countNonEmptySubArrays = countNonEmptySubArrays;
exports.filterDatesArrayByRange = filterDatesArrayByRange;
exports.normalizeString = normalizeString;
function getDateWithOffset(offsetInSeconds) {
    const currentDate = new Date(); // Get the current date and time
    const offsetMilliseconds = offsetInSeconds * 1000; // Convert seconds to milliseconds
    const newDate = new Date(currentDate.getTime() + offsetMilliseconds); // Add the offset
    return newDate;
}
function GenerateRandomCode(length) {
    const characters = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
function formatDateToMMDDYYYYHHMMSS(date) {
    const pad = (n) => (n < 10 ? "0" + n : n); // Padding single digits with leading zero
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const day = pad(date.getDate());
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}
const filterDataByTimeRange = (data, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter(({ createdAt }) => {
        const entryDate = new Date(createdAt);
        return entryDate >= start && entryDate <= end;
    });
};
exports.filterDataByTimeRange = filterDataByTimeRange;
const filterDataBorrowByTimeRange = (data, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter((borrow_date) => {
        const entryDate = new Date(borrow_date);
        return entryDate >= start && entryDate <= end;
    });
};
exports.filterDataBorrowByTimeRange = filterDataBorrowByTimeRange;
function convertQueryParams(query, types) {
    const result = {};
    for (const key in types) {
        const value = query[key];
        const type = types[key];
        if (value === undefined) {
            result[key] = undefined;
            continue;
        }
        switch (type) {
            case "int":
                const parsedInt = parseInt(value, 10);
                result[key] = isNaN(parsedInt) ? undefined : parsedInt;
                break;
            case "boolean":
                result[key] = (value.toLowerCase() === "true");
                break;
            case "string":
                result[key] = value;
                break;
            default:
                result[key] = value;
        }
    }
    return result;
}
function paginateArray(array, page, pageSize) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
}
function countVisitsByTimeRange(entries) {
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
    }
    else {
        result = "No Entry";
    }
    return result;
}
function countNonEmptySubArrays(datesArray) {
    let count = 0;
    datesArray.map((i) => {
        if (i.length > 0) {
            count += 1;
        }
    });
    return count;
}
function filterDatesArrayByRange(datesArray, startDate, endDate) {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return datesArray.reduce((result, subArray) => {
        const filtered = subArray.filter((date) => date.getTime() >= start && date.getTime() <= end);
        if (filtered.length > 0) {
            result.push(filtered);
        }
        return result;
    }, []);
}
function normalizeString(input) {
    return input.replace(/\s+/g, "").toLowerCase();
}
