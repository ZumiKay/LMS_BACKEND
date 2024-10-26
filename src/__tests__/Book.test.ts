import { UploadToStorage } from "../config/storage";
import BorrowBookHandler from "../controller/TrackFeature/BorrowBook.controller";
import Book from "../models/book.model";
import BookCart from "../models/bookcart.model";
import BorrowBook from "../models/borrowbook.model";
import { BookStatus } from "../Types/BookType";

jest.mock("../models/borrowbook.model");
jest.mock("../models/book.model");
jest.mock("../models/bookcart.model");
jest.mock("@vercel/blob");
jest.mock("qrcode");
jest.mock("../config/storage");

const mockbook = {
  id: 1,
  title: "Book title",
  ISBN: [{ type: "As", identifier: "001" }],
  description: "Description",
  categories: [{ name: "Action" }],
  author: ["Author1"],
  publisher_date: new Date(),
  status: BookStatus.AVAILABLE,
  borrow_count: 0,
};
const mockBorrowInfo = {
  id: 1,
  borrow_id: "unique id",
  books: [mockbook] as any,
  userId: 1,
  status: BookStatus.TOPICKUP,
  qrcode: "qrcode",
  createdAt: new Date(),
};

describe("Borrow Book Process", () => {
  let res: any;
  let req: any;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  test("No Book", async () => {
    await BorrowBookHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Error QrCode ", async () => {
    req.body = { books: mockbook };

    (UploadToStorage as jest.Mock).mockRejectedValue(null);
    await BorrowBookHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("Checkout Completed", async () => {
    req.body = { books: [mockbook] };
    req.user = { id: 10 };
    (UploadToStorage as jest.Mock).mockResolvedValue({
      url: "url",
    });
    (BorrowBook.create as jest.Mock).mockResolvedValue(mockBorrowInfo);
    (BookCart.bulkCreate as jest.Mock).mockResolvedValue([
      { bookID: 1, borrowID: "uniqueid" },
    ]);
    (Book.update as jest.Mock).mockResolvedValue([1]);

    await BorrowBookHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
