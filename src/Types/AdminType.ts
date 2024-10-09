import BorrowBook from "../models/borrowbook.model";
import LibraryEntry from "../models/libraryentry.model";

export interface StudentCardReturnType {
  id_number: string;
  profile_url: string;
  name: string;
  department: string;
  faculty: string;
}

export interface ExportReportType {
  name: string;
  department: string;
  information: string;
  informationtype: string;
  startdate: string;
  enddate: string;
}

export interface ExcelDataType {
  ID: string;
  fullname: string;
  faculty: string;
  department: string;
  email: string;
  phone_number: string | null;
  library_entry: LibraryEntry[] | null;
  borrowedbook: Date[];
}
