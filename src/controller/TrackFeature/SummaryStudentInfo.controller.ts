import { Request, Response } from "express";
import {
  countNonEmptySubArrays,
  filterDatesArrayByRange,
} from "../../Utilities/Helper";
import ErrorCode from "../../Utilities/ErrorCode";
import {
  FilterSummaryStudentType,
  SummaryStudentParamType,
} from "../../Types/AdminType";
import User from "../../models/user.model";
import Department from "../../models/department.model";
import LibraryEntry from "../../models/libraryentry.model";
import BorrowBook from "../../models/borrowbook.model";

function filterByUniqueDate(datesArray: Date[][]) {
  const filteredDates: Date[][] = [];

  datesArray.forEach((dates) => {
    const uniqueDates = dates.reduce((result: Date[], date) => {
      // Check if the current date is already in the result array
      const hasDuplicate = result.some((existingDate) => {
        return (
          new Date(date).toDateString() ===
          new Date(existingDate).toDateString()
        );
      });

      // Add the current date to the result array if it's not a duplicate
      if (!hasDuplicate) {
        result.push(date);
      }

      return result;
    }, []);

    filteredDates.push(uniqueDates);
  });

  return filteredDates;
}

function countMonthsInRange(
  datesArray: Date[][],
  startDate: Date,
  endDate: Date
) {
  let result: any = {};
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const startYear = new Date(startDate).getFullYear();
  const startMonth = new Date(startDate).getMonth();
  const endYear = new Date(endDate).getFullYear();
  const endMonth = new Date(endDate).getMonth();

  //Inititalize Result
  for (let year = startYear; year <= endYear; year++) {
    const isStartYear = year === startYear;
    const isEndYear = year === endYear;
    const start = isStartYear ? startMonth : 0;
    const end = isEndYear ? endMonth : 11;

    for (let month = start; month <= end; month++) {
      const monthName = monthNames[month];
      result[monthName] = { monthCount: 0, weekly: {} };
      for (let week = 1; week <= 4; week++) {
        result[monthName].weekly[week] = 0;
      }
    }
  }
  //
  datesArray.forEach((subarray) => {
    if (Array.isArray(subarray)) {
      const subarrayStartDate = new Date(subarray[0]);
      const subarrayEndDate = new Date(subarray[subarray.length - 1]);
      const year = subarrayStartDate.getFullYear();
      const month = subarrayStartDate.getMonth();
      const monthenddate = subarrayEndDate.getMonth();

      // Check if the subarray's start and end dates are within the specified range
      const isWithinRange =
        (year > startYear || (year === startYear && month >= startMonth)) &&
        (year < endYear || (year === endYear && month <= endMonth)) &&
        subarrayStartDate >= startDate &&
        subarrayEndDate <= endDate;

      if (isWithinRange) {
        const monthName = monthNames[month];
        const lastmonthname = monthNames[monthenddate];
        if (result.hasOwnProperty(monthName)) {
          result[monthName].monthCount++;

          // Get the unique weeks within the subarray
          const uniqueWeeks = new Set();
          subarray.forEach((date) => {
            const week = Math.ceil(new Date(date).getDate() / 7);
            uniqueWeeks.add(week);
          });

          // Update the weekly count for each week in the month
          uniqueWeeks.forEach((week) => {
            if (result[monthName].weekly.hasOwnProperty(week)) {
              result[monthName].weekly[week as string]++;
            }
          });
        }
        if (result.hasOwnProperty(lastmonthname) && monthenddate !== month) {
          result[lastmonthname].monthCount++;

          // Get the unique weeks within the subarray
          const uniqueWeeks = new Set();
          subarray.forEach((date) => {
            const week = Math.ceil(new Date(date).getDate() / 7);
            uniqueWeeks.add(week);
          });

          // Update the weekly count for each week in the month
          uniqueWeeks.forEach((week) => {
            if (result[lastmonthname].weekly.hasOwnProperty(week)) {
              result[lastmonthname].weekly[week as string]++;
            }
          });
        }
      }
    }
  });

  return result;
}

function countEntriesAndBorrowedBooksBySemesterAndSelected(
  entries: Date[][],
  borrowedbook: Date[][],
  selecteddaterange: FilterSummaryStudentType[]
) {
  let result = {};

  selecteddaterange.forEach((i) => {
    const entry_date = filterDatesArrayByRange(
      entries,
      i.filter.start,
      i.filter.end
    );
    const borrow_id = filterDatesArrayByRange(
      borrowedbook,
      i.filter.start,
      i.filter.end
    );
    const filteredentry = filterByUniqueDate(entry_date);
    const filteredborrowed = filterByUniqueDate(borrow_id);

    result = {
      ...result,
      [i.name]: {
        entry: {
          total: countNonEmptySubArrays(filteredentry),
          monthly: countMonthsInRange(
            filteredentry,
            i.filter.start,
            i.filter.end
          ),
        },
        borrowedbook: {
          total: countNonEmptySubArrays(filteredborrowed),
          monthly: countMonthsInRange(
            filteredborrowed,
            i.filter.start,
            i.filter.end
          ),
        },
      },
    };
  });

  return result;
}

export default async function SummaryStudentUsage(req: Request, res: Response) {
  try {
    const { department, filtervalue } = req.body() as SummaryStudentParamType;
    if (!department || !filtervalue) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    const filtercondition = {
      where: { ...(department !== "all" ? { department } : {}) },
      include: [
        {
          model: User,
          as: "users",
          required: true,
          include: [
            {
              model: LibraryEntry,
              as: "entries",
            },
            { model: BorrowBook, as: "borrowbooks" },
          ],
          attributes: {
            exclude: ["password"],
          },
        },
      ],
    };
    const student = await (department === "all"
      ? Department.findAll(filtercondition)
      : Department.findOne(filtercondition));

    if (!student) {
      return res.status(200).json({ message: "No data found" });
    }

    const library_entry: Date[][] = [];
    const borrowbooks: Date[][] = [];

    switch (department) {
      case "all":
        const studata = student as Department[];
        studata.flatMap((stu) => {
          stu.users.forEach((data) => {
            library_entry.push(data.entries?.map((i) => i.createdAt) ?? []);
            borrowbooks.push(data.borrowbooks?.map((i) => i.createdAt) ?? []);
          });
        });
        break;

      default:
        const filterstudent = student as Department;
        filterstudent.users.forEach((user) => {
          library_entry.push(user.entries?.map((i) => i.createdAt) ?? []);
          borrowbooks.push(user.borrowbooks?.map((i) => i.createdAt) ?? []);
        });
        break;
    }

    const result = countEntriesAndBorrowedBooksBySemesterAndSelected(
      library_entry,
      borrowbooks,
      filtervalue
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    console.log("Summary Student", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}
