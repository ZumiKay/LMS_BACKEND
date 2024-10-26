import { Op } from "sequelize";
import {
  Login,
  RefreshToken,
} from "../controller/Authentication/Account.controller";
import User from "../models/user.model";
import ErrorCode from "../Utilities/ErrorCode";
import bcrypt from "bcryptjs";
import Usersession from "../models/usersession.model";
import { getDateWithOffset } from "../Utilities/Helper";
import { generateToken } from "../Utilities/Security";

jest.mock("../models/user.model");
jest.mock("../models/Usersession.model");
jest.mock("bcryptjs");
jest.mock("../Utilities/Security");
jest.mock("../Utilities/ErrorCode");
jest.mock("../Utilities/Helper");

describe("Login", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it("User Not Found 404", async () => {
    req.body = { email: "example@gmail.com", password: "12345" };
    (User.findOne as jest.Mock).mockResolvedValue(null); // Mock no user found
    (ErrorCode as jest.Mock).mockReturnValue("Unauthenticated");
    await Login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { email: "example@gmail.com" },
          {}, // No studentID
        ],
      },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Wrong Email or Password",
      error: "Unauthenticated",
    });
  });

  test("should return 200 and set cookies if login is successful", async () => {
    req.body = { email: "test@example.com", password: "password123" };

    const mockUser = {
      id: 1,
      password: "hashedpassword",
      studentID: "12345",
      role: "user",
    };
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true); // Assume Password is Correct
    (generateToken as jest.Mock)
      .mockReturnValueOnce("accessToken")
      .mockReturnValueOnce("refreshToken"); // Mock tokens
    (getDateWithOffset as jest.Mock).mockReturnValue(new Date());

    await Login(req, res);

    expect(Usersession.create).toHaveBeenCalledWith({
      session_id: "refreshToken",
      userId: mockUser.id,
      expiredAt: expect.any(Date),
    });
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logging In" });
  });

  test("Shoud Return Status 500 if error", async () => {
    req.body = { email: "example@gmail.com", password: "12345" };
    (User.findOne as jest.Mock).mockRejectedValue(new Error("DB Error"));

    await Login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: ErrorCode("Error Server 500"),
    });
  });
});

// describe("RefreshToken", () => {
//   let req: any;
//   let res: any;

//   const mockUserSession = {
//     session_id: "valid_refresh_token",
//     expiredAt: new Date(Date.now() + 10000), // Not expired
//   };

//   beforeEach(() => {
//     req = {
//       body: {},
//       headers: {},
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//       cookie: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks(); // Clear mocks between tests
//   });
//   it("should return a 401 error if the token is invalid or expired", async () => {
//     // Mock findOne to return null (invalid or expired session)
//     req.headers = {
//       authorization: "Bearer invalid_token",
//     };
//     (Usersession.findOne as jest.Mock).mockResolvedValueOnce(null);

//     await RefreshToken(req, res);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       status: ErrorCode("Unauthenticated"),
//     });
//   });

//   it("Should Return New Token if Refresh Token is Valid", async () => {
//     req.headers = {
//       authorization: "Bearer valid_refresh_token",
//     };
//     (Usersession.findOne as jest.Mock).mockResolvedValueOnce(mockUserSession);
//     const mockNewToken = "new_access_token";
//     (generateToken as jest.Mock).mockReturnValue(mockNewToken);

//     await RefreshToken(req, res);

//     expect(Usersession.findOne).toHaveBeenCalledWith({
//       where: {
//         session_id: "valid_refresh_token",
//         expiredAt: { [Op.lt]: expect.any(Date) },
//       },
//     });
//     expect(generateToken).toHaveBeenCalledWith(
//       expect.any(Object),
//       process.env.JWT_SECRET,
//       process.env.ACCESSTOKEN_LIFE
//     );

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({ data: mockNewToken });
//   });
// });
