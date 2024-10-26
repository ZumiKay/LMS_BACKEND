import { NextFunction } from "express";
import { IsAdmin, VerifyToken } from "../middleware/UserValidate";
import JWT from "jsonwebtoken";
import { ROLE } from "../Types/AuthenticationType";
import TrackEntry from "../controller/TrackFeature/LibraryEntry.controller";
import User from "../models/user.model";

jest.mock("../models/user.model");
jest.mock("../models/libraryentry.model");
jest.mock("../models/borrowbook.model");
jest.mock("jsonwebtoken");

const MockUser = {
  id: 1,
  firstname: "zumi",
  lastname: "lock",
  email: "zumi@gmail.com",
  password: "securepassword",
  studentID: "19020119",
  department: {
    faculty: "ICT",
    department: "CS",
  },
  role: ROLE.STUDENT,
};

describe("Track Feature Test", () => {
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
    req = {
      body: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  test("Verify Token", async () => {
    req.headers.authorization = "Bearer validtoken";

    (JWT.verify as jest.Mock).mockResolvedValue({
      id: MockUser.id,
      role: MockUser.role,
    });
    await VerifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  test("Role Check", async () => {
    req.user = {
      id: MockUser.id,
      role: ROLE.LIBRARIAN,
      studentID: MockUser.studentID,
    };
    await IsAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("POST /Scan Entry", async () => {
    const mockData = {
      url: "https://my.paragoniu.edu.kh/qr?student_id=19020119",
    };

    req.body = mockData;

    (User.findOne as jest.Mock).mockResolvedValue(MockUser);

    await TrackEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("");
});
