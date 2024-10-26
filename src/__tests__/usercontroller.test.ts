// Adjust the path accordingly

import {
  DeleteUser,
  EditUserInfo,
} from "../controller/Authentication/User.controller";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import ErrorCode from "../Utilities/ErrorCode";
import { ROLE } from "../Types/AuthenticationType";

jest.mock("../models/user.model");
jest.mock("bcryptjs");
jest.mock("../Utilities/Security");
jest.mock("../Utilities/ErrorCode");
jest.mock("../Utilities/Helper");

describe("EditUserInfo", () => {
  let req: any;
  let res: any;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    // Setup mock response
    res = {
      status: statusMock,
    };

    // Setup default mock request
    req = {
      body: {
        id: 1,
        edittype: "Password",
        password: "oldpassword",
        newpassword: "newpassword",
      },
      user: {
        id: 1,
        role: "STUDENT",
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user is not found", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    await EditUserInfo(req, res);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ status: ErrorCode("Not Found") });
  });

  it("should return 400 if password does not match", async () => {
    const mockUser = { password: "hashedpassword" };
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    await EditUserInfo(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ status: ErrorCode("Bad Request") });
  });

  it("should update name for student role", async () => {
    req.body = {
      id: 1,
      edittype: "Name",
      firstname: "John",
      lastname: "Doe",
      password: "password",
    };
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

    const mockUser = { id: 1, role: "STUDENT" };

    (User.findByPk as jest.Mock).mockReturnValue(mockUser);
    User.update as jest.Mock;

    await EditUserInfo(req, res);

    expect(User.update).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Update Successfully" });
  });

  it("should return 500 on error", async () => {
    (User.findByPk as jest.Mock).mockRejectedValue(new Error("Database error"));

    await EditUserInfo(req, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: ErrorCode("Error Server 500"),
    });
  });
});

describe("Delete User", () => {
  let res: any;
  let req: any;

  beforeEach(() => {
    req = {
      user: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  test("Return 403", async () => {
    req.user = {
      id: 1,
      role: ROLE.LIBRARIAN,
    };
    await DeleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
