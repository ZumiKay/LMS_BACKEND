import Book from "../models/book.model";
import User from "../models/user.model";

export interface GetBookType {
  id?: number;
  type?: "all" | "id" | "filter";
  limit?: number;
  filter?: {
    ISBN?: ISBN_OBJ[];
    title?: string;
    publisher_date?: Date;
    status?: string;
    createAt?: Date;
  };
}

export interface ISBN_OBJ {
  type: string;
  identifier: string;
}

export enum BookStatus {
  TOPICKUP = "ToPickUp",
  PICKEDUP = "PickedUp",
  RETURNED = "Returned",
  AVAILABLE = "Available",
  UNAVAILABLE = "Unavailable",
}

export interface EditBorrowBookType {
  type?: "pickup" | "return";
  borrowId: string;
}

export interface BorrowBookReturnType {
  borrow_id: string;
  Books: Book[];
  borrow_date: Date;
  user?: Pick<User, "firstname" | "lastname" | "email" | "studentID">;
  status: string;
  expect_return_date: Date | null;
  qrcode: string | null;
  retrun_date?: string;
  updatedAt: Date;
}
