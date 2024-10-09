import excel from "exceljs";
import { ExcelDataType } from "../Types/AdminType";
import { formatDateToMMDDYYYYHHMMSS } from "../Utilities/Helper";
export const generateExcel = (
  data: ExcelDataType[],
  information: string,
  informationtypes: string
) => {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  workbook.created = new Date();

  worksheet.columns = [
    { header: "ID", key: "id", width: 15 },
    { header: "Name", key: "name", width: 15 },
    { header: "Department", key: "department", width: 15 },
    { header: "Email", key: "email", width: 15 },
    { header: "Library Entry (Times)", key: "entry", width: 40 },
    information !== "entry"
      ? {
          header: "Borrowed Book (books)",
          key: "borrow_book",
          width: 40,
        }
      : {},
  ];

  data.forEach((i) => {
    worksheet.addRow({
      id: i.ID,
      name: i.fullname,
      department: i.department,
      email: i.email,
      entry:
        i.library_entry && informationtypes !== "short"
          ? i.library_entry
              .map((j) => formatDateToMMDDYYYYHHMMSS(j.createdAt))
              .join(", ")
          : i.library_entry
          ? i.library_entry.length
          : 0,
      borrow_book:
        i.borrowedbook && information !== "entry" ? i.borrowedbook.length : 0,
    });
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  return workbook;
};
